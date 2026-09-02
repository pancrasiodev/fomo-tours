import { useState } from 'react'
import { ArrowUpRight, Mail, Phone, MapPin, Clock } from 'lucide-react'
import './ContactSection.css'

const contactInfo = [
  { icon: Phone, label: 'Phone', value: '+254 700 123 456' },
  { icon: Mail, label: 'Email', value: 'info@fomotours.co.ke' },
  { icon: MapPin, label: 'Office', value: 'Kimathi Street, Nairobi, Kenya' },
  { icon: Clock, label: 'Hours', value: 'Mon - Sat, 8:00 AM - 6:00 PM' },
]

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="contact container">
      <div className="contact__grid">
        <div className="contact__panel">
          <h2 className="contact__panel-title">Send Us a Message</h2>
          <p className="contact__panel-sub">Fill out the form and our team will respond within 24 hours.</p>

          {submitted ? (
            <div className="contact__success">
              <h3>Message Sent! 🎉</h3>
              <p>Thanks for reaching out. We'll get back to you shortly.</p>
            </div>
          ) : (
            <form className="contact__form" onSubmit={handleSubmit}>
              <div className="contact__row">
                <div className="contact__field">
                  <label>Full Name</label>
                  <input type="text" placeholder="Jane Doe" required />
                </div>
                <div className="contact__field">
                  <label>Email Address</label>
                  <input type="email" placeholder="jane@email.com" required />
                </div>
              </div>

              <div className="contact__field">
                <label>Subject</label>
                <input type="text" placeholder="How can we help?" required />
              </div>

              <div className="contact__field">
                <label>Message</label>
                <textarea placeholder="Tell us more..." rows={5} required />
              </div>

              <button type="submit" className="contact__submit">
                Send Message <ArrowUpRight size={16} />
              </button>
            </form>
          )}
        </div>

        <div className="contact__info">
          {contactInfo.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="contact__info-item">
                <div className="contact__info-icon"><Icon size={18} /></div>
                <div>
                  <p className="contact__info-label">{item.label}</p>
                  <p className="contact__info-value">{item.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}