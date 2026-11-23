import { Link } from 'react-router-dom';
import { BUSINESS_INFO } from '../../data/cakesData';

export default function PrivacyPolicyPage() {
  return (
    <div className="lany-container" style={{ padding: '60px 24px 80px', maxWidth: '860px' }}>
      <span className="section-sub-badge">Legal</span>
      <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2.5rem', margin: '12px 0 24px', color: 'var(--color-obsidian)' }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--color-gray-400)', fontSize: '0.9rem', marginBottom: '32px' }}>
        Effective Date: November 2026 &bull; {BUSINESS_INFO.name} ({BUSINESS_INFO.legalName})
      </p>

      <div style={{ color: 'var(--color-dark)', lineHeight: '1.8', fontSize: '0.98rem' }}>
        <p>
          At {BUSINESS_INFO.name} (accessible at lanycakes.co.ke), we value the privacy and trust of our clients across Nairobi. This Privacy Policy details how we handle personal information collected when you order cakes, submit custom baking requests, or contact our team.
        </p>

        <h3 style={{ fontSize: '1.3rem', marginTop: '28px', marginBottom: '12px', color: 'var(--color-obsidian)' }}>
          1. Information We Collect
        </h3>
        <p>
          When you place an order or make an inquiry, we collect information necessary to fulfill your cake delivery:
        </p>
        <ul style={{ paddingLeft: '24px' }}>
          <li>Your full name and contact phone number / WhatsApp handle.</li>
          <li>Delivery address, estate, or event venue location in Nairobi and environs.</li>
          <li>Requested cake inscription details, personal messages, and event dates.</li>
          <li>Transaction confirmation codes for M-Pesa payments.</li>
        </ul>

        <h3 style={{ fontSize: '1.3rem', marginTop: '28px', marginBottom: '12px', color: 'var(--color-obsidian)' }}>
          2. How We Use Your Information
        </h3>
        <p>
          Your information is used strictly to bake, personalize, box, and safely deliver your orders. We never sell, rent, or distribute your personal details to third-party marketing brokers.
        </p>

        <h3 style={{ fontSize: '1.3rem', marginTop: '28px', marginBottom: '12px', color: 'var(--color-obsidian)' }}>
          3. Contact Us
        </h3>
        <p>
          If you have any questions regarding this Privacy Policy, please email <a href={`mailto:${BUSINESS_INFO.email}`} style={{ color: 'var(--color-brand-primary)' }}>{BUSINESS_INFO.email}</a> or reach out on WhatsApp at {BUSINESS_INFO.phoneFormatted}.
        </p>
      </div>
    </div>
  );
}
