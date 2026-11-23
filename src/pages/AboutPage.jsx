import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, Heart, Sparkles, Award } from 'lucide-react';
import PreFooterCta from '../components/Home/PreFooterCta';
import { usePageSeo, getBakerySchema, getBreadcrumbSchema } from '../utils/seo';
import './AboutPage.css';

const BAKING_VALUES = [
  {
    id: "taste",
    tag: "01 / TASTE",
    brand: "Lany",
    quote: "will convince you that taste comes first",
    title: "The Art of Taste",
    desc: "We balance sweetness so natural Belgian cocoa, Madagascar vanilla, and fresh fruit curds take center stage in every slice.",
    bg: "/images/about/value-bg-taste.jpg",
    alt: "Triple layer chocolate fudge cake with fresh berry glaze"
  },
  {
    id: "ingredients",
    tag: "02 / PURITY",
    brand: "Lany",
    quote: "refuses shortcuts & fake essences",
    title: "Pure Ingredients",
    desc: "100% real dairy butter, fair-trade couverture chocolate, and local Kenyan highland berries. Never hydrogenated spreads.",
    bg: "/images/about/value-bg-ingredients.jpg",
    alt: "Chocolate cake slice with fresh strawberries and rich cocoa sponge"
  },
  {
    id: "craft",
    tag: "03 / CRAFT",
    brand: "Lany",
    quote: "emotionally attached to velvety swirls",
    title: "Artisan Handcraft",
    desc: "Every delicate palette-knife ruffle, rustic semi-naked crumb, and sculpted petal is hand-piped with patient devotion.",
    bg: "/images/about/value-bg-craft.jpg",
    alt: "Pastry chef piping artisan buttercream ribbons onto a celebration cake"
  },
  {
    id: "fresh",
    tag: "04 / FRESH",
    brand: "Lany",
    quote: "always baked fresh for your good mood",
    title: "Baked Fresh Daily",
    desc: "Oven-fresh every morning in Ruiru & Nairobi. We bake with real passion to turn life’s sweetest moments into unforgettable memories.",
    bg: "/images/about/value-bg-fresh.jpg",
    alt: "Freshly decorated dark chocolate celebration cake on a stand"
  }
];

export default function AboutPage() {
  const bakerySchema = getBakerySchema();
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about' }
  ]);

  usePageSeo({
    title: 'About Lany Cake Shop | Kamakis Ruiru & Nairobi',
    description: 'Meet Carol Jenny and the Lany Cake Shop team at Kamakis Eastern Bypass, Ruiru. We bake fresh birthday cakes, wedding cakes, and bento cakes daily.',
    keywords: [
      'artisan cake bakery Nairobi',
      'Carol Jenny master baker',
      'Lany Cake Shop Nairobi',
      'CJ Cakes confectionery',
      'Kamakis bakery studio Ruiru',
      'custom wedding cake decorator'
    ],
    canonicalPath: '/about',
    image: '/images/lany/cj-cakes.webp',
    schema: {
      "@context": "https://schema.org",
      "@graph": [bakerySchema, breadcrumbSchema]
    }
  });

  return (
    <div className="about-page">
      {/* Editorial Bakeri-Style Split Hero */}
      <section className="about-hero-split">
        {/* Left: Deep Chocolate Studio Panel */}
        <div className="about-hero-left">
          <div className="about-hero-left-content">
            <p className="about-hero-blurb">
              A warm neighbourhood cake shop in Kamakis, Ruiru baking fresh birthday cakes, wedding tiers, and everyday treats for families across Nairobi.
            </p>

            <div className="about-hero-rating-badge">
              <div className="rating-avatars-stack">
                <img src="/images/avatars/avatar-1.jpg" alt="Client review" />
                <img src="/images/avatars/avatar-2.jpg" alt="Client review" />
                <img src="/images/avatars/avatar-3.jpg" alt="Client review" />
                <span className="avatar-plus-count">+</span>
              </div>
              <div className="rating-text-group">
                <div className="rating-stars-line">
                  <span className="rating-star">★</span>
                  <span className="rating-score">4.9/5</span>
                </div>
                <span className="rating-count">1,200+ Happy Reviews</span>
              </div>
            </div>

            <h1 className="about-hero-headline">
              About Lany Cake Shop — Ruiru &amp; Nairobi
            </h1>
          </div>
        </div>

        {/* Center Floating Inset Card */}
        <div className="about-hero-inset-card">
          <img 
            src="/images/about/golden-buns-inset.jpg" 
            alt="Freshly baked artisan cinnamon rolls" 
            className="inset-card-img" 
          />
        </div>

        {/* Right: Full Photography Panel */}
        <div className="about-hero-right">
          <img 
            src="/images/about/artisan-challah-basket.jpg" 
            alt="Artisanal challah bread and sourdough basket" 
            className="about-hero-bg-photo" 
          />
          <div className="about-hero-photo-overlay" />

          {/* Top-Right Laurel Badge */}
          <div className="about-hero-laurel-badge">
            <svg className="laurel-svg left" viewBox="0 0 24 40" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 2C15 8 10 16 10 24C10 32 15 38 20 38M14 6C11 8 8 12 8 16M11 15C8 17 6 20 6 24M11 25C8 27 7 30 7 34" strokeLinecap="round" />
            </svg>
            <div className="laurel-badge-text">
              <span className="laurel-since">Since 2018 / Handcrafted</span>
              <strong className="laurel-city">in Nairobi, Kenya</strong>
            </div>
            <svg className="laurel-svg right" viewBox="0 0 24 40" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 2C9 8 14 16 14 24C14 32 9 38 4 38M10 6C13 8 16 12 16 16M13 15C16 17 18 20 18 24M13 25C16 27 17 30 17 34" strokeLinecap="round" />
            </svg>
          </div>

          {/* Bottom-Right Action Button */}
          <div className="about-hero-action-wrap">
            <Link to="/cakes" className="about-hero-cta-btn">
              <span>Order a Cake</span>
              <span className="cta-arrow-box">
                <ArrowUpRight size={18} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Manifesto & Bento Showcase Section (Below Hero) */}
      <section className="about-manifesto-section">
        <div className="lany-container">
          {/* Centered Top Badge */}
          <div className="about-manifesto-badge-wrap">
            <span className="about-manifesto-badge">
              <span className="badge-paren">(</span>
              ABOUT US
              <span className="badge-paren">)</span>
            </span>
          </div>

          {/* Centered Impact Lead */}
          <h2 className="about-manifesto-lead">
            At Lany Cakes, we craft fresh breads, pastries, cakes, and desserts using quality ingredients and a passion for baking. Every bite is made to bring <span className="fade-word-1">warmth,</span> <span className="fade-word-2">flavor,</span> <span className="fade-word-3">and joy to your day.</span>
          </h2>

          {/* 3-Column Bento Showcase */}
          <div className="about-bento-grid">
            {/* 1. Left: Chef Portrait */}
            <div className="about-bento-card bento-chef-card">
              <img 
                src="/images/about/baker-chef-portrait.jpg" 
                alt="Carol Jenny Head Pastry Chef" 
                className="bento-card-img" 
              />
            </div>

            {/* 2. Center: 2-Tier Stats Bento Box */}
            <div className="about-bento-card bento-stats-box">
              <div className="bento-stat-main">
                <span className="bento-num">100+</span>
                <span className="bento-label">Signature Bakes &amp; Recipes</span>
              </div>
              <div className="bento-stat-split-row">
                <div className="bento-stat-sub">
                  <span className="bento-sub-num">12K+</span>
                  <span className="bento-sub-label">Happy Customers</span>
                </div>
                <div className="bento-stat-sub divider-left">
                  <span className="bento-sub-num">8+</span>
                  <span className="bento-sub-label">Years of Experience</span>
                </div>
              </div>
            </div>

            {/* 3. Right: Artisan Hands Decorating Action */}
            <div className="about-bento-card bento-action-card">
              <img 
                src="/images/about/pastry-decorating-hands.jpg" 
                alt="Artisan pastry decoration in action" 
                className="bento-card-img" 
              />
            </div>
          </div>
        </div>
      </section>

      <div className="lany-container about-content-container">
        {/* Moka-Style Baking Philosophy & Vibe Section */}
        <section className="about-philosophy-moka-section">
          <div className="section-header-center">
            <span className="section-sub-badge">
              <span className="badge-paren">(</span>
              OUR BAKING PHILOSOPHY
              <span className="badge-paren">)</span>
            </span>
            <h2 className="section-title">The Vibe, The Passion &amp; Sweet Cravings</h2>
            <p className="philosophy-section-sub">
              Baking is more than flour and butter to us — it’s an art, an obsession with real flavors, and the people who make every bite unforgettable.
            </p>
          </div>

          <div className="philosophy-moka-grid-wrap">
            {/* Left & Right White Edge Fade Curtains */}
            <div className="philosophy-edge-fade philosophy-edge-fade-left" aria-hidden="true" />
            <div className="philosophy-edge-fade philosophy-edge-fade-right" aria-hidden="true" />

            <div className="philosophy-moka-grid">
              {BAKING_VALUES.map((item) => (
                <div key={item.id} className="philosophy-moka-card">
                  {/* Cake Background Image */}
                  <img 
                    src={item.bg} 
                    alt={item.alt} 
                    className="philosophy-card-bg"
                    loading="lazy"
                  />

                  {/* Deep Obsidian & Burgundy Brand Gradient Overlay for Supreme Contrast */}
                  <div className="philosophy-card-overlay" />

                  {/* Left & Right Soft White Edge Fade on Card Borders */}
                  <div className="philosophy-card-edge-fade" aria-hidden="true" />

                  {/* Card Content Stack */}
                  <div className="philosophy-card-inner">
                    {/* Top Bar: Brand + Number Pill */}
                    <div className="philosophy-card-top">
                      <span className="philosophy-brand-logo">{item.brand}</span>
                      <span className="philosophy-index-pill">{item.tag}</span>
                    </div>

                    {/* Center: Punchy Vibe Display Typography */}
                    <div className="philosophy-card-center">
                      <p className="philosophy-vibe-quote">
                        {item.quote}
                      </p>
                    </div>

                    {/* Bottom: Formal Value Title + Core Philosophy Description */}
                    <div className="philosophy-card-bottom">
                      <h3 className="philosophy-value-title">{item.title}</h3>
                      <p className="philosophy-value-desc">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* PreFooter Call To Action (Same As HomePage) */}
      <PreFooterCta />
    </div>
  );
}
