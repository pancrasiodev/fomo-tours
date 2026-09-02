import { ArrowUpRight } from 'lucide-react'
import './Process.css'

const tickerItems = [
  'Game Drives', 'Tour Guide', 'Adventure', 'Sunrise Viewing',
  'Mountain Trekking', 'Cultural Experiences', 'Transportation',
]

const steps = [
  {
    number: '01.',
    title: 'Choose Your Package',
    desc: 'Explore our safari, beach, mountain, and cultural packages. Select the experience that matches your interests and preferred travel style.',
  },
  {
    number: '02.',
    title: 'Confirm Availability',
    desc: 'Choose your preferred travel dates and confirm availability with our team. We will also answer questions about the itinerary.',
  },
  {
    number: '03.',
    title: 'Make a Reservation',
    desc: 'Complete the booking form with your package, travel date, group size, accommodation preferences, and contact details.',
  },
  {
    number: '04.',
    title: 'Receive Confirmation',
    desc: 'Once your reservation is processed, you will receive your booking confirmation, meeting details, itinerary, and travel guidance.',
  },
]

export default function Process() {
  return (
    <section className="process-section">
      <div className="process__heading-wrap">
        <h2 className="process__heading">How to Book Your Tour</h2>
      </div>

      <div className="process__ticker-wrap">
        <div className="process__ticker">
          <div className="process__ticker-track">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="process__ticker-item">
                {item} <span className="process__ticker-star">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="process__grid">
        <div className="process__intro">
          <h3>4 Easy Steps</h3>
          <p>
            Booking your Kenyan adventure is simple and straightforward.
            Follow these four steps to reserve your preferred FOMO Travel experience.
          </p>
          <button className="process__cta">
            Book Your Tour
            <span className="process__cta-icon"><ArrowUpRight size={16} /></span>
          </button>
        </div>

        <div className="process__steps">
          {steps.map((step, i) => (
            <div key={i} className="process__step">
              <span className="process__step-number">{step.number}</span>
              <h4 className="process__step-title">{step.title}</h4>
              <p className="process__step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}