import { API_BASE } from '../config/api.js'

const BOOKINGS_KEY = 'fomo_Managed_Bookings_v1'

const SEED_BOOKINGS = [
  {
    id: 'bk-1001',
    full_name: 'Wanjiku Kamau',
    email: 'wanjiku.k@gmail.com',
    phone: '+254 722 418 902',
    package_title: 'Bush to Indian Ocean: Tsavo Plains & Diani Reefs',
    package_slug: 'tsavo-diani',
    departure_date: '2026-12-12',
    num_guests: 2,
    currency: 'KSh',
    total_amount: 76000,
    amount_paid: 45000,
    payment_plan: 'lipa_pole_pole',
    payment_status: 'partial',
    payment_method: 'M-Pesa',
    mpesa_receipt: 'SJK84M2P9Q',
    notes: 'Lipa Pole Pole — balance due 5 days before SGR departure.',
    payments: [
      {
        id: 'pmt-1',
        date: '2026-11-02',
        amount: 25000,
        method: 'M-Pesa',
        reference: 'SJB41L9K2A',
        note: 'Initial booking deposit',
      },
      {
        id: 'pmt-2',
        date: '2026-11-06',
        amount: 20000,
        method: 'M-Pesa',
        reference: 'SJK84M2P9Q',
        note: '2nd Lipa Pole Pole installment logged by Admin',
      },
    ],
    created_at: '2026-11-02T09:30:00Z',
  },
  {
    id: 'bk-1002',
    full_name: 'Brian Ochieng',
    email: 'bochieng@outlook.com',
    phone: '+254 711 890 334',
    package_title: 'Rift Valley Escape: Boat Safaris & Gorge Cycling',
    package_slug: 'naivasha-hells-gate',
    departure_date: '2026-11-21',
    num_guests: 4,
    currency: 'KSh',
    total_amount: 26000,
    amount_paid: 26000,
    payment_plan: 'full',
    payment_status: 'paid',
    payment_method: 'M-Pesa',
    mpesa_receipt: 'SJL99T5R1W',
    notes: 'Group of 4 friends — CBD Kencom pickup.',
    payments: [
      {
        id: 'pmt-3',
        date: '2026-11-05',
        amount: 26000,
        method: 'M-Pesa',
        reference: 'SJL99T5R1W',
        note: 'Full payment confirmed via M-Pesa Till 9689363',
      },
    ],
    created_at: '2026-11-05T14:15:00Z',
  },
  {
    id: 'bk-1003',
    full_name: 'Claire & Marc Dubois',
    email: 'claire.dubois@wanadoo.fr',
    phone: '+33 6 42 88 19 04',
    package_title: 'Great Migration: Mara River Crossings & Big Cats',
    package_slug: 'mara-migration',
    departure_date: '2026-12-18',
    num_guests: 2,
    currency: 'USD',
    total_amount: 2900,
    amount_paid: 0,
    payment_plan: 'lipa_pole_pole',
    payment_status: 'pending',
    payment_method: 'Bank Transfer',
    mpesa_receipt: '',
    notes: 'Requested invoice for 30% wire deposit.',
    payments: [],
    created_at: '2026-11-06T16:45:00Z',
  },
]

export function readRawBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY)
    let parsed = null
    if (!raw) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(SEED_BOOKINGS))
      parsed = SEED_BOOKINGS
    } else {
      parsed = JSON.parse(raw)
    }
    if (!Array.isArray(parsed)) return []
    return parsed.map((b) => {
      const pSum =
        Array.isArray(b.payments) && b.payments.length > 0
          ? b.payments.reduce((acc, p) => acc + Number(p.amount || 0), 0)
          : 0
      const paid = Math.max(Number(b.amount_paid || 0), pSum)
      const total = Number(b.total_amount || 0)
      const status =
        total > 0 && paid >= total
          ? 'paid'
          : paid > 0
            ? 'partial'
            : b.payment_status || 'pending'
      return {
        ...b,
        amount_paid: paid,
        payment_status: status,
      }
    })
  } catch {
    return SEED_BOOKINGS
  }
}

function writeRawBookings(list) {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list))
    window.dispatchEvent(new Event('fomo-bookings-updated'))
    return true
  } catch (err) {
    console.error('Bookings write failed:', err)
    return false
  }
}

function mergeBookingIntoLocal(booking) {
  if (!booking || (!booking.id && !booking.booking_ref)) return
  const ref = booking.booking_ref || booking.id
  const list = readRawBookings()
  const idx = list.findIndex(
    (b) => b.id === booking.id || b.id === ref || b.booking_ref === ref
  )

  const pSum =
    Array.isArray(booking.payments) && booking.payments.length > 0
      ? booking.payments.reduce((acc, p) => acc + Number(p.amount || 0), 0)
      : 0
  const normalizedPaid = Math.max(Number(booking.amount_paid || 0), pSum)
  const total = Number(booking.total_amount || 0)
  const status =
    total > 0 && normalizedPaid >= total
      ? 'paid'
      : normalizedPaid > 0
        ? 'partial'
        : booking.payment_status || 'pending'

  const normalizedBooking = {
    ...booking,
    amount_paid: normalizedPaid,
    payment_status: status,
  }

  if (idx >= 0) {
    const next = [...list]
    next[idx] = { ...next[idx], ...normalizedBooking }
    writeRawBookings(next)
  } else {
    writeRawBookings([normalizedBooking, ...list])
  }
}

export function formatBookingMoney(amount = 0, currency = 'KSh') {
  const num = Number(amount || 0)
  const formatted = num.toLocaleString('en-US')
  return currency === 'USD' ? `$${formatted}` : `KSh ${formatted}`
}

export function derivePaymentStatus(totalAmount, amountPaid, explicitOverride = '') {
  if (explicitOverride === 'failed') return 'failed'
  const total = Number(totalAmount || 0)
  const paid = Number(amountPaid || 0)
  if (total > 0 && paid >= total) return 'paid'
  if (paid > 0 && paid < total) return 'partial'
  return 'pending'
}

export function getAllManagedBookings() {
  const list = readRawBookings()
  return [...list].sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  )
}

export async function syncBookingsFromApi() {
  try {
    const token = localStorage.getItem('fomo_admin_token')
    if (!token) return getAllManagedBookings()

    const res = await fetch(`${API_BASE}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return getAllManagedBookings()

    const data = await res.json()
    if (Array.isArray(data.bookings) && data.bookings.length > 0) {
      const localMap = new Map(readRawBookings().map((b) => [b.id, b]))
      for (const apiBooking of data.bookings) {
        const id = apiBooking.id || apiBooking.booking_ref
        localMap.set(id, { ...(localMap.get(id) || {}), ...apiBooking, id })
      }
      const merged = Array.from(localMap.values()).sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      )
      writeRawBookings(merged)
      return merged
    }
  } catch {
    // Offline fallback works seamlessly
  }
  return getAllManagedBookings()
}

export async function createClientBooking(payload) {
  const list = readRawBookings()
  const total = Number(payload.total_amount || 0)
  const initialPaid = Number(payload.initial_paid || 0)
  const currency = payload.currency || 'KSh'
  const method = payload.payment_method || 'M-Pesa'
  const ref = (payload.mpesa_receipt || '').trim().toUpperCase()

  const payments =
    initialPaid > 0
      ? [
          {
            id: `pmt-${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
            amount: initialPaid,
            method,
            reference: ref || 'ADMIN-LOG',
            note: payload.payment_note || 'Recorded on behalf of client',
          },
        ]
      : []

  const newBooking = {
    id: payload.id || `bk-${Date.now().toString(36)}`,
    full_name: payload.full_name || 'Client',
    email: payload.email || '',
    phone: payload.phone || '',
    package_title: payload.package_title || 'Custom Kenyan Safari',
    package_slug: payload.package_slug || '',
    departure_date: payload.departure_date || '',
    num_guests: Number(payload.num_guests || 1),
    currency,
    total_amount: total,
    amount_paid: initialPaid,
    payment_status: derivePaymentStatus(total, initialPaid),
    payment_plan:
      payload.payment_plan ||
      (initialPaid > 0 && initialPaid < total ? 'lipa_pole_pole' : 'full'),
    payment_method: method,
    mpesa_receipt: ref,
    notes: payload.notes || '',
    payments,
    created_at: new Date().toISOString(),
  }

  writeRawBookings([newBooking, ...list])

  try {
    const token = localStorage.getItem('fomo_admin_token')
    const res = await fetch(`${API_BASE}/api/bookings/upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(newBooking),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.booking) {
        mergeBookingIntoLocal(data.booking)
        return data.booking
      }
    }
  } catch {
    // Offline local store works seamlessly
  }

  return newBooking
}

/**
 * Triggers a live Safaricom Daraja M-Pesa Express (STK Push) prompt for Pay All or Lipa Pole Pole.
 */
export async function initiateMpesaStkPush({
  bookingId,
  phone,
  amount,
  currency = 'KSh',
  paymentPlan = 'full',
  note = '',
}) {
  const res = await fetch(`${API_BASE}/api/payments/stkpush`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      booking_ref: bookingId,
      phone,
      amount,
      currency,
      payment_plan: paymentPlan,
      note,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Could not send M-Pesa prompt to phone')
  }
  return data
}

/**
 * Polls live Daraja STK Push status (`pending` | `completed` | `failed`) and syncs booking store.
 */
export async function checkMpesaStkStatus(checkoutRequestId) {
  const res = await fetch(`${API_BASE}/api/payments/status/${encodeURIComponent(checkoutRequestId)}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Unable to check M-Pesa payment status')
  }
  if (data.booking) {
    mergeBookingIntoLocal(data.booking)
  }
  return data
}

/**
 * Record an installment / full payment OR manually update payment details on behalf of a client.
 */
export async function recordClientPayment(
  bookingId,
  {
    addAmount = 0,
    totalAmount,
    method = 'M-Pesa',
    reference = '',
    note = '',
    statusOverride = '',
  } = {}
) {
  const list = readRawBookings()
  let updatedRecord = null

  const nextList = list.map((b) => {
    if (b.id !== bookingId) return b

    const nextTotal =
      totalAmount !== undefined && totalAmount !== ''
        ? Number(totalAmount)
        : Number(b.total_amount || 0)

    const added = Number(addAmount || 0)
    const cleanRef = reference.trim().toUpperCase()
    const existingPayments = Array.isArray(b.payments) ? [...b.payments] : []

    if (added > 0) {
      existingPayments.unshift({
        id: `pmt-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        amount: added,
        method,
        reference: cleanRef || 'ADMIN-ENTRY',
        note: note || 'Payment updated by Admin on behalf of client',
      })
    }

    let nextPaid = Number(b.amount_paid || 0) + added
    if (statusOverride === 'paid' && added === 0 && nextPaid < nextTotal) {
      const diff = nextTotal - nextPaid
      nextPaid = nextTotal
      if (diff > 0) {
        existingPayments.unshift({
          id: `pmt-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          amount: diff,
          method,
          reference: cleanRef || b.mpesa_receipt || 'PAID-FULL',
          note: note || 'Marked Paid in Full by Admin on behalf of client',
        })
      }
    } else if (statusOverride === 'pending' && added === 0) {
      nextPaid = 0
    }

    const computedStatus =
      statusOverride && ['paid', 'partial', 'pending', 'failed'].includes(statusOverride)
        ? statusOverride === 'partial' && nextPaid === 0
          ? 'partial'
          : derivePaymentStatus(nextTotal, nextPaid, statusOverride)
        : derivePaymentStatus(nextTotal, nextPaid)

    updatedRecord = {
      ...b,
      total_amount: nextTotal,
      amount_paid: nextPaid,
      payment_status: statusOverride === 'failed' ? 'failed' : computedStatus,
      payment_method: method || b.payment_method,
      mpesa_receipt: cleanRef || b.mpesa_receipt,
      notes: note && added === 0 ? note : b.notes,
      payments: existingPayments,
      updated_at: new Date().toISOString(),
    }
    return updatedRecord
  })

  writeRawBookings(nextList)

  if (updatedRecord) {
    try {
      const token = localStorage.getItem('fomo_admin_token')
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updatedRecord),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.booking) {
          mergeBookingIntoLocal(data.booking)
          return data.booking
        }
      }
    } catch {
      // Offline mode already persisted
    }
  }

  return updatedRecord
}

export async function deleteManagedBooking(bookingId) {
  const list = readRawBookings().filter((b) => b.id !== bookingId)
  writeRawBookings(list)

  try {
    const token = localStorage.getItem('fomo_admin_token')
    if (token) {
      await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    }
  } catch {
    // Offline delete already saved
  }
}

// Guest & Traveler Dashboard Utilities
const GUEST_BOOKINGS_KEY = 'fomo_guest_bookings_v1'

export function saveGuestBookingRef(bookingRef) {
  if (!bookingRef) return
  try {
    const existing = JSON.parse(localStorage.getItem(GUEST_BOOKINGS_KEY) || '[]')
    if (!existing.includes(bookingRef)) {
      existing.unshift(bookingRef)
      localStorage.setItem(GUEST_BOOKINGS_KEY, JSON.stringify(existing.slice(0, 10)))
    }
  } catch {
    // ignore
  }
}

export function getStoredGuestBookingRefs() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_BOOKINGS_KEY) || '[]')
  } catch {
    return []
  }
}

export async function fetchTravelerBookings() {
  const token = localStorage.getItem('fomo_traveler_token')
  let travelerEmail = ''
  try {
    const traveler = JSON.parse(localStorage.getItem('fomo_traveler') || 'null')
    if (traveler?.email) travelerEmail = traveler.email.trim().toLowerCase()
  } catch {
    // ignore
  }

  try {
    const res = await fetch(`${API_BASE}/api/bookings/my-trips?email=${encodeURIComponent(travelerEmail)}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.bookings)) {
        data.bookings.forEach(mergeBookingIntoLocal)
        return data.bookings
      }
    }
  } catch {
    // fallback to local below
  }

  // Fallback: match from local database/localStorage
  const all = readRawBookings()
  if (travelerEmail) {
    return all.filter((b) => String(b.email || '').toLowerCase() === travelerEmail)
  }
  return []
}

export async function lookupGuestReservation(bookingRef, email) {
  const res = await fetch(`${API_BASE}/api/bookings/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_ref: bookingRef, email }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Could not locate your reservation. Please verify your reference.')
  }

  if (data.booking) {
    mergeBookingIntoLocal(data.booking)
    saveGuestBookingRef(data.booking.id || data.booking.booking_ref)
  }
  return data.booking
}

export async function claimGuestReservation({ bookingRef, email, password, fullName, phone }) {
  const res = await fetch(`${API_BASE}/api/bookings/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      booking_ref: bookingRef,
      email,
      password,
      full_name: fullName,
      phone,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create account and claim trip.')
  }

  if (data.token) {
    localStorage.setItem('fomo_traveler_token', data.token)
  }
  if (data.user) {
    localStorage.setItem('fomo_traveler', JSON.stringify(data.user))
    window.dispatchEvent(new Event('fomo-auth-change'))
  }
  if (data.booking) {
    mergeBookingIntoLocal(data.booking)
  }

  return data
}

export async function cancelBookingRequest(bookingId, reason = '') {
  const token = localStorage.getItem('fomo_traveler_token')
  const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ reason }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Could not cancel booking')
  }
  if (data.booking) {
    mergeBookingIntoLocal(data.booking)
  }
  return data.booking
}
