import { useState } from 'react'
import { ArrowLeft, ArrowRight, Play, Plus, Star } from 'lucide-react'
import './TourDocumentation.css'

const slides = [
  { label: 'Safari Adventure', location: 'Maasai Mara', image: '/images/zebras.webp' },
  { label: 'Wildlife Encounter', location: 'Amboseli', image: '/images/mt-kenya.webp' },
  { label: 'Mountain Views', location: 'Mount Kenya', image: '/images/mt-kenya.webp' },
]

const inclusions = [
  'Pick-Up and Drop-Off',
  'Transportation',
  'Game Drives',
  'Professional Tour Guide',
  'Photographer',
  'Breakfast and Lunch',
]

export default function TourDocumentation() {
  const [active, setActive] = useState(0)
  const slide = slides[active]

  const goTo = (dir) => setActive((prev) => (prev + dir + slides.length) % slides.length)

  return (
    <section className="tourdoc">
      <div className="tourdoc__inner">
        <div className="tourdoc__col tourdoc__col--left">
          <span className="tourdoc__badge">
            <span className="tourdoc__badge-icon"><Plus size={12} /></span>
            Tour Documentation
          </span>

          <h2 className="tourdoc__title">
            Capture Your <span>Unforgettable Moments</span>
          </h2>

          <div className="tourdoc__review">
            <h4>Customer Review</h4>
            <p className="tourdoc__quote">
              Our safari was unforgettable. The FOMO Travel team made every moment
              effortless, and the photographs captured memories we will always treasure.
            </p>

            <div className="tourdoc__profile">
              <span className="tourdoc__avatar" />
              <div>
                <p className="tourdoc__name">James Mwangi</p>
                <p className="tourdoc__location">Nairobi, Kenya</p>
              </div>
            </div>

            <div className="tourdoc__pills">
              <span className="tourdoc__pill">
                Rating 5.0 <Star size={12} fill="currentColor" />
              </span>
              <span className="tourdoc__pill">Premium Package</span>
            </div>
          </div>

          <div className="tourdoc__inclusions">
            <h4>Our safari package includes:</h4>
            <div className="tourdoc__pills tourdoc__pills--wrap">
              {inclusions.map((item) => (
                <span key={item} className="tourdoc__pill">{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="tourdoc__col tourdoc__col--center">
          <div className="tourdoc__featured">
            <img src={slide.image} alt={slide.location} className="tourdoc__featured-img" />
            <div className="tourdoc__featured-overlay">
              <div className="tourdoc__featured-text">
                <span>{slide.label}</span>
                <h3>{slide.location}</h3>
              </div>
              <div className="tourdoc__featured-nav">
                <button onClick={() => goTo(-1)} aria-label="Previous">
                  <ArrowLeft size={16} />
                </button>
                <button onClick={() => goTo(1)} aria-label="Next">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="tourdoc__col tourdoc__col--right">
          <p className="tourdoc__intro">
            Relive the magic of your Kenyan adventure with our professional photo
            and video documentation services.
          </p>

          <div className="tourdoc__video">
            <img src="/images/zebras.webp" alt="Video highlights" className="tourdoc__video-img" />
            <button className="tourdoc__play" aria-label="Play video">
              <Play size={20} fill="currentColor" />
            </button>
          </div>

          <h4 className="tourdoc__video-title">Video Highlights</h4>
          <p className="tourdoc__video-desc">
            Experience the best moments from our Kenyan safari through this
            professionally curated video compilation.
          </p>

          <div className="tourdoc__cta-row">
            <button className="tourdoc__cta">View All Documentation</button>
            <button className="tourdoc__cta-icon" aria-label="Play">
              <Play size={16} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}