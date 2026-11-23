import { Sparkles, Truck, HeartHandshake, ShieldCheck } from 'lucide-react';
import './WhyChooseUs.css';

export default function WhyChooseUs() {
  const cards = [
    {
      num: "01",
      tag: "FRESH BAKED QUALITY",
      theme: "dark",
      icon: <Sparkles size={20} />,
      headline: "Freshly Baked Quality",
      desc: "Every cake is made-to-order on your delivery date. We use genuine dairy butter, Belgian cocoa, farm-fresh eggs, and natural extracts—no artificial preservatives.",
      chips: ["Genuine Dairy Butter", "Belgian Cocoa", "Farm-Fresh Eggs", "Natural Extracts", "0% Preservatives"],
      scrollHint: "Scroll for Fast & Reliable Delivery ↓"
    },
    {
      num: "02",
      tag: "LOGISTICS & CARE",
      theme: "yellow",
      icon: <Truck size={20} />,
      headline: "Fast & Reliable Delivery",
      desc: "Prompt door-to-door delivery across Nairobi, Ruiru, Kiambu, Westlands, Kilimani, Karen, and Thika Road. Temperature-controlled and carefully cushioned for safe arrival.",
      chips: ["Nairobi Suburbs", "Ruiru & Kiambu", "Westlands & Kilimani", "Karen & Environs", "Temperature-Controlled"],
      scrollHint: "Scroll for Affordable Pricing ↓"
    },
    {
      num: "03",
      tag: "HONEST PRICING",
      theme: "dark",
      icon: <HeartHandshake size={20} />,
      headline: "Affordable & Transparent",
      desc: "Artisan confectionery doesn't have to cost a fortune. Clear pricing starting from KSh 2,500 with zero hidden consultation or standard writing fees.",
      chips: ["From KSh 2,500", "Zero Consultation Fees", "Complimentary Writing", "No Hidden Charges"],
      scrollHint: "Scroll for Dietary Artistry ↓"
    },
    {
      num: "04",
      tag: "TAILORED ARTISTRY",
      theme: "yellow",
      icon: <ShieldCheck size={20} />,
      headline: "Dietary & Custom Artistry",
      desc: "Need an eggless sponge, gluten-free bake, or intricate fondant figurine? Our decorators cater to your exact dietary and design brief.",
      chips: ["100% Eggless Sponges", "Gluten-Free Recipes", "Fondant Figurines", "Custom Dietary Briefs"],
      scrollHint: "Handcrafted with Care"
    }
  ];

  return (
    <section className="lany-section lany-moka-why-section" id="why-lany">
      <div className="lany-container">
        
        {/* Editorial Section Header */}
        <div className="moka-section-header">
          <span className="moka-kicker-badge">WHY LANY CAKES</span>
          <h2 className="moka-section-heading">Why Choose Our Cake Shop in Nairobi &amp; Ruiru</h2>
          <p className="moka-section-lead">
            Your trust matters. That’s why we obsess over every ingredient, every swirl of buttercream, and every delivery timing.
          </p>
        </div>

        {/* Bento Grid: Left Vertical Scrolling Cards + Right Stationary Sticky Photo */}
        <div className="moka-bento-hero">
          
          {/* Left Column: Natural Vertical Stack of Cards that switch as user scrolls */}
          <div className="moka-left-stack">
            {cards.map((card) => (
              <div 
                key={card.num} 
                className={`moka-card moka-card-${card.theme}`}
                id={`moka-step-${card.num}`}
              >
                {/* Header: Number pill + Kicker Tag */}
                <div className="moka-card-header">
                  <div className="moka-num-badge">
                    <span>{card.num}</span>
                  </div>
                  <span className="moka-tag-kicker">{card.tag}</span>
                  <div className="moka-card-icon-pill" aria-hidden="true">
                    {card.icon}
                  </div>
                </div>

                {/* Body: Display Headline */}
                <div className="moka-card-body">
                  <h3 className="moka-display-headline">
                    {card.headline}
                  </h3>
                </div>

                {/* Footer: User Copy Description + Feature Chips */}
                <div className="moka-card-footer">
                  <p className="moka-manifesto-subtext">
                    {card.desc}
                  </p>
                  
                  {/* Highlight Chips */}
                  <div className="moka-chips-wrap">
                    {card.chips.map((chip, cIdx) => (
                      <span key={cIdx} className="moka-chip">
                        {chip}
                      </span>
                    ))}
                  </div>

                  {/* Gentle Scroll Hint */}
                  <div className="moka-scroll-hint-bar">
                    <span className="moka-scroll-hint">{card.scrollHint}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Sticky Stationary Photo Card */}
          <div className="moka-right-photo-card" aria-hidden="true">
            <img 
              src="/images/home/cake-eating-lifestyle.jpg" 
              alt="People enjoying delicious freshly baked cake in Nairobi" 
              className="moka-photo-img"
              loading="lazy"
            />
            {/* Minimal Corner Accents */}
            <div className="moka-photo-badge">
              <span className="moka-badge-dot"></span>
            </div>
            <div className="moka-photo-caption">
              Freshly Handcrafted in Nairobi
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
