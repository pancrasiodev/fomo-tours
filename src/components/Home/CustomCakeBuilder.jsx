import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { CAKE_FLAVORS, BUSINESS_INFO } from '../../data/cakesData';
import { recordLead } from '../../utils/analyticsStore';
import './CustomCakeBuilder.css';

export default function CustomCakeBuilder() {
  const [occasion, setOccasion] = useState('Birthday Celebration');
  const [flavor, setFlavor] = useState('Classic Vanilla Velvet');
  const [sizeKg, setSizeKg] = useState('2 kg (Serves 12 - 16)');
  const [tiers, setTiers] = useState('1 Tier (Standard Round)');
  const [inscription, setInscription] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [dietary, setDietary] = useState('Standard (Pure Butter & Fresh Dairy)');

  // Dynamic Price Estimator (Defaults to KSh 4,200 for 2 kg)
  const calculateEstimate = () => {
    let base = 4200;
    if (sizeKg.startsWith('1 kg')) base = 2500;
    else if (sizeKg.startsWith('1.5 kg')) base = 3200;
    else if (sizeKg.startsWith('2 kg')) base = 4200;
    else if (sizeKg.startsWith('3 kg')) base = 6200;
    else if (sizeKg.startsWith('4 kg')) base = 8200;
    else if (sizeKg.startsWith('5 kg')) base = 12500;
    else if (sizeKg.startsWith('8 kg')) base = 22000;

    if (dietary.includes('Eggless')) base += 400;
    if (dietary.includes('Gluten-Free')) base += 800;

    return base;
  };

  const estimatedPrice = calculateEstimate();

  const handleSendToWhatsApp = (e) => {
    e.preventDefault();

    // Record lead in Analytics
    recordLead({
      name: 'Custom Cake Studio Inquirer',
      occasion,
      eventDate: deliveryDate,
      message: `${sizeKg}, ${tiers}, ${flavor}, ${dietary}. Inscription: "${inscription}". Location: ${neighborhood}`,
      source: 'Custom Cake Builder',
      budgetEstimate: estimatedPrice
    });

    let text = `*CUSTOM CAKE INQUIRY - LANY CAKE SHOP*\n\n`;
    text += `• *Occasion:* ${occasion}\n`;
    text += `• *Size / Weight:* ${sizeKg}\n`;
    text += `• *Tier Structure:* ${tiers}\n`;
    text += `• *Cake Flavor:* ${flavor}\n`;
    text += `• *Dietary Requirement:* ${dietary}\n`;
    if (deliveryDate) text += `• *Delivery / Event Date:* ${deliveryDate}\n`;
    if (neighborhood) text += `• *Delivery Location:* ${neighborhood}\n`;
    if (inscription) text += `• *Message / Inscription:* "${inscription}"\n`;
    text += `• *Estimated Price:* KSh ${estimatedPrice.toLocaleString()}\n\n`;
    text += `Hello Carol Jenny & Lany Cakes Team, I would love to confirm design availability and consultation for my custom cake!`;

    const url = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="lany-section lany-builder-section" id="custom-builder">
      <div className="lany-container">
        <div className="builder-card-container">
          <div className="builder-header">
            <span className="section-sub-badge">Custom Cake Studio</span>
            <h2 className="section-title">Design Your Dream Cake</h2>
            <p className="section-description">
              Have a unique vision or theme? Configure your preferences below for an instant price estimate and direct consultation with our lead decorator.
            </p>
          </div>

          <form className="builder-grid" onSubmit={handleSendToWhatsApp}>
            {/* Occasion / Celebration */}
            <div className="builder-field">
              <label>Occasion / Celebration:</label>
              <select 
                value={occasion} 
                onChange={e => setOccasion(e.target.value)} 
                className="builder-select"
              >
                <option value="Birthday Celebration">Birthday Celebration</option>
                <option value="Wedding / Bridal Ceremony">Wedding / Bridal Ceremony</option>
                <option value="Traditional Ruracio / Dowry">Traditional Ruracio / Dowry</option>
                <option value="Graduation Party">Graduation Party</option>
                <option value="Baby Shower / Gender Reveal">Baby Shower / Gender Reveal</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Corporate Event / Product Launch">Corporate Event / Product Launch</option>
              </select>
            </div>

            {/* Size / Weight */}
            <div className="builder-field">
              <label>Size / Weight:</label>
              <select 
                value={sizeKg} 
                onChange={e => setSizeKg(e.target.value)} 
                className="builder-select"
              >
                <option value="1 kg (Serves 4 - 6)">1 kg (Serves 4 - 6)</option>
                <option value="1.5 kg (Serves 6 - 10)">1.5 kg (Serves 6 - 10)</option>
                <option value="2 kg (Serves 12 - 16)">2 kg (Serves 12 - 16)</option>
                <option value="3 kg (Serves 20 - 25)">3 kg (Serves 20 - 25)</option>
                <option value="4 kg (Serves 28 - 35)">4 kg (Serves 28 - 35)</option>
                <option value="5 kg (2 Tiers - Serves 40 - 50)">5 kg (2 Tiers - Serves 40 - 50)</option>
                <option value="8 kg (3 Tiers - Serves 80 - 100)">8 kg (3 Tiers - Serves 80 - 100)</option>
              </select>
            </div>

            {/* Cake Flavor */}
            <div className="builder-field">
              <label>Cake Flavor:</label>
              <select 
                value={flavor} 
                onChange={e => setFlavor(e.target.value)} 
                className="builder-select"
              >
                {CAKE_FLAVORS.map(f => (
                  <option key={f.id} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tier Structure */}
            <div className="builder-field">
              <label>Tier Structure:</label>
              <select 
                value={tiers} 
                onChange={e => setTiers(e.target.value)} 
                className="builder-select"
              >
                <option value="1 Tier (Standard Round)">1 Tier (Standard Round)</option>
                <option value="1 Tier (Heart Shaped)">1 Tier (Heart Shaped)</option>
                <option value="1 Tier (Square Slab)">1 Tier (Square Slab)</option>
                <option value="2 Tiers Stacked">2 Tiers Stacked</option>
                <option value="3 Tiers Grand Tiered">3 Tiers Grand Tiered</option>
              </select>
            </div>

            {/* Dietary Requirement */}
            <div className="builder-field">
              <label>Dietary Requirement:</label>
              <select 
                value={dietary} 
                onChange={e => setDietary(e.target.value)} 
                className="builder-select"
              >
                <option value="Standard (Pure Butter & Fresh Dairy)">Standard (Pure Butter &amp; Fresh Dairy)</option>
                <option value="100% Eggless Sponge">100% Eggless Sponge</option>
                <option value="Gluten-Free Flours">Gluten-Free Flours</option>
                <option value="Dairy-Free on Request">Dairy-Free on Request</option>
              </select>
            </div>

            {/* Delivery / Event Date */}
            <div className="builder-field">
              <label>Delivery / Event Date:</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                className="builder-input"
                placeholder="dd/mm/yyyy"
              />
            </div>

            {/* Delivery Location */}
            <div className="builder-field">
              <label>Delivery Location (Nairobi / Environs):</label>
              <input
                type="text"
                placeholder="e.g. Ruiru, Kilimani, Westlands, Karen, Thika Rd"
                value={neighborhood}
                onChange={e => setNeighborhood(e.target.value)}
                className="builder-input"
              />
            </div>

            {/* Message / Inscription on Cake */}
            <div className="builder-field">
              <label>Message / Inscription on Cake:</label>
              <input
                type="text"
                placeholder="e.g. Congratulations Dr. Grace!"
                value={inscription}
                onChange={e => setInscription(e.target.value)}
                className="builder-input"
              />
            </div>

            {/* Estimated Price & Send Design on WhatsApp Action */}
            <div className="builder-summary-box">
              <div className="summary-estimate-col">
                <span className="estimate-sub">Estimated Price</span>
                <span className="estimate-val">KSh {estimatedPrice.toLocaleString()}</span>
                <small className="estimate-note">*Final quote confirmed based on intricate decorations or fondant sculpts.</small>
              </div>

              <div className="summary-actions-col">
                <button type="submit" className="builder-wa-submit-btn">
                  <MessageCircle size={20} />
                  <span>Send Design on WhatsApp</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
