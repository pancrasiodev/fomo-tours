import { useState } from 'react';
import './FaqSection.css';

const BAKERY_FAQS = [
  {
    q: "Do you bake fresh products every day?",
    a: "Yes, we bake fresh products every day using high-quality ingredients to ensure great taste, freshness, and consistent quality for every customer."
  },
  {
    q: "Can I place a custom cake order?",
    a: "Yes, absolutely! We specialize in custom cakes for birthdays, weddings, baby showers, and milestone celebrations. You can customize the flavor, size, tier structure, and personal inscription, or send us reference pictures directly on WhatsApp."
  },
  {
    q: "Do you offer delivery services?",
    a: "Yes, we provide prompt and reliable door-to-door delivery across Nairobi, Ruiru, Kiambu, Westlands, Kilimani, Karen, and Thika Road. Every cake travels in a temperature-controlled, cushioned cake box for safe and pristine arrival."
  },
  {
    q: "How far in advance should I place an order?",
    a: "We recommend placing standard celebration cake orders 24 to 48 hours in advance. For same-day deliveries, please reach out via WhatsApp before 11:00 AM. For elaborate multi-tier wedding cakes or sculpted builds, 3 to 7 days notice is best."
  },
  {
    q: "Do you offer vegetarian or gluten-free options?",
    a: "Yes! We cater to dietary requirements with 100% eggless sponges, dairy-free alternatives, and gluten-conscious recipes crafted from pure natural extracts and Belgian cocoa—no artificial preservatives."
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept M-Pesa (Buy Goods Till / Paybill) as well as Visa, Mastercard, and direct bank transfers. For bespoke and wedding orders, a 50% deposit secures your date on our calendar."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="lany-faq-section" id="faq">
      <div className="lany-container faq-container">
        
        {/* Section Header matching Framer design */}
        <div className="faq-header-center">
          <div className="faq-framer-pill">
            <span className="faq-pill-bracket">(</span>
            <span className="faq-pill-text">FAQ</span>
            <span className="faq-pill-bracket">)</span>
          </div>

          <h2 className="faq-framer-title">
            Cake Shop Nairobi<br />Prices &amp; Delivery FAQs
          </h2>
        </div>

        {/* Framer Unified Accordion Card */}
        <div className="faq-card-frame">
          {BAKERY_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                className={`faq-card-row ${isOpen ? 'is-open' : ''}`}
              >
                <button 
                  className="faq-row-trigger"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-row-question">{faq.q}</span>
                  <span className="faq-toggle-icon" aria-hidden="true">
                    {isOpen ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="faq-row-content">
                    <p className="faq-row-answer">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
