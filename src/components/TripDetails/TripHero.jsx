import { MapPin, Clock, Calendar } from 'lucide-react'
import './TripHero.css'

export default function TripHero({ pkg }) {
  return (
    <section className="trip-hero">
      <div className="trip-hero__bg">
        <img
          src={pkg.cover_image ? `http://localhost:5000${pkg.cover_image}` : '/images/masaihero.webp'}
          alt={pkg.title}
        />
        <div className="trip-hero__overlay" />
      </div>

      <div className="trip-hero__inner">
        <div className="trip-hero__breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href="/trips">Safaris</a>
          <span>/</span>
          <span>{pkg.title}</span>
        </div>

        <div className="trip-hero__content">
          <span className="trip-hero__tag">Safari Package</span>
          <h1 className="trip-hero__title">{pkg.title}</h1>

          <div className="trip-hero__meta">
            <div className="trip-hero__meta-item">
              <MapPin size={16} />
              <span>{pkg.destinations}</span>
            </div>
            <div className="trip-hero__meta-item">
              <Clock size={16} />
              <span>{pkg.duration}</span>
            </div>
            <div className="trip-hero__meta-item">
              <Calendar size={16} />
              <span>Nearest Airport: {pkg.nearest_airport}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}