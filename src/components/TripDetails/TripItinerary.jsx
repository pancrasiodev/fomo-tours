import { useState } from 'react'
import { ChevronDown, ChevronUp, Utensils, BedDouble } from 'lucide-react'
import './TripItinerary.css'

export default function TripItinerary({ days }) {
  const [openDay, setOpenDay] = useState(0)

  if (!days || days.length === 0) return null

  return (
    <div className="trip-itinerary">
      <h2 className="trip-itinerary__heading">Day by Day Itinerary</h2>

      <div className="trip-itinerary__list">
        {days.map((day, i) => (
          <div
            key={day.id}
            className={`trip-day ${openDay === i ? 'trip-day--open' : ''}`}
          >
            <button
              className="trip-day__header"
              onClick={() => setOpenDay(openDay === i ? null : i)}
            >
              <div className="trip-day__num">
                <span>Day</span>
                <strong>{day.day_number}</strong>
              </div>
              <div className="trip-day__title-wrap">
                <h3 className="trip-day__title">{day.title}</h3>
                {day.accommodation && (
                  <span className="trip-day__accommodation">
                    <BedDouble size={13} /> {day.accommodation}
                  </span>
                )}
              </div>
              <div className="trip-day__arrow">
                {openDay === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {openDay === i && (
              <div className="trip-day__body">
                <p className="trip-day__desc">{day.description}</p>
                <div className="trip-day__footer">
                  {day.meals && (
                    <span className="trip-day__meals">
                      <Utensils size={13} /> {day.meals}
                    </span>
                  )}
                  {day.accommodation && (
                    <span className="trip-day__stay">
                      <BedDouble size={13} /> {day.accommodation}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}