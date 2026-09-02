import { ArrowUpRight, Calendar, Users } from 'lucide-react'
import './UpcomingTrips.css'

const trips = [
  { name: 'Masai Mara Migration', date: '24 July 2026', spots: '8 spots left', price: '$1,200', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=200&q=80' },
  { name: 'Amboseli & Kilimanjaro', date: '3 August 2026', spots: '5 spots left', price: '$980', image: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=200&q=80' },
  { name: 'Serengeti Crossing', date: '15 August 2026', spots: '12 spots left', price: '$1,450', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=200&q=80' },
  { name: 'Maasai Cultural Trek', date: '2 September 2026', spots: '10 spots left', price: '$650', image: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?w=200&q=80' },
]

export default function UpcomingTrips() {
  return (
    <section className="upcoming container">
      <div className="upcoming__header">
        <span className="upcoming__badge">Upcoming Trips</span>
        <h2 className="upcoming__title">Plan Your Next Adventure</h2>
      </div>

      <div className="upcoming__list">
        {trips.map((trip, i) => (
          <div key={i} className="upcoming__row">
            <img src={trip.image} alt={trip.name} className="upcoming__thumb" />
            <div className="upcoming__info">
              <h3>{trip.name}</h3>
              <div className="upcoming__meta">
                <span><Calendar size={14} /> {trip.date}</span>
                <span><Users size={14} /> {trip.spots}</span>
              </div>
            </div>
            <div className="upcoming__price">{trip.price}</div>
            <button className="upcoming__btn">
              <ArrowUpRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}