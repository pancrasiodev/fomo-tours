import './FeaturedQuote.css'

export default function FeaturedQuote() {
  return (
    <div className="fquote-wrap">
      <section className="fquote" aria-label="Featured traveler testimonial">
        <img
          src="/images/dhow-sunset.jpg"
          alt="Traditional Swahili dhow sailing at golden sunset off the Kenyan coast"
          className="fquote__img"
          loading="lazy"
        />
        <div className="fquote__scrim" aria-hidden="true" />

        <div className="fquote__content">
          <div className="fquote__stars" aria-label="Rated 5 out of 5 stars">
            ★★★★★
          </div>

          <blockquote className="fquote__text">
            &ldquo;Six of us in the Land Cruiser, a window each, and a guide who spotted a
            leopard in the Mara from 400 meters. I have stopped recommending anyone
            else.&rdquo;
          </blockquote>

          <p className="fquote__author">
            Arjun Mehta, Maasai Mara and Diani Coast Safari
          </p>
        </div>
      </section>
    </div>
  )
}
