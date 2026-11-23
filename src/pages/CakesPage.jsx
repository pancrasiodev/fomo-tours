import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CAKES_CATALOG, CAKE_CATEGORIES } from '../data/cakesData';
import { useCart } from '../utils/cartStore';
import { usePageSeo, getBreadcrumbSchema } from '../utils/seo';
import './CakesPage.css';

export default function CakesPage({ forcedCategory }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = forcedCategory || searchParams.get('category') || 'all';
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();

  // Dynamic SEO Configurations for each Category & Catalog Permalinks
  const seoConfig = useMemo(() => {
    const map = {
      'bento': {
        title: 'Bento Cakes Nairobi | Mini Cakes from KSh 1,500 | Lany',
        description: 'Order Korean bento cakes in Nairobi starting from KSh 1,500. Fresh mini lunchbox cakes and cupcake combos with custom messages and same-day delivery.',
        primary: 'bento cakes nairobi',
        keywords: ['bento cakes Nairobi', 'korean lunchbox cakes nairobi', 'mini birthday cake nairobi', 'bento cake ksh 1500', 'pastel bento cakes ruiru', 'same day bento delivery'],
        canonical: '/bento-cakes'
      },
      'birthday': {
        title: 'Birthday Cakes Nairobi & Ruiru | Lany Cake Shop',
        description: 'Fresh birthday cakes in Nairobi and Ruiru baked with real dairy butter and Belgian chocolate. Browse themed kids cakes and order online for fast delivery.',
        primary: 'birthday cakes nairobi',
        keywords: ['birthday cakes Nairobi', 'custom birthday cakes nairobi', 'birthday cake delivery ruiru', 'minimalist birthday cake', 'best birthday cakes in nairobi'],
        canonical: '/birthday-cakes-nairobi'
      },
      'boys-birthday': {
        title: 'Birthday Cake for Boys Nairobi | Lany Cake Shop',
        description: 'Order a fun birthday cake for boys in Nairobi and Ruiru. Custom Spider-Man, Minecraft, and Paw Patrol cakes baked fresh with balanced sweetness.',
        primary: 'birthday cake for boys',
        keywords: ['birthday cake for boys', 'spiderman cake nairobi', 'superhero birthday cakes', 'football cakes for boys', 'boys celebration cakes nairobi'],
        canonical: '/birthday-cake-for-boys'
      },
      'wedding': {
        title: 'Wedding Cakes Nairobi & Ruiru | Lany Cake Shop',
        description: 'Custom wedding cakes in Nairobi and Ruiru baked by Carol Jenny. Multi-tier floral cakes, soft sponge flavor pairings, and reliable venue delivery.',
        primary: 'wedding cakes nairobi',
        keywords: ['wedding cakes Nairobi', 'bridal cakes kenya', 'tiered wedding cakes nairobi', 'botanical wedding cake', 'wedding cake tasting nairobi'],
        canonical: '/wedding-cakes-nairobi'
      },
      'graduation': {
        title: 'Graduation Cakes Juja & Nairobi | Lany Cake Shop',
        description: 'Order custom graduation cakes in Juja (JKUAT), Ruiru, and Nairobi. Kindergarten graduation cakes, cap-and-scroll designs, and school colors baked fresh.',
        primary: 'graduation cakes juja',
        keywords: ['graduation cakes Juja', 'jkuat graduation cakes', 'cap and scroll cake nairobi', 'academic celebration bakes', 'graduation cake delivery thika road'],
        canonical: '/graduation-cakes-juja'
      },
      'baby-shower': {
        title: 'Baby Shower Cakes Nairobi & Ruiru | Lany Cakes',
        description: 'Order baby shower cakes, baptism cakes, and gender reveal cakes in Nairobi and Ruiru. Soft pastel designs and fresh sponge flavors delivered to your door.',
        primary: 'baby shower cakes nairobi',
        keywords: ['baby shower cakes Nairobi', 'gender reveal cake nairobi', 'pastel teddy bear cake', 'baby shower celebration bakes'],
        canonical: '/baby-shower-cakes-nairobi'
      },
      'cupcakes': {
        title: 'Cupcakes Delivery Ruiru & Nairobi | Lany Cakes',
        description: 'Fresh cupcakes delivery in Ruiru and Nairobi. Moist chocolate, red velvet, and vanilla cupcakes with smooth buttercream swirls for birthdays and gifts.',
        primary: 'cupcakes delivery ruiru',
        keywords: ['cupcakes delivery Ruiru', 'artisan cupcakes nairobi', 'gourmet cupcake box', 'red velvet cupcakes ruiru', 'party cupcakes delivery'],
        canonical: '/cupcakes-delivery-ruiru'
      },
      'brownies': {
        title: 'Chocolate Brownie Cakes Nairobi | Lany Cake Shop',
        description: 'Rich chocolate brownie cakes and chocolate drip cakes in Nairobi and Ruiru, layered with Belgian chocolate ganache and salted caramel.',
        primary: 'chocolate brownie cake',
        keywords: ['chocolate brownie cake', 'brownie celebration cake nairobi', 'belgian chocolate brownies ruiru', 'fudge chocolate cake'],
        canonical: '/chocolate-brownie-cake'
      },
      'fondant': {
        title: 'Custom Fondant Cakes Nairobi | Lany Cake Shop',
        description: 'Custom fondant cakes in Nairobi and Ruiru with clean finishes and 3D character toppers for kids birthdays, weddings, and milestone events.',
        primary: 'fondant cakes nairobi',
        keywords: ['fondant cakes Nairobi', 'custom fondant figurines', 'sugar art cakes nairobi', 'porcelain fondant drape'],
        canonical: '/fondant-cakes'
      },
      'custom': {
        title: 'Custom Cakes Nairobi & Ruiru | Lany Cake Shop',
        description: 'Order custom cakes in Nairobi and Ruiru. Pick your theme, size, and cake flavors online and get a quick quote from Carol Jenny at Lany Cake Shop.',
        primary: 'custom cakes nairobi',
        keywords: ['custom cakes Nairobi', 'corporate logo cakes', 'bespoke cake design nairobi', '3d sculpted cakes ruiru'],
        canonical: '/custom-order'
      },
      'all': {
        title: typeof window !== 'undefined' && window.location.pathname === '/buy-cake-online-in-nairobi'
          ? 'Buy Cake Online in Nairobi | Fast Delivery | Lany'
          : 'Cake Menu & Prices Nairobi & Ruiru | Lany Cakes',
        description: typeof window !== 'undefined' && window.location.pathname === '/buy-cake-online-in-nairobi'
          ? 'Looking to buy cake online in Nairobi? Browse freshly baked birthday cakes, bento cakes, wedding tiers, and cupcakes from Lany Cake Shop with fast delivery.'
          : 'Explore our full Nairobi & Ruiru cake menu with transparent KSh prices. Order birthday cakes, bento boxes, graduation cakes, and cupcakes online from Lany.',
        primary: 'buy cake online in nairobi',
        keywords: ['buy cake online in Nairobi', 'cake store nairobi', 'order cake online ruiru', 'best cake shop nairobi', 'fresh cakes delivery nairobi'],
        canonical: typeof window !== 'undefined' && window.location.pathname === '/buy-cake-online-in-nairobi' ? '/buy-cake-online-in-nairobi' : '/cakes'
      }
    };
    return map[currentCategory] || map.all;
  }, [currentCategory]);

  usePageSeo({
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
    canonicalPath: seoConfig.canonical,
    image: '/images/lany/birthday-cakes.webp',
    schema: getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Cakes Catalog', url: '/cakes' },
      ...(currentCategory !== 'all' ? [{ name: seoConfig.primary, url: seoConfig.canonical }] : [])
    ])
  });

  const featuredBakes = [
    {
      id: 'minimalist-birthday-cake',
      slug: 'minimalist-birthday-cake-nairobi',
      name: 'Minimalist Birthday Cake',
      price: 'KSh 2,500',
      image: '/images/lany/birthday-cake.webp'
    },
    {
      id: 'royal-floral-wedding-tier',
      slug: 'royal-botanical-wedding-cake-nairobi',
      name: '3-Tier Botanical Wedding',
      price: 'KSh 14,000',
      image: '/images/lany/bridal-cakes.webp'
    },
    {
      id: 'confetti-dream-birthday',
      slug: 'festive-birthday-cake-delivery-nairobi',
      name: 'Festive Celebration Cake',
      price: 'KSh 3,200',
      image: '/images/lany/birthday-cakes.webp'
    },
    {
      id: 'gourmet-artisan-cupcake-box',
      slug: 'gourmet-cupcakes-delivery-ruiru-nairobi',
      name: 'Artisan Cupcake Box',
      price: 'KSh 2,400',
      image: '/images/lany/cupcakes.webp'
    }
  ];

  const filteredCakes = useMemo(() => {
    const catFallbacks = {
      'baby-shower': ['half-and-half-baby-birthday-cake', 'holy-spirit-baptism-cake', 'sofia-fairytale-princess-first-birthday-cake'],
      'cupcakes': ['bento-cupcake-combo', 'farewell-doctor-bento-cupcake-combo'],
      'brownies': ['chocolate-cake-artisanal-drip', 'salted-caramel-naked-birthday-cake'],
      'wedding': ['birthday-cake-for-mom-gold-butterfly', 'mothers-day-butterfly-gift-cake', 'ocean-azure-blue-birthday-cake'],
    };
    return CAKES_CATALOG.filter(cake => {
      const matchesCat =
        currentCategory === 'all' ||
        cake.category === currentCategory ||
        (catFallbacks[currentCategory] && catFallbacks[currentCategory].includes(cake.id));
      const matchesSearch = searchQuery === '' || 
        cake.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cake.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cake.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });
  }, [currentCategory, searchQuery, sortBy]);

  const handleCategoryChange = (catId) => {
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="lany-catalog-page">
      {/* Dark Cocoa Editorial Shop Hero */}
      <section className="catalog-hero-banner">
        {/* Floating Bakery Accents */}
        <img
          src="/images/bestsellers/floating-cake-slice.png"
          alt=""
          aria-hidden="true"
          className="shop-float-treat shop-float-tl"
        />
        <img
          src="/images/bestsellers/floating-lemon-tart.png"
          alt=""
          aria-hidden="true"
          className="shop-float-treat shop-float-ml"
        />
        <img
          src="/images/bestsellers/floating-cinnamon-bun.png"
          alt=""
          aria-hidden="true"
          className="shop-float-treat shop-float-tr"
        />
        <img
          src="/images/bestsellers/floating-chocolate-cookie.png"
          alt=""
          aria-hidden="true"
          className="shop-float-treat shop-float-mr"
        />

        <div className="lany-container catalog-hero-inner">
          <h1 className="catalog-page-title">
            {seoConfig.title.split('|')[0].trim()}
          </h1>
          <p style={{ maxWidth: '620px', margin: '10px auto 18px', color: 'rgba(255,255,255,0.86)', fontSize: '0.98rem', lineHeight: 1.55 }}>
            {seoConfig.description}
          </p>

          <div className="catalog-hero-cta-row">
            <a
              href="#catalog-menu"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('catalog-menu')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="shop-hero-menu-btn"
            >
              <span>View Our Menu</span>
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      <section id="catalog-menu" className="catalog-products-section">
        <div className="lany-container catalog-body-container">
          {/* Section Header Row */}
          <div className="catalog-section-top-row">
            <h2 className="catalog-products-heading">Our Signature Cakes</h2>
            <button
              type="button"
              className="catalog-view-all-btn"
              onClick={() => {
                handleCategoryChange('all');
                setSearchQuery('');
                setSortBy('featured');
              }}
            >
              View All Cakes &raquo;
            </button>
          </div>

        {/* Cakes Grid */}
        {filteredCakes.length === 0 ? (
          <div className="catalog-empty-state">
            <div className="empty-icon" />
            <h3>No cakes matched your search</h3>
            <p>Try searching for a different keyword or view all categories.</p>
            <button 
              className="reset-filter-btn"
              onClick={() => {
                setSearchQuery('');
                handleCategoryChange('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="catalog-grid">
            {filteredCakes.map(cake => {
              const isAdded = addedId === cake.id;
              const isBespoke = cake.pricingModel === 'bespoke';
              return (
                <div key={cake.id} className="catalog-cake-card">
                  <Link to={`/cake/${cake.slug || cake.id}`} className="catalog-cake-img-wrap">
                    <img
                      src={`/images/cakes/cutouts/${cake.id}.webp`}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = cake.image; }}
                      alt={cake.name}
                      className="catalog-cake-img"
                      loading="lazy"
                    />
                  </Link>

                  <div className="catalog-cake-info">
                    <div className="catalog-cake-title-row">
                      <h3 className="catalog-cake-name">
                        <Link to={`/cake/${cake.slug || cake.id}`}>{cake.name}</Link>
                      </h3>
                      <span className="catalog-cake-price">
                        {isBespoke ? 'Quote' : cake.priceFormatted}
                      </span>
                    </div>

                    {isBespoke ? (
                      <Link to={`/cake/${cake.slug || cake.id}`} className="catalog-add-cart-btn">
                        Request Quote
                      </Link>
                    ) : (
                      <div className="catalog-card-actions">
                        <button
                          type="button"
                          className={`catalog-add-cart-btn ${isAdded ? 'is-added' : ''}`}
                          onClick={() => {
                            addToCart(cake, {
                              weight: cake.defaultWeight || '1 kg',
                              flavor: 'Vanilla Sponge',
                              totalPrice: cake.price,
                            });
                            setAddedId(cake.id);
                            setTimeout(() => setAddedId(prev => (prev === cake.id ? null : prev)), 1600);
                          }}
                        >
                          {isAdded ? 'Added to Cart ✓' : 'Add to Cart'}
                        </button>
                        <button
                          type="button"
                          className="catalog-buy-now-btn"
                          onClick={() => {
                            addToCart(cake, {
                              weight: cake.defaultWeight || '1 kg',
                              flavor: 'Vanilla Sponge',
                              totalPrice: cake.price,
                            });
                            window.dispatchEvent(new Event('lany_open_cart'));
                          }}
                        >
                          Buy Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </section>

      <div className="lany-container">

        {/* SEO Editorial Summary & Cross-Linking Hub */}
        <section className="catalog-seo-editorial-block" style={{
          marginTop: '60px',
          padding: '36px',
          background: '#FAF7F2',
          borderRadius: '20px',
          border: '1px solid rgba(122,21,47,0.08)'
        }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#7A152F',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Artisan Baking Guide &bull; Nairobi &amp; Ruiru
            </span>
            <h2 style={{
              fontSize: 'clamp(20px, 2.4vw, 28px)',
              fontWeight: 700,
              color: '#26181A',
              marginBottom: '16px',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Real Butter, Freshly Baked Every Morning for Your Celebrations
            </h2>
            <p style={{ fontSize: '14.5px', color: '#68595B', lineHeight: 1.7, marginBottom: '14px' }}>
              When you order to <strong>buy cake online in Nairobi</strong>, nobody wants dry sponges or plastic-tasting imitation creams that sat in a display case for days. At Lany Cake Shop, Carol Jenny and our bakers bake every order fresh for your specific date. From tender Korean <strong>bento cakes</strong> to grand multi-tier <strong>wedding cakes in Nairobi</strong>, we whip real dairy butter, rich Belgian cocoa, and fresh Kenyan passion curd so every forkful tastes homemade and heavenly.
            </p>
            <p style={{ fontSize: '14.5px', color: '#68595B', lineHeight: 1.7, marginBottom: '20px' }}>
              Nestled at our studio along the Kamakis Eastern Bypass, we provide smooth <strong>cake delivery in Ruiru</strong>, Juja, Thika Road, Westlands, and Nairobi estates. Need a custom design, an eggless recipe, or something out of the box? Build your dream bake with our <Link to="/custom-order" style={{ color: '#7A152F', fontWeight: 600, textDecoration: 'underline' }}>custom cakes in Nairobi</Link> builder or drop by our <Link to="/cake-shop-in-ruiru" style={{ color: '#7A152F', fontWeight: 600, textDecoration: 'underline' }}>cake shop in Ruiru</Link> for an easy studio pickup on your way home.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(122,21,47,0.08)'
            }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#7A152F', marginBottom: '6px' }}>Top Categories</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13.5px', lineHeight: 1.8 }}>
                  <li><Link to="/bento-cakes" style={{ color: '#554245' }}>Bento Cakes Nairobi &rarr;</Link></li>
                  <li><Link to="/birthday-cakes-nairobi" style={{ color: '#554245' }}>Birthday Cakes Nairobi &rarr;</Link></li>
                  <li><Link to="/wedding-cakes-nairobi" style={{ color: '#554245' }}>Wedding Cakes Nairobi &rarr;</Link></li>
                </ul>
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#7A152F', marginBottom: '6px' }}>Local Delivery Hubs</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13.5px', lineHeight: 1.8 }}>
                  <li><Link to="/cake-shop-in-ruiru" style={{ color: '#554245' }}>Cake Shop Ruiru (Kamakis) &rarr;</Link></li>
                  <li><Link to="/cake-shop-in-juja" style={{ color: '#554245' }}>Cake Shop Juja (JKUAT) &rarr;</Link></li>
                  <li><Link to="/contact" style={{ color: '#554245' }}>Eastern Bypass Studio &rarr;</Link></li>
                </ul>
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#7A152F', marginBottom: '6px' }}>Studio &amp; Citations</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13.5px', lineHeight: 1.8 }}>
                  <li>
                    <a href="https://maps.google.com/?q=Kamakis+Eastern+Bypass+Ruiru+Kenya" target="_blank" rel="noopener noreferrer" style={{ color: '#554245' }}>
                      Google Maps Pin ↗
                    </a>
                  </li>
                  <li>
                    <a href="https://instagram.com/lanycakeshop" target="_blank" rel="noopener noreferrer" style={{ color: '#554245' }}>
                      Instagram @lanycakeshop ↗
                    </a>
                  </li>
                  <li>
                    <Link to="/contact" style={{ color: '#554245' }}>Contact Bakery Team &rarr;</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
