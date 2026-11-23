import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, Phone, Mail, Clock, MessageCircle, Send, 
  CheckCircle2, Sparkles, ArrowRight, ShieldCheck, HeartHandshake
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/cakesData';
import { recordLead } from '../utils/analyticsStore';
import PreFooterCta from '../components/Home/PreFooterCta';
import { usePageSeo, getBakerySchema, getBreadcrumbSchema } from '../utils/seo';
import './ContactPage.css';

export default function ContactPage() {
  const bakerySchema = getBakerySchema();
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Contact Us', url: '/contact' }
  ]);

  usePageSeo({
    title: 'Contact Lany Cake Shop | Kamakis Ruiru & Nairobi',
    description: 'Contact Lany Cake Shop at Kamakis Eastern Bypass, Ruiru. Call or WhatsApp +254 758 582 215 for custom celebration cakes, delivery, or studio pickup.',
    keywords: [
      'cake shop Kamakis Eastern Bypass Ruiru',
      'contact Lany Cake Shop Nairobi',
      'bakery phone number Ruiru',
      'cake studio pickup Kamakis',
      'WhatsApp cake ordering Nairobi',
      'order cake Ruiru'
    ],
    canonicalPath: '/contact',
    image: '/images/lany/birthday-cakes.webp',
    schema: {
      "@context": "https://schema.org",
      "@graph": [bakerySchema, breadcrumbSchema]
    }
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    occasion: 'Birthday Celebration',
    date: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const orderRef = `LANY-MSG-${Math.floor(1000 + Math.random() * 9000)}`;

    // Automatically record Lead in Analytics
    recordLead({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      occasion: formData.occasion,
      eventDate: formData.date,
      message: formData.message,
      source: 'Contact Page Inquiry',
      budgetEstimate: 'Direct Inquiry'
    });

    let text = `*NEW WEBSITE INQUIRY [${orderRef}]*\n\n`;
    text += `• *Customer Name:* ${formData.name}\n`;
    text += `• *WhatsApp / Phone:* ${formData.phone}\n`;
    if (formData.email) text += `• *Email:* ${formData.email}\n`;
    text += `• *Celebration Occasion:* ${formData.occasion}\n`;
    if (formData.date) text += `• *Event Date:* ${formData.date}\n`;
    if (formData.message) text += `• *Design & Details:* ${formData.message}\n`;
    text += `\nHello Carol Jenny & Lany Bakery team, I am reaching out through your website contact page and would love to hear from you!`;

    const url = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setSubmitted(orderRef);
  };

  return (
    <div className="contact-page">
      {/* Contact Hero Banner (Lany Dark Chocolate Vibe) */}
      <section className="contact-hero-banner">
        <div className="contact-container">
          <div className="contact-pill-wrap">
            <span className="contact-pill">( CONTACT US )</span>
          </div>
          <h1 className="contact-hero-title">Contact Lany Cake Shop — Kamakis Ruiru &amp; Nairobi</h1>
          <p className="contact-hero-subtitle">
            Planning a birthday cake, graduation cake, or need same-day cake delivery in Nairobi and Ruiru? Call or WhatsApp our bakery team or visit us at Greek Towers, Kamakis on the Eastern Bypass.
          </p>

          <div className="contact-trust-badges">
            <span className="trust-badge">
              <Sparkles size={14} className="badge-sparkle" />
              <span>Baked Fresh Daily at Kamakis, Ruiru</span>
            </span>
            <span className="trust-badge">
              <ShieldCheck size={14} className="badge-sparkle" />
              <span>Chilled Doorstep Delivery Across Nairobi</span>
            </span>
            <span className="trust-badge">
              <MessageCircle size={14} className="badge-sparkle" />
              <span>Direct WhatsApp Replies in ~15 Mins</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="contact-body-section">
        <div className="contact-container">
          <div className="contact-layout-grid">
            
            {/* LEFT COLUMN: Studio Information & Direct Channels */}
            <div className="contact-info-col">
              
              {/* Bakery Studio Feature Card */}
              <div className="studio-feature-card">
                <div className="studio-card-img-wrap">
                  <img 
                    src="/images/about/pastry-decorating-action.jpg" 
                    alt="Lany Bakery Studio Decorating" 
                    className="studio-card-img" 
                  />
                  <div className="studio-live-badge">
                    <span className="live-dot" />
                    <span>Baking Studio Open Today • 10 AM – 9 PM</span>
                  </div>
                </div>

                <div className="studio-card-content">
                  <h2 className="studio-card-title">CJ Cakes &amp; Confectionery Studio</h2>
                  <p className="studio-card-desc">
                    Every delicate palette-knife swirl, rustic crumb, and custom tier is handcrafted with pure dairy butter and natural extracts in our Ruiru studio.
                  </p>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="contact-wa-spotlight">
                <div className="wa-spotlight-top">
                  <div className="wa-spotlight-icon">
                    <MessageCircle size={24} />
                  </div>
                  <div className="wa-spotlight-text">
                    <span className="wa-spotlight-label">PREFERRED QUICK CHANNEL</span>
                    <strong className="wa-spotlight-title">Instant WhatsApp Chat</strong>
                  </div>
                </div>
                <p className="wa-spotlight-p">
                  Need an urgent cake, same-day delivery check, or quick pricing advice? Chat directly with Carol Jenny’s team on WhatsApp.
                </p>
                <a 
                  href={BUSINESS_INFO.whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="wa-spotlight-btn"
                >
                  <MessageCircle size={18} />
                  <span>Chat on WhatsApp: {BUSINESS_INFO.phoneFormatted}</span>
                </a>
              </div>

              {/* Contact Detail Stack */}
              <div className="contact-cards-stack">
                <div className="contact-info-item">
                  <div className="info-icon-box">
                    <MapPin size={20} />
                  </div>
                  <div className="info-item-content">
                    <span className="info-label">STUDIO LOCATION</span>
                    <strong className="info-value">{BUSINESS_INFO.address}</strong>
                    <span className="info-hint">Doorstep delivery across Westlands, Kilimani, Karen, CBD &amp; Environs</span>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="info-icon-box">
                    <Phone size={20} />
                  </div>
                  <div className="info-item-content">
                    <span className="info-label">DIRECT PHONE CALLS</span>
                    <strong className="info-value">
                      <a href={`tel:${BUSINESS_INFO.phone}`}>{BUSINESS_INFO.phoneFormatted}</a>
                    </strong>
                    <span className="info-hint">Customer desk &amp; delivery hotline</span>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="info-icon-box">
                    <Mail size={20} />
                  </div>
                  <div className="info-item-content">
                    <span className="info-label">EMAIL INQUIRIES</span>
                    <strong className="info-value">
                      <a href={`mailto:${BUSINESS_INFO.inquiriesEmail}`}>{BUSINESS_INFO.inquiriesEmail}</a>
                    </strong>
                    <span className="info-hint">Corporate orders, weddings &amp; vendor inquiries</span>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="info-icon-box">
                    <Clock size={20} />
                  </div>
                  <div className="info-item-content">
                    <span className="info-label">STUDIO HOURS</span>
                    <strong className="info-value">{BUSINESS_INFO.openingHours}</strong>
                    <span className="info-hint">Oven-fresh baking 7 days a week</span>
                  </div>
                </div>
              </div>

              {/* Link to Configurator */}
              <div className="configurator-promo-card">
                <div className="promo-text">
                  <strong>Looking to build a custom bespoke cake?</strong>
                  <p>Use our 2-minute step configurator with visual cake options and flavor combinations.</p>
                </div>
                <Link to="/custom-order" className="promo-link-btn">
                  <span>Custom Order Builder</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

            </div>

            {/* RIGHT COLUMN: Contact & Cake Inquiry Form */}
            <div className="contact-form-col">
              <div className="contact-form-card">
                
                <div className="form-card-header">
                  <span className="form-eyebrow">SEND US A MESSAGE</span>
                  <h2 className="form-card-title">Share Your Celebration Vision</h2>
                  <p className="form-card-subtitle">
                    Fill out the form below. We will review your requirements and reply with details directly via WhatsApp or phone.
                  </p>
                </div>

                {submitted ? (
                  <div className="contact-submitted-notice">
                    <div className="submitted-icon-wrap">
                      <CheckCircle2 size={36} strokeWidth={2.5} />
                    </div>
                    <span className="submitted-badge">INQUIRY SENT • {submitted}</span>
                    <h3 className="submitted-title">Thank You, {formData.name || 'Friend'}!</h3>
                    <p className="submitted-desc">
                      Your message has been received and forwarded to our WhatsApp coordinator. We will reply to <strong>{formData.phone}</strong> within 15 minutes!
                    </p>
                    <div className="submitted-action-group">
                      <a 
                        href={`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(`Hello Carol Jenny, I just sent a contact inquiry [${submitted}]. Excited to connect!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="submitted-wa-btn"
                      >
                        <MessageCircle size={18} />
                        <span>Chat on WhatsApp Now</span>
                      </a>
                      <button 
                        type="button"
                        className="reset-form-btn"
                        onClick={() => {
                          setSubmitted(false);
                          setFormData({
                            name: '',
                            phone: '',
                            email: '',
                            occasion: 'Birthday Celebration',
                            date: '',
                            message: ''
                          });
                        }}
                      >
                        Send Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form className="contact-actual-form" onSubmit={handleSubmit}>
                    
                    {/* Full Name */}
                    <div className="form-group">
                      <label>Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Grace Wambui"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    {/* Phone & Email Row */}
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Phone / WhatsApp Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 0712 345 678"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>Email Address (Optional)</label>
                        <input
                          type="email"
                          placeholder="e.g. grace@gmail.com"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="form-input"
                        />
                      </div>
                    </div>

                    {/* Occasion & Target Date */}
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Celebration Occasion / Cake Type</label>
                        <select
                          value={formData.occasion}
                          onChange={e => setFormData({ ...formData, occasion: e.target.value })}
                          className="form-select"
                        >
                          <option value="Birthday Celebration">Birthday Celebration</option>
                          <option value="Minimalist Bento & Petite">Minimalist Bento &amp; Petite</option>
                          <option value="Wedding & Multi-Tier Cake">Grand Wedding &amp; Multi-Tier Cake</option>
                          <option value="Baby Shower / Milestone">Baby Shower / Gender Reveal</option>
                          <option value="Artisan Cupcake Towers">Artisan Cupcake Towers</option>
                          <option value="Graduation & Achievement">Graduation &amp; Achievement</option>
                          <option value="Corporate Event / Gala">Corporate Event / Gala</option>
                          <option value="Treats & Bakery Spread">Treats &amp; Pastry Spread</option>
                          <option value="Other Custom Concept">Other Custom Concept</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Target Event Date (Optional)</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={e => setFormData({ ...formData, date: e.target.value })}
                          className="form-input"
                        />
                      </div>
                    </div>

                    {/* Message / Design Details */}
                    <div className="form-group">
                      <label>Tell Us About Your Celebration (Flavor cravings, design ideas, servings)</label>
                      <textarea
                        rows={4}
                        placeholder="Tell us what you have in mind: favorite flavors, color palette, guest count, or delivery neighborhood in Nairobi..."
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        className="form-textarea"
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="contact-submit-btn">
                      <Send size={18} />
                      <span>Send Inquiry to Bakery Team</span>
                    </button>

                    <p className="form-footer-guarantee">
                      Zero spam. We review your vision and reply with details and a tailored quote on WhatsApp within 15 minutes.
                    </p>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Embedded Google Business Profile Map */}
      <section className="contact-map-section" style={{ padding: '0 20px 56px', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(36, 8, 13, 0.1)', boxShadow: '0 14px 36px rgba(36, 8, 13, 0.08)' }}>
          <div style={{ padding: '18px 22px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderBottom: '1px solid rgba(36, 8, 13, 0.08)' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#24080D', fontFamily: 'Fredoka, sans-serif' }}>Find Lany Cake Shop — Greek Towers, Ruiru</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#5A4A49' }}>Kamakis, Eastern Bypass • Free Studio Pickup &amp; Fast Nairobi Dispatch</p>
            </div>
            <a
              href="https://www.google.com/maps/place/Lany+Cake+Shop,+Greek+Towers,+Ruiru/@-1.147689,36.9610822,17z"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#621927', color: '#FFFFFF', padding: '10px 18px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <MapPin size={15} />
              <span>Open in Google Maps</span>
            </a>
          </div>
          <iframe
            title="Lany Cake Shop Greek Towers Ruiru Map"
            src="https://maps.google.com/maps?q=Lany+Cake+Shop,+Greek+Towers,+Ruiru&ll=-1.147689,36.9610822&z=16&output=embed"
            width="100%"
            height="360"
            style={{ border: 0, display: 'block' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>

      {/* PreFooter CTA (Matches Home & About - Zero Gap to Footer) */}
      <PreFooterCta />
    </div>
  );
}
