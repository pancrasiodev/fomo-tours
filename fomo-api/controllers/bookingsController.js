const db = require('../config/database')

function derivePaymentStatus(totalAmount, amountPaid, explicitOverride = '') {
  if (explicitOverride === 'failed') return 'failed'
  const total = Number(totalAmount || 0)
  const paid = Number(amountPaid || 0)
  if (total > 0 && paid >= total) return 'paid'
  if (paid > 0 && paid < total) return 'partial'
  return 'pending'
}

async function hydrateBooking(row) {
  const [paymentRows] = await db.query(
    'SELECT * FROM booking_payments WHERE booking_ref = ? ORDER BY id DESC',
    [row.booking_ref]
  )
  return {
    ...row,
    id: row.booking_ref,
    db_id: row.id,
    num_guests: Number(row.num_guests || 1),
    total_amount: Number(row.total_amount || 0),
    amount_paid: Number(row.amount_paid || 0),
    payments: paymentRows
      .filter((p) => p.status !== 'failed')
      .map((p) => ({
        id: p.payment_uid,
        date: p.payment_date || String(p.created_at || '').slice(0, 10),
        amount: Number(p.amount || 0),
        kes_amount: Number(p.kes_amount || 0),
        method: p.method || 'M-Pesa',
        reference: p.reference || '',
        status: p.status || 'completed',
        note: p.note || '',
      })),
  }
}

const createBooking = async (req, res) => {
  try {
    const body = req.body || {}
    const bookingRef =
      body.booking_ref ||
      body.id ||
      `bk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`

    let resolvedTotal = Number(body.total_amount || 0)
    let resolvedTitle = body.package_title || 'Custom Kenyan Safari'
    let resolvedSlug = body.package_slug || ''
    let resolvedDepDate = body.departure_date || ''
    let resolvedCurrency = body.currency || 'KSh'
    const numGuests = Math.max(1, Number(body.num_guests || 1))

    if (body.package_date_id) {
      const [dates] = await db.query('SELECT * FROM package_dates WHERE id = ?', [
        body.package_date_id,
      ])
      if (dates.length > 0) {
        const d = dates[0]
        if (!resolvedTotal && d.price_per_person) {
          resolvedTotal = Number(d.price_per_person) * numGuests
        }
        resolvedTitle = body.package_title || d.package_title || resolvedTitle
        resolvedSlug = body.package_slug || d.package_slug || resolvedSlug
        resolvedDepDate = body.departure_date || d.departure_date || resolvedDepDate
        resolvedCurrency = body.currency || d.currency || resolvedCurrency

        await db.query(
          'UPDATE package_dates SET slots_available = CASE WHEN slots_available >= ? THEN slots_available - ? ELSE 0 END WHERE id = ?',
          [numGuests, numGuests, d.id]
        )
      }
    }

    const amountPaid = Number(
      body.amount_paid !== undefined ? body.amount_paid : body.initial_paid || 0
    )
    const paymentPlan =
      body.payment_plan || (amountPaid > 0 && amountPaid < resolvedTotal ? 'lipa_pole_pole' : 'full')
    const paymentStatus =
      body.payment_status || derivePaymentStatus(resolvedTotal, amountPaid)
    const paymentMethod = body.payment_method || 'M-Pesa'
    const mpesaReceipt = String(body.mpesa_receipt || '').trim().toUpperCase()

    let activeRef = bookingRef

    const [existing] = await db.query('SELECT * FROM bookings WHERE booking_ref = ?', [
      bookingRef,
    ])

    const isAuthorizedToUpdate =
      Boolean(req.admin) ||
      (req.user &&
        (req.user.id === existing[0]?.user_id ||
          String(req.user.email || '').toLowerCase() === String(existing[0]?.email || '').toLowerCase()))

    if (existing.length > 0 && isAuthorizedToUpdate) {
      await db.query(
        `UPDATE bookings
         SET package_slug=?, package_title=?, full_name=?, email=?, phone=?, departure_date=?, num_guests=?,
             currency=?, total_amount=?, amount_paid=?, payment_plan=?, payment_status=?, payment_method=?,
             mpesa_receipt=?, special_requests=?, notes=?, updated_at=CURRENT_TIMESTAMP
         WHERE booking_ref=?`,
        [
          resolvedSlug,
          resolvedTitle,
          body.full_name || 'Client',
          body.email || '',
          body.phone || '',
          resolvedDepDate,
          numGuests,
          resolvedCurrency,
          resolvedTotal,
          amountPaid,
          paymentPlan,
          paymentStatus,
          paymentMethod,
          mpesaReceipt,
          body.special_requests || '',
          body.notes || '',
          activeRef,
        ]
      )
    } else {
      if (existing.length > 0 && !isAuthorizedToUpdate) {
        activeRef = `FOMO-${Date.now().toString(36).slice(-4).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`
      }

      await db.query(
        `INSERT INTO bookings
         (booking_ref, package_date_id, package_slug, package_title, full_name, email, phone, departure_date,
          num_guests, currency, total_amount, amount_paid, payment_plan, payment_status, payment_method,
          mpesa_receipt, special_requests, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          activeRef,
          body.package_date_id || null,
          resolvedSlug,
          resolvedTitle,
          body.full_name || 'Client',
          body.email || '',
          body.phone || '',
          resolvedDepDate,
          numGuests,
          resolvedCurrency,
          resolvedTotal,
          amountPaid,
          paymentPlan,
          paymentStatus,
          paymentMethod,
          mpesaReceipt,
          body.special_requests || '',
          body.notes || '',
        ]
      )
    }

    // Sync initial payment entries if provided
    const incomingPayments = Array.isArray(body.payments) ? body.payments : []
    if (incomingPayments.length > 0) {
      for (const p of incomingPayments) {
        const pUid = p.id || `pmt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
        const [pExists] = await db.query(
          'SELECT id FROM booking_payments WHERE payment_uid = ?',
          [pUid]
        )
        if (pExists.length === 0 && Number(p.amount || 0) > 0) {
          await db.query(
            `INSERT INTO booking_payments
             (payment_uid, booking_ref, amount, currency, kes_amount, method, reference, status, note, recorded_by, payment_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, 'client', ?)`,
            [
              pUid,
              activeRef,
              Number(p.amount),
              resolvedCurrency,
              Math.round(Number(p.amount)),
              p.method || paymentMethod,
              p.reference || mpesaReceipt || 'LOGGED',
              p.note || 'Booking payment',
              p.date || new Date().toISOString().slice(0, 10),
            ]
          )
        }
      }
    } else if (amountPaid > 0) {
      const [anyPayment] = await db.query(
        'SELECT id FROM booking_payments WHERE booking_ref = ? LIMIT 1',
        [activeRef]
      )
      if (anyPayment.length === 0) {
        await db.query(
          `INSERT INTO booking_payments
           (payment_uid, booking_ref, amount, currency, kes_amount, method, reference, status, note, recorded_by, payment_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, 'client', ?)`,
          [
            `pmt-${Date.now().toString(36)}`,
            activeRef,
            amountPaid,
            resolvedCurrency,
            Math.round(amountPaid),
            paymentMethod,
            mpesaReceipt || 'INITIAL',
            body.payment_note || 'Initial booking payment',
            new Date().toISOString().slice(0, 10),
          ]
        )
      }
    }

    const [savedRows] = await db.query('SELECT * FROM bookings WHERE booking_ref = ?', [activeRef])
    const hydrated = await hydrateBooking(savedRows[0])

    return res.status(201).json({
      message: 'Booking recorded',
      booking_id: hydrated.id,
      total_amount: hydrated.total_amount,
      booking: hydrated,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const getAllBookings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM bookings ORDER BY created_at DESC, id DESC')
    const bookings = await Promise.all(rows.map(hydrateBooking))
    return res.json({ bookings })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await db.query(
      'SELECT * FROM bookings WHERE booking_ref = ? OR id = ? LIMIT 1',
      [id, id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    const hydrated = await hydrateBooking(rows[0])
    return res.json({ booking: hydrated })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body || {}

    const [rows] = await db.query(
      'SELECT * FROM bookings WHERE booking_ref = ? OR id = ? LIMIT 1',
      [id, id]
    )
    if (rows.length === 0) {
      return createBooking({ ...req, body: { ...body, booking_ref: id } }, res)
    }

    const current = rows[0]
    const bookingRef = current.booking_ref
    const nextTotal =
      body.total_amount !== undefined ? Number(body.total_amount) : Number(current.total_amount || 0)
    const nextPaid =
      body.amount_paid !== undefined ? Number(body.amount_paid) : Number(current.amount_paid || 0)
    const nextStatus =
      body.payment_status || derivePaymentStatus(nextTotal, nextPaid)
    const nextMethod = body.payment_method || current.payment_method || 'M-Pesa'
    const nextReceipt =
      body.mpesa_receipt !== undefined
        ? String(body.mpesa_receipt || '').trim().toUpperCase()
        : current.mpesa_receipt

    await db.query(
      `UPDATE bookings
       SET total_amount=?, amount_paid=?, payment_status=?, payment_method=?, mpesa_receipt=?, notes=?, updated_at=CURRENT_TIMESTAMP
       WHERE booking_ref=?`,
      [
        nextTotal,
        nextPaid,
        nextStatus,
        nextMethod,
        nextReceipt,
        body.notes !== undefined ? body.notes : current.notes,
        bookingRef,
      ]
    )

    if (Array.isArray(body.payments)) {
      for (const p of body.payments) {
        const pUid = p.id || `pmt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
        const [exists] = await db.query(
          'SELECT id FROM booking_payments WHERE payment_uid = ?',
          [pUid]
        )
        if (exists.length === 0 && Number(p.amount || 0) > 0) {
          await db.query(
            `INSERT INTO booking_payments
             (payment_uid, booking_ref, amount, currency, kes_amount, method, reference, status, note, recorded_by, payment_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, 'admin', ?)`,
            [
              pUid,
              bookingRef,
              Number(p.amount),
              current.currency || 'KSh',
              Math.round(Number(p.amount)),
              p.method || nextMethod,
              p.reference || nextReceipt || 'ADMIN-ENTRY',
              p.note || 'Recorded by Admin on behalf of client',
              p.date || new Date().toISOString().slice(0, 10),
            ]
          )
        }
      }
    }

    const [updatedRows] = await db.query('SELECT * FROM bookings WHERE booking_ref = ?', [
      bookingRef,
    ])
    const hydrated = await hydrateBooking(updatedRows[0])
    return res.json({ message: 'Client payment updated', booking: hydrated })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await db.query(
      'SELECT booking_ref FROM bookings WHERE booking_ref = ? OR id = ? LIMIT 1',
      [id, id]
    )
    if (rows.length > 0) {
      await db.query('DELETE FROM booking_payments WHERE booking_ref = ?', [rows[0].booking_ref])
      await db.query('DELETE FROM bookings WHERE booking_ref = ?', [rows[0].booking_ref])
    }
    return res.json({ message: 'Booking deleted' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

// Traveler / Customer Dashboard controllers
const getTravelerBookings = async (req, res) => {
  try {
    const userEmail = (req.user?.email || req.query.email || '').trim().toLowerCase()
    const userId = req.user?.id || null

    if (!userEmail && !userId) {
      return res.status(400).json({ error: 'User identifier or email required' })
    }

    const [rows] = await db.query(
      'SELECT * FROM bookings WHERE (user_id IS NOT NULL AND user_id = ?) OR LOWER(email) = ? ORDER BY id DESC',
      [userId || -1, userEmail]
    )

    const hydrated = await Promise.all(rows.map(hydrateBooking))
    return res.json({ bookings: hydrated })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const lookupGuestBooking = async (req, res) => {
  try {
    const { booking_ref, email } = req.body || {}
    const cleanRef = String(booking_ref || '').trim()
    const cleanEmail = String(email || '').trim().toLowerCase()

    if (!cleanRef || !cleanEmail) {
      return res.status(400).json({ error: 'Both Booking Reference and Email are required for guest lookup' })
    }

    const [rows] = await db.query(
      'SELECT * FROM bookings WHERE LOWER(booking_ref) = LOWER(?) AND LOWER(email) = ? LIMIT 1',
      [cleanRef, cleanEmail]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'No matching reservation found. Please verify your Booking Reference (e.g. FOMO-XXXXXX) and email address.',
      })
    }

    const hydrated = await hydrateBooking(rows[0])
    return res.json({ booking: hydrated })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const claimGuestBooking = async (req, res) => {
  try {
    const bcrypt = require('bcryptjs')
    const jwt = require('jsonwebtoken')
    const JWT_SECRET = () => process.env.JWT_SECRET || 'fomotours_secret_key_2026'

    const { booking_ref, email, password, full_name, phone } = req.body || {}
    const cleanRef = String(booking_ref || '').trim()
    const cleanEmail = String(email || '').trim().toLowerCase()

    if (!cleanRef || !cleanEmail || !password) {
      return res.status(400).json({ error: 'Booking Reference, Email, and a secure Password are required' })
    }

    const [bookingRows] = await db.query(
      'SELECT * FROM bookings WHERE LOWER(booking_ref) = LOWER(?) AND LOWER(email) = ? LIMIT 1',
      [cleanRef, cleanEmail]
    )

    if (bookingRows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found for this reference and email' })
    }

    const booking = bookingRows[0]

    // Check if user already exists
    let userId
    let userRecord
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [cleanEmail])

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id
      userRecord = existingUsers[0]
    } else {
      const hashed = await bcrypt.hash(password, 10)
      const name = (full_name || booking.full_name || cleanEmail.split('@')[0]).trim()
      const userPhone = phone || booking.phone || ''

      const [resIns] = await db.query(
        'INSERT INTO users (full_name, email, phone, password, auth_provider) VALUES (?, ?, ?, ?, ?)',
        [name, cleanEmail, userPhone, hashed, 'email']
      )
      userId = resIns.insertId
      userRecord = { id: userId, full_name: name, email: cleanEmail, phone: userPhone }
    }

    // Link booking to this user
    await db.query('UPDATE bookings SET user_id = ? WHERE booking_ref = ?', [userId, booking.booking_ref])

    const token = jwt.sign({ userId, role: 'traveler' }, JWT_SECRET(), {
      expiresIn: '30d',
    })

    const [updatedRows] = await db.query('SELECT * FROM bookings WHERE booking_ref = ?', [booking.booking_ref])
    const hydrated = await hydrateBooking(updatedRows[0])

    return res.json({
      message: 'Account successfully created and trip linked!',
      token,
      user: {
        id: userRecord.id,
        name: userRecord.full_name,
        email: userRecord.email,
        phone: userRecord.phone,
      },
      booking: hydrated,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const cancelTravelerBooking = async (req, res) => {
  try {
    const { id } = req.params
    const reason = req.body?.reason || 'Cancelled by client request'
    const [rows] = await db.query(
      'SELECT * FROM bookings WHERE booking_ref = ? OR id = ? LIMIT 1',
      [id, id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const b = rows[0]
    const updatedNotes = `${b.notes ? b.notes + '\n' : ''}[Cancellation Requested: ${new Date().toISOString().slice(0, 10)} - ${reason}]`
    await db.query(
      "UPDATE bookings SET payment_status = 'cancelled', notes = ?, updated_at = CURRENT_TIMESTAMP WHERE booking_ref = ?",
      [updatedNotes, b.booking_ref]
    )

    const [updated] = await db.query('SELECT * FROM bookings WHERE booking_ref = ?', [b.booking_ref])
    const hydrated = await hydrateBooking(updated[0])
    return res.json({ message: 'Booking cancellation registered', booking: hydrated })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updatePaymentStatus,
  deleteBooking,
  getTravelerBookings,
  lookupGuestBooking,
  claimGuestBooking,
  cancelTravelerBooking,
}
