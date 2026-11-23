import { Star } from 'lucide-react';
import './ReviewsSection.css';

const GOOGLE_REVIEWS = [
  {
    id: 1,
    name: "Kareri Miriti",
    avatar: "/images/avatars/rev-faith.jpg",
    quote: "Absolutely loved the cake! It was delicious, and everyone enjoyed it. The flavours complemented each other so well. I also really appreciated the consultation and how helpful she was in guiding me on the flavour combinations. Great service from start to finish. I’ll definitely be ordering again!"
  },
  {
    id: 2,
    name: "Emily Macharia",
    isLocalGuide: true,
    avatar: "/images/avatars/rev-mercy.jpg",
    quote: "Very professional service. The cake was delivered on time despite the very short notice. I truly appreciated the efficiency, quality, and excellent service from Lany Cake. I would highly recommend them."
  },
  {
    id: 3,
    name: "Judy Wanjiku",
    avatar: "/images/avatars/rev-wanjiku.jpg",
    quote: "Thank you so much, Lany Cakeshop, for the amazing Demon Hunters-themed birthday cake. The design was exactly what we wanted, and the cake was absolutely delicious. You truly made the birthday celebration extra special! Highly recommend Lany Cakeshop."
  },
  {
    id: 4,
    name: "Mwaura Muthondu",
    avatar: "/images/avatars/avatar-1.jpg",
    quote: "Absolutely loved the cupcakes! The cakes were fresh, soft, and beautifully decorated, with just the right amount of sweetness. You can really tell that they put a lot of care into what they make. An amazing cake shop around Ruiru with delicious cupcakes. Highly recommended!"
  },
  {
    id: 5,
    name: "Douglas Mwangi",
    avatar: "/images/avatars/avatar-2.jpg",
    quote: "The spiderman theme birthday cake for my son was so yummy. I loved the strawberry and orange flavours. Absolutely the best cakeshop, would highly recommend Lany cakeshop."
  }
];

export default function ReviewsSection() {
  return (
    <section className="lany-bakery-reviews-section" id="reviews">
      <div className="lany-container bakery-reviews-container">
        
        {/* Client Stories Header */}
        <div className="reviews-section-header">
          <span className="reviews-pre-pill">( SWEET CELEBRATION STORIES )</span>
          <h2 className="reviews-headline">What Our Customers Say</h2>
        </div>

        {/* Stacking Cards Deck: Next Review slides up and stacks as user scrolls */}
        <div className="bakery-cards-deck">
          {GOOGLE_REVIEWS.map((review, idx) => (
            <div 
              key={review.id} 
              className="bakery-stack-card"
              style={{ 
                top: `clamp(110px, 16vh, 170px)`,
                zIndex: idx + 10
              }}
            >
              <div className="bakery-testimonial-card">
                
                {/* Left Column: Official Google Business Review Badge Plaque */}
                <a 
                  href="https://www.google.com/search?q=lanyc+cakeshop#lrd=0x182f1107c0e68e43:0xc9f580f622bfd314,1,,,," 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="testimonial-google-plaque"
                  title="View verified review on Google Business Profile"
                >
                  <div className="plaque-top-brand">
                    <svg className="plaque-google-g" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span className="plaque-gbp-title">Google Reviews</span>
                  </div>

                  <div className="plaque-score-box">
                    <span className="plaque-rating-num">5.0</span>
                    <div className="plaque-stars" aria-label="5 out of 5 stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill="#FBBC05" color="#FBBC05" />
                      ))}
                    </div>
                  </div>
                </a>

                {/* Right Column: Review Quote & Meta */}
                <div className="testimonial-content-wrapper">
                  
                  {/* Quotation Mark Icon */}
                  <div className="testimonial-quote-icon" aria-hidden="true">
                    <svg width="34" height="26" viewBox="0 0 34 26" fill="none">
                      <path d="M0 16.25C0 7.27 5.78 1.44 14.62 0L15.3 3.77C10.74 4.88 8.16 8.32 7.75 11.7C8.7 11.28 9.92 11.14 11.15 11.42C13.87 12.11 15.64 14.48 15.64 17.55C15.64 21.73 12.38 25.07 8.16 25.07C3.54 25.07 0 21.45 0 16.25ZM18.36 16.25C18.36 7.27 24.14 1.44 32.98 0L33.66 3.77C29.1 4.88 26.52 8.32 26.11 11.7C27.06 11.28 28.28 11.14 29.51 11.42C32.23 12.11 34 14.48 34 17.55C34 21.73 30.74 25.07 26.52 25.07C21.9 25.07 18.36 21.45 18.36 16.25Z" fill="#241411"/>
                    </svg>
                  </div>

                  {/* Main Review Quote */}
                  <blockquote className="testimonial-quote-text">
                    {review.quote}
                  </blockquote>

                  {/* Reviewer Details */}
                  <div className="testimonial-author-row">
                    <div className="testimonial-author-info">
                      <div className="author-name-wrap">
                        <h3 className="testimonial-author-name">{review.name}</h3>
                        {review.isLocalGuide && <span className="local-guide-badge">Local Guide</span>}
                      </div>
                      <div className="review-stars-wrap" aria-label="5 out of 5 stars">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={15} fill="#FBBC05" color="#FBBC05" />
                        ))}
                      </div>
                    </div>

                    {/* Official Google Business Profile Logo & Badge */}
                    <a 
                      href="https://www.google.com/search?q=lanyc+cakeshop#lrd=0x182f1107c0e68e43:0xc9f580f622bfd314,1,,,," 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="google-profile-badge" 
                      title="Verified Google Business Profile Review"
                    >
                      <svg className="google-g-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span className="gbp-text">Google Review</span>
                    </a>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
