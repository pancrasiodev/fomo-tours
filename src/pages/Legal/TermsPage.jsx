import { Link } from 'react-router-dom';
import { BUSINESS_INFO } from '../../data/cakesData';

export default function TermsPage() {
  return (
    <div className="lany-container" style={{ padding: '60px 24px 80px', maxWidth: '860px' }}>
      <span className="section-sub-badge">Legal</span>
      <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2.5rem', margin: '12px 0 24px', color: 'var(--color-obsidian)' }}>
        Terms &amp; Conditions
      </h1>
      <p style={{ color: 'var(--color-gray-400)', fontSize: '0.9rem', marginBottom: '32px' }}>
        Effective Date: November 2026 &bull; {BUSINESS_INFO.name} ({BUSINESS_INFO.legalName})
      </p>

      <div style={{ color: 'var(--color-dark)', lineHeight: '1.8', fontSize: '0.98rem' }}>
        <p>
          Welcome to {BUSINESS_INFO.name}. By placing an order via our website, WhatsApp, or phone, you agree to the following terms regarding perishable baked confections and delivery services.
        </p>

        <h3 style={{ fontSize: '1.3rem', marginTop: '28px', marginBottom: '12px', color: 'var(--color-obsidian)' }}>
          1. Ordering &amp; Confirmation
        </h3>
        <p>
          Orders for celebration cakes and cupcakes are confirmed once design requirements and delivery details are aligned. For custom sculpted and multi-tiered wedding cakes, a 50% deposit confirms your event date on our baking schedule.
        </p>

        <h3 style={{ fontSize: '1.3rem', marginTop: '28px', marginBottom: '12px', color: 'var(--color-obsidian)' }}>
          2. Perishability &amp; Cake Care
        </h3>
        <p>
          Our cakes are prepared fresh using real dairy butter, cream cheese, and natural ingredients. Upon receipt, cakes must be stored in a cool, air-conditioned environment or refrigerated until 1-2 hours before slicing.
        </p>

        <h3 style={{ fontSize: '1.3rem', marginTop: '28px', marginBottom: '12px', color: 'var(--color-obsidian)' }}>
          3. Delivery &amp; Inspection
        </h3>
        <p>
          We provide doorstep delivery across Nairobi, Ruiru, Kiambu, and environs. The recipient is requested to visually inspect the cake upon handover. In the rare event of transit damage, our coordinator will assist with prompt resolution.
        </p>
      </div>
    </div>
  );
}
