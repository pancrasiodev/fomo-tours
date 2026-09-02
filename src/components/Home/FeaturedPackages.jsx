import { useRef, useState, useCallback, useLayoutEffect, useEffect } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from 'lucide-react'
import './FeaturedPackages.css'

const FALLBACK = 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=700&q=80'

const filters = ['Trekking Adventure', 'Jeep Exploration', 'Cultural Insights Tour', 'Sunrise View']

const activitiesByFilter = {
  'Trekking Adventure': [
    { title: 'Mount Kenya Foothills', desc: 'Trek scenic forest trails at the base of Mount Kenya.', image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=700&q=80' },
    { title: "Hell's Gate Cycling and Hiking", desc: 'Cycle and hike through dramatic gorge landscapes.', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=80' },
    { title: 'Ngong Hills Trek', desc: 'Panoramic Rift Valley views on a classic day hike.', image: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?w=700&q=80' },
    { title: 'Aberdare Forest Trail', desc: 'Wander misty highland forest teeming with wildlife.', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=700&q=80' },
    { title: 'Rift Valley Escarpment Walk', desc: "Sweeping views across Kenya's iconic Rift Valley.", image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=700&q=80' },
  ],
  'Jeep Exploration': [
    { title: 'Maasai Mara Game Drive', desc: "Explore the open plains and encounter Kenya's remarkable wildlife in a private safari jeep.", image: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=700&q=80' },
    { title: 'Amboseli Safari Drive', desc: 'Elephant herds roam beneath Mount Kilimanjaro.', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=700&q=80' },
    { title: 'Samburu Wilderness Safari', desc: "Track rare wildlife in Kenya's northern frontier.", image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=700&q=80' },
    { title: 'Tsavo Red Elephant Safari', desc: 'Meet the famous red-dust elephants of Tsavo.', image: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?w=700&q=80' },
    { title: 'Lake Nakuru Game Drive', desc: 'Flamingo-lined shores and rhino sanctuaries.', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=700&q=80' },
  ],
  'Cultural Insights Tour': [
    { title: 'Maasai Village Experience', desc: 'Traditional song, dance, and daily life with local elders.', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=700&q=80' },
    { title: 'Samburu Cultural Visit', desc: 'Meet the Samburu people and their vibrant traditions.', image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=700&q=80' },
    { title: 'Lamu Old Town Walk', desc: 'Wander centuries-old Swahili coastal architecture.', image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=700&q=80' },
    { title: 'Swahili Heritage Experience', desc: "Discover coastal Kenya's rich Swahili culture.", image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=700&q=80' },
    { title: 'Kenyan Community Tour', desc: 'Meaningful visits to local communities and markets.', image: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?w=700&q=80' },
  ],
  'Sunrise View': [
    { title: 'Maasai Mara Sunrise Drive', desc: 'Golden hour with the plains waking up around you.', image: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=700&q=80' },
    { title: 'Amboseli Kilimanjaro Sunrise', desc: "Watch dawn break over Africa's tallest peak.", image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=700&q=80' },
    { title: 'Mount Kenya Dawn View', desc: "First light over Kenya's highest mountain.", image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=700&q=80' },
    { title: 'Lake Nakuru Sunrise Safari', desc: 'Mist rising over flamingo-filled waters at dawn.', image: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?w=700&q=80' },
    { title: 'Samburu Morning Wildlife Drive', desc: 'Early morning tracking of rare northern species.', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=700&q=80' },
  ],
}

const OVERLAY_IMG = 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=300&q=80'

export default function FeaturedPackages() {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const dragState = useRef({ isDown: false, startX: 0, startTranslate: 0, moved: false })

  const [activeFilter, setActiveFilter] = useState('Jeep Exploration')
  const [activeIndex, setActiveIndex] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const [dragging, setDragging] = useState(false)

  const activities = activitiesByFilter[activeFilter]
  const count = activities.length

  const idx = (offset) => (activeIndex + offset + count) % count

  const displayCards = [
    { ...activities[idx(-4)], level: 'far', key: 'far-l2' },
    { ...activities[idx(-3)], level: 'far', key: 'far-l1' },
    { ...activities[idx(-2)], level: 'side', key: 'side-l' },
    { ...activities[idx(-1)], level: 'raised', key: 'raised-l' },
    { ...activities[idx(0)], level: 'active', overlay: OVERLAY_IMG, key: 'active' },
    { ...activities[idx(1)], level: 'raised', key: 'raised-r' },
    { ...activities[idx(2)], level: 'side', key: 'side-r' },
    { ...activities[idx(3)], level: 'far', key: 'far-r1' },
    { ...activities[idx(4)], level: 'far', key: 'far-r2' },
  ]

  const centerActiveCard = useCallback(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return
    const activeEl = track.querySelector('[data-active="true"]')
    if (!activeEl) return

    const viewportWidth = viewport.clientWidth
    const activeCenter = activeEl.offsetLeft + activeEl.offsetWidth / 2
    const newTranslate = viewportWidth / 2 - activeCenter
    setTranslateX(newTranslate)
  }, [])

  useLayoutEffect(() => {
    centerActiveCard()
  }, [activeIndex, activeFilter, centerActiveCard])

  useEffect(() => {
    const onResize = () => centerActiveCard()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [centerActiveCard])

  const goNext = () => setActiveIndex((i) => (i + 1) % count)
  const goPrev = () => setActiveIndex((i) => (i - 1 + count) % count)

  const handleFilterChange = (f) => {
    setActiveFilter(f)
    setActiveIndex(0)
  }

  const handleCardSelect = (level, offset) => {
    if (dragState.current.moved) return
    if (level === 'active') return
    setActiveIndex((i) => (i + offset + count) % count)
  }

  const onPointerDown = useCallback((e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    dragState.current = {
      isDown: true,
      startX: clientX,
      startTranslate: translateX,
      moved: false,
    }
    setDragging(true)
  }, [translateX])

  const onPointerMove = useCallback((e) => {
    if (!dragState.current.isDown) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const walk = clientX - dragState.current.startX
    if (Math.abs(walk) > 5) dragState.current.moved = true
    setTranslateX(dragState.current.startTranslate + walk)
  }, [])

  const onPointerUp = useCallback(() => {
    if (!dragState.current.isDown) return
    dragState.current.isDown = false
    setDragging(false)

    const walk = translateX - dragState.current.startTranslate
    const threshold = 60

    if (dragState.current.moved) {
      if (walk < -threshold) {
        goNext()
      } else if (walk > threshold) {
        goPrev()
      } else {
        centerActiveCard()
      }
    }
  }, [translateX, centerActiveCard])

  const progress = count > 1 ? (activeIndex / (count - 1)) * 100 : 0

  return (
    <section className="featured">
      <div className="featured__header">
        <span className="featured__badge">
          <span className="featured__badge-icon"><Star size={11} fill="currentColor" /></span>
          Tour Activity
        </span>
        <h2 className="featured__title">
          Our <span>Tour Package</span>
        </h2>

        <div className="featured__filters">
          {filters.map((f) => (
            <button
              key={f}
              className={`featured__filter ${activeFilter === f ? 'featured__filter--active' : ''}`}
              onClick={() => handleFilterChange(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="featured__stage">
        <div className="featured__grid" />

        <div
          className="carousel-viewport"
          ref={viewportRef}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
        >
          <div
            className="carousel-track"
            ref={trackRef}
            style={{
              transform: `translateX(${translateX}px)`,
              transition: dragging ? 'none' : 'transform 0.5s ease',
            }}
          >
            {displayCards.map((card, i) => {
              const isActive = card.level === 'active'
              const offset = i - 4
              return (
                <div
                  key={card.key}
                  data-active={isActive}
                  className={`featured__card featured__card--${card.level}`}
                  onClick={() => handleCardSelect(card.level, offset)}
                >
                  <div className="featured__card-img-wrap">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="featured__card-img"
                      draggable={false}
                      onError={(e) => { e.target.src = FALLBACK }}
                    />
                  </div>
                  {card.overlay && (
                    <img
                      src={card.overlay}
                      alt=""
                      className="featured__card-overlay"
                      draggable={false}
                      onError={(e) => { e.target.src = FALLBACK }}
                    />
                  )}
                  {isActive && (
                    <div className="featured__card-body">
                      <div className="featured__card-text">
                        <h3>{card.title}</h3>
                        <p>{card.desc}</p>
                      </div>
                      <button className="featured__card-btn" aria-label={`View ${card.title}`}>
                        <ArrowUpRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="featured__nav">
        <button onClick={goPrev} className="featured__nav-btn" aria-label="Previous activity">
          <ArrowLeft size={18} />
        </button>
        <div className="featured__progress">
          <span className="featured__progress-fill" style={{ width: `${Math.max(progress, 8)}%` }} />
        </div>
        <button onClick={goNext} className="featured__nav-btn" aria-label="Next activity">
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}