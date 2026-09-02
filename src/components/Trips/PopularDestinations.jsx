import { ArrowUpRight } from 'lucide-react'
import './PopularDestinations.css'

const destinations = [
  { name: 'Masai Mara', trips: '12 Trips', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=700&q=80' },
  { name: 'Amboseli', trips: '8 Trips', image: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=700&q=80' },
  { name: 'Lake Nakuru', trips: '6 Trips', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=700&q=80' },
  { name: 'Mount Kenya', trips: '5 Trips', image: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?w=700&q=80' },
  { name: 'Diani Beach', trips: '9 Trips', image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=700&q=80' },
  { name: 'Samburu', trips: '4 Trips', image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=700&q=80' },
]

export default function PopularDestinations() {
  return (
    <section className="destinations container">
      <div className="destinations__header">
        <span className="destinations__badge">Popular Destinations</span>
        <h2 className="destinations__title">Where Travelers Are Headed</h2>
      </div>

      <div className="destinations__grid">
        {destinations.map((d, i) => (
          <div key={i} className="destinations__card">
            <img src={d.image} alt={d.name} className="destinations__img" />
            <div className="destinations__overlay">
              <div>
                <h3>{d.name}</h3>
                <p>{d.trips}</p>
              </div>
              <span className="destinations__arrow"><ArrowUpRight size={16} /></span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}