import './Reviews.css'

const FALLBACK = 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80'

const reviews = [
  {
    name: 'James Mwangi',
    text: 'Our safari was unforgettable. Every moment was effortless and the guides were incredible.',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&q=80',
  },
  {
    name: 'David Otieno',
    text: 'Professional, punctual, and full of local knowledge. Highly recommend for first-timers.',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80',
  },
  {
    name: 'Fatima Hassan',
    text: 'The migration crossing was the highlight of my life. FOMO Travel made it seamless.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  },
  {
    name: 'Sarah Kim',
    text: 'The guides know the land so well. We saw the Big Five in just two days.',
    image: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800&q=80',
  },
]

export default function Reviews() {
  return (
    <section className="reviews container">
      <div className="reviews__header">
        <span className="reviews__badge">Testimonials</span>
        <h2 className="reviews__title">What Our Travelers Say</h2>
      </div>

      <div className="reviews-grid">
        {/* 1. James Mwangi text */}
        <div className="reviews__text">
          <h3>{reviews[0].name}</h3>
          <p>{reviews[0].text}</p>
        </div>
        {/* 2. James Mwangi image */}
        <div className="reviews__image-wrap">
          <img src={reviews[0].image} alt={reviews[0].name} onError={(e) => { e.target.src = FALLBACK }} />
        </div>

        {/* 3. David Otieno text */}
        <div className="reviews__text">
          <h3>{reviews[1].name}</h3>
          <p>{reviews[1].text}</p>
        </div>
        {/* 4. David Otieno image */}
        <div className="reviews__image-wrap">
          <img src={reviews[1].image} alt={reviews[1].name} onError={(e) => { e.target.src = FALLBACK }} />
        </div>

        {/* 5. Fatima Hassan image */}
        <div className="reviews__image-wrap">
          <img src={reviews[2].image} alt={reviews[2].name} onError={(e) => { e.target.src = FALLBACK }} />
        </div>
        {/* 6. Fatima Hassan text */}
        <div className="reviews__text">
          <h3>{reviews[2].name}</h3>
          <p>{reviews[2].text}</p>
        </div>

        {/* 7. Sarah Kim image */}
        <div className="reviews__image-wrap">
          <img src={reviews[3].image} alt={reviews[3].name} onError={(e) => { e.target.src = FALLBACK }} />
        </div>
        {/* 8. Sarah Kim text */}
        <div className="reviews__text">
          <h3>{reviews[3].name}</h3>
          <p>{reviews[3].text}</p>
        </div>
      </div>
    </section>
  )
}