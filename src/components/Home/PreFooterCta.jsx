import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import './PreFooterCta.css';

export default function PreFooterCta() {
  const cards = [
    {
      id: 1,
      image: "/images/home/cta-card-1.jpg",
      alt: "Fresh milk, golden croissants and wheat on rustic wood",
      tiltClass: "cta-card-tilt-1"
    },
    {
      id: 2,
      image: "/images/home/cta-card-2.jpg",
      alt: "French chocolate and vanilla eclairs on wooden board",
      tiltClass: "cta-card-tilt-2"
    },
    {
      id: 3,
      image: "/images/home/cta-card-3.jpg",
      alt: "Artisan baked breads and pastries in basket",
      tiltClass: "cta-card-tilt-3"
    },
    {
      id: 4,
      image: "/images/home/cta-card-4.jpg",
      alt: "Assorted artisanal cake slices",
      tiltClass: "cta-card-tilt-4"
    }
  ];

  return (
    <section className="lany-cravings-cta-section" id="cravings-cta">
      <div className="cravings-cta-container">
        
        {/* Center Editorial Title */}
        <h2 className="cravings-cta-title">
          Ready to Satisfy Your<br />Sweet Cravings?
        </h2>

        {/* CTA Button Group: Pink 'Order Now' + Arrow Button */}
        <div className="cravings-cta-btn-group">
          <Link to="/cakes" className="cravings-order-btn">
            <span>Order Now</span>
          </Link>
          <Link to="/cakes" className="cravings-arrow-btn" aria-label="Order Now">
            <ArrowUpRight size={20} strokeWidth={2.4} />
          </Link>
        </div>

        {/* Fanned Bakery Cards Arc */}
        <div className="cravings-cards-fan">
          {cards.map((card) => (
            <div key={card.id} className={`cravings-fan-card ${card.tiltClass}`}>
              <img 
                src={card.image} 
                alt={card.alt} 
                className="cravings-fan-img"
                loading="lazy"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
