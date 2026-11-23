import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Wallet,
  Plus,
  X,
  Check,
  Trash2,
} from 'lucide-react'
import AdminLayout from './AdminLayout'
import {
  getAllManagedBookings,
  syncBookingsFromApi,
  createClientBooking,
  recordClientPayment,
  initiateMpesaStkPush,
  checkMpesaStkStatus,
  deleteManagedBooking,
  formatBookingMoney,
} from '../../utils/bookingStore.js'
import { getAllManagedTrips } from '../../utils/tripStore.js'
import './Admin.css'
import './AdminDashboard.css'
import './AdminPackages.css'
import './AdminPackageForm.css'
import './AdminBookings.css'

const PAYMENT_METHODS = ['M-Pesa', 'Bank Transfer', 'Card', 'Cash in Office']

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [trips, setTrips] = useState([])
  const [admin, setAdmin] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState('')

  // Update Payment on Behalf of Client modal
  const [activeBookingId, setActiveBookingId] = useState(null)
  const [payForm, setPayForm] = useState({
    addAmount: '',
    method: 'M-Pesa',
    reference: '',
    statusOverride: '',
    totalAmount: '',
    note: '',
  })

  // Create Booking on Behalf of Client modal
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [newBooking, setNewBooking] = useState({
    full_name: '',
    email: '',
    phone: '',
    package_title: '',
    departure_date: '',
    num_guests: 2,
    currency: 'KSh',
    total_amount: '',
    initial_paid: '',
    payment_method: 'M-Pesa',
    mpesa_receipt: '',
    notes: '',
  })

  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('fomo_admin')
    if (!stored) {
      navigate('/admin')
      return undefined
    }
    setAdmin(JSON.parse(stored))

    const sync = () => {
      setBookings(getAllManagedBookings())
      const liveTrips = getAllManagedTrips({ includeDrafts: false, excludeAliases: true })
      setTrips(liveTrips)
    }
    sync()
    syncBookingsFromApi().catch(() => {})

    window.addEventListener('fomo-bookings-updated', sync)
    window.addEventListener('fomo-trips-updated', sync)
    return () => {
      window.removeEventListener('fomo-bookings-updated', sync)
      window.removeEventListener('fomo-trips-updated', sync)
    }
  }, [navigate])

  const activeBooking = bookings.find((b) => b.id === activeBookingId) || null

  const openPaymentModal = (booking) => {
    const remaining = Math.max(
      0,
      Number(booking.total_amount || 0) - Number(booking.amount_paid || 0)
    )
    setActiveBookingId(booking.id)
    setPayForm({
      addAmount: remaining > 0 ? String(remaining) : '',
      method: booking.payment_method || 'M-Pesa',
      reference: '',
      statusOverride: '',
      totalAmount: String(booking.total_amount || 0),
      note: '',
    })
  }

  const handleSavePayment = async (e) => {
    e.preventDefault()
    if (!activeBooking) return

    const updated = await recordClientPayment(activeBooking.id, {
      addAmount: Number(payForm.addAmount || 0),
      totalAmount: payForm.totalAmount,
      method: payForm.method,
      reference: payForm.reference,
      note: payForm.note,
      statusOverride: payForm.statusOverride,
    })

    setActiveBookingId(null)
    if (updated) {
      setToast(
        `Updated payment on behalf of ${updated.full_name} — Paid ${formatBookingMoney(updated.amount_paid, updated.currency)} of ${formatBookingMoney(updated.total_amount, updated.currency)}`
      )
      setTimeout(() => setToast(''), 4500)
    }
  }

  const handleSendClientStkPush = async () => {
    if (!activeBooking) return
    const amt = Number(payForm.addAmount || 0)
    if (amt <= 0) {
      setToast('Enter an installment or balance amount greater than 0 to send M-Pesa STK Push.')
      setTimeout(() => setToast(''), 4000)
      return
    }
    try {
      const stk = await initiateMpesaStkPush({
        bookingId: activeBooking.id,
        phone: activeBooking.phone,
        amount: amt,
        currency: activeBooking.currency,
        paymentPlan: activeBooking.payment_plan || 'lipa_pole_pole',
        note: payForm.note || 'M-Pesa STK Push triggered by Admin',
      })
      setActiveBookingId(null)
      setToast(
        `Sent M-Pesa prompt (KSh ${Number(stk.amountKes || 0).toLocaleString()} · Till ${stk.tillNumber || '9689363'}) to ${activeBooking.phone}`
      )
      setTimeout(() => setToast(''), 5500)

      if (stk.checkoutRequestId) {
        let attempts = 0
        const poll = setInterval(async () => {
          attempts += 1
          try {
            const st = await checkMpesaStkStatus(stk.checkoutRequestId)
            if (st.state === 'completed') {
              clearInterval(poll)
              setToast(`M-Pesa payment confirmed for ${activeBooking.full_name} (${st.reference})!`)
              setTimeout(() => setToast(''), 5500)
            } else if (st.state === 'failed' || attempts >= 16) {
              clearInterval(poll)
            }
          } catch {
            if (attempts >= 16) clearInterval(poll)
          }
        }, 4000)
      }
    } catch (err) {
      setToast(err.message || 'Could not send M-Pesa STK Push')
      setTimeout(() => setToast(''), 5000)
    }
  }

  const handleSelectTripForNewBooking = (title) => {
    const matched = trips.find((t) => t.title === title)
    if (matched) {
      const rawPrice = String(matched.price || '')
      const currency = rawPrice.includes('$') ? 'USD' : 'KSh'
      const numericUnit = Number(rawPrice.replace(/[^0-9.]/g, '') || 0)
      const guests = Number(newBooking.num_guests || 1)
      setNewBooking((prev) => ({
        ...prev,
        package_title: title,
        currency,
        total_amount: numericUnit > 0 ? String(numericUnit * guests) : prev.total_amount,
      }))
    } else {
      setNewBooking((prev) => ({ ...prev, package_title: title }))
    }
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    const created = await createClientBooking(newBooking)
    setNewModalOpen(false)
    setNewBooking({
      full_name: '',
      email: '',
      phone: '',
      package_title: '',
      departure_date: '',
      num_guests: 2,
      currency: 'KSh',
      total_amount: '',
      initial_paid: '',
      payment_method: 'M-Pesa',
      mpesa_receipt: '',
      notes: '',
    })
    setToast(`Created booking & payment record for ${created.full_name}.`)
    setTimeout(() => setToast(''), 4500)
  }

  const handleDeleteBooking = (booking) => {
    if (window.confirm(`Remove booking record for ${booking.full_name}?`)) {
      deleteManagedBooking(booking.id)
    }
  }

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase()
    const matchSearch =
      b.full_name?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q) ||
      b.mpesa_receipt?.toLowerCase().includes(q) ||
      b.package_title?.toLowerCase().includes(q)
    const matchFilter = filter === 'all' || b.payment_status === filter
    return matchSearch && matchFilter
  })

  const stats = {
    total: bookings.length,
    paid: bookings.filter((b) => b.payment_status === 'paid').length,
    partial: bookings.filter((b) => b.payment_status === 'partial').length,
    pending: bookings.filter((b) => b.payment_status === 'pending').length,
  }

  return (
    <AdminLayout admin={admin} search={search} onSearch={setSearch}>
      <div className="admin-packages-top">
        <div className="admin-page-title">
          <h1>Bookings &amp; Client Payments</h1>
          <p>
            Record M-Pesa installments, Lipa Pole Pole deposits, or full payments on behalf of clients
          </p>
        </div>
        <div className="admin-packages__cta-group">
          <button
            type="button"
            className="admin-packages__add"
            onClick={() => setNewModalOpen(true)}
          >
            <Plus size={16} /> New Client Booking
          </button>
        </div>
      </div>

      {toast && (
        <div className="wizard-toast">
          <span>{toast}</span>
        </div>
      )}

      <div className="admin-booking-stats">
        <div className="admin-booking-stat">
          <span className="admin-booking-stat__value">{stats.total}</span>
          <span className="admin-booking-stat__label">Total Bookings</span>
        </div>
        <div className="admin-booking-stat admin-booking-stat--green">
          <span className="admin-booking-stat__value">{stats.paid}</span>
          <span className="admin-booking-stat__label">Paid in Full</span>
        </div>
        <div className="admin-booking-stat admin-booking-stat--orange">
          <span className="admin-booking-stat__value">{stats.partial}</span>
          <span className="admin-booking-stat__label">Partial (Lipa Pole Pole)</span>
        </div>
        <div className="admin-booking-stat admin-booking-stat--yellow">
          <span className="admin-booking-stat__value">{stats.pending}</span>
          <span className="admin-booking-stat__label">Awaiting Deposit</span>
        </div>
      </div>

      <div className="admin-booking-filters">
        {[
          { key: 'all', label: 'All Bookings' },
          { key: 'paid', label: 'Paid in Full' },
          { key: 'partial', label: 'Partial / Installments' },
          { key: 'pending', label: 'Pending' },
          { key: 'failed', label: 'Failed / Cancelled' },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            className={`admin-booking-filter ${filter === f.key ? 'admin-booking-filter--active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="admin-card">
        {filtered.length === 0 ? (
          <div className="admin-empty-state">
            <Users size={40} />
            <p>No client bookings match your current filter.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Trip &amp; Departure</th>
                  <th>Guests</th>
                  <th>Paid / Balance</th>
                  <th>Latest Receipt</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const total = Number(b.total_amount || 0)
                  const paid = Number(b.amount_paid || 0)
                  const remaining = Math.max(0, total - paid)
                  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0

                  return (
                    <tr key={b.id}>
                      <td>
                        <div className="admin-table__client">
                          <div className="admin-table__avatar">
                            {(b.full_name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="admin-table__name">{b.full_name}</div>
                            <div className="admin-table__email">
                              {b.phone || b.email || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-table__name">{b.package_title}</div>
                        <div className="admin-table__email">
                          {b.departure_date
                            ? `Departs ${new Date(b.departure_date).toLocaleDateString()}`
                            : 'Flexible date'}
                          {b.payment_plan
                            ? ` · Plan: ${b.payment_plan === 'lipa_pole_pole' ? 'Lipa Pole Pole' : 'Full Payment'}`
                            : ''}
                        </div>
                      </td>
                      <td>{b.num_guests}</td>
                      <td>
                        <div className="admin-pay-balance">
                          <div className="admin-pay-balance__nums">
                            <strong>{formatBookingMoney(paid, b.currency)}</strong>
                            <span>of {formatBookingMoney(total, b.currency)}</span>
                          </div>
                          <div className="admin-pay-balance__bar">
                            <div
                              className={`admin-pay-balance__fill ${pct >= 100 ? 'admin-pay-balance__fill--paid' : ''}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {remaining > 0 && (
                            <span style={{ fontSize: '11px', color: 'rgba(20,18,14,0.52)' }}>
                              Balance: {formatBookingMoney(remaining, b.currency)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {b.mpesa_receipt ? (
                          <span className="admin-table__receipt">{b.mpesa_receipt}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${b.payment_status}`}>
                          {b.payment_status === 'partial' ? 'Lipa Pole Pole' : b.payment_status}
                        </span>
                      </td>
                      <td>
                        <div className="admin-pkg-actions">
                          <button
                            type="button"
                            className="admin-pay-btn"
                            onClick={() => openPaymentModal(b)}
                          >
                            <Wallet size={13} />
                            <span>Update Payment</span>
                          </button>
                          <button
                            type="button"
                            className="admin-pkg-action admin-pkg-action--delete"
                            onClick={() => handleDeleteBooking(b)}
                            title="Delete booking"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Update Payment on Behalf of Client Modal ─── */}
      {activeBooking && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setActiveBookingId(null)}
        >
          <form
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSavePayment}
          >
            <div className="admin-modal__head">
              <div>
                <span className="admin-modal__kicker">UPDATE PAYMENT ON BEHALF OF CLIENT</span>
                <h3 className="admin-modal__title">{activeBooking.full_name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'rgba(20,18,14,0.58)' }}>
                  {activeBooking.package_title} · {activeBooking.num_guests} guest(s)
                </p>
              </div>
              <button
                type="button"
                className="admin-modal__close"
                onClick={() => setActiveBookingId(null)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {(() => {
              const total = Number(payForm.totalAmount || activeBooking.total_amount || 0)
              const paidSoFar = Number(activeBooking.amount_paid || 0)
              const balanceDue = Math.max(0, total - paidSoFar)

              return (
                <>
                  <div className="admin-modal__summary">
                    <div className="admin-modal__metric">
                      <span>Total Trip Cost</span>
                      <strong>{formatBookingMoney(total, activeBooking.currency)}</strong>
                    </div>
                    <div className="admin-modal__metric">
                      <span>Paid So Far</span>
                      <strong>{formatBookingMoney(paidSoFar, activeBooking.currency)}</strong>
                    </div>
                    <div className="admin-modal__metric">
                      <span>Balance Due</span>
                      <strong>{formatBookingMoney(balanceDue, activeBooking.currency)}</strong>
                    </div>
                  </div>

                  {balanceDue > 0 && (
                    <div className="admin-modal__quick-fills">
                      <button
                        type="button"
                        className="admin-modal__quick-pill"
                        onClick={() =>
                          setPayForm((p) => ({
                            ...p,
                            addAmount: String(balanceDue),
                            statusOverride: 'paid',
                          }))
                        }
                      >
                        + Pay Full Balance ({formatBookingMoney(balanceDue, activeBooking.currency)})
                      </button>
                      <button
                        type="button"
                        className="admin-modal__quick-pill"
                        onClick={() =>
                          setPayForm((p) => ({
                            ...p,
                            addAmount: String(Math.round(total * 0.5)),
                            statusOverride: '',
                          }))
                        }
                      >
                        + 50% Deposit ({formatBookingMoney(Math.round(total * 0.5), activeBooking.currency)})
                      </button>
                      <button
                        type="button"
                        className="admin-modal__quick-pill"
                        onClick={() =>
                          setPayForm((p) => ({
                            ...p,
                            addAmount: '0',
                            statusOverride: 'paid',
                          }))
                        }
                      >
                        Mark Paid in Full
                      </button>
                    </div>
                  )}
                </>
              )
            })()}

            <div className="wizard-fields">
              <div className="wizard-row">
                <div className="wizard-field">
                  <label>
                    Amount Received ({activeBooking.currency}) <span>New installment</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 20000"
                    value={payForm.addAmount}
                    onChange={(e) => setPayForm((p) => ({ ...p, addAmount: e.target.value }))}
                  />
                </div>
                <div className="wizard-field">
                  <label>Payment Channel</label>
                  <select
                    value={payForm.method}
                    onChange={(e) => setPayForm((p) => ({ ...p, method: e.target.value }))}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="wizard-row">
                <div className="wizard-field">
                  <label>
                    M-Pesa / Transaction Code <span>Optional</span>
                  </label>
                  <input
                    placeholder="e.g. SJK84M2P9Q"
                    value={payForm.reference}
                    onChange={(e) => setPayForm((p) => ({ ...p, reference: e.target.value }))}
                  />
                </div>
                <div className="wizard-field">
                  <label>Status Override</label>
                  <select
                    value={payForm.statusOverride}
                    onChange={(e) =>
                      setPayForm((p) => ({ ...p, statusOverride: e.target.value }))
                    }
                  >
                    <option value="">Auto-calculate from balance</option>
                    <option value="paid">Paid in Full</option>
                    <option value="partial">Partial (Lipa Pole Pole)</option>
                    <option value="pending">Pending Deposit (Reset to 0)</option>
                    <option value="failed">Failed / Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="wizard-row">
                <div className="wizard-field">
                  <label>
                    Total Agreed Trip Cost ({activeBooking.currency}) <span>Editable</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={payForm.totalAmount}
                    onChange={(e) => setPayForm((p) => ({ ...p, totalAmount: e.target.value }))}
                  />
                </div>
                <div className="wizard-field">
                  <label>
                    Payment Note <span>Optional</span>
                  </label>
                  <input
                    placeholder="e.g. Sent M-Pesa confirmation on WhatsApp"
                    value={payForm.note}
                    onChange={(e) => setPayForm((p) => ({ ...p, note: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {Array.isArray(activeBooking.payments) && activeBooking.payments.length > 0 && (
              <div className="admin-modal__ledger">
                <h4>Recorded Payment History ({activeBooking.payments.length})</h4>
                {activeBooking.payments.map((pmt) => (
                  <div key={pmt.id} className="admin-modal__ledger-row">
                    <div>
                      <strong>
                        {formatBookingMoney(pmt.amount, activeBooking.currency)}
                      </strong>{' '}
                      <span style={{ color: 'rgba(20,18,14,0.58)' }}>
                        via {pmt.method} · {pmt.date}
                      </span>
                      {pmt.note && (
                        <div style={{ fontSize: '11.5px', color: 'rgba(20,18,14,0.52)' }}>
                          {pmt.note}
                        </div>
                      )}
                    </div>
                    <span className="admin-table__receipt">{pmt.reference}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="admin-modal__actions">
              <button
                type="button"
                className="admin-packages__add admin-packages__add--secondary"
                onClick={() => setActiveBookingId(null)}
              >
                Cancel
              </button>
              {activeBooking.phone && (
                <button
                  type="button"
                  className="admin-packages__add admin-packages__add--secondary"
                  style={{ background: '#2474CC', color: '#FFFFFF' }}
                  onClick={handleSendClientStkPush}
                >
                  Send M-Pesa STK Push
                </button>
              )}
              <button type="submit" className="admin-packages__add">
                <Check size={15} /> Save Client Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Create Booking on Behalf of Client Modal ─── */}
      {newModalOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setNewModalOpen(false)}
        >
          <form
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateBooking}
          >
            <div className="admin-modal__head">
              <div>
                <span className="admin-modal__kicker">BOOK ON BEHALF OF CLIENT</span>
                <h3 className="admin-modal__title">New Client Booking &amp; Deposit</h3>
              </div>
              <button
                type="button"
                className="admin-modal__close"
                onClick={() => setNewModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="wizard-fields">
              <div className="wizard-row">
                <div className="wizard-field">
                  <label>Client Full Name</label>
                  <input
                    required
                    placeholder="e.g. Amina Hassan"
                    value={newBooking.full_name}
                    onChange={(e) =>
                      setNewBooking((p) => ({ ...p, full_name: e.target.value }))
                    }
                  />
                </div>
                <div className="wizard-field">
                  <label>Phone / WhatsApp</label>
                  <input
                    placeholder="+254 7..."
                    value={newBooking.phone}
                    onChange={(e) =>
                      setNewBooking((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="wizard-row">
                <div className="wizard-field">
                  <label>Client Email</label>
                  <input
                    type="email"
                    placeholder="client@email.com"
                    value={newBooking.email}
                    onChange={(e) =>
                      setNewBooking((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
                <div className="wizard-field">
                  <label>Departure Date</label>
                  <input
                    type="date"
                    value={newBooking.departure_date}
                    onChange={(e) =>
                      setNewBooking((p) => ({ ...p, departure_date: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="wizard-field">
                <label>Select Trip</label>
                <select
                  required
                  value={newBooking.package_title}
                  onChange={(e) => handleSelectTripForNewBooking(e.target.value)}
                >
                  <option value="">Choose a FOMO trip…</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.title}>
                      {t.title} ({t.price})
                    </option>
                  ))}
                  <option value="Custom Private Kenyan Safari">
                    Custom Private Kenyan Safari
                  </option>
                </select>
              </div>

              <div className="wizard-row">
                <div className="wizard-field">
                  <label>Number of Guests</label>
                  <input
                    type="number"
                    min="1"
                    value={newBooking.num_guests}
                    onChange={(e) =>
                      setNewBooking((p) => ({ ...p, num_guests: Number(e.target.value || 1) }))
                    }
                  />
                </div>
                <div className="wizard-field">
                  <label>Currency</label>
                  <select
                    value={newBooking.currency}
                    onChange={(e) =>
                      setNewBooking((p) => ({ ...p, currency: e.target.value }))
                    }
                  >
                    <option value="KSh">KSh (KES)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="wizard-row">
                <div className="wizard-field">
                  <label>Total Trip Amount</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="e.g. 52000"
                    value={newBooking.total_amount}
                    onChange={(e) =>
                      setNewBooking((p) => ({ ...p, total_amount: e.target.value }))
                    }
                  />
                </div>
                <div className="wizard-field">
                  <label>
                    Amount Paid Now <span>0 if pending</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 20000"
                    value={newBooking.initial_paid}
                    onChange={(e) =>
                      setNewBooking((p) => ({ ...p, initial_paid: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="wizard-row">
                <div className="wizard-field">
                  <label>Payment Channel</label>
                  <select
                    value={newBooking.payment_method}
                    onChange={(e) =>
                      setNewBooking((p) => ({ ...p, payment_method: e.target.value }))
                    }
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="wizard-field">
                  <label>
                    M-Pesa / Ref Code <span>Optional</span>
                  </label>
                  <input
                    placeholder="e.g. SJM72P4N8K"
                    value={newBooking.mpesa_receipt}
                    onChange={(e) =>
                      setNewBooking((p) => ({ ...p, mpesa_receipt: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="admin-modal__actions">
              <button
                type="button"
                className="admin-packages__add admin-packages__add--secondary"
                onClick={() => setNewModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="admin-packages__add">
                <Check size={15} /> Create Booking
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  )
}
