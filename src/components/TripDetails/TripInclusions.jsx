import { CheckCircle, XCircle } from 'lucide-react'
import './TripInclusions.css'

export default function TripInclusions({ inclusions, exclusions }) {
  if (!inclusions.length && !exclusions.length) return null

  return (
    <div className="trip-inclusions">
      <h2 className="trip-inclusions__heading">What's Included</h2>

      <div className="trip-inclusions__grid">
        {/* Inclusions */}
        <div className="trip-inclusions__col">
          <h3 className="trip-inclusions__col-title trip-inclusions__col-title--green">
            <CheckCircle size={18} /> Included
          </h3>
          <ul className="trip-inclusions__list">
            {inclusions.map((item, i) => (
              <li key={i} className="trip-inclusions__item trip-inclusions__item--green">
                <CheckCircle size={15} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exclusions */}
        <div className="trip-inclusions__col">
          <h3 className="trip-inclusions__col-title trip-inclusions__col-title--red">
            <XCircle size={18} /> Not Included
          </h3>
          <ul className="trip-inclusions__list">
            {exclusions.map((item, i) => (
              <li key={i} className="trip-inclusions__item trip-inclusions__item--red">
                <XCircle size={15} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}