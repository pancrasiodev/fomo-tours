const db = require('../config/database')
const daraja = require('../services/darajaService')

function deriveStatus(totalAmount, amountPaid, fallbackOnZero = 'pending') {
  const total = Number(totalAmount || 0)
  const paid = Number(amountPaid || 0)
  if (total > 0 && paid >= total) return 'paid'
  if (paid > 0 && paid < total) return 'partial'
  return fallbackOnZero
}

async function recalculateBookingTotals(bookingRef, latestReceipt = '', failIfUnpaid = false) {
  const [bookings] = await db.query('SELECT * FROM bookings WHERE booking_ref = ?', [bookingRef])
  if (bookings.length === 0) return null
  const booking = bookings[0]

  const [completedRows] = await db.query(
    "SELECT * FROM booking_payments WHERE booking_ref = ? AND status = 'completed' ORDER BY id DESC",
    [bookingRef]
  )

  const sumPaid = completedRows.reduce((acc, row) => acc + Number(row.amount || 0), 0)
  const topReceipt =
    latestReceipt ||
    completedRows.find((r) => r.reference && !r.reference.startsWith('STK-'))?.reference ||
    booking.mpesa_receipt ||
    ''

  const nextStatus = deriveStatus(
    booking.total_amount,
    sumPaid,
    failIfUnpaid ? 'failed' : 'pending'
  )

  await db.query(
    `UPDATE bookings
     SET amount_paid = ?, payment_status = ?, payment_method = 'M-Pesa', mpesa_receipt = ?, updated_at = CURRENT_TIMESTAMP
     WHERE booking_ref = ?`,
    [sumPaid, nextStatus, topReceipt, bookingRef]
  )

  const [allPayments] = await db.query(
    'SELECT * FROM booking_payments WHERE booking_ref = ? ORDER BY id DESC',
    [bookingRef]
  )

  return {
    ...booking,
    id: booking.booking_ref,
    amount_paid: sumPaid,
    payment_status: nextStatus,
    mpesa_receipt: topReceipt,
    payments: allPayments.map((p) => ({
      id: p.payment_uid,
      date: p.payment_date || String(p.created_at || '').slice(0, 10),
      amount: Number(p.amount || 0),
      kes_amount: Number(p.kes_amount || 0),
      method: p.method || 'M-Pesa',
      reference: p.reference || '',
      status: p.status,
      note: p.note || '',
    })),
  }
}

/**
 * POST /api/payments/stkpush (and /api/payments/mpesa)
 * Sends a live M-Pesa Express prompt to the client's phone for either:
 *   - Pay All (100% upfront)
 *   - Lipa Pole Pole (30%+ first deposit OR subsequent installment)
 */
const initiateBookingStkPush = async (req, res) => {
  try {
    const {
      booking_id,
      booking_ref,
      bookingRef,
      phone,
      amount,
      currency = 'KSh',
      payment_plan = 'full',
      paymentPlan,
      note = '',
    } = req.body

    const ref = String(booking_ref || booking_id || bookingRef || '').trim()
    if (!ref) {
      return res.status(400).json({ error: 'booking_ref or booking_id is required' })
    }

    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE booking_ref = ? OR id = ?',
      [ref, ref]
    )
    const booking = bookings[0] || null
    const resolvedRef = booking ? booking.booking_ref : ref
    const resolvedCurrency = booking?.currency || currency || 'KSh'
    const chargeAmount = Number(amount || booking?.total_amount || 0)

    if (chargeAmount <= 0) {
      return res.status(400).json({ error: 'Payment amount must be greater than zero' })
    }

    const kesAmount = daraja.convertToKes(chargeAmount, resolvedCurrency)
    const planLabel =
      (booking?.payment_plan || payment_plan) === 'lipa_pole_pole'
        ? 'FOMO LipaPole'
        : 'FOMO FullPay'

    const stk = await daraja.initiateStkPush({
      phone: phone || booking?.phone,
      amountKes: kesAmount,
      accountReference: resolvedRef.toUpperCase().slice(0, 12),
      transactionDesc: planLabel,
    })

    const paymentUid = `pmt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
    const today = new Date().toISOString().slice(0, 10)
    const defaultNote =
      note ||
      ((booking?.payment_plan || payment_plan) === 'lipa_pole_pole'
        ? 'Lipa Pole Pole M-Pesa STK Push'
        : 'Full payment M-Pesa STK Push')

    await db.query(
      `INSERT INTO booking_payments
       (payment_uid, booking_ref, amount, currency, kes_amount, method, reference, phone, checkout_request_id, merchant_request_id, status, note, recorded_by, payment_date)
       VALUES (?, ?, ?, ?, ?, 'M-Pesa', ?, ?, ?, ?, 'pending', ?, 'gateway', ?)`,
      [
        paymentUid,
        resolvedRef,
        chargeAmount,
        resolvedCurrency,
        kesAmount,
        `STK-${stk.checkoutRequestId.slice(-6)}`,
        stk.phone,
        stk.checkoutRequestId,
        stk.merchantRequestId,
        defaultNote,
        today,
      ]
    )

    if (booking) {
      await db.query(
        `UPDATE bookings
         SET checkout_request_id = ?, merchant_request_id = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
         WHERE booking_ref = ?`,
        [stk.checkoutRequestId, stk.merchantRequestId, phone || booking.phone, resolvedRef]
      )
    }

    return res.status(200).json({
      message: stk.customerMessage,
      booking_ref: resolvedRef,
      payment_uid: paymentUid,
      checkoutRequestId: stk.checkoutRequestId,
      merchantRequestId: stk.merchantRequestId,
      amount: chargeAmount,
      currency: resolvedCurrency,
      amountKes: stk.amountKes,
      tillNumber: stk.tillNumber,
      phone: stk.phone,
    })
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to initiate M-Pesa STK Push' })
  }
}

/**
 * POST /api/payments/callback
 * Safaricom Daraja asynchronous webhook receiver.
 */
const handleDarajaCallback = async (req, res) => {
  try {
    const parsed = daraja.parseStkCallback(req.body)
    if (!parsed || !parsed.checkoutRequestId) {
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    const [rows] = await db.query(
      'SELECT * FROM booking_payments WHERE checkout_request_id = ? LIMIT 1',
      [parsed.checkoutRequestId]
    )

    if (rows.length > 0) {
      const pmt = rows[0]
      if (parsed.isSuccess) {
        const receipt = parsed.mpesaReceipt || pmt.reference || 'MPESA-CONFIRMED'
        await db.query(
          `UPDATE booking_payments
           SET status = 'completed', reference = ?, result_code = ?, result_desc = ?
           WHERE id = ?`,
          [receipt, parsed.resultCode, parsed.resultDesc, pmt.id]
        )
        await recalculateBookingTotals(pmt.booking_ref, receipt, false)
      } else {
        await db.query(
          `UPDATE booking_payments
           SET status = 'failed', result_code = ?, result_desc = ?
           WHERE id = ?`,
          [parsed.resultCode, parsed.resultDesc, pmt.id]
        )
        await recalculateBookingTotals(pmt.booking_ref, '', true)
      }
    }

    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (err) {
    console.error('[Daraja Callback Error]:', err.message)
    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}

/**
 * GET /api/payments/status/:checkoutRequestId
 * Checks DB first; if still pending, queries Safaricom Daraja stkpushquery live!
 */
const checkStkPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params
    const [rows] = await db.query(
      'SELECT * FROM booking_payments WHERE checkout_request_id = ? LIMIT 1',
      [checkoutRequestId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Payment request not found' })
    }

    const pmt = rows[0]

    // Already settled by webhook or previous poll
    if (pmt.status === 'completed' || pmt.status === 'failed') {
      const updatedBooking = await recalculateBookingTotals(
        pmt.booking_ref,
        pmt.status === 'completed' ? pmt.reference : '',
        pmt.status === 'failed'
      )
      return res.json({
        state: pmt.status,
        reference: pmt.reference,
        resultDesc: pmt.result_desc || (pmt.status === 'completed' ? 'Payment confirmed' : 'Payment failed'),
        booking: updatedBooking,
      })
    }

    // Query Safaricom Daraja directly
    const liveStatus = await daraja.queryStkPushStatus(checkoutRequestId)

    if (liveStatus.state === 'completed') {
      const receipt =
        pmt.reference && !pmt.reference.startsWith('STK-')
          ? pmt.reference
          : `MPESA-${checkoutRequestId.slice(-8).toUpperCase()}`
      await db.query(
        `UPDATE booking_payments
         SET status = 'completed', reference = ?, result_code = ?, result_desc = ?
         WHERE id = ?`,
        [receipt, liveStatus.resultCode || '0', liveStatus.resultDesc, pmt.id]
      )
      const updatedBooking = await recalculateBookingTotals(pmt.booking_ref, receipt, false)
      return res.json({
        state: 'completed',
        reference: receipt,
        resultDesc: liveStatus.resultDesc,
        booking: updatedBooking,
      })
    }

    if (liveStatus.state === 'failed') {
      await db.query(
        `UPDATE booking_payments
         SET status = 'failed', result_code = ?, result_desc = ?
         WHERE id = ?`,
        [liveStatus.resultCode || '1', liveStatus.resultDesc, pmt.id]
      )
      const updatedBooking = await recalculateBookingTotals(pmt.booking_ref, '', true)
      return res.json({
        state: 'failed',
        reference: '',
        resultDesc: liveStatus.resultDesc,
        booking: updatedBooking,
      })
    }

    return res.json({
      state: 'pending',
      reference: '',
      resultDesc: liveStatus.resultDesc,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

/**
 * GET /api/payments/health
 * Verifies Crony Daraja OAuth credentials against Safaricom API.
 */
const checkGatewayHealth = async (req, res) => {
  try {
    const cfg = daraja.getDarajaConfig()
    const token = await daraja.getAccessToken()
    return res.json({
      gateway: 'Safaricom Daraja M-Pesa Express',
      env: cfg.env,
      transactionType: cfg.transactionType,
      shortcode: cfg.shortcode,
      tillNumber: cfg.partyB,
      oauthReady: Boolean(token),
    })
  } catch (err) {
    return res.status(500).json({
      gateway: 'Safaricom Daraja M-Pesa Express',
      oauthReady: false,
      error: err.message,
    })
  }
}

module.exports = {
  initiateBookingStkPush,
  handleDarajaCallback,
  checkStkPaymentStatus,
  checkGatewayHealth,
  recalculateBookingTotals,
}
