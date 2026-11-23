import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import './TourDocumentation.css'

const STEPS = [
  {
    number: '01',
    title: 'Tell us where and when',
    desc: 'Pick a departure, or send a rough idea and a budget. A safari designer who knows Kenya firsthand replies within one working day.',
  },
  {
    number: '02',
    title: 'We plan it with you',
    desc: 'You get a day-by-day route and one fixed price. Change anything you like. A 30 percent deposit holds your place with flexible Lipa Pole Pole installments.',
  },
  {
    number: '03',
    title: 'Travel with a local leader',
    desc: 'Meet your Kenyan guide on arrival in Nairobi or Mombasa. 4×4 Cruisers, park fees and lodges are handled, and our team is on call day and night.',
  },
]

export default function TourDocumentation() {
  return (
    <div className="howworks-wrap">
      <section className="howworks">
        <div className="howworks__inner">
        <div className="howworks__photo-wrap">
          <img
            src="/images/tourist-truck.webp"
            alt="Packed 4x4 safari cruiser heading down a golden savanna trail in Kenya"
            className="howworks__photo"
            loading="lazy"
          />
        </div>

        <div className="howworks__content">
          <span className="howworks__eyebrow">HOW IT WORKS</span>

          <h2 className="howworks__heading">
            From a rough idea to your Kenya tour departure
          </h2>

          <ol className="howworks__steps">
            {STEPS.map((step) => (
              <li key={step.number} className="howworks__step">
                <span className="howworks__num" aria-hidden="true">
                  {step.number}
                </span>
                <div className="howworks__step-body">
                  <h3 className="howworks__step-title">{step.title}</h3>
                  <p className="howworks__step-desc">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <Link to="/travel-plan" className="howworks__btn">
            <span>More about how we work</span>
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
        </div>
      </section>
    </div>
  )
}
