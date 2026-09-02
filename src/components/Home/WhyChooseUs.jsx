import { ArrowUpRight, Plus } from 'lucide-react'
import './WhyChooseUs.css'

const reasons = [
  {
    number: '01',
    title: 'Local Expertise',
    desc: 'Kenyan-born guides who know the migration patterns, hidden trails, and best viewing spots by heart.',
    variant: 'dark',
  },
  {
    number: '02',
    title: 'Small Group Safaris',
    desc: 'Intimate group sizes so you get closer to the wildlife and a more personal, unforgettable experience.',
    variant: 'light',
  },
  {
    number: '03',
    title: 'Trusted & Licensed',
    desc: 'A decade of experience running fully licensed, safety-first safaris across Kenya\'s top destinations.',
    variant: 'dark',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="pricing">
      <div className="pricing__header">
        <span className="pricing__badge">
          <span className="pricing__badge-icon"><Plus size={12} /></span>
          Why Choose Us
        </span>
        <h2 className="pricing__title">
          The FOMO Difference
        </h2>
      </div>

      <div className="pricing__grid">
        {reasons.map((reason, i) => (
          <div key={i} className={`pricing__card pricing__card--${reason.variant}`}>
            <div className="pricing__card-top">
              <span className="pricing__price">{reason.number}</span>
            </div>
            <p className="pricing__desc">{reason.desc}</p>
            <div className="pricing__card-bottom">
              <h3 className="pricing__card-title">{reason.title}</h3>
              <button className="pricing__cta">
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}