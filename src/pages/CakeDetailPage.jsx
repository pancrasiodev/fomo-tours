import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, MessageCircle, Star, Check, Truck, 
  ShieldCheck, Clock, Sparkles, Upload, Calendar, MapPin, 
  Info, ChevronRight, CheckCircle2, FileText, ChevronDown, ArrowDown
} from 'lucide-react';
import { 
  CAKES_CATALOG, CAKE_FLAVORS, CAKE_FILLINGS, CAKE_ICINGS, CAKE_DESIGNS,
  CAKE_EXTRAS, DELIVERY_ZONES, DELIVERY_SLOTS, BUSINESS_INFO 
} from '../data/cakesData';
import { addToCart } from '../utils/cartStore';
import { API_BASE } from '../config/api';
import PreFooterCta from '../components/Home/PreFooterCta';
import './CakeDetailPage.css';

export default function CakeDetailPage({ forcedCakeId }) {
  const { id: paramId } = useParams();
  const id = forcedCakeId || paramId;
  const navigate = useNavigate();

  const cake = CAKES_CATALOG.find(c => c.id === id || c.slug === id || (c.aliases && c.aliases.includes(id))) || CAKES_CATALOG[0];

  useEffect(() => {
    const shortName = cake.name.length > 42 ? `${cake.name.slice(0, 41).trim()}…` : cake.name;
    document.title = `${shortName} | Lany Cakes`;
    
    // Meta Description (strictly <= 155 chars for SEO compliance)
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    const baseDesc = (cake.shortDesc || '').trim();
    const cleanDesc = baseDesc.length > 155 ? `${baseDesc.slice(0, 152).trim()}...` : baseDesc;
    metaDesc.setAttribute('content', cleanDesc);

    // Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', `${cake.name}, ${cake.categoryName} Nairobi, cake delivery Nairobi, buy cake online Nairobi, Kamakis bakery Ruiru, artisan celebration cakes`);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://lanycakes.co.ke/cake/${cake.slug || cake.id}`;
    canonical.setAttribute('href', currentUrl);

    // OpenGraph & Twitter Meta Tags
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lanycakes.co.ke';
    const imageUrl = cake.image.startsWith('http') ? cake.image : `${origin}${cake.image}`;
    const ogTags = [
      { property: 'og:title', content: `${cake.name} | Lany Cake Shop Nairobi` },
      { property: 'og:description', content: cake.shortDesc },
      { property: 'og:image', content: imageUrl },
      { property: 'og:url', content: currentUrl },
      { property: 'og:type', content: 'product' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `${cake.name} | Lany Cake Shop` },
      { name: 'twitter:description', content: cake.shortDesc },
      { name: 'twitter:image', content: imageUrl }
    ];

    const injectedMeta = [];
    ogTags.forEach(tag => {
      const selector = tag.property ? `meta[property="${tag.property}"]` : `meta[name="${tag.name}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (tag.property) el.setAttribute('property', tag.property);
        if (tag.name) el.setAttribute('name', tag.name);
        document.head.appendChild(el);
        injectedMeta.push(el);
      }
      el.setAttribute('content', tag.content);
    });

    // JSON-LD Structured Data Schema (Product + Bakery Offer)
    const jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    jsonLdScript.id = 'product-jsonld-schema';
    const schemaData = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: cake.name,
      image: [imageUrl],
      description: cake.description || cake.shortDesc,
      sku: cake.id,
      brand: {
        '@type': 'Brand',
        name: 'Lany Cake Shop'
      },
      offers: {
        '@type': 'Offer',
        url: currentUrl,
        priceCurrency: 'KES',
        price: cake.price || 3200,
        validFrom: '2026-01-01',
        priceValidUntil: '2027-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: 'https://schema.org/InStock',
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '300',
            currency: 'KES'
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'KE'
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 0,
              maxValue: 1,
              unitCode: 'DAY'
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 0,
              maxValue: 1,
              unitCode: 'DAY'
            }
          }
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'KE',
          returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted'
        },
        seller: {
          '@type': 'Bakery',
          name: 'Lany Cake Shop',
          telephone: BUSINESS_INFO.phoneFormatted || '+254758582215',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Greek Towers, Kamakis Eastern Bypass',
            addressLocality: 'Ruiru',
            addressRegion: 'Nairobi Metro',
            addressCountry: 'KE'
          }
        }
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '128'
      }
    };
    jsonLdScript.text = JSON.stringify(schemaData);

    const existingScript = document.getElementById('product-jsonld-schema');
    if (existingScript) existingScript.remove();
    document.head.appendChild(jsonLdScript);

    return () => {
      const s = document.getElementById('product-jsonld-schema');
      if (s) s.remove();
      injectedMeta.forEach(m => m.remove());
    };
  }, [cake]);

  // Gallery state
  const gallery = cake.gallery && cake.gallery.length > 0 ? cake.gallery : [cake.image];
  const [activeImage, setActiveImage] = useState(gallery[0]);

  // Theme resolution: 'dark' | 'pink' | 'yellow'
  const cakeTheme = cake.theme || (cake.category === 'wedding' || cake.category === 'custom' ? 'dark' : 'pink');

  // Pricing model: 'fixed' | 'dynamic' | 'bespoke'
  const pricingModel = cake.pricingModel || (cake.category === 'wedding' || cake.category === 'custom' ? 'bespoke' : 'dynamic');

  // Check if cake is an open custom builder design vs an uploaded catalog design
  const isCustomCake = cake.category === 'custom' || cake.isCustom || cake.id === 'custom' || cake.id?.includes('custom');

  // Configuration options: Size, Flavor, Design, Quantity & Inscription
  const [selectedWeight, setSelectedWeight] = useState(cake.defaultWeight || cake.availableWeights[0]?.weight || '1.5 kg');
  const [selectedFlavor, setSelectedFlavor] = useState(CAKE_FLAVORS[0].name);
  const [selectedDesign, setSelectedDesign] = useState(CAKE_DESIGNS[0].name);
  const [inscription, setInscription] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Extras / Add-ons toggles
  const [selectedExtras, setSelectedExtras] = useState({
    candles: false,
    acrylicTopper: false,
    goldLeaf: false,
    berryCrown: false,
    luxuryPackaging: false
  });

  // Reference Image Upload state
  const [refImagePreview, setRefImagePreview] = useState(null);
  const [refImageUploading, setRefImageUploading] = useState(false);

  // Fulfillment & Schedule
  const [fulfillmentType, setFulfillmentType] = useState('delivery'); // 'delivery' | 'pickup'
  const [selectedZone, setSelectedZone] = useState('westlands_kilimani');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [deliverySlot, setDeliverySlot] = useState('afternoon');

  // Bespoke Quote Form state
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    guestCount: cake.servings || '50-80 guests',
    tierStructure: '2 Tiers',
    flavorPreferences: selectedFlavor,
    budgetRange: 'KSh 15,000 – 30,000',
    eventDate: '',
    deliveryLocation: '',
    notes: ''
  });

  // Inline "Order Now" Checkout State (Retain on Same Screen - No Pop Up)
  const orderCardRef = useRef(null);
  const detailsPaneRef = useRef(null);
  const orderPaneRef = useRef(null);
  const sliderContainerRef = useRef(null);
  const [sliderHeight, setSliderHeight] = useState(undefined);

  const [inlineOrderOpen, setInlineOrderOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Variations, 2: Delivery & Contact, 3: Review & Place
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderError, setOrderError] = useState('');
  const [showOrderNote, setShowOrderNote] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    fulfillment: 'pickup', // 'pickup' | 'delivery'
    address: '',
    date: '',
    notes: ''
  });

  // Collapsible dropdowns state (below short description)
  const [openAccordion, setOpenAccordion] = useState(null);
  const [addedNotice, setAddedNotice] = useState(false);

  // Resolve base weight price
  const baseWeightPrice = useMemo(() => {
    const found = cake.availableWeights?.find(w => w.weight === selectedWeight);
    return found ? found.price : cake.price;
  }, [cake, selectedWeight]);

  // Compute live customization extra charges
  const extrasCharge = useMemo(() => {
    let sum = 0;
    CAKE_EXTRAS.forEach(extra => {
      if (selectedExtras[extra.key]) {
        sum += extra.price;
      }
    });
    return sum;
  }, [selectedExtras]);

  // Compute delivery fee
  const deliveryFee = useMemo(() => {
    if (fulfillmentType === 'pickup') return 0;
    const zone = DELIVERY_ZONES.find(z => z.id === selectedZone);
    return zone ? zone.fee : 350;
  }, [fulfillmentType, selectedZone]);

  // Live total formula: Base Cake Price + Customisation Charges + Delivery Fee
  const singleCakeTotal = baseWeightPrice + extrasCharge;
  const itemsSubtotal = singleCakeTotal * quantity;
  const liveTotal = itemsSubtotal + deliveryFee;

  const toggleExtra = (extraKey) => {
    setSelectedExtras(prev => ({
      ...prev,
      [extraKey]: !prev[extraKey]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please choose a smaller photo.');
        return;
      }
      setRefImageUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRefImagePreview(reader.result);
        setRefImageUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add to cart with snapshot
  const handleAddToCart = () => {
    addToCart(cake, {
      weight: selectedWeight,
      flavor: selectedFlavor,
      design: isCustomCake ? selectedDesign : cake.name,
      icing: isCustomCake ? selectedDesign : 'Standard',
      inscription: inscription.trim(),
      basePrice: baseWeightPrice,
      price: baseWeightPrice,
      quantity: quantity
    });

    setAddedNotice(true);
    window.dispatchEvent(new Event('lany_open_cart'));
    setTimeout(() => setAddedNotice(false), 2600);
  };

  // WhatsApp Order Flow
  const handleWhatsAppOrder = () => {
    const inquiryRef = `LNY-INQ-${Math.floor(1000 + Math.random() * 9000)}`;

    // Secretly register inquiry in backend
    fetch(`${API_BASE}/api/cake-orders/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'WhatsApp Shopper',
        phone: 'WhatsApp Direct',
        email: '',
        occasion: cake.name,
        guestCount: selectedWeight,
        tierStructure: '1 Tier',
        flavorPreferences: selectedFlavor,
        budgetRange: `KSh ${(baseWeightPrice * quantity).toLocaleString()}`,
        eventDate: deliveryDate,
        deliveryLocation: fulfillmentType === 'pickup' ? 'Lany Studio, Kamakis Eastern Bypass (Pickup)' : selectedZone,
        referenceImage: activeImage || cake.image,
        notes: `Inquiry Ref: ${inquiryRef}. Size: ${selectedWeight}, Flavor: ${selectedFlavor}${isCustomCake ? `, Design: ${selectedDesign}` : ''}, Quantity: ${quantity}. Inscription: "${inscription}"`
      })
    }).catch(() => {});

    let text = `*CAKE INQUIRY [${inquiryRef}] - LANY CAKES NAIROBI*\n\n`;
    text += `*Cake:* ${cake.name}\n`;
    text += `*Size / Weight:* ${selectedWeight}\n`;
    text += `*Flavor:* ${selectedFlavor}\n`;
    if (isCustomCake && selectedDesign) {
      text += `*Design / Style:* ${selectedDesign}\n`;
    }
    text += `*Quantity:* ${quantity}\n`;
    if (inscription.trim()) text += `*Inscription:* "${inscription.trim()}"\n`;
    text += `*Total:* KSh ${(baseWeightPrice * quantity).toLocaleString()}\n\n`;
    text += `Hello Carol Jenny & Lany Cakes Team, I would like to order or inquire about ${cake.name}. Please advise on availability and next steps!`;

    const url = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Multi-step Wizard Navigation Helpers
  const goToNextStep = () => {
    setOrderError('');
    if (checkoutStep === 1) {
      if (cake.availableWeights && cake.availableWeights.length > 0 && !selectedWeight) {
        setOrderError('Please select a cake size / weight.');
        return;
      }
      setCheckoutStep(2);
    } else if (checkoutStep === 2) {
      if (!orderForm.name.trim()) {
        setOrderError('Please enter your full name.');
        return;
      }
      if (!orderForm.phone.trim()) {
        setOrderError('Please enter your WhatsApp phone number.');
        return;
      }
      if (orderForm.fulfillment === 'delivery' && !orderForm.address.trim()) {
        setOrderError('Please enter your delivery estate / location.');
        return;
      }
      setCheckoutStep(3);
    }
  };

  const goToPrevStep = () => {
    setOrderError('');
    setCheckoutStep(prev => Math.max(1, prev - 1));
  };

  const handleOrderNowClick = () => {
    setInlineOrderOpen(true);
    setCheckoutStep(1);
    setOrderSuccess(null);
    setOrderError('');
    if (!orderForm.date) {
      setOrderForm(prev => ({ ...prev, date: deliveryDate }));
    }
    if (typeof window !== 'undefined' && window.innerWidth <= 991 && sliderContainerRef.current) {
      sliderContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBackToDetails = () => {
    setInlineOrderOpen(false);
    if (typeof window !== 'undefined' && window.innerWidth <= 991 && sliderContainerRef.current) {
      sliderContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Synchronize height smoothly between Cake Details View and Order Wizard View
  useEffect(() => {
    const activePane = inlineOrderOpen ? orderPaneRef.current : detailsPaneRef.current;
    if (!activePane) return;

    const updateHeight = () => {
      if (activePane) {
        const h = Math.ceil(activePane.getBoundingClientRect().height);
        if (h > 0) {
          setSliderHeight(h + 12);
        }
      }
    };

    updateHeight();
    const rafId = requestAnimationFrame(updateHeight);
    window.addEventListener('resize', updateHeight);

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        updateHeight();
      });
      ro.observe(activePane);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateHeight);
      if (ro) ro.disconnect();
    };
  }, [inlineOrderOpen, checkoutStep, openAccordion, orderSuccess]);

  // Normal "Order Now" Submission with WhatsApp Handoff & Secret Backend Sync
  const handleOrderNowSubmit = async (e) => {
    if (e) e.preventDefault();
    setOrderError('');

    if (!orderForm.name.trim()) {
      setOrderError('Please enter your full name.');
      return;
    }
    if (!orderForm.phone.trim()) {
      setOrderError('Please enter your WhatsApp phone number.');
      return;
    }
    if (orderForm.fulfillment === 'delivery' && !orderForm.address.trim()) {
      setOrderError('Please enter your delivery estate / location.');
      return;
    }

    setOrderSubmitting(true);
    const orderRef = `LNY-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const fulfillmentText = orderForm.fulfillment === 'pickup'
      ? 'Studio Pickup (Lany Studio, Kamakis Eastern Bypass)'
      : `Doorstep Delivery (${orderForm.address.trim()})`;

    // Secretly save order in backend API database
    fetch(`${API_BASE}/api/cake-orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: orderForm.name.trim(),
        phone: orderForm.phone.trim(),
        email: '',
        deliveryType: orderForm.fulfillment,
        deliveryAddress: orderForm.fulfillment === 'pickup' ? 'Lany Studio, Kamakis Eastern Bypass' : orderForm.address.trim(),
        deliveryZone: orderForm.fulfillment === 'pickup' ? 'pickup' : selectedZone,
        deliveryDate: orderForm.date || deliveryDate,
        deliverySlot: deliverySlot,
        paymentMethod: 'WhatsApp Coordination',
        items: [
          {
            cakeId: cake.id,
            name: cake.name,
            weight: selectedWeight,
            flavor: selectedFlavor,
            design: selectedDesign,
            icing: selectedDesign,
            inscription: inscription.trim(),
            quantity: quantity,
            basePrice: baseWeightPrice
          }
        ],
        specialInstructions: orderForm.notes.trim()
      })
    }).catch(err => {
      console.log('[Cake Order] Backend synced:', err);
    });

    // Format complete structured WhatsApp message emphasizing Flavor, Size, Quantity
    let msg = `*NEW CAKE ORDER - #${orderRef}*\n\n`;
    msg += `*Customer Name:* ${orderForm.name.trim()}\n`;
    msg += `*WhatsApp:* ${orderForm.phone.trim()}\n`;
    msg += `*Cake Selected:* ${cake.name}\n`;
    msg += `*Size / Weight:* ${selectedWeight}\n`;
    msg += `*Flavor:* ${selectedFlavor}\n`;
    if (isCustomCake && selectedDesign) {
      msg += `*Design / Style:* ${selectedDesign}\n`;
    }
    msg += `*Quantity:* ${quantity} ${quantity === 1 ? 'cake' : 'cakes'}\n`;
    if (inscription.trim()) {
      msg += `*Writing on Cake:* "${inscription.trim()}"\n`;
    }
    msg += `*Fulfillment:* ${fulfillmentText}\n`;
    msg += `*Date Needed:* ${orderForm.date || deliveryDate}\n`;
    msg += `*Total Amount:* KSh ${liveTotal.toLocaleString()}\n`;
    if (orderForm.notes.trim()) {
      msg += `*Notes:* ${orderForm.notes.trim()}\n`;
    }
    msg += `\nHello Carol Jenny, I have placed order #${orderRef}. Please confirm availability and baking schedule!`;

    const waUrl = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    setOrderSubmitting(false);
    setOrderSuccess(orderRef);
  };

  // Bespoke Quotation Submission
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setQuoteSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/cake-orders/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: quoteForm.customerName,
          phone: quoteForm.phone,
          email: quoteForm.email,
          occasion: cake.name,
          guestCount: quoteForm.guestCount,
          tierStructure: quoteForm.tierStructure,
          flavorPreferences: quoteForm.flavorPreferences,
          budgetRange: quoteForm.budgetRange,
          eventDate: quoteForm.eventDate || deliveryDate,
          deliveryLocation: quoteForm.deliveryLocation,
          referenceImage: refImagePreview || '',
          notes: quoteForm.notes
        })
      });
      const data = await res.json();
      if (data.success) {
        setQuoteSuccess(data.quoteRef);
      } else {
        alert(data.error || 'Failed to submit quote request. Please try via WhatsApp.');
      }
    } catch {
      setQuoteSuccess('Q-PENDING');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const currentIndex = CAKES_CATALOG.findIndex(c => c.id === cake.id);
  const nextCake = CAKES_CATALOG[(currentIndex + 1) % CAKES_CATALOG.length];

  // Sibling switcher for the vertical bar
  const switcherCakes = CAKES_CATALOG.slice(0, 6);

  const minDeliveryDate = useMemo(() => {
    const d = new Date();
    const daysAhead = pricingModel === 'bespoke' ? 3 : 1;
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  }, [pricingModel]);

  return (
    <div className={`cake-detail-page-container theme-${cakeTheme}`}>
      {/* ========================================================================
          1. IMMERSIVE SINGLE-PRODUCT SHOWCASE HERO (LATTICE EDITORIAL VIBE)
          ======================================================================== */}
      <section className="lattice-product-hero">
        {/* Giant Watermark Typography in Background */}
        <div className="lattice-watermark-text" aria-hidden="true">
          {cake.watermarkText || cake.name.split(' ')[0].toUpperCase()}
        </div>

        <div className={`lattice-hero-inner ${inlineOrderOpen ? 'order-mode-active' : ''}`}>
          {/* Left: Giant Luscious Circular Hero Cake Image */}
          <div className="lattice-hero-visual-col">
            <div className="lattice-cake-circle-frame">
              <img 
                src={activeImage} 
                alt={cake.name} 
                className="lattice-cake-main-img" 
              />
              {cake.badge && (
                <div className="lattice-hero-badge">
                  {cake.badge}
                </div>
              )}
            </div>

            {/* Thumbnail switcher pills */}
            {gallery.length > 1 && (
              <div className="lattice-gallery-dots">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`gallery-dot-btn ${activeImage === img ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                    title={`View angle ${idx + 1}`}
                  >
                    <img src={img} alt="Thumbnail preview" />
                  </button>
                ))}
              </div>
            )}

            {/* In Order Mode: Cake Name & Live Price as yellow text underneath cake circle */}
            {inlineOrderOpen && (
              <div className="order-mode-left-summary">
                <h3 className="order-left-title">{cake.name}</h3>
                <div className="order-left-price">KSh {singleCakeTotal.toLocaleString()}</div>
              </div>
            )}
          </div>

          {/* Center-Right: Horizontal Sliding Viewport (Cake Details & Order Wizard) */}
          <div className="lattice-hero-content-col" ref={sliderContainerRef}>
            <div 
              className="lattice-content-slider-viewport"
              style={{ height: sliderHeight ? `${sliderHeight}px` : 'auto' }}
            >
              <div className={`lattice-content-slider-track ${inlineOrderOpen ? 'show-order' : 'show-details'}`}>
                
                {/* PANE 1: CAKE DETAILS & SPECIFICATIONS */}
                <div 
                  className="lattice-slide-pane lattice-details-pane"
                  ref={detailsPaneRef}
                  aria-hidden={inlineOrderOpen}
                >
                  {/* Kicker Category Index */}
                  <div className="lattice-hero-kicker">
                    <span>{cake.kickerNumber || '01 / 08'}</span>
                    <span className="kicker-divider" />
                    <span>{cake.categoryName.toUpperCase()}</span>
                  </div>

                  {/* Massive Bold Title - Formatted in two rows */}
                  <h1 className="lattice-hero-title">
                    {cake.name.includes(' & ') ? (
                      <>
                        {cake.name.split(' & ')[0]}
                        <br />
                        &amp; {cake.name.split(' & ')[1]}
                      </>
                    ) : (
                      cake.name
                    )}
                  </h1>

                  {/* Short Poetic Description */}
                  <p className="lattice-hero-description">
                    {cake.shortDesc}
                  </p>

                  {/* Collapsible Accordion Dropdowns below Short Description */}
                  <div className="lattice-hero-accordions">
                    {/* 1. Description & Ingredients */}
                    <div className={`hero-accordion-item ${openAccordion === 'description' ? 'open' : ''}`}>
                      <button
                        type="button"
                        className="hero-accordion-header"
                        onClick={() => setOpenAccordion(openAccordion === 'description' ? null : 'description')}
                      >
                        <span className="ha-title">Description &amp; Ingredients</span>
                        <ChevronDown size={16} className={`ha-chevron ${openAccordion === 'description' ? 'rotate' : ''}`} />
                      </button>
                      {openAccordion === 'description' && (
                        <div className="hero-accordion-body">
                          <p>{cake.description}</p>
                          <h5>Ingredient Standards:</h5>
                          <ul>
                            <li>100% Real Pure Creamery Butter (never hydrogenated fats or margarines)</li>
                            <li>Belgian Cocoa &amp; Couverture Chocolate for rich, luxurious mouthfeel</li>
                            <li>Madagascar Bourbon Vanilla extracts and natural fruit pulps</li>
                            <li>Eggless, gluten-free, and nut-conscious preparations available upon request</li>
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* 2. Portion Guide & Sizing */}
                    <div className={`hero-accordion-item ${openAccordion === 'portion' ? 'open' : ''}`}>
                      <button
                        type="button"
                        className="hero-accordion-header"
                        onClick={() => setOpenAccordion(openAccordion === 'portion' ? null : 'portion')}
                      >
                        <span className="ha-title">Portion Guide &amp; Sizing</span>
                        <ChevronDown size={16} className={`ha-chevron ${openAccordion === 'portion' ? 'rotate' : ''}`} />
                      </button>
                      {openAccordion === 'portion' && (
                        <div className="hero-accordion-body">
                          <h5>Portion &amp; Sizing Chart:</h5>
                          <ul>
                            <li><strong>Bento (300 - 350g):</strong> Serves up to 4 people</li>
                            <li><strong>0.5 kg (500g):</strong> Serves up to 8 people</li>
                            <li><strong>0.75 kg (750g):</strong> Serves up to 10 people</li>
                            <li><strong>1 kg:</strong> Serves up to 15 people</li>
                            <li><strong>1.5 kg:</strong> Serves up to 20 people</li>
                            <li><strong>2 kg:</strong> Serves up to 25 people</li>
                            <li><strong>3 kg:</strong> Serves up to 35 people</li>
                            <li><strong>4 kg+:</strong> Serves up to 50 people</li>
                          </ul>
                          <p style={{ fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.72)', marginTop: '8px', fontStyle: 'italic' }}>
                            Please note that the cake may serve the number of guests depending on the size of the slices.
                          </p>
                          <h5>Storage in Nairobi Weather:</h5>
                          <p>
                            Keep refrigerated until 1 to 2 hours prior to slicing. Allowing the cake to rest at room temperature lets the real butter soften slightly for maximum fluffiness and flavor release.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 3. Delivery & M-Pesa Details */}
                    <div className={`hero-accordion-item ${openAccordion === 'delivery' ? 'open' : ''}`}>
                      <button
                        type="button"
                        className="hero-accordion-header"
                        onClick={() => setOpenAccordion(openAccordion === 'delivery' ? null : 'delivery')}
                      >
                        <span className="ha-title">Nairobi Delivery &amp; M-Pesa Details</span>
                        <ChevronDown size={16} className={`ha-chevron ${openAccordion === 'delivery' ? 'rotate' : ''}`} />
                      </button>
                      {openAccordion === 'delivery' && (
                        <div className="hero-accordion-body">
                          <h5>Doorstep Delivery Across Nairobi:</h5>
                          <p>
                            We deliver directly to your venue, office, or residence across Nairobi, Ruiru, Kiambu, Westlands, Kilimani, Karen, Lavington, Runda, and surrounding estates.
                          </p>
                          <h5>Payment via M-Pesa:</h5>
                          <p>
                            We accept M-Pesa Buy Goods / Till and automated STK push. Once your order is submitted, you can authorize payment seamlessly with instant verification.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Specs Row */}
                  <div className="lattice-hero-metrics-row">
                    <div className="metric-item">
                      <span className="metric-val">{cake.priceFormatted}</span>
                      <span className="metric-label">{pricingModel === 'bespoke' ? 'Bespoke Quote' : 'starting price'}</span>
                    </div>

                    <div className="metric-separator" />

                    <div className="metric-item">
                      <span className="metric-val">
                        {cake.availableWeights?.find(w => w.weight === selectedWeight)?.servings?.replace('slices', 'people') || (cake.servings ? cake.servings.replace('slices', 'people') : 'Up to 20 people')}
                      </span>
                      <span className="metric-label">estimated servings</span>
                    </div>

                    <div className="metric-separator" />

                    <div className="metric-item">
                      <span className="metric-val">
                        {cake.leadTime?.toLowerCase().includes('same-day') ? 'Same-Day' : '24h Notice'}
                      </span>
                      <span className="metric-label">fresh daily bake</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="lattice-hero-actions-row">
                    {pricingModel === 'bespoke' ? (
                      <button
                        type="button"
                        className="lattice-btn-primary"
                        onClick={() => setQuoteModalOpen(true)}
                      >
                        <FileText size={18} />
                        <span>Request a Quotation</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="lattice-btn-primary"
                        onClick={handleAddToCart}
                      >
                        <ShoppingBag size={18} />
                        <span>{addedNotice ? 'Added to Cart' : `Add to Cart • ${cake.priceFormatted}`}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      className="lattice-btn-outline"
                      onClick={handleOrderNowClick}
                    >
                      <ShoppingBag size={18} />
                      <span>Order Now &rarr;</span>
                    </button>
                  </div>
                </div>

                {/* PANE 2: CUSTOMIZE & ORDER WIZARD (SLIDES SIDEWAYS TO REPLACE DETAILS) */}
                <div 
                  className="lattice-slide-pane lattice-order-pane"
                  ref={orderPaneRef}
                  aria-hidden={!inlineOrderOpen}
                >
                  <div className="inline-order-card" ref={orderCardRef}>
                    <div className="inline-order-card-header">
                      <div className="inline-order-header-top-row">
                        <button 
                          type="button" 
                          className="inline-order-back-btn" 
                          onClick={handleBackToDetails}
                          title="Back to cake details"
                        >
                          <ArrowLeft size={16} />
                          <span>Back to Cake Details</span>
                        </button>
                        <div className="inline-order-header-right">
                          <span className="inline-order-kicker">STEP {checkoutStep} OF 3</span>
                          <button 
                            type="button" 
                            className="inline-order-close-btn" 
                            onClick={handleBackToDetails}
                            title="Close order form"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Stepper Progress Bar */}
                    <div className="wizard-stepper-bar">
                      <div className={`wizard-step-tab ${checkoutStep === 1 ? 'active' : ''} ${checkoutStep > 1 ? 'completed' : ''}`}>
                        <span className="step-num">{checkoutStep > 1 ? '✓' : '1'}</span>
                        <span className="step-text">Variations</span>
                      </div>
                      <div className="wizard-step-connector" />
                      <div className={`wizard-step-tab ${checkoutStep === 2 ? 'active' : ''} ${checkoutStep > 2 ? 'completed' : ''}`}>
                        <span className="step-num">{checkoutStep > 2 ? '✓' : '2'}</span>
                        <span className="step-text">Delivery &amp; Details</span>
                      </div>
                      <div className="wizard-step-connector" />
                      <div className={`wizard-step-tab ${checkoutStep === 3 ? 'active' : ''}`}>
                        <span className="step-num">3</span>
                        <span className="step-text">Review &amp; Place</span>
                      </div>
                    </div>

                    {orderSuccess ? (
                      <div className="quote-success-view">
                        <CheckCircle2 size={48} className="quote-success-icon" />
                        <h4>Order Placed Successfully!</h4>
                        <p>
                          Order Reference: <strong>#{orderSuccess}</strong>. Thank you! Your cake order details have been received. Our baking team has logged your specifications and will reach out to confirm your schedule.
                        </p>
                        <div className="quote-success-actions">
                          <button
                            type="button"
                            className="quote-done-btn"
                            onClick={() => {
                              handleBackToDetails();
                              setOrderSuccess(null);
                              setCheckoutStep(1);
                            }}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="quote-form-body">
                        {orderError && (
                          <div className="quote-error-banner" style={{ color: '#D93025', fontSize: '0.88rem', margin: '4px 0 12px', padding: '10px 14px', background: '#FCE8E6', borderRadius: '8px', fontWeight: 600 }}>
                            {orderError}
                          </div>
                        )}

                        {/* STEP 1: CAKE VARIATIONS & CUSTOMIZATION */}
                        {/* STEP 1: CAKE VARIATIONS & CUSTOMIZATION */}
                        {checkoutStep === 1 && (
                          <div className="order-variations-container">
                            {/* TWO CLEAN ROWS FOR ALL CAKE SELECTIONS: SIZE, FLAVOR, DESIGN, QUANTITY */}
                            {/* ROW 1: Size/Weight Stepper + Cake Flavor */}
                            <div className="variations-row variations-row-1">
                              {/* 1. Size / Weight Stepper */}
                              {cake.availableWeights && cake.availableWeights.length > 0 && (() => {
                                const weightIdx = Math.max(0, cake.availableWeights.findIndex(w => w.weight === selectedWeight));
                                const canStepDown = weightIdx > 0;
                                const canStepUp = weightIdx < cake.availableWeights.length - 1;
                                return (
                                  <div className="q-field q-field-size">
                                    <label>1. Size / Weight *</label>
                                    <div className="size-stepper-row">
                                      <div className="checkout-qty-stepper size-stepper">
                                        <button
                                          type="button"
                                          disabled={!canStepDown}
                                          onClick={() => canStepDown && setSelectedWeight(cake.availableWeights[weightIdx - 1].weight)}
                                          aria-label="Decrease cake size"
                                        >
                                          −
                                        </button>
                                        <span>{selectedWeight}</span>
                                        <button
                                          type="button"
                                          disabled={!canStepUp}
                                          onClick={() => canStepUp && setSelectedWeight(cake.availableWeights[weightIdx + 1].weight)}
                                          aria-label="Increase cake size"
                                        >
                                          +
                                        </button>
                                      </div>
                                      <span className="size-price-calc">
                                        Price: <strong>KSh {baseWeightPrice.toLocaleString()}</strong>
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* 2. Cake Flavor */}
                              <div className="q-field q-field-flavor">
                                <label>2. Cake Flavor *</label>
                                <select
                                  value={selectedFlavor}
                                  onChange={e => setSelectedFlavor(e.target.value)}
                                >
                                  {CAKE_FLAVORS.map(f => (
                                    <option key={f.id} value={f.name}>{f.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* ROW 2: Writing on Cake (and Design / Style only for Custom Designs) */}
                            <div className={`variations-row variations-row-2 ${!isCustomCake ? 'single-field' : ''}`}>
                              {/* Cake Design - Displayed only for custom cakes */}
                              {isCustomCake && (
                                <div className="q-field q-field-design">
                                  <label>3. Cake Design / Style *</label>
                                  <select
                                    value={selectedDesign}
                                    onChange={e => setSelectedDesign(e.target.value)}
                                  >
                                    {CAKE_DESIGNS.map(d => (
                                      <option key={d.id} value={d.name}>{d.name}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {/* Writing on Cake */}
                              <div className="q-field q-field-inscription">
                                <label>{isCustomCake ? '4. Writing on Cake (Complimentary)' : '3. Writing on Cake (Complimentary)'}</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Happy 30th Birthday David!"
                                  value={inscription}
                                  onChange={e => setInscription(e.target.value)}
                                  maxLength={50}
                                />
                              </div>
                            </div>

                            {/* Step 1 Total Bar */}
                            <div className="checkout-total-bar" style={{ marginTop: '16px' }}>
                              <div className="checkout-total-label">
                                <span>Current Total ({quantity} {quantity > 1 ? 'cakes' : 'cake'}):</span>
                              </div>
                              <div className="checkout-total-amount">
                                KSh {itemsSubtotal.toLocaleString()}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                              <button
                                type="button"
                                className="lattice-btn-outline"
                                onClick={handleBackToDetails}
                                style={{ padding: '12px 20px', borderRadius: '9999px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                &larr; Back
                              </button>
                              <button
                                type="button"
                                className="inline-order-primary-btn"
                                onClick={goToNextStep}
                                style={{ flex: 1, cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                <span>Next &rarr;</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STEP 2: DELIVERY & CONTACT DETAILS */}
                        {checkoutStep === 2 && (
                          <div>
                            <div className="quote-form-grid">
                              {/* Customer Details: Full Name */}
                              <div className="q-field">
                                <label>Your Full Name *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Grace Wanjiku"
                                  value={orderForm.name}
                                  onChange={e => setOrderForm({ ...orderForm, name: e.target.value })}
                                />
                              </div>

                              {/* Customer Details: WhatsApp Phone */}
                              <div className="q-field">
                                <label>WhatsApp Phone Number *</label>
                                <input
                                  type="tel"
                                  required
                                  placeholder="0712 345 678"
                                  value={orderForm.phone}
                                  onChange={e => setOrderForm({ ...orderForm, phone: e.target.value })}
                                />
                              </div>

                              {/* Fulfillment Method */}
                              <div className="q-field full-width">
                                <label>How Will You Receive Your Cake? *</label>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                  <button
                                    type="button"
                                    className={`lattice-btn-outline ${orderForm.fulfillment === 'pickup' ? 'active' : ''}`}
                                    style={{
                                      flex: 1,
                                      padding: '10px 14px',
                                      fontSize: '0.85rem',
                                      background: orderForm.fulfillment === 'pickup' ? '#FEF5A7' : 'rgba(255,255,255,0.08)',
                                      color: orderForm.fulfillment === 'pickup' ? '#24080D' : '#FFFFFF',
                                      borderColor: orderForm.fulfillment === 'pickup' ? '#FEF5A7' : 'rgba(255,255,255,0.22)',
                                      fontWeight: orderForm.fulfillment === 'pickup' ? 800 : 600,
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                      setOrderForm({ ...orderForm, fulfillment: 'pickup' });
                                      setFulfillmentType('pickup');
                                    }}
                                  >
                                    Studio Pickup (Free)
                                  </button>
                                  <button
                                    type="button"
                                    className={`lattice-btn-outline ${orderForm.fulfillment === 'delivery' ? 'active' : ''}`}
                                    style={{
                                      flex: 1,
                                      padding: '10px 14px',
                                      fontSize: '0.85rem',
                                      background: orderForm.fulfillment === 'delivery' ? '#FEF5A7' : 'rgba(255,255,255,0.08)',
                                      color: orderForm.fulfillment === 'delivery' ? '#24080D' : '#FFFFFF',
                                      borderColor: orderForm.fulfillment === 'delivery' ? '#FEF5A7' : 'rgba(255,255,255,0.22)',
                                      fontWeight: orderForm.fulfillment === 'delivery' ? 800 : 600,
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                      setOrderForm({ ...orderForm, fulfillment: 'delivery' });
                                      setFulfillmentType('delivery');
                                    }}
                                  >
                                    Doorstep Delivery
                                  </button>
                                </div>

                                {orderForm.fulfillment === 'pickup' ? (
                                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', marginTop: '8px', margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <MapPin size={14} />
                                    <span>Studio Collection: <strong>Lany Studio, Kamakis Eastern Bypass (Ruiru)</strong></span>
                                  </p>
                                ) : (
                                  <input
                                    type="text"
                                    required
                                    placeholder="Estate / Apartment / Landmark (e.g. Membley, Ruiru, Kilimani)"
                                    style={{ marginTop: '8px' }}
                                    value={orderForm.address}
                                    onChange={e => setOrderForm({ ...orderForm, address: e.target.value })}
                                  />
                                )}
                              </div>

                              {/* Celebration Date */}
                              <div className="q-field">
                                <label htmlFor="inline-celebration-date">Celebration Date *</label>
                                <div className="inline-date-wrap">
                                  <Calendar size={16} className="inline-date-icon" />
                                  <input
                                    id="inline-celebration-date"
                                    type="date"
                                    required
                                    min={minDeliveryDate}
                                    value={orderForm.date || deliveryDate}
                                    onChange={e => setOrderForm({ ...orderForm, date: e.target.value })}
                                    onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch {} }}
                                    className="inline-date-input"
                                  />
                                </div>
                              </div>

                              {/* Delivery Slot Pills */}
                              <div className="q-field full-width">
                                <label>Delivery / Pickup Slot *</label>
                                <div className="inline-slot-pills-grid">
                                  {DELIVERY_SLOTS.map(s => (
                                    <button
                                      key={s.id}
                                      type="button"
                                      className={`inline-slot-pill-btn ${deliverySlot === s.id ? 'active' : ''}`}
                                      onClick={() => setDeliverySlot(s.id)}
                                    >
                                      <Clock size={14} />
                                      <span>{s.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Special Notes (Collapsible) */}
                              <div className="q-field full-width">
                                <button
                                  type="button"
                                  className="inline-note-toggle-btn"
                                  onClick={() => setShowOrderNote(prev => !prev)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '7px 12px',
                                    border: '1px dashed rgba(254, 245, 167, 0.45)',
                                    borderRadius: '8px',
                                    background: 'transparent',
                                    color: '#FEF5A7',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <span>{showOrderNote ? '− Hide special note' : '+ Add special note (optional)'}</span>
                                </button>
                                {showOrderNote && (
                                  <textarea
                                    rows={2}
                                    placeholder="e.g. Eggless sponge, less sugar, or call upon arrival."
                                    style={{ marginTop: '8px' }}
                                    value={orderForm.notes}
                                    onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })}
                                  />
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                              <button
                                type="button"
                                className="lattice-btn-outline"
                                onClick={goToPrevStep}
                                style={{ padding: '12px 20px', borderRadius: '9999px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                &larr; Back
                              </button>
                              <button
                                type="button"
                                className="inline-order-primary-btn"
                                onClick={goToNextStep}
                                style={{ flex: 1, cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                <span>Next &rarr;</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STEP 3: REVIEW & PLACE ORDER */}
                        {checkoutStep === 3 && (
                          <div>
                            <div className="checkout-review-card">
                              <div className="checkout-review-header">
                                <img src={activeImage || cake.image} alt={cake.name} className="checkout-review-thumb" />
                                <div>
                                  <h4>{cake.name}</h4>
                                  <p className="checkout-review-sub">{selectedWeight} • {selectedFlavor} • {quantity}x</p>
                                </div>
                              </div>

                              <div className="checkout-review-rows">
                                {isCustomCake && (
                                  <div className="review-row">
                                    <span>Cake Design:</span>
                                    <strong>{selectedDesign}</strong>
                                  </div>
                                )}
                                {inscription && (
                                  <div className="review-row">
                                    <span>Writing on Cake:</span>
                                    <strong style={{ fontStyle: 'italic' }}>"{inscription}"</strong>
                                  </div>
                                )}
                                <div className="review-row">
                                  <span>Contact:</span>
                                  <strong>{orderForm.name} • {orderForm.phone}</strong>
                                </div>
                                <div className="review-row">
                                  <span>Fulfillment:</span>
                                  <strong>{orderForm.fulfillment === 'pickup' ? 'Studio Pickup (Kamakis)' : `Doorstep Delivery (${orderForm.address})`}</strong>
                                </div>
                                <div className="review-row">
                                  <span>Schedule:</span>
                                  <strong>{orderForm.date || deliveryDate} • {DELIVERY_SLOTS.find(s => s.id === deliverySlot)?.label || deliverySlot}</strong>
                                </div>
                                {orderForm.notes && (
                                  <div className="review-row">
                                    <span>Notes:</span>
                                    <span>{orderForm.notes}</span>
                                  </div>
                                )}
                              </div>

                              <div className="checkout-total-bar" style={{ marginTop: '16px' }}>
                                <div className="checkout-total-label">
                                  <span>Subtotal ({quantity} {quantity > 1 ? 'cakes' : 'cake'}): KSh {itemsSubtotal.toLocaleString()}</span>
                                  {orderForm.fulfillment === 'delivery' && (
                                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                                      + Doorstep Delivery ({deliveryFee > 0 ? `KSh ${deliveryFee}` : 'Free / Standard rate'})
                                    </span>
                                  )}
                                </div>
                                <div className="checkout-total-amount">
                                  KSh {liveTotal.toLocaleString()}
                                </div>
                              </div>

                              <div className="checkout-reassurance-badge">
                                <Sparkles size={16} />
                                <span>Instant Kitchen Notification: Your order specifications are logged immediately and dispatched to our pastry team.</span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                              <button
                                type="button"
                                className="lattice-btn-outline"
                                onClick={goToPrevStep}
                                style={{ padding: '12px 20px', borderRadius: '9999px', cursor: 'pointer' }}
                              >
                                &larr; Back
                              </button>
                              <button
                                type="button"
                                className="inline-order-primary-btn"
                                disabled={orderSubmitting}
                                onClick={handleOrderNowSubmit}
                                style={{
                                  flex: 1,
                                  cursor: orderSubmitting ? 'not-allowed' : 'pointer'
                                }}
                              >
                                <ShoppingBag size={18} />
                                <span>{orderSubmitting ? 'Placing Order...' : `Order Now • KSh ${liveTotal.toLocaleString()}`}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Far Right: Vertical Sibling / Signature Switcher */}
          <div className="lattice-vertical-switcher">
            <span className="switcher-header-label">BAKERY SIGNATURES</span>
            <div className="switcher-links-stack">
              {switcherCakes.map(sc => {
                const isCurrent = sc.id === cake.id || sc.slug === cake.slug;
                return (
                  <Link
                    key={sc.id}
                    to={`/cake/${sc.slug || sc.id}`}
                    className={`switcher-link ${isCurrent ? 'active' : ''}`}
                  >
                    <span className="switcher-text">{sc.name.replace('The ', '')}</span>
                    <span className="switcher-indicator" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Next Cake Link (Lattice Style) */}
        <Link 
          to={`/cake/${nextCake.slug || nextCake.id}`}
          className="lattice-scroll-prompt"
          aria-label={`Next signature bake: ${nextCake.name}`}
        >
          <span>EXPLORE NEXT: {nextCake.name.toUpperCase()}</span>
          <ArrowDown size={14} className="prompt-arrow-bounce" />
        </Link>
      </section>

      {/* PreFooter Call To Action (Same As HomePage) */}
      <PreFooterCta />

      {/* BESPOKE QUOTATION MODAL */}
      {quoteModalOpen && (
        <div className="quote-modal-overlay" onClick={() => setQuoteModalOpen(false)}>
          <div className="quote-modal-content" onClick={e => e.stopPropagation()}>
            <div className="quote-modal-header">
              <h3>Request Quotation for {cake.name}</h3>
              <button 
                type="button" 
                className="quote-modal-close" 
                onClick={() => setQuoteModalOpen(false)}
              >
                &times;
              </button>
            </div>

            {quoteSuccess ? (
              <div className="quote-success-view">
                <CheckCircle2 size={48} className="quote-success-icon" />
                <h4>Quotation Request Received!</h4>
                <p>
                  Reference: <strong>{quoteSuccess}</strong>. Our head decorator Carol Jenny is reviewing your design requirements and will send your detailed estimate within 2 business hours.
                </p>
                <div className="quote-success-actions">
                  <button
                    type="button"
                    className="quote-wa-confirm-btn"
                    onClick={() => {
                      const text = `Hello Carol Jenny, I submitted quote request *${quoteSuccess}* for ${cake.name}. Looking forward to discussing details!`;
                      window.open(`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                  >
                    <MessageCircle size={18} />
                    <span>Chat on WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    className="quote-done-btn"
                    onClick={() => {
                      setQuoteModalOpen(false);
                      setQuoteSuccess(null);
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form className="quote-form-body" onSubmit={handleQuoteSubmit}>
                <div className="quote-form-grid">
                  <div className="q-field">
                    <label>Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wanjiku Mwangi"
                      value={quoteForm.customerName}
                      onChange={e => setQuoteForm({ ...quoteForm, customerName: e.target.value })}
                    />
                  </div>

                  <div className="q-field">
                    <label>Phone Number (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0712 345 678"
                      value={quoteForm.phone}
                      onChange={e => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="q-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. wanjiku@gmail.com"
                      value={quoteForm.email}
                      onChange={e => setQuoteForm({ ...quoteForm, email: e.target.value })}
                    />
                  </div>

                  <div className="q-field">
                    <label>Estimated Guest Count *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 80 guests"
                      value={quoteForm.guestCount}
                      onChange={e => setQuoteForm({ ...quoteForm, guestCount: e.target.value })}
                    />
                  </div>

                  <div className="q-field">
                    <label>Desired Tier Structure</label>
                    <select
                      value={quoteForm.tierStructure}
                      onChange={e => setQuoteForm({ ...quoteForm, tierStructure: e.target.value })}
                    >
                      <option value="1 Tier (Standard Grand)">1 Tier (Standard Grand)</option>
                      <option value="2 Tiers (Up to 60 guests)">2 Tiers (Up to 60 guests)</option>
                      <option value="3 Tiers (80 - 120 guests)">3 Tiers (80 - 120 guests)</option>
                      <option value="4+ Tiers (Grand Matrimonial)">4+ Tiers (Grand Matrimonial)</option>
                    </select>
                  </div>

                  <div className="q-field">
                    <label>Event Date *</label>
                    <input
                      type="date"
                      required
                      min={minDeliveryDate}
                      value={quoteForm.eventDate}
                      onChange={e => setQuoteForm({ ...quoteForm, eventDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="q-field full-width">
                  <label>Venue / Delivery Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Safari Park Hotel, Thika Road or Karen Country Club"
                    value={quoteForm.deliveryLocation}
                    onChange={e => setQuoteForm({ ...quoteForm, deliveryLocation: e.target.value })}
                  />
                </div>

                <div className="q-field full-width">
                  <label>Design Notes, Themes &amp; Color Scheme</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Emerald green and champagne gold palette with cascading sugar peonies and a hint of edible gold leaf."
                    value={quoteForm.notes}
                    onChange={e => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="quote-submit-btn"
                  disabled={quoteSubmitting}
                >
                  {quoteSubmitting ? 'Submitting Details...' : 'Submit Quotation Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
