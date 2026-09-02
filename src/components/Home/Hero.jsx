import { useState, useEffect } from 'react'
import { ArrowUpRight } from 'lucide-react'
import './Hero.css'

const slides = [
  {
    bg: '/images/safari-trip.webp',
    badge: 'Experience the Magic of Kenya',
    headingLine1: 'Unforgettable Masai Mara',
    headingLine2: 'Migration Safari',
    tourName: 'Masai Mara Migration Safari',
    duration: '4 Days, 3 Nights',
    desc: 'Witness the greatest wildlife spectacle on earth as millions of wildebeest cross the Mara River.',
    activity: {
      image: '/images/sun-rise-drive.webp',
      title: 'Sunrise Game Drive',
      time: '05:30',
      desc: 'Head out at dawn for the best wildlife sightings on the Mara.',
    },
  },
  {
    bg: '/images/elephant-encounter.webp',
    badge: 'Experience the Magic of Kenya',
    headingLine1: 'Unforgettable Amboseli',
    headingLine2: 'Safari Adventure',
    tourName: 'Amboseli & Kilimanjaro Safari',
    duration: '3 Days, 2 Nights',
    desc: "Watch elephant herds roam beneath Africa's highest peak at golden hour.",
    activity: {
      image: '/images/elephant-encounter.webp',
      title: 'Elephant Encounter',
      time: '06:15',
      desc: 'Get close to resident elephant herds roaming the open plains.',
    },
  },
  {
    bg: '/images/Kilimanjaro.webp',
    badge: 'Experience the Magic of Kenya',
    headingLine1: 'Unforgettable Kilimanjaro',
    headingLine2: 'Viewpoint Safari',
    tourName: 'Kilimanjaro Viewpoint Safari',
    duration: '5 Days, 4 Nights',
    desc: 'Catch Kilimanjaro at first light from the best vantage point in Amboseli.',
    activity: {
      image: '/images/Kilimanjaro.webp',
      title: 'Kilimanjaro Viewpoint',
      time: '07:00',
      desc: "Watch the sun rise over Africa's tallest peak.",
    },
  },
  {
    bg: '/images/giraffe-hero.webp',
    badge: 'Experience the Magic of Kenya',
    headingLine1: 'Unforgettable Wildlife',
    headingLine2: 'Plains Safari',
    tourName: 'Giraffe & Wildlife Safari',
    duration: '2 Days, 1 Night',
    desc: 'Spot giraffes and grazing herds roaming the golden savannah at sunset.',
    activity: {
      image: '/images/giraffe-hero.webp',
      title: 'Sunset Wildlife Walk',
      time: '17:30',
      desc: 'Golden hour among giraffes and grazing herds on the open plains.',
    },
  },
  {
    bg: '/images/leopard-hero.webp',
    badge: 'Experience the Magic of Kenya',
    headingLine1: 'Unforgettable Predator',
    headingLine2: 'Tracking Safari',
    tourName: 'Leopard Tracking Safari',
    duration: '3 Days, 2 Nights',
    desc: 'Track elusive leopards through dense forest with our expert local guides.',
    activity: {
      image: '/images/leopard-hero.webp',
      title: 'Leopard Tracking',
      time: '16:00',
      desc: 'Follow expert trackers deep into leopard territory.',
    },
  },
]

const bgSliderImages = [
  '/images/leopard-hero.webp',
  '/images/river-hero.webp',
  '/images/giraffe-hero.webp',
]

export default function Hero() {
  const [active, setActive] = useState(0)
  const [bgIndex, setBgIndex] = useState(0)
  const slide = slides[active]

  const goTo = (i) => setActive((i + slides.length) % slides.length)

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgSliderImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const bgImage = bgSliderImages[bgIndex]

  return (
    <section
      className="hero"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="hero__overlay" />

      <div className="hero__top">
        
        <h1 className="hero__title">
          {slide.headingLine1}
          <br />
          <em>{slide.headingLine2}</em>
        </h1>
      </div>

      <div className="hero__bottom">
        <div className="hero__bottom-row">
          <div className="hero__info">
            <h3>{slide.tourName}</h3>
            <p className="hero__date">{slide.duration}</p>

            <div className="hero__avatars">
              <div className="hero__avatar-stack">
                <span className="hero__avatar" style={{ backgroundImage: `url(/images/safari-trip.webp)` }} />
                <span className="hero__avatar" style={{ backgroundImage: `url(/images/giraffe-hero.webp)` }} />
                <span className="hero__avatar hero__avatar--count">+32</span>
              </div>
              <span>People Joined</span>
            </div>

            <p className="hero__desc">{slide.desc}</p>

            <div className="hero__actions">
              <button className="hero__cta">Book Now</button>
              <button className="hero__cta-icon" aria-label="Next">
                <ArrowUpRight size={18} />
              </button>
            </div>
          </div>

          <div className="hero__filmstrip">
            {slides.map((s, i) => (
              <button
                key={i}
                className={`hero__strip-card ${i === active ? 'hero__strip-card--main' : ''}`}
                style={{ backgroundImage: `url(${s.activity.image})` }}
                onClick={() => goTo(i)}
              >
                {i === active && (
                  <div className="hero__strip-body">
                    <div className="hero__strip-text">
                      <h4>{s.activity.title}</h4>
                      <p>{s.activity.desc}</p>
                    </div>
                    <span className="hero__strip-time">{s.activity.time}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="hero__pagination">
          <span className="hero__page-count">
            <strong>{String(active + 1).padStart(2, '0')}</strong>/{String(slides.length).padStart(2, '0')}
          </span>
          <div className="hero__progress">
            <span
              className="hero__progress-fill"
              style={{ width: `${((active + 1) / slides.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}