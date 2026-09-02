import { ArrowUpRight } from 'lucide-react'
import './HowToBook.css'

const tickerItems = [
  'Transportation', 'Game Drives', 'Tour Guide', 'Adventure',
  'Sunrise Viewing', 'Mountain Trekking', 'Cultural Experiences',
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

export default function HowToBook() {
  return (
    <section className="howbook">
      <div className="howbook__heading-wrap">
        <h2 className="howbook__heading">How to Book Your Tour</h2>
      </div>

      <div className="howbook__ticker-wrap">
        <div className="howbook__ticker">
          <div className="howbook__ticker-track">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="howbook__ticker-item">
                {item} <span className="howbook__ticker-star">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="howbook__grid">
        <div className="howbook__intro">
          <h3>4 Easy Steps</h3>
          <p>
            Booking your Kenyan adventure is simple and straightforward.
            Follow these four steps to reserve your preferred FOMO Travel experience.
          </p>
          <button className="howbook__cta">
            Book Your Tour
            <span className="howbook__cta-icon"><ArrowUpRight size={16} /></span>
          </button>
        </div>

        <div className="howbook__steps">
          {steps.map((step, i) => (
            <div key={i} className="howbook__step">
              <span className="howbook__step-number">{step.number}</span>
              <h4 className="howbook__step-title">{step.title}</h4>
              <p className="howbook__step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}