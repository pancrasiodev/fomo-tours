import { Link } from 'react-router-dom';
import { MapPin, Star, Award, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import Hero from '../components/Home/Hero';
import CategoriesSection from '../components/Home/CategoriesSection';
import FeaturedCakes from '../components/Home/FeaturedCakes';
import WhyChooseUs from '../components/Home/WhyChooseUs';
import ReviewsSection from '../components/Home/ReviewsSection';
import FaqSection from '../components/Home/FaqSection';
import PreFooterCta from '../components/Home/PreFooterCta';
import { usePageSeo, getBakerySchema, getFaqSchema } from '../utils/seo';

export default function HomePage() {
  const bakerySchema = getBakerySchema();
  const faqSchema = getFaqSchema([
    {
      q: "Where is Lany Cake Shop located in Nairobi & Ruiru?",
      a: "Our bakery studio is situated along Kamakis Eastern Bypass in Ruiru, Nairobi Metro, with daily dispatch across Nairobi CBD, Westlands, Kilimani, Karen, and Thika Road."
    },
    {
      q: "Can I order custom birthday cakes online with same-day delivery?",
      a: "Yes! Order before 11:00 AM for same-day delivery across Nairobi and Ruiru on our signature bento cakes, Belgian chocolate fudge, and classic celebration cakes."
    },
    {
      q: "Do you bake eggless cakes and custom wedding cakes?",
      a: "Yes, we bake 100% eggless cakes on request, along with multi-tier wedding cakes, corporate cakes, and themed birthday cakes for boys and girls."
    }
  ]);

  usePageSeo({
    title: 'Cake Shop in Nairobi & Ruiru | Custom Cakes | Lany Cakes',
    description: 'Best cake shop in Nairobi & Ruiru (Kamakis Bypass). Fresh birthday cakes, bento cakes from KSh 1,500, graduation & wedding cakes with same-day delivery.',
    keywords: [
      'cake shop in Nairobi and Ruiru',
      'cake shop Nairobi',
      'cake shop in Ruiru',
      'birthday cakes Nairobi',
      'bento cakes Nairobi',
      'wedding cakes Nairobi',
      'buy cake online in Nairobi',
      'custom cakes Nairobi',
      'Kamakis Eastern Bypass bakery',
      'best cake shop in Kenya'
    ],
    canonicalPath: '/',
    image: '/images/lany/birthday-cakes.webp',
    schema: {
      "@context": "https://schema.org",
      "@graph": [bakerySchema, faqSchema]
    }
  });

  return (
    <main className="lany-home-page">
      {/* Primary Hero: Crumb Club Editorial Design */}
      <Hero />

      {/* Bakery Collections */}
      <CategoriesSection />

      {/* Most Loved Cakes & Bestsellers */}
      <FeaturedCakes />

      {/* Why Lany Cake Shop • Nairobi Metro - Framer Showcase */}
      <section className="lany-home-seo-hub" style={{
        padding: '68px 0 80px',
        background: '#FAF6F0',
        borderTop: '1px solid rgba(162,91,54,0.12)',
        borderBottom: '1px solid rgba(162,91,54,0.12)',
        position: 'relative'
      }}>
        {/* Scoped CSS Using Lany Brand Fonts (Fredoka & Manrope) */}
        <style>{`
          .framer-showcase-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: center;
          }
          .framer-col-item {
            display: flex;
            align-items: center;
            gap: 24px;
            padding: 24px 32px;
          }
          .framer-col-divider-right {
            border-right: 1px dashed rgba(162, 91, 54, 0.28);
          }
          .framer-row-divider-bottom {
            border-bottom: 1px dashed rgba(162, 91, 54, 0.28);
            padding-bottom: 32px;
            margin-bottom: 32px;
          }
          .framer-img-frame {
            width: 220px;
            height: 175px;
            flex-shrink: 0;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(162, 91, 54, 0.08);
          }
          .framer-img-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
          .framer-cta-link {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 13.5px;
            font-weight: 700;
            color: #4A2617;
            text-decoration: none;
            white-space: nowrap;
            font-family: var(--font-heading);
          }
          .framer-cta-link:hover {
            text-decoration: underline;
          }
          @media (max-width: 960px) {
            .framer-showcase-row {
              grid-template-columns: 1fr;
            }
            .framer-col-divider-right {
              border-right: none;
              border-bottom: 1px dashed rgba(162, 91, 54, 0.28);
              padding-bottom: 24px;
              margin-bottom: 24px;
            }
            .framer-col-item {
              padding: 16px 0;
            }
          }
          @media (max-width: 600px) {
            .framer-col-item {
              flex-direction: column !important;
              align-items: flex-start !important;
            }
            .framer-img-frame {
              width: 100%;
              height: 200px;
            }
          }
        `}</style>

        <div className="lany-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* Why Choose Lany Cake Shop - Header */}
          <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 48px' }}>
            <div style={{
              fontSize: '13.5px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#4A2617',
              marginBottom: '10px',
              fontFamily: 'var(--font-heading)'
            }}>
              Why Lany Cake Shop &bull; Nairobi Metro
            </div>
            <h2 style={{
              fontSize: 'clamp(28px, 3.8vw, 42px)',
              fontWeight: 700,
              color: '#4A2617',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              marginBottom: '14px',
              fontFamily: 'var(--font-heading)'
            }}>
              Fresh Cakes Baked Daily,<br />Delivered Across Nairobi
            </h2>
          </div>

          {/* Row 1: Item 01 (Img Left, Text Right, 01 Below) | Item 02 (Img Left, Text Right, 02 Below) */}
          <div className="framer-showcase-row framer-row-divider-bottom">
            
            {/* Item 01: Fresh Bakes / Celebration & Bento Cakes */}
            <div className="framer-col-item framer-col-divider-right">
              <div className="framer-img-frame">
                <img
                  src="/images/about/pastry-decorating-action.jpg"
                  alt="Freshly baked celebration cupcakes with sprinkles at Lany Cake Shop"
                  loading="lazy"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <h3 style={{
                  fontSize: '19px',
                  fontWeight: 700,
                  color: '#4A2617',
                  letterSpacing: '0.01em',
                  marginBottom: '6px',
                  fontFamily: 'var(--font-heading)'
                }}>
                  Fresh Every Single Day
                </h3>
                <p style={{
                  fontSize: '13.5px',
                  color: '#70645D',
                  lineHeight: 1.5,
                  marginBottom: '10px',
                  fontFamily: 'var(--font-sans)'
                }}>
                  Every cake is baked on your celebration day with pure dairy butter and Belgian chocolate. Zero preservatives in any of our <Link to="/birthday-cakes-nairobi" style={{ color: 'inherit', fontWeight: 'inherit', textDecoration: 'none' }}>birthday cakes in Nairobi</Link>.
                </p>
                <div style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#4A2617',
                  lineHeight: 1,
                  fontFamily: 'var(--font-heading)'
                }}>
                  01
                </div>
              </div>
            </div>

            {/* Item 02: Artisan Bread / Wedding & Tiered Bakes */}
            <div className="framer-col-item">
              <div className="framer-img-frame">
                <img
                  src="/images/about/pastry-decorating-hands.jpg"
                  alt="Lany baker hand-piping buttercream at the Kamakis studio"
                  loading="lazy"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <h3 style={{
                  fontSize: '19px',
                  fontWeight: 700,
                  color: '#4A2617',
                  letterSpacing: '0.01em',
                  marginBottom: '6px',
                  fontFamily: 'var(--font-heading)'
                }}>
                  Handcrafted, Not Mass-Made
                </h3>
                <p style={{
                  fontSize: '13.5px',
                  color: '#70645D',
                  lineHeight: 1.5,
                  marginBottom: '10px',
                  fontFamily: 'var(--font-sans)'
                }}>
                  Carol Jenny and our studio bakers hand-pipe every swirl and sugar bloom, from tiny bento cakes to towering <Link to="/wedding-cakes-nairobi" style={{ color: 'inherit', fontWeight: 'inherit', textDecoration: 'none' }}>wedding cakes in Nairobi</Link>.
                </p>
                <div style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#4A2617',
                  lineHeight: 1,
                  fontFamily: 'var(--font-heading)'
                }}>
                  02
                </div>
              </div>
            </div>

          </div>

          {/* Row 2: Item 03 (03 Above, Text Left, Img Right) | Item 04 (04 Above, Text Left, Img Right) */}
          <div className="framer-showcase-row">
            
            {/* Item 03: Pure Baking / Ruiru & Kamakis Bypass */}
            <div className="framer-col-item framer-col-divider-right">
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#4A2617',
                  lineHeight: 1,
                  marginBottom: '8px',
                  fontFamily: 'var(--font-heading)'
                }}>
                  03
                </div>
                <h3 style={{
                  fontSize: '19px',
                  fontWeight: 700,
                  color: '#4A2617',
                  letterSpacing: '0.01em',
                  marginBottom: '6px',
                  fontFamily: 'var(--font-heading)'
                }}>
                  Safe 45-Minute Delivery
                </h3>
                <p style={{
                  fontSize: '13.5px',
                  color: '#70645D',
                  lineHeight: 1.5,
                  marginBottom: '10px',
                  fontFamily: 'var(--font-sans)'
                }}>
                  Chilled dispatch from Kamakis Eastern Bypass to Ruiru, Juja, Thika Road and all of Nairobi. Or pick up from our <Link to="/cake-shop-in-ruiru" style={{ color: 'inherit', fontWeight: 'inherit', textDecoration: 'none' }}>cake shop in Ruiru</Link>.
                </p>
              </div>
              <div className="framer-img-frame">
                <img
                  src="/images/home/nairobi-cake-delivery.jpg"
                  alt="Doorstep cake delivery across Nairobi and Ruiru from Lany Cake Shop"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Item 04: Baked Bliss / A Cake For Every Guest List */}
            <div className="framer-col-item">
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#4A2617',
                  lineHeight: 1,
                  marginBottom: '8px',
                  fontFamily: 'var(--font-heading)'
                }}>
                  04
                </div>
                <h3 style={{
                  fontSize: '19px',
                  fontWeight: 700,
                  color: '#4A2617',
                  letterSpacing: '0.01em',
                  marginBottom: '6px',
                  fontFamily: 'var(--font-heading)'
                }}>
                  A Cake For Every Guest List
                </h3>
                <p style={{
                  fontSize: '13.5px',
                  color: '#70645D',
                  lineHeight: 1.5,
                  marginBottom: '10px',
                  fontFamily: 'var(--font-sans)'
                }}>
                  Clear prices from a KSh 1,500 bento (serves 4) to 4 kg tiers (serves 50). Design <Link to="/custom-order" style={{ color: 'inherit', fontWeight: 'inherit', textDecoration: 'none' }}>custom cakes in Nairobi</Link> with live pricing.
                </p>
              </div>
              <div className="framer-img-frame">
                <img
                  src="/images/about/values-cake-4.jpg"
                  alt="Two-tier celebration cake with red roses for larger guest lists"
                  loading="lazy"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Why Lany Cakes Pillars */}
      <WhyChooseUs />

      {/* Google Profile Client Reviews (Bakery Spread Showcase) */}
      <ReviewsSection />

      {/* FAQs */}
      <FaqSection />

      {/* Call to Action */}
      <PreFooterCta />
    </main>
  );
}
