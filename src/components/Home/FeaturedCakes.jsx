import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../utils/cartStore';
import './FeaturedCakes.css';

const BEST_SELLERS = [
  {
    id: 'bento-cupcake-combo',
    slug: 'bento-cake-cupcake-combo-nairobi',
    title: 'Bento Cake & 5-Cupcake Box',
    keywordTag: 'BENTO CAKES',
    priceBadge: 'KSh 2,400',
    kshPrice: 2400,
    priceFormatted: 'KSh 2,400',
    desc: 'Trending Korean bento cake with custom gold lettering paired with 5 matching artisanal cupcakes.',
    cutoutImage: '/images/cakes/cutouts/bento-cupcake-combo.webp',
    image: '/images/cakes/bento-cake-cupcake-combo.webp',
    weight: 'Bento + 5 Cupcakes',
    category: 'Bento Cakes'
  },
  {
    id: 'spiderman-superhero-birthday-cake',
    slug: 'spiderman-cake',
    title: 'Spider-Man Boys Birthday Cake',
    keywordTag: 'SPIDERMAN CAKE',
    priceBadge: 'KSh 2,700',
    kshPrice: 2700,
    priceFormatted: 'KSh 2,700',
    desc: 'Action-packed Marvel Spider-Man celebration cake in sky-blue buttercream with 3D mask & web slinger.',
    cutoutImage: '/images/cakes/cutouts/spiderman-superhero-birthday-cake.webp',
    image: '/images/cakes/spiderman-superhero-birthday-cake.webp',
    weight: '1 kg',
    category: 'Birthday Cake for Boys'
  },
  {
    id: 'kindergarten-grade-1-graduation-cake',
    slug: 'kindergarten-graduation-cake',
    title: 'Kindergarten & Grade 1 Graduation Cake',
    keywordTag: 'GRADUATION CAKES',
    priceBadge: 'KSh 2,850',
    kshPrice: 2850,
    priceFormatted: 'KSh 2,850',
    desc: 'Vibrant school milestone cake topped with 3D colorful pencils, book stack, apple & 1-2-3 blocks.',
    cutoutImage: '/images/cakes/cutouts/kindergarten-grade-1-graduation-cake.webp',
    image: '/images/cakes/kindergarten-graduation-cake.webp',
    weight: '1 kg',
    category: 'Graduation Cakes'
  },
  {
    id: 'chocolate-cake-artisanal-drip',
    slug: 'chocolate-cake',
    title: 'Decadent Chocolate Cake',
    keywordTag: 'CHOCOLATE CAKE',
    priceBadge: 'KSh 2,600',
    kshPrice: 2600,
    priceFormatted: 'KSh 2,600',
    desc: 'Rich Belgian chocolate sponge with silky chocolate ganache drip, Oreo cookies & chocolate shard crown.',
    cutoutImage: '/images/cakes/cutouts/chocolate-cake-artisanal-drip.webp',
    image: '/images/cakes/chocolate-drip-birthday-cake.webp',
    weight: '1 kg',
    category: 'Birthday Cakes'
  },
  {
    id: 'graduation-cake-congrats-grad-her',
    slug: 'graduation-cake',
    title: 'Personalized Graduation Cake',
    keywordTag: 'GRADUATION CAKES',
    priceBadge: 'KSh 2,750',
    kshPrice: 2750,
    priceFormatted: 'KSh 2,750',
    desc: 'Custom graduation cap, gold tassel, degree scroll & personalized name plaque in rich buttercream.',
    cutoutImage: '/images/cakes/cutouts/graduation-cake-congrats-grad-her.webp',
    image: '/images/cakes/graduation-cake-for-her.webp',
    weight: '1 kg',
    category: 'Graduation Cakes'
  },
  {
    id: 'sofia-the-first-princess-cake',
    slug: 'sofia-the-first-cake',
    title: 'Sofia the First Princess Cake',
    keywordTag: 'BIRTHDAY CAKES',
    priceBadge: 'KSh 2,950',
    kshPrice: 2950,
    priceFormatted: 'KSh 2,950',
    desc: 'Royal lavender & pearl princess birthday cake with Sofia the First topper and buttercream rosettes.',
    cutoutImage: '/images/cakes/cutouts/sofia-the-first-princess-cake.webp',
    image: '/images/cakes/sofia-the-first-birthday-cake.webp',
    weight: '1 kg',
    category: 'Birthday Cakes'
  }
];

// Duplicate items to create an infinite seamless auto-moving loop
const MARQUEE_ITEMS = [...BEST_SELLERS, ...BEST_SELLERS];

// Interactive 3D Staged Cake with Realistic Platter & Physics Tilt
function RealCake3DStage({ image, alt, isHovered }) {
  const stageRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, tz: 0 });

  const handleMouseMove = (e) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 2 - 1; // -1 to 1
    const py = (y / rect.height) * 2 - 1; // -1 to 1
    setTilt({
      rx: -py * 10,
      ry: px * 12,
      tz: 18
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, tz: 0 });
  };

  return (
    <div 
      ref={stageRef}
      className={`real-cake-3d-stage ${isHovered ? 'is-card-hovered' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="cake-3d-perspective-box"
        style={{
          transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(${tilt.tz}px)`
        }}
      >
        <img 
          src={image} 
          alt={alt} 
          className="real-cake-photo" 
          loading="lazy" 
        />
      </div>

      {/* Realistic Soft Contact Drop Shadow on Dusty Rose */}
      <div 
        className="real-cake-contact-shadow"
        style={{
          transform: `scale(${isHovered ? 1.06 : 1}) translateX(${-tilt.ry * 1.2}px)`
        }}
      />
    </div>
  );
}

export default function FeaturedCakes() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [addedId, setAddedId] = useState(null);

  const handleProductRedirect = (item) => {
    navigate(`/cake/${item.slug || item.id}`);
  };

  return (
    <section id="bestsellers" className="lany-bestseller-section" aria-label="Our Best Sellers">
      {/* Editorial Header with Yellow Stripe */}
      <div className="bestseller-header-row">
        <div className="bestseller-title-wrap">
          <span className="bestseller-kicker">CAKE SHOP IN NAIROBI &amp; RUIRU</span>
          <h2 className="bestseller-main-title">
            <span className="bestseller-title-line">Best Birthday Cakes, Event Cakes &amp; Graduation</span>
            <span className="bestseller-title-line highlight-strip">Cakes in Nairobi.</span>
          </h2>
        </div>

        <div className="bestseller-meta-wrap">
          <p className="bestseller-meta-text">
            Customer favorites across Nairobi and Ruiru. Click any product to view its dedicated cake page, select custom flavors, and order.
          </p>
        </div>
      </div>

      {/* Auto-moving Carousel Track (Smooth slow drift, stills on hover) */}
      <div 
        className={`bestseller-track-wrapper ${isPaused ? 'is-paused' : ''}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          setHoveredCardId(null);
        }}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => {
          setIsPaused(false);
          setHoveredCardId(null);
        }}
      >
        <div className="bestseller-cards-row">
          {MARQUEE_ITEMS.map((item, index) => {
            const cardKey = `${item.id}-${index}`;
            const isCardHovered = hoveredCardId === cardKey;

            return (
              <article 
                key={cardKey} 
                className="bestseller-card"
                onClick={() => handleProductRedirect(item)}
                onMouseEnter={() => setHoveredCardId(cardKey)}
                onMouseLeave={() => setHoveredCardId(null)}
                style={{ cursor: 'pointer' }}
                title={`Click to view ${item.title} product page & order`}
              >
                {/* 3D Staged Real Cake Photography on Turntable Platter */}
                <RealCake3DStage 
                  image={item.cutoutImage} 
                  alt={item.title} 
                  isHovered={isCardHovered} 
                />

                {/* Information Block Below Floating Cake */}
                <div className="bestseller-info-block">
                  <div className="bestseller-title-row">
                    <h3 className="bestseller-card-title">{item.title}</h3>
                    <span className="bestseller-price-text">{item.priceBadge}</span>
                  </div>

                  <div className="bestseller-card-actions">
                    <button
                      type="button"
                      className={`bestseller-add-cart-btn ${addedId === item.id ? 'is-added' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(
                          { ...item, name: item.title, price: item.kshPrice },
                          { weight: item.weight || '1 kg', flavor: 'Vanilla Sponge', totalPrice: item.kshPrice }
                        );
                        setAddedId(item.id);
                        setTimeout(() => setAddedId(prev => (prev === item.id ? null : prev)), 1600);
                      }}
                    >
                      {addedId === item.id ? 'Added to Cart ✓' : 'Add to Cart'}
                    </button>
                    <button
                      type="button"
                      className="bestseller-buy-now-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(
                          { ...item, name: item.title, price: item.kshPrice },
                          { weight: item.weight || '1 kg', flavor: 'Vanilla Sponge', totalPrice: item.kshPrice }
                        );
                        window.dispatchEvent(new Event('lany_open_cart'));
                      }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
