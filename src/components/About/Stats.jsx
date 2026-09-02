import './Stats.css'

const stats = [
  { number: '2,500+', label: 'Travelers helped globally' },
  { number: '40+', label: 'Licensed safari guides' },
  { number: '98%', label: 'Client satisfaction rate' },
  { number: '10+', label: 'Years of experience' },
]

export default function Stats() {
  return (
    <section className="stats">
      <div className="stats__grid container">
        {stats.map((s, i) => (
          <div key={i} className="stats__item">
            <span className="stats__number">{s.number}</span>
            <span className="stats__label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="stats__split container">
        <h2 className="stats__heading">
          Empowering Unforgettable<br />Kenyan Adventures
        </h2>

        <div className="stats__copy">
          <div className="stats__block">
            <h4>Our Vision</h4>
            <p>To be the leading safari operator in East Africa, providing accessible, authentic, and unforgettable wildlife experiences worldwide.</p>
          </div>
          <div className="stats__block">
            <h4>Our Mission</h4>
            <p>To support travelers in discovering Kenya's natural beauty through expert guidance, ensuring every guest experiences a safari of a lifetime.</p>
          </div>
        </div>
      </div>

      <div className="stats__image-wrap container">
        <img
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1400&q=80"
          alt="Kenyan safari landscape"
          className="stats__image"
        />
      </div>
    </section>
  )
}