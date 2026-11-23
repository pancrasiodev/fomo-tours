import { useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { KENYA_DESTINATIONS } from '../../data/siteData.js'
import './Destinations.css'

export default function Destinations() {
  const trackRef = useRef(null)
  const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false })
  const [isDragging, setIsDragging] = useState(false)
  const navigate = useNavigate()

  const onMouseDown = (e) => {
    const el = trackRef.current
    if (!el) return
    dragRef.current = {
      active: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      moved: false,
    }
    setIsDragging(true)
  }

  const onMouseMove = (e) => {
    if (!dragRef.current.active) return
    const el = trackRef.current
    if (!el) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = (x - dragRef.current.startX) * 1.3
    if (Math.abs(walk) > 6) dragRef.current.moved = true
    el.scrollLeft = dragRef.current.scrollLeft - walk
  }

  const onMouseUp = () => {
    dragRef.current.active = false
    setIsDragging(false)
  }

  const handleCardClick = (name) => {
    if (dragRef.current.moved) return
    navigate(`/trips?destination=${encodeURIComponent(name)}`)
  }

  return (
    <section id="destinations" className="destinations">
      <div className="destinations__header-wrap">
        <div className="destinations__header">
          <div className="destinations__titles">
            <span className="destinations__eyebrow">DESTINATIONS</span>
            <h2 className="destinations__heading">Eight places we know by heart</h2>
          </div>

          <Link to="/destinations" className="destinations__all-btn">
            <span>All destinations</span>
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>
      </div>

      <div
        ref={trackRef}
        className={`destinations__track ${isDragging ? 'destinations__track--dragging' : ''}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {KENYA_DESTINATIONS.map((dest) => (
          <article
            key={dest.name}
            className="destinations__card"
            onClick={() => handleCardClick(dest.name)}
          >
            <img
              src={dest.image}
              alt={dest.name}
              className="destinations__img"
              loading="lazy"
              draggable={false}
            />
            <div className="destinations__gradient" />
            <div className="destinations__caption">
              <span className="destinations__region">{dest.region}</span>
              <h3 className="destinations__name">{dest.name}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
