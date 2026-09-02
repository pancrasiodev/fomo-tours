import { useState } from 'react'
import { Calendar, Users, Phone, Mail, User, MessageSquare, CheckCircle } from 'lucide-react'
import './TripBooking.css'

export default function TripBooking({ pkg, dates }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    num_guests: 1,
    special_requests: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setStep(2)
  }

  const totalAmount = selectedDate
    ? selectedDate.price_per_person * form.num_guests
    : 0

  const handleBooking = async () => {
    if (!form.full_name || !form.email || !form.phone) {
      setError('Please fill in all required fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_date_id: selectedDate.id,
          ...form,
          num_guests: parseInt(form.num_guests)
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Booking failed'); return }
      setBooking(data)
      setStep(3)
    } catch (err) {
      setError('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMpesa = async () => {
    if (!booking) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:5000/api/payments/mpesa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.booking_id,
          phone: form.phone,
          amount: totalAmount
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Payment failed'); return }
      setStep(4)
    } catch (err) {
      setError('Payment error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="trip-booking">

      {/* Price display */}
      <div className="trip-booking__price-card">
        <span className="trip-booking__from">From</span>
        <div className="trip-booking__price">
          {dates.length > 0 ? (
            <>
              <span className="trip-booking__amount">
                ${Math.min(...dates.map(d => d.price_per_person)).toLocaleString()}
              </span>
              <span className="trip-booking__per">per person</span>
            </>
          ) : (
            <span className="trip-booking__amount">Contact Us</span>
          )}
        </div>
        <div className="trip-booking__duration">
          <Calendar size={14} /> {pkg.duration}
        </div>
      </div>

      {/* Step indicators */}
      <div className="trip-booking__steps">
        {['Select Date', 'Your Details', 'Payment'].map((label, i) => (
          <div
            key={i}
            className={`trip-booking__step ${step > i + 1 ? 'trip-booking__step--done' : ''} ${step === i + 1 ? 'trip-booking__step--active' : ''}`}
          >
            <div className="trip-booking__step-num">
              {step > i + 1 ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Step 1 - Date selection */}
      {step === 1 && (
        <div className="trip-booking__section">
          <h3 className="trip-booking__section-title">Choose Departure Date</h3>
          {dates.length === 0 ? (
            <div className="trip-booking__no-dates">
              <Calendar size={32} />
              <p>No available dates at the moment.</p>
              <a href="/contact" className="trip-booking__contact-btn">Contact Us</a>
            </div>
          ) : (
            <div className="trip-booking__dates">
              {dates.map((date) => (
                <button
                  key={date.id}
                  className={`trip-booking__date-card ${selectedDate?.id === date.id ? 'trip-booking__date-card--selected' : ''}`}
                  onClick={() => handleDateSelect(date)}
                >
                  <div className="trip-booking__date-info">
                    <span className="trip-booking__date-dep">
                      {new Date(date.departure_date).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                    <span className="trip-booking__date-ret">
                      to {new Date(date.return_date).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="trip-booking__date-right">
                    <span className="trip-booking__date-price">${date.price_per_person}<sup>pp</sup></span>
                    <span className={`trip-booking__date-slots ${date.slots_available <= 3 ? 'trip-booking__date-slots--low' : ''}`}>
                      {date.slots_available} slots left
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2 - Guest details */}
      {step === 2 && (
        <div className="trip-booking__section">
          <h3 className="trip-booking__section-title">Your Details</h3>

          <div className="trip-booking__selected-date">
            <Calendar size={14} />
            {new Date(selectedDate.departure_date).toLocaleDateString('en-US', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
            <button onClick={() => setStep(1)} className="trip-booking__change">Change</button>
          </div>

          {error && <div className="trip-booking__error">{error}</div>}

          <div className="trip-booking__form">
            <div className="trip-booking__field">
              <label><User size={14} /> Full Name *</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div className="trip-booking__field">
              <label><Mail size={14} /> Email Address *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@email.com"
              />
            </div>

            <div className="trip-booking__field">
              <label><Phone size={14} /> Phone (M-Pesa) *</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="0712345678"
              />
            </div>

            <div className="trip-booking__field">
              <label><Users size={14} /> Number of Guests</label>
              <select name="num_guests" value={form.num_guests} onChange={handleChange}>
                {Array.from({ length: selectedDate.slots_available }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>

            <div className="trip-booking__field">
              <label><MessageSquare size={14} /> Special Requests</label>
              <textarea
                name="special_requests"
                value={form.special_requests}
                onChange={handleChange}
                placeholder="Any dietary requirements, accessibility needs..."
                rows={3}
              />
            </div>
          </div>

          <div className="trip-booking__total">
            <span>Total Amount</span>
            <span className="trip-booking__total-amount">${totalAmount.toLocaleString()}</span>
          </div>

          <button
            className="trip-booking__submit"
            onClick={handleBooking}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      )}

      {/* Step 3 - Payment */}
      {step === 3 && (
        <div className="trip-booking__section">
          <h3 className="trip-booking__section-title">Pay with M-Pesa</h3>

          <div className="trip-booking__mpesa">
            <img src="/images/mpesa.png" alt="M-Pesa" className="trip-booking__mpesa-logo" />
            <p className="trip-booking__mpesa-text">
              An STK push will be sent to <strong>{form.phone}</strong>. 
              Enter your M-Pesa PIN to complete payment of <strong>${totalAmount.toLocaleString()}</strong>.
            </p>
          </div>

          {error && <div className="trip-booking__error">{error}</div>}

          <button
            className="trip-booking__submit trip-booking__submit--mpesa"
            onClick={handleMpesa}
            disabled={loading}
          >
            {loading ? 'Sending STK Push...' : `Pay $${totalAmount.toLocaleString()} via M-Pesa`}
          </button>

          <button className="trip-booking__skip" onClick={() => setStep(4)}>
            I'll pay later
          </button>
        </div>
      )}

      {/* Step 4 - Success */}
      {step === 4 && (
        <div className="trip-booking__success">
          <div className="trip-booking__success-icon">
            <CheckCircle size={48} />
          </div>
          <h3>Booking Confirmed!</h3>
          <p>
            Thank you, <strong>{form.full_name}</strong>! Your booking has been received.
            We'll send confirmation to <strong>{form.email}</strong>.
          </p>
          <a href="/trips" className="trip-booking__submit">
            Browse More Safaris
          </a>
        </div>
      )}
    </div>
  )
}