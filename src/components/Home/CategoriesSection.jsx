import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './CategoriesSection.css';

const COLLECTION_ITEMS = [
  {
    id: 'bento',
    title: 'Bento Cakes',
    displayTitle: 'BENTO CAKES',
    description: 'Trending Korean-style mini lunchbox cakes starting from KSh 1,500. Ideal for birthdays, anniversaries, and personal surprise gifts.',
    link: '/bento-cakes',
    actionText: 'Explore',
    image: '/images/cakes/bento-cake-cupcake-combo.webp',
    alt: 'Trending Korean bento lunchbox celebration cake and cupcakes combo',
    cardClass: 'card-cadence-1' // medium height (440px)
  },
  {
    id: 'birthday',
    title: 'Birthday Cakes',
    displayTitle: 'BIRTHDAY CAKES',
    description: 'Make every birthday unforgettable with custom designs, fun themes, and delicious flavors tailored to your needs.',
    link: '/birthday-cakes-nairobi',
    actionText: 'Explore',
    image: '/images/lany/birthday-cakes.webp',
    alt: 'Real frosted birthday celebration cake with fresh strawberries and sparkling candles',
    cardClass: 'card-cadence-2' // tall vertical
  },
  {
    id: 'boys-birthday',
    title: 'Cakes for Boys',
    displayTitle: 'BOYS BIRTHDAY CAKES',
    description: 'Spider-Man, Paw Patrol, dinosaurs, and superheroes with balanced sweetness that kids and parents love.',
    link: '/birthday-cake-for-boys',
    actionText: 'Explore',
    image: '/images/cakes/spiderman-superhero-birthday-cake.webp',
    alt: 'Spider-Man superhero birthday cake for boys with red banner in Nairobi',
    cardClass: 'card-cadence-3' // wide landscape
  },
  {
    id: 'graduation',
    title: 'Graduation Cakes',
    displayTitle: 'GRADUATION CAKES',
    description: 'Honor academic triumph with custom cap-and-scroll designs, faculty colors, and congratulatory plaques in Juja & Nairobi.',
    link: '/graduation-cakes-juja',
    actionText: 'Explore',
    image: '/images/collection/graduation.jpg',
    alt: 'Real handcrafted graduation cap celebration cake with gold tassel and diploma books',
    cardClass: 'card-cadence-4' // medium-tall vertical
  },
  {
    id: 'cupcakes',
    title: 'Artisan Cupcakes',
    displayTitle: 'CUPCAKES',
    description: 'Perfect for parties, corporate gifts, or office celebrations. Freshly baked cupcake boxes delivered across Ruiru & Nairobi.',
    link: '/cupcakes-delivery-ruiru',
    actionText: 'Explore',
    image: '/images/collection/cupcakes.jpg',
    alt: 'Real artisanal gourmet cupcakes with chocolate brownie bites on a ceramic plate',
    cardClass: 'card-cadence-5' // grand tall vertical
  },
  {
    id: 'baby-shower',
    title: 'Baby Shower Cakes',
    displayTitle: 'BABY SHOWER CAKES',
    description: 'Make your baby shower unforgettable with a custom cake designed to impress your guests and capture the joy of the moment.',
    link: '/baby-shower-cakes-nairobi',
    actionText: 'Explore',
    image: '/images/collection/baby-shower.jpg',
    alt: 'Real elegant baby shower cake with delicate gold Baby lettering and pedestal styling',
    cardClass: 'card-cadence-1'
  },
  {
    id: 'wedding',
    title: 'Wedding Cakes',
    displayTitle: 'WEDDING CAKES',
    description: 'Tiered elegance and timeless artistry handcrafted with exquisite detail and romantic flavor profiles for your big celebration.',
    link: '/wedding-cakes-nairobi',
    actionText: 'Explore',
    image: '/images/collection/wedding.jpg',
    alt: 'Real tiered white floral wedding cake adorned with fresh peach roses and daisies',
    cardClass: 'card-cadence-2'
  },
  {
    id: 'chocolate-brownie',
    title: 'Chocolate Brownie Cake',
    displayTitle: 'CHOCOLATE BROWNIES',
    description: 'Decadent Belgian chocolate brownie cakes with rich molten fudge ganache and roasted hazelnut crunch delivered across Nairobi.',
    link: '/chocolate-brownie-cake',
    actionText: 'Explore',
    image: '/images/home/cta-card-2.jpg',
    alt: 'Real Belgian chocolate brownie celebration cake with molten ganache',
    cardClass: 'card-cadence-3'
  },
  {
    id: 'fondant',
    title: 'Fondant Cakes',
    displayTitle: 'FONDANT CAKES',
    description: 'Bespoke 3D sugarcraft, character modeling, and flawless fondant finishes for luxury birthdays and milestone events.',
    link: '/fondant-cakes',
    actionText: 'Explore',
    image: '/images/collection/wedding.jpg',
    alt: 'Sculpted fondant celebration cake handcrafted by Lany Cake Shop Nairobi',
    cardClass: 'card-cadence-4'
  },
  {
    id: 'custom',
    title: 'Custom Cakes',
    displayTitle: 'CUSTOM CAKES',
    description: 'Stand out with a custom cake designed just for your event. Choose your flavor, design, and theme, we handle the rest and deliver perfection.',
    link: '/custom-order',
    actionText: 'Order Now',
    image: '/images/collection/custom.jpg',
    alt: 'Real bespoke designer semi-naked cake with fresh red florals and blackberries',
    cardClass: 'card-cadence-6' // medium-wide (440px height)
  }
];

// Duplicate items twice to ensure infinite seamless loop on any screen width
const MARQUEE_ITEMS = [...COLLECTION_ITEMS, ...COLLECTION_ITEMS];

export default function CategoriesSection() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="lany-collection-section" aria-label="Our Cakes Collection">
      {/* Header matching Framer editorial layout */}
      <div className="collection-header-row">
        <div className="collection-title-wrap">
          <h2 className="collection-headline">
            <span className="headline-line">Birthday, Bento &amp;</span>{' '}
            <span className="headline-line highlight-strip">Wedding Cakes.</span>
          </h2>
        </div>

        <div className="collection-meta-wrap">
          <p className="collection-meta-text">
            Left to right, slice to slice. The menu doesn't change when the clock does.
          </p>
        </div>
      </div>

      {/* Infinite Smooth Carousel Track - Slowly moves, stills on hover */}
      <div 
        className={`collection-track-container ${isPaused ? 'is-paused' : ''}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="collection-track">
          {MARQUEE_ITEMS.map((item, index) => (
            <article 
              key={`${item.id}-${index}`} 
              className={`collection-card ${item.cardClass}`}
            >
              <Link 
                to={item.link} 
                className="collection-card-link"
                title={`${item.displayTitle} - ${item.actionText}`}
              >
                {/* Photo Frame with Clean Edge */}
                <div className="card-photo-frame">
                  <img 
                    src={item.image} 
                    alt={item.alt}
                    className="card-photo-img"
                    loading="lazy"
                  />
                  
                  {/* Hover Overlay: Description & Explore Button appear on hover */}
                  <div className="card-hover-overlay">
                    <div className="overlay-content">
                      <p className="overlay-description">{item.description}</p>
                      <div className="overlay-action">
                        <span className="action-label">{item.actionText}</span>
                        <ArrowRight size={16} className="action-arrow" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Caption: Clean title with NO numbering */}
                <div className="card-caption-block">
                  <span className="card-title-text">{item.title}</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
