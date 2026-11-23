import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, Clock, Truck, ShieldCheck, Sparkles, Phone, MessageCircle, 
  ChevronDown, ChevronUp, ArrowRight, CheckCircle2, Star 
} from 'lucide-react';
import { LOCATIONS_DATA } from '../data/locationsData';
import { BUSINESS_INFO, CAKES_CATALOG } from '../data/cakesData';
import { usePageSeo, getBreadcrumbSchema, getFaqSchema } from '../utils/seo';
import PreFooterCta from '../components/Home/PreFooterCta';
import './LocationPage.css';

export default function LocationPage({ forcedLocation }) {
  const { slug } = useParams();
  
  // Resolve location either from prop or route slug
  let locationKey = forcedLocation;
  if (!locationKey) {
    if (slug?.includes('juja')) locationKey = 'juja';
    else if (slug?.includes('kahawa')) locationKey = 'kahawa';
    else if (slug?.includes('kasarani')) locationKey = 'kasarani';
    else if (slug?.includes('roysambu') || slug?.includes('trm') || slug?.includes('zimmerman')) locationKey = 'roysambu';
    else if (slug?.includes('garden-city') || slug?.includes('thika-road')) locationKey = 'garden-city';
    else if (slug?.includes('ruai') || slug?.includes('utawala') || slug?.includes('kamulu')) locationKey = 'ruai';
    else if (slug?.includes('tatu-city') || slug?.includes('membley') || slug?.includes('kiambu')) locationKey = 'tatu-city';
    else locationKey = 'ruiru';
  }

  const data = LOCATIONS_DATA[locationKey] || LOCATIONS_DATA.ruiru;
  const [openFaq, setOpenFaq] = useState(0);

  const isGreenSpot = typeof window !== 'undefined' && window.location.pathname.includes('green-spot');
  const effectiveSlug = isGreenSpot ? 'cake-shop-around-green-spot-eastern-bypass' : data.slug;
  const effectiveTitle = isGreenSpot
    ? 'Cake Shop Green Spot Eastern Bypass | Lany Cakes'
    : data.seoTitle;
  const effectiveDesc = isGreenSpot
    ? 'Order fresh birthday cakes, bento cakes, and graduation cakes near Green Spot on the Eastern Bypass, Kamakis Ruiru. Fast pickup or delivery.'
    : data.seoDescription;

  const localSchema = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "name": `Lany Cake Shop - ${data.city}`,
    "image": "https://lanycakes.co.ke/images/lany/birthday-cakes.webp",
    "telephone": BUSINESS_INFO.phoneFormatted,
    "email": BUSINESS_INFO.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Greek Towers, Kamakis Eastern Bypass",
      "addressLocality": "Ruiru",
      "addressRegion": "Kiambu",
      "addressCountry": "KE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -1.147689,
      "longitude": 36.9610822
    },
    "hasMap": "https://www.google.com/maps?cid=14552677630529229588",
    "sameAs": [
      "https://www.google.com/maps/place/Lany+Cake+Shop/@-1.147689,36.9610822,17z/data=!3m1!4b1!4m6!3m5!1s0x182f474986c7ee6f:0xc9f5656b7a4a1a84!8m2!3d-1.147689!4d36.9610822!16s%2Fg%2F11z13b31pc"
    ],
    "url": `https://lanycakes.co.ke/${effectiveSlug}`,
    "openingHours": "Mo-Su 10:00-21:00",
    "priceRange": "KSh 1,500 - KSh 25,000",
    "areaServed": data.neighborhoods
  };

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Locations', url: '/cake-shop-in-ruiru' },
    { name: data.city, url: `/${effectiveSlug}` }
  ]);

  const faqSchema = getFaqSchema(data.faqs);

  usePageSeo({
    title: effectiveTitle,
    description: effectiveDesc,
    keywords: [data.primaryKeyword, ...(data.secondaryKeywords || [])],
    canonicalPath: `/${effectiveSlug}`,
    image: '/images/lany/birthday-cakes.webp',
    schema: {
      "@context": "https://schema.org",
      "@graph": [localSchema, breadcrumbs, ...(faqSchema ? [faqSchema] : [])]
    }
  });

  const whatsappMessage = encodeURIComponent(
    `Hello Carol Jenny & Lany Bakery! I am looking for a cake in ${data.city} and would like to inquire about availability and delivery.`
  );

  return (
    <div className="location-page">

      {/* Hero Banner */}
      <section className="location-hero-banner">
        <div className="location-container">
          <div className="location-pill-wrap">
            <span className="location-hero-pill">( {data.heroBadge} )</span>
          </div>

          <h1 className="location-hero-title">
            {isGreenSpot ? 'Cake Shop Around Green Spot, Eastern Bypass — Kamakis Ruiru' : data.headline}
          </h1>
          <p className="location-hero-subtitle">{data.subheadline}</p>

          <div className="location-trust-strip">
            <div className="trust-pill-item">
              <Sparkles size={15} className="trust-icon" />
              <span>100% Genuine Dairy Butter &amp; Cocoa</span>
            </div>
            <div className="trust-pill-item">
              <Clock size={15} className="trust-icon" />
              <span>Doorstep Delivery in {data.deliveryTime}</span>
            </div>
            <div className="trust-pill-item">
              <ShieldCheck size={15} className="trust-icon" />
              <span>Zero Transit Damage Guarantee</span>
            </div>
          </div>

          <div className="location-cta-group">
            <Link to="/cakes" className="location-primary-btn">
              <span>Order Celebration Cake</span>
              <ArrowRight size={18} />
            </Link>
            <a 
              href={`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="location-whatsapp-btn"
            >
              <MessageCircle size={18} />
              <span>WhatsApp Us Now ({data.city})</span>
            </a>
          </div>
        </div>
      </section>

      {/* Neighborhoods & Coverage Section */}
      <section className="location-coverage-section">
        <div className="location-container">
          <div className="coverage-card">
            <div className="coverage-header">
              <div className="coverage-icon-box">
                <MapPin size={24} />
              </div>
              <div>
                <h2 className="coverage-title">Neighborhoods We Serve Across {data.city}</h2>
                <p className="coverage-sub">
                  Every order is dispatched in temperature-controlled boxes from our Kamakis Eastern Bypass kitchen directly to your doorstep.
                </p>
              </div>
            </div>

            <div className="neighborhoods-grid">
              {data.neighborhoods.map((estate, idx) => (
                <div key={idx} className="neighborhood-pill">
                  <CheckCircle2 size={16} className="nh-check" />
                  <span>{estate}</span>
                </div>
              ))}
            </div>

            <div className="coverage-footer-note">
              <span><strong>Pickup Option:</strong> {data.pickupLocation}</span>
            </div>

            <div style={{ marginTop: '20px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(36, 8, 13, 0.1)' }}>
              <iframe
                title="Lany Cake Shop Greek Towers Ruiru Map"
                src="https://maps.google.com/maps?q=Lany+Cake+Shop,+Greek+Towers,+Ruiru&ll=-1.147689,36.9610822&z=16&output=embed"
                width="100%"
                height="280"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid rgba(36, 8, 13, 0.08)', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.84rem', color: '#24080D', marginRight: '6px' }}>Nearby Delivery Hubs:</strong>
              <Link to="/cake-shop-in-ruiru" className="neighborhood-pill" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.82rem' }}>Ruiru &amp; Kamakis</Link>
              <Link to="/cake-shop-in-juja" className="neighborhood-pill" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.82rem' }}>Juja &amp; JKUAT</Link>
              <Link to="/cake-shop-in-kahawa" className="neighborhood-pill" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.82rem' }}>Kahawa Sukari &amp; Wendani</Link>
              <Link to="/cake-shop-near-kasarani" className="neighborhood-pill" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.82rem' }}>Kasarani &amp; Seasons</Link>
              <Link to="/cake-shop-near-roysambu" className="neighborhood-pill" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.82rem' }}>Roysambu &amp; TRM</Link>
              <Link to="/cake-shop-near-garden-city" className="neighborhood-pill" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.82rem' }}>Garden City &amp; Thika Rd</Link>
              <Link to="/cake-shop-near-ruai" className="neighborhood-pill" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.82rem' }}>Ruai &amp; Utawala</Link>
              <Link to="/cake-shop-near-tatu-city" className="neighborhood-pill" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.82rem' }}>Tatu City &amp; Membley</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best-Selling Cakes for this Area */}
      <section className="location-cakes-section">
        <div className="location-container">
          <div className="section-title-wrap">
            <span className="section-pre-pill">( POPULAR CELEBRATION BAKES )</span>
            <h2 className="section-main-heading">Cakes Loved by Customers in {data.city}</h2>
            <p className="section-sub-copy">
              From surprise birthday tiers to graduation caps and intimate bento boxes, here are our top-requested flavors in {data.city}.
            </p>
          </div>

          <div className="location-cakes-grid">
            {CAKES_CATALOG.slice(0, 3).map((cake) => (
              <div key={cake.id} className="loc-cake-card">
                <div className="loc-cake-img-wrap">
                  <img src={cake.image} alt={cake.name} className="loc-cake-img" loading="lazy" />
                  <span className="loc-price-badge">{cake.priceFormatted || `KSh ${cake.price?.toLocaleString()}`}</span>
                </div>
                <div className="loc-cake-body">
                  <span className="loc-cake-cat">{cake.categoryName || 'Artisan Cake'}</span>
                  <h3 className="loc-cake-title">{cake.name}</h3>
                  <p className="loc-cake-desc">{cake.shortDesc || cake.description}</p>
                  <div className="loc-cake-footer">
                    <span className="loc-portion">{cake.servings || 'Serves 8-12'}</span>
                    <Link to={`/cake/${cake.slug || cake.id}`} className="loc-view-btn">
                      <span>View Cake</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Lany for Ruiru / Juja (Humanized ContentDesk Highlights) */}
      <section className="location-why-section">
        <div className="location-container">
          <div className="section-title-wrap">
            <span className="section-pre-pill">( THE LANY DIFFERENCE )</span>
            <h2 className="section-main-heading">Why Order from Our {data.city} Cake Studio?</h2>
          </div>

          <div className="location-highlights-grid">
            {data.highlights.map((h, i) => (
              <div key={i} className="highlight-card">
                <div className="highlight-number">0{i + 1}</div>
                <h3 className="highlight-title">{h.title}</h3>
                <p className="highlight-desc">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local Customer Testimonials */}
      <section className="location-reviews-section">
        <div className="location-container">
          <div className="section-title-wrap">
            <span className="section-pre-pill">( CLIENT CELEBRATION REVIEWS )</span>
            <h2 className="section-main-heading">What Neighbors in {data.city} Say</h2>
          </div>

          <div className="location-reviews-grid">
            {data.localTestimonials.map((t, i) => (
              <div key={i} className="loc-review-card">
                <div className="loc-review-stars">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={16} fill="#F8B84E" color="#F8B84E" />
                  ))}
                </div>
                <blockquote className="loc-review-quote">
                  "{t.quote}"
                </blockquote>
                <div className="loc-review-author">
                  <strong>{t.name}</strong>
                  <span>{t.estate} &bull; <em>{t.cake}</em></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Localized FAQ Section */}
      <section className="location-faq-section">
        <div className="location-container">
          <div className="section-title-wrap">
            <span className="section-pre-pill">( FREQUENTLY ASKED QUESTIONS )</span>
            <h2 className="section-main-heading">Questions About Cake Delivery in {data.city}</h2>
          </div>

          <div className="location-faq-list">
            {data.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className={`loc-faq-item ${isOpen ? 'is-open' : ''}`}>
                  <button 
                    className="loc-faq-trigger" 
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {isOpen && (
                    <div className="loc-faq-body">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PreFooter Call to Action */}
      <PreFooterCta />
    </div>
  );
}
