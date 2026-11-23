import { useState } from 'react'
import { Link } from 'react-router-dom'
import './WaysToTravel.css'

const WAYS = [
  {
    id: 'adventure',
    num: '01',
    title: 'Adventure',
    caption: 'Trails, summits and long days outside',
    image: '/images/Kilimanjaro.webp',
    alt: 'Mount Kilimanjaro and acacia plains at sunrise',
  },
  {
    id: 'culture',
    num: '02',
    title: 'Culture',
    caption: 'Maasai conservancies, Swahili towns and local hosts',
    image: '/images/amboseli.webp',
    alt: 'Savanna conservancy landscape in southern Kenya',
  },
  {
    id: 'beach',
    num: '03',
    title: 'Beach and Islands',
    caption: 'Dhow sails, coral reefs and warm Indian Ocean coves',
    image: '/images/diani-coast.jpg',
    alt: 'White sand shoreline and turquoise water at Diani Beach',
  },
  {
    id: 'wildlife',
    num: '04',
    title: 'Wildlife',
    caption: 'Big cats, open plains and a window seat for everyone',
    image: '/images/leopard-hero.webp',
    alt: 'Leopard resting in the golden grass of Maasai Mara',
  },
  {
    id: 'balloon',
    num: '05',
    title: 'Balloon and Camps',
    caption: 'Dawn flights over the Mara and lantern-lit bush dinners',
    image: '/images/mara-balloon.jpg',
    alt: 'Hot air balloons drifting above Maasai Mara at dawn',
  },
]

export default function WaysToTravel() {
  const [active, setActive] = useState(0)
  const current = WAYS[active]

  return (
    <section className="ways-sec">
      <div className="ways-sec__inner">
        <div className="ways-sec__header">
          <div className="ways-sec__header-left">
            <span className="ways-sec__eyebrow">WAYS TO TRAVEL</span>
            <h2 className="ways-sec__heading">
              Five kinds of trip, one way of running them
            </h2>
          </div>

          <p className="ways-sec__intro">
            Whatever the style, you get a local leader, small camps with
            character and a group that fits around one table.
          </p>
        </div>

        <div className="ways-sec__body">
          {/* Left Portrait Card with Crossfading Image + Caption */}
          <Link to="/trips" className="ways-sec__media">
            {WAYS.map((way, idx) => (
              <img
                key={way.id}
                src={way.image}
                alt={way.alt}
                loading="lazy"
                className={`ways-sec__img ${idx === active ? 'ways-sec__img--active' : ''}`}
              />
            ))}
            <div className="ways-sec__scrim" aria-hidden="true" />
            <span key={current.id} className="ways-sec__caption">
              {current.caption}
            </span>
          </Link>

          {/* Right Interactive 5-Row List */}
          <div className="ways-sec__list" role="tablist" aria-label="Travel styles">
            {WAYS.map((way, idx) => {
              const isActive = idx === active
              return (
                <button
                  key={way.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`ways-sec__row ${isActive ? 'ways-sec__row--active' : ''}`}
                  onMouseEnter={() => setActive(idx)}
                  onFocus={() => setActive(idx)}
                  onClick={() => setActive(idx)}
                >
                  <span className="ways-sec__num">{way.num}</span>
                  <span className="ways-sec__title">{way.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
