import { CheckCircle } from 'lucide-react'
import './TripOverview.css'

export default function TripOverview({ pkg, highlights, gallery }) {
  return (
    <div className="trip-overview">

      {/* Gallery strip */}
      {gallery.length > 0 && (
        <div className="trip-gallery">
          {gallery.slice(0, 4).map((img, i) => (
            <div key={i} className={`trip-gallery__item ${i === 0 ? 'trip-gallery__item--main' : ''}`}>
              <img src={`http://localhost:5000${img.image_url}`} alt={img.caption || pkg.title} />
              {img.caption && <span className="trip-gallery__caption">{img.caption}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Overview */}
      <div className="trip-overview__section">
        <h2 className="trip-overview__heading">Overview</h2>
        <p className="trip-overview__text">{pkg.overview}</p>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="trip-overview__section">
          <h2 className="trip-overview__heading">Highlights</h2>
          <div className="trip-highlights">
            {highlights.map((item, i) => (
              <div key={i} className="trip-highlight">
                <CheckCircle size={18} className="trip-highlight__icon" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}