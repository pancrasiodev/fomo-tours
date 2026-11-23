import { useState } from 'react';
import { ShoppingBag, MessageCircle, Sparkles, Check, ArrowRight } from 'lucide-react';
import { TREATS_AND_SNACKS, BUSINESS_INFO } from '../data/cakesData';
import { addToCart } from '../utils/cartStore';
import { usePageSeo, getBreadcrumbSchema } from '../utils/seo';
import './TreatsPage.css';

export default function TreatsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Treats & Snacks', url: '/treats-and-snacks' }
  ]);

  usePageSeo({
    title: 'Treats & Snacks in Nairobi | Cupcakes, Cookies & Savory Bites | Lany Cakes',
    description: 'Fresh treats and snacks in Nairobi. Gourmet cookies, dessert table favors, artisan cupcakes, and celebration snack platters delivered fresh across Nairobi and Ruiru.',
    canonicalPath: '/treats-and-snacks',
    image: '/images/lany/cupcakes.webp',
    schema: breadcrumbSchema
  });

  const [addedItem, setAddedItem] = useState(null);

  const handleAdd = (treat) => {
    addToCart({
      id: treat.id,
      name: treat.name,
      image: treat.image,
      price: treat.price,
      defaultWeight: treat.servings
    }, {
      weight: treat.servings,
      flavor: treat.category,
      price: treat.price,
      quantity: 1
    });

    setAddedItem(treat.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

  const handleWhatsAppTreat = (treat) => {
    const text = `Hello Lany Cakes! I would like to order *${treat.name}* (${treat.servings}) for KSh ${treat.price.toLocaleString()}. Please let me know delivery availability.`;
    const url = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="treats-page">
      <div className="treats-hero-banner">
        <div className="lany-container">
          <span className="section-sub-badge">Sweet &amp; Savory Bites</span>
          <h1 className="treats-title">Treats &amp; Snacks in Nairobi</h1>
          <p className="treats-subtitle">
            Delicious baby shower treats, gourmet cupcakes, wedding dessert table favors, and savory snacks freshly made and delivered fast across Nairobi for every celebration.
          </p>
        </div>
      </div>

      <div className="lany-container treats-body">
        <div className="treats-grid">
          {TREATS_AND_SNACKS.map(treat => (
            <div key={treat.id} className="treat-card">
              <div className="treat-img-wrap">
                <img src={treat.image} alt={treat.name} className="treat-img" />
                <span className="treat-cat-tag">{treat.category}</span>
              </div>

              <div className="treat-info">
                <h3 className="treat-name">{treat.name}</h3>
                <p className="treat-desc">{treat.description}</p>
                <div className="treat-servings-badge">
                  <span>Portion: {treat.servings}</span>
                </div>

                <div className="treat-bottom-bar">
                  <span className="treat-price">{treat.priceFormatted}</span>

                  <div className="treat-btns">
                    <button
                      className={`treat-cart-btn ${addedItem === treat.id ? 'added' : ''}`}
                      onClick={() => handleAdd(treat)}
                    >
                      {addedItem === treat.id ? (
                        <>
                          <Check size={16} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} />
                          <span>Add to Bag</span>
                        </>
                      )}
                    </button>
                    <button
                      className="treat-wa-btn"
                      onClick={() => handleWhatsAppTreat(treat)}
                      title="Order on WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dessert Table Catering Box */}
        <div className="dessert-catering-banner">
          <div className="catering-text">
            <h3>Planning a Dessert Table or Corporate Spread?</h3>
            <p>
              We craft full dessert buffets featuring custom cupcake towers, cake pop displays, dessert cups, and savory cocktail platters for weddings, birthdays, and corporate events across Nairobi.
            </p>
          </div>
          <a
            href={`https://wa.me/${BUSINESS_INFO.whatsapp}?text=Hello%20Lany%20Cakes%2C%20I%20would%20like%20to%20request%20a%20quote%20for%20event%20dessert%20catering.`}
            target="_blank"
            rel="noopener noreferrer"
            className="catering-cta-btn"
          >
            <MessageCircle size={18} />
            <span>Request Event Dessert Quote</span>
          </a>
        </div>
      </div>
    </div>
  );
}
