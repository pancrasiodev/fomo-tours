import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, ArrowRight, ArrowLeft, Send, MessageCircle,
  Upload, MapPin, ShieldCheck, X, Sparkles, Clock, Calendar
} from 'lucide-react';
import { 
  BUSINESS_INFO, CAKE_FLAVORS, CAKE_FILLINGS, CAKE_ICINGS, 
  DELIVERY_ZONES, DELIVERY_SLOTS 
} from '../data/cakesData';
import { recordLead } from '../utils/analyticsStore';
import { API_BASE } from '../config/api';
import PreFooterCta from '../components/Home/PreFooterCta';
import { usePageSeo, getBreadcrumbSchema } from '../utils/seo';
import './CustomOrderPage.css';

// 7 Visual Celebration Styles (Step 1)
const CELEBRATION_STYLES = [
  {
    id: 'birthday',
    name: 'Birthday Celebration',
    badge: 'Most Popular',
    badgeType: 'popular',
    image: '/images/collection/birthday.jpg',
  },
  {
    id: 'bento',
    name: 'Minimalist Bento & Petite',
    badge: 'Trending Aesthetic',
    badgeType: 'trending',
    image: '/images/collection/custom.jpg',
  },
  {
    id: 'wedding',
    name: 'Grand Wedding & Multi-Tier',
    badge: 'Bespoke Luxury',
    badgeType: 'luxury',
    image: '/images/collection/wedding.jpg',
  },
  {
    id: 'baby-shower',
    name: 'Baby Shower & Milestones',
    badge: 'Gentle Pastels',
    badgeType: 'pastel',
    image: '/images/collection/baby-shower.jpg',
  },
  {
    id: 'cupcakes',
    name: 'Artisan Cupcake Towers',
    badge: 'Party Favorite',
    badgeType: 'party',
    image: '/images/collection/cupcakes.jpg',
  },
  {
    id: 'graduation',
    name: 'Graduation & Achievement',
    badge: 'Milestone Bakes',
    badgeType: 'milestone',
    image: '/images/collection/graduation.jpg',
  },
  {
    id: 'other',
    name: 'Other / Bespoke Concept',
    badge: 'Anything You Imagine',
    badgeType: 'bespoke',
    image: '/images/about/pastry-decorating-hands.jpg',
  }
];

// Size Options (Aligned with Official Cake Serving Guide)
const SIZE_OPTIONS = [
  { id: '1kg', weight: '1 kg', servings: 'Serves up to 15 people', label: 'Intimate Family' },
  { id: '1.5kg', weight: '1.5 kg', servings: 'Serves up to 20 people', label: 'Most Popular', popular: true },
  { id: '2kg', weight: '2 kg', servings: 'Serves up to 25 people', label: 'Celebration Gathering' },
  { id: '3kg', weight: '3 kg+', servings: 'Serves up to 35 people', label: 'Grand Party Tier' },
  { id: '4kg', weight: '4 kg+', servings: 'Serves up to 50 people', label: 'Mega Celebration' },
  { id: 'other-size', weight: 'Other / Custom Tier', servings: 'Custom guest count', label: 'Multi-Tier Custom' }
];

// Extended Flavors with "Other"
const FLAVOR_OPTIONS = [
  ...CAKE_FLAVORS,
  { 
    id: 'other-flavor', 
    name: 'Other Flavor (Tell Us Your Preference)', 
    desc: 'Craving pistachio rose, lemon poppyseed, coconut lime or another custom blend? Tell us below!' 
  }
];

// Extended Fillings with "Other" and "Baker's Choice"
const FILLING_OPTIONS = [
  ...CAKE_FILLINGS,
  { id: 'bakers-choice', name: "Baker's Choice (Best Pairing)", desc: 'Let our head baker pair the tastiest artisanal filling.' },
  { id: 'other-filling', name: 'Other / Custom Filling', desc: 'Custom compote, nut praline, curd, or ganache.' }
];

// Extended Outer Finishes with "Other"
const FINISH_OPTIONS = [
  ...CAKE_ICINGS,
  { id: 'other-finish', name: 'Other / Custom Finish', desc: 'Fault-line gold, concrete gray, metallic drip, or sculpted fondant.' }
];

// Celebration Extras with Real Photography (Step 3 Visual Cards)
const CELEBRATION_EXTRAS = [
  { 
    id: 'candles', 
    key: 'candles', 
    name: 'Sparkler Birthday Candles (Pack of 2)',
    image: '/images/addons/candles.jpg'
  },
  { 
    id: 'acrylicTopper', 
    key: 'acrylicTopper', 
    name: 'Mirror Gold Acrylic Cake Topper',
    image: '/images/addons/topper.jpg'
  },
  { 
    id: 'goldLeaf', 
    key: 'goldLeaf', 
    name: '24K Edible Gold Leaf Accents',
    image: '/images/addons/gold-leaf.jpg'
  },
  { 
    id: 'berryCrown', 
    key: 'berryCrown', 
    name: 'Fresh Seasonal Berry & Edible Floral Crown',
    image: '/images/addons/berry-crown.jpg'
  },
  { 
    id: 'luxuryPackaging', 
    key: 'luxuryPackaging', 
    name: 'Luxury Keepsake Gift Box & Silk Ribbon',
    image: '/images/addons/gift-box.jpg'
  },
  { 
    id: 'otherExtra', 
    key: 'otherExtra', 
    name: 'Other Custom Add-on',
    image: '/images/about/pastry-decorating-hands.jpg'
  }
];

export default function CustomOrderPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Cakes', url: '/cakes' },
    { name: 'Custom Cakes Nairobi', url: '/custom-order' }
  ]);

  usePageSeo({
    title: 'Custom Cakes Nairobi & Ruiru | Lany Cake Shop',
    description: 'Order custom cakes in Nairobi and Ruiru. Pick your theme, size, cake flavors, and upload a design photo for a fast quote from Carol Jenny at Lany Cake Shop.',
    keywords: [
      'custom cakes Nairobi',
      'custom birthday cakes Nairobi',
      'bespoke wedding cakes Kenya',
      '3D sculpted cakes Nairobi',
      'eggless custom cakes',
      'cake design Ruiru'
    ],
    canonicalPath: '/custom-order',
    image: '/images/lany/custom-cakes.webp',
    schema: breadcrumbSchema
  });

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Celebration Style
  const [selectedStyle, setSelectedStyle] = useState(CELEBRATION_STYLES[0]);
  const [customStyleNote, setCustomStyleNote] = useState('');

  // Step 2: Size, Flavors (Can be combined!), Filling, Finish
  const [selectedSize, setSelectedSize] = useState(SIZE_OPTIONS[1]);
  const [customSizeNote, setCustomSizeNote] = useState('');

  // Multi-flavor selection (Flavors can be combined)
  const [selectedFlavors, setSelectedFlavors] = useState([FLAVOR_OPTIONS[1].name]); // Belgian Chocolate Fudge
  const [customFlavorNote, setCustomFlavorNote] = useState('');

  const [selectedFilling, setSelectedFilling] = useState(FILLING_OPTIONS[0].name);
  const [customFillingNote, setCustomFillingNote] = useState('');

  const [selectedFinish, setSelectedFinish] = useState(FINISH_OPTIONS[0].name);
  const [customFinishNote, setCustomFinishNote] = useState('');

  // Step 3: Personalization, Inscription & Extras
  const [noInscription, setNoInscription] = useState(false);
  const [inscription, setInscription] = useState('');
  const [selectedExtras, setSelectedExtras] = useState({
    candles: false,
    acrylicTopper: true,
    goldLeaf: false,
    berryCrown: false,
    luxuryPackaging: false,
    otherExtra: false
  });
  const [customExtraNote, setCustomExtraNote] = useState('');
  const [referenceImage, setReferenceImage] = useState(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [colorSchemeNotes, setColorSchemeNotes] = useState('');

  // Step 4: Schedule, Fulfillment & Contact Info
  const [fulfillmentMode, setFulfillmentMode] = useState('delivery'); // 'delivery' | 'pickup'
  const [selectedZone, setSelectedZone] = useState('westlands_kilimani');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [deliverySlot, setDeliverySlot] = useState('afternoon');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Min date calculation (tomorrow)
  const minDeliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  // SEO & JSON-LD Structured Data Schema for Custom Orders
  useEffect(() => {
    document.title = 'Custom Cakes Nairobi & Ruiru | Lany Cake Shop';
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Order custom cakes in Nairobi and Ruiru. Pick your theme, size, cake flavors, and upload a design photo for a fast quote from Carol Jenny at Lany Cake Shop.');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://lanycakes.co.ke/custom-order';
    canonical.setAttribute('href', currentUrl);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lanycakes.co.ke';
    const ogTags = [
      { property: 'og:title', content: 'Custom Cakes Nairobi & Ruiru | Lany Cake Shop' },
      { property: 'og:description', content: 'Order a custom cake in Nairobi & Ruiru with your preferred flavor, size, and design photo. Fast WhatsApp quote.' },
      { property: 'og:image', content: `${origin}/images/collection/custom.jpg` },
      { property: 'og:url', content: currentUrl },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Custom Cakes Nairobi & Ruiru | Lany Cake Shop' },
      { name: 'twitter:description', content: 'Custom birthday, graduation, and wedding cakes baked fresh in Nairobi & Ruiru.' },
      { name: 'twitter:image', content: `${origin}/images/collection/custom.jpg` }
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

    const jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    jsonLdScript.id = 'custom-order-jsonld-schema';
    const schemaData = {
      '@context': 'https://schema.org/',
      '@type': 'Service',
      name: 'Custom Celebration Cake Design Service',
      serviceType: 'Bakery & Cake Decorating',
      provider: {
        '@type': 'Bakery',
        name: 'Lany Cake Shop',
        telephone: BUSINESS_INFO.phone || '+254708779955',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Kamakis Eastern Bypass',
          addressLocality: 'Ruiru',
          addressRegion: 'Nairobi Metro',
          addressCountry: 'KE'
        }
      },
      areaServed: ['Nairobi', 'Ruiru', 'Kiambu', 'Juja', 'Westlands', 'Kilimani', 'Karen'],
      description: 'Handcrafted custom cakes tailored by size, taste, and visual design with doorstep delivery across Nairobi.'
    };
    jsonLdScript.text = JSON.stringify(schemaData);

    const existingScript = document.getElementById('custom-order-jsonld-schema');
    if (existingScript) existingScript.remove();
    document.head.appendChild(jsonLdScript);

    return () => {
      const s = document.getElementById('custom-order-jsonld-schema');
      if (s) s.remove();
      injectedMeta.forEach(m => m.remove());
    };
  }, []);

  // Extras count
  const extrasCount = useMemo(() => {
    return Object.values(selectedExtras).filter(Boolean).length;
  }, [selectedExtras]);

  // Flavor toggle (Combine flavors!)
  const handleFlavorToggle = (flvName) => {
    if (selectedFlavors.includes(flvName)) {
      if (selectedFlavors.length > 1) {
        setSelectedFlavors(prev => prev.filter(f => f !== flvName));
      }
    } else {
      if (selectedFlavors.length < 3) {
        setSelectedFlavors(prev => [...prev, flvName]);
      } else {
        setSelectedFlavors(prev => [prev[1], prev[2], flvName]);
      }
    }
  };

  // Handle Photo Upload Preview + Server Upload (auto-deleted after 7 days)
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImage(reader.result);
    };
    reader.readAsDataURL(file);

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await fetch(`${API_BASE}/api/upload-reference`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data?.success && data?.url) {
        setReferenceImageUrl(data.url);
      }
    } catch {
      // Keep local preview even if offline
    } finally {
      setUploadingImage(false);
    }
  };

  // Step Validation & Fluid Journey
  const canProceed = () => {
    if (currentStep === 1) return Boolean(selectedStyle);
    if (currentStep === 2) return Boolean(selectedSize && selectedFlavors.length > 0);
    if (currentStep === 3) return true;
    if (currentStep === 4) return customerName.trim().length > 0 && customerPhone.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 160, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 160, behavior: 'smooth' });
    }
  };

  // Prepare order summary details string
  const resolvedStyleName = selectedStyle.id === 'other' 
    ? (customStyleNote ? `Other: ${customStyleNote}` : 'Other / Bespoke Concept') 
    : selectedStyle.name;

  const resolvedSizeName = selectedSize.id === 'other-size'
    ? (customSizeNote ? `Custom: ${customSizeNote}` : 'Custom Multi-Tier Size')
    : `${selectedSize.weight} (${selectedSize.servings})`;

  const resolvedFlavorSummary = selectedFlavors.map(f => {
    if (f.includes('Other') && customFlavorNote) return `Custom: ${customFlavorNote}`;
    return f;
  }).join(' + ');

  const resolvedFillingName = selectedFilling.includes('Other')
    ? (customFillingNote ? `Custom Filling: ${customFillingNote}` : 'Custom Filling')
    : selectedFilling;

  const resolvedFinishName = selectedFinish.includes('Other')
    ? (customFinishNote ? `Custom Finish: ${customFinishNote}` : 'Custom Finish')
    : selectedFinish;

  // Single unified submit handler: submits request & dispatches details to WhatsApp + backend
  const handleSubmitOrder = (e) => {
    if (e) e.preventDefault();

    const orderRef = `LANY-CUST-${Math.floor(1000 + Math.random() * 9000)}`;

    recordLead({
      name: customerName || 'Custom Cake Inquirer',
      phone: customerPhone,
      occasion: resolvedStyleName,
      eventDate: deliveryDate,
      message: `${resolvedSizeName}, Flavor(s): ${resolvedFlavorSummary}, Filling: ${resolvedFillingName}, Finish: ${resolvedFinishName}. Message: "${noInscription ? 'No inscription' : inscription}". Note: ${colorSchemeNotes}`,
      source: 'Custom Order Configurator (WhatsApp Direct Submission)',
      budgetEstimate: 'Custom Quotation'
    });

    // Secretly register custom quote & trigger email notification in backend
    const resolvedPhotoUrl = referenceImageUrl
      ? (referenceImageUrl.startsWith('http') ? referenceImageUrl : `${window.location.origin}${referenceImageUrl}`)
      : '';
    fetch(`${API_BASE}/api/cake-orders/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: customerName || 'Custom Cake Inquirer',
        phone: customerPhone,
        email: '',
        occasion: resolvedStyleName,
        guestCount: resolvedSizeName,
        tierStructure: 'Custom Cake',
        flavorPreferences: `${resolvedFlavorSummary} | Filling: ${resolvedFillingName} | Finish: ${resolvedFinishName}`,
        budgetRange: 'Custom Quote',
        eventDate: `${deliveryDate} (${DELIVERY_SLOTS.find(s => s.id === deliverySlot)?.label || deliverySlot})`,
        deliveryLocation: fulfillmentMode === 'pickup' ? 'Lany Studio, Kamakis Eastern Bypass (Pickup)' : `${deliveryAddress || 'Nairobi Delivery'}`,
        referenceImage: resolvedPhotoUrl,
        notes: `Ref: ${orderRef}. Inscription: "${noInscription ? 'No inscription' : inscription}". Notes: ${colorSchemeNotes}`
      })
    }).catch(() => {});

    let msg = `*NEW CUSTOM CAKE INQUIRY [${orderRef}]*\n\n`;
    msg += `• *Celebration Style:* ${resolvedStyleName}\n`;
    msg += `• *Size / Portions:* ${resolvedSizeName}\n`;
    msg += `• *Cake Flavor(s):* ${resolvedFlavorSummary} (Combined flavors)\n`;
    msg += `• *Artisan Filling:* ${resolvedFillingName}\n`;
    msg += `• *Outer Frosting Finish:* ${resolvedFinishName}\n`;
    
    if (noInscription) {
      msg += `• *Writing on Cake:* None (Keep design clean / provide separate card)\n`;
    } else if (inscription) {
      msg += `• *Writing on Cake:* "${inscription}"\n`;
    }

    const extrasList = CELEBRATION_EXTRAS.filter(x => selectedExtras[x.key]).map(x => {
      if (x.key === 'otherExtra' && customExtraNote) {
        return `Other: ${customExtraNote}`;
      }
      return x.name;
    });

    if (extrasList.length > 0) {
      msg += `• *Add-ons & Extras:* ${extrasList.join(', ')}\n`;
    }

    if (colorSchemeNotes) {
      msg += `• *Design & Theme Notes:* ${colorSchemeNotes}\n`;
    }

    if (referenceImageUrl) {
      const fullPhotoUrl = referenceImageUrl.startsWith('http')
        ? referenceImageUrl
        : `${window.location.origin}${referenceImageUrl}`;
      msg += `• *Reference Photo:* ${fullPhotoUrl}\n`;
    } else if (referenceImage) {
      msg += `• *Reference Photo:* Customer attached design photo\n`;
    }

    msg += `• *Fulfillment Mode:* ${fulfillmentMode === 'pickup' ? 'Studio Collection (Lany Studio, Kamakis Eastern Bypass)' : `Doorstep Delivery (${DELIVERY_ZONES.find(z => z.id === selectedZone)?.name})`}\n`;
    if (deliveryAddress && fulfillmentMode === 'delivery') {
      msg += `• *Delivery Address:* ${deliveryAddress}\n`;
    }
    msg += `• *Celebration Date & Slot:* ${deliveryDate} • ${DELIVERY_SLOTS.find(s => s.id === deliverySlot)?.label}\n`;
    if (customerName) msg += `• *Customer:* ${customerName} (${customerPhone})\n`;
    
    msg += `\n*PRICING INQUIRY:* Please share the personalized price quotation and confirm availability for this date.\n\n`;
    msg += `Hello Carol Jenny & Lany Bakery team, I have submitted my custom cake request online!`;

    const url = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setSubmissionSuccess(orderRef);
  };

  const stepTitles = [
    'Design & Theme',
    'Taste & Size',
    'Personalization',
    'Personal & Delivery Details'
  ];

  return (
    <div className="custom-order-app">
      <main className="custom-app-layout">
        <div className="custom-app-container">
          
          {/* LEFT COLUMN: Main Configurator Wizard */}
          <div className="custom-app-main-col">
            
            {/* Top Interactive Breadcrumb Stepper */}
            <nav className="stepper-breadcrumbs" aria-label="Progress">
              {stepTitles.map((title, idx) => {
                const stepNum = idx + 1;
                const isActive = currentStep === stepNum;
                const isPassed = currentStep > stepNum;
                return (
                  <button
                    key={title}
                    type="button"
                    className={`stepper-crumb-btn ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                    onClick={() => setCurrentStep(stepNum)}
                  >
                    <span className="crumb-num">
                      {isPassed ? <Check size={12} strokeWidth={3} /> : stepNum}
                    </span>
                    <span className="crumb-title">{title}</span>
                  </button>
                );
              })}
            </nav>

            {/* Step Progress Bar with Percentage */}
            {(() => {
              const progressPct = Math.round((currentStep / stepTitles.length) * 100);
              return (
                <div className="stepper-progress-wrap">
                  <div className="stepper-progress-track">
                    <div className="stepper-progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="stepper-progress-pct">{progressPct}%</span>
                </div>
              );
            })()}

            {/* SUCCESS BANNER (If submitted) */}
            {submissionSuccess && (
              <div className="booking-success-card">
                <div className="success-icon-wrap">
                  <Check size={28} strokeWidth={3} />
                </div>
                <div className="success-content">
                  <span className="success-badge">REQUEST SUBMITTED • {submissionSuccess}</span>
                  <h3 className="success-title">Thank you, {customerName || 'Friend'}! Your custom cake details are on their way.</h3>
                  <p className="success-desc">
                    We have received your custom order specifications and dispatched them to our WhatsApp team. Head baker Carol Jenny is reviewing your design and will reply via WhatsApp (<strong>{customerPhone}</strong>) within 15–30 minutes!
                  </p>
                  <div className="success-actions">
                    <a 
                      href={`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(`Hello Carol Jenny, I just submitted custom cake request ${submissionSuccess}. Excited to hear from you!`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="success-wa-btn"
                    >
                      <MessageCircle size={16} />
                      <span>Open WhatsApp Chat</span>
                    </a>
                    <button 
                      type="button"
                      className="success-reset-btn"
                      onClick={() => setSubmissionSuccess(null)}
                    >
                      <span>Edit My Request</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Celebration Style */}
            {currentStep === 1 && (
              <section className="step-view-section">
                <div className="step-view-header">
                  <span className="step-tracker-label">STEP 1 — CHOOSE YOUR CELEBRATION</span>
                  <h1 className="step-view-title">Order a Custom Cake in Nairobi &amp; Ruiru</h1>
                </div>

                <div className="options-cards-grid">
                  {CELEBRATION_STYLES.map((style) => {
                    const isSelected = selectedStyle.id === style.id;
                    return (
                      <div 
                        key={style.id}
                        className={`option-choice-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedStyle(style);
                          if (style.id !== 'other') {
                            setCurrentStep(2);
                            window.scrollTo({ top: 160, behavior: 'smooth' });
                          }
                        }}
                      >
                        <div className="choice-card-img-wrap">
                          <img src={style.image} alt={style.name} className="choice-card-img" />
                          <span className={`choice-badge badge-${style.badgeType}`}>
                            {style.badge}
                          </span>
                        </div>

                        <div className="choice-card-body">
                          <h2 className="choice-card-title">{style.name}</h2>
                          <button 
                            type="button" 
                            className={`choice-action-btn ${isSelected ? 'btn-selected' : ''}`}
                          >
                            {isSelected ? (
                              <>
                                <Check size={14} strokeWidth={3} />
                                <span>Selected</span>
                              </>
                            ) : (
                              <span>Select this</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* If "Other / Bespoke Concept" is chosen, show input */}
                {selectedStyle.id === 'other' && (
                  <div className="other-option-input-wrap">
                    <label className="other-input-label">
                      <Sparkles size={16} className="sparkle-icon" />
                      <span>Tell us what you are celebrating or describe your custom concept:</span>
                    </label>
                    <input 
                      type="text"
                      value={customStyleNote}
                      onChange={(e) => setCustomStyleNote(e.target.value)}
                      placeholder="e.g. 50th Golden Anniversary, Corporate Tech Summit, Boho Safari Theme, etc."
                      className="form-text-input highlight-field"
                      autoFocus
                    />
                  </div>
                )}
              </section>
            )}

            {/* STEP 2: Size, Flavors (Can be combined), Filling & Finish */}
            {currentStep === 2 && (
              <section className="step-view-section">
                {/* Sub-section 1: Size / Weight Stepper */}
                <div className="step-subblock">
                  <div className="subblock-header-row">
                    <h3 className="subblock-heading">1. Select Cake Size &amp; Guest Portions</h3>
                    <span className="subblock-badge">Portion Guide</span>
                  </div>
                  {(() => {
                    const sizeIdx = Math.max(0, SIZE_OPTIONS.findIndex(s => s.id === selectedSize.id));
                    const canStepDown = sizeIdx > 0;
                    const canStepUp = sizeIdx < SIZE_OPTIONS.length - 1;
                    return (
                      <div className="custom-size-stepper-row">
                        <div className="custom-size-stepper">
                          <button
                            type="button"
                            disabled={!canStepDown}
                            onClick={() => canStepDown && setSelectedSize(SIZE_OPTIONS[sizeIdx - 1])}
                            aria-label="Decrease cake size"
                          >
                            −
                          </button>
                          <span>{selectedSize.weight}</span>
                          <button
                            type="button"
                            disabled={!canStepUp}
                            onClick={() => canStepUp && setSelectedSize(SIZE_OPTIONS[sizeIdx + 1])}
                            aria-label="Increase cake size"
                          >
                            +
                          </button>
                        </div>
                        <div className="custom-size-meta">
                          <strong>{selectedSize.label}</strong>
                          <span>{selectedSize.servings}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* If "Other / Custom Tier Size" is chosen */}
                  {selectedSize.id === 'other-size' && (
                    <div className="other-option-input-wrap" style={{ marginTop: '14px' }}>
                      <label className="other-input-label">
                        <span>Describe your desired size, tiers, or guest count:</span>
                      </label>
                      <input 
                        type="text"
                        value={customSizeNote}
                        onChange={(e) => setCustomSizeNote(e.target.value)}
                        placeholder="e.g. 3-Tier cake for 80 guests, or 5 kg multi-tier"
                        className="form-text-input highlight-field"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* Sub-section 2: Sponge Flavor (Flavors can be combined!) */}
                <div className="step-subblock">
                  <div className="subblock-header-row">
                    <h3 className="subblock-heading">2. Choose Cake Flavor(s)</h3>
                    <span className="subblock-badge highlight-badge">Combine 1 to 3 Flavors</span>
                  </div>

                  <p className="flavor-combine-note">Note: Flavors can be freely combined!</p>

                  <div className="flavor-pills-grid">
                    {FLAVOR_OPTIONS.map((flv) => {
                      const isSelected = selectedFlavors.includes(flv.name);
                      return (
                        <div 
                          key={flv.id}
                          className={`flavor-pill-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleFlavorToggle(flv.name)}
                        >
                          <div className="flavor-pill-top">
                            <span className={`flavor-checkbox ${isSelected ? 'checked' : ''}`}>
                              {isSelected && <Check size={13} strokeWidth={3} />}
                            </span>
                            <span className="flavor-name">{flv.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* If "Other Flavor" is chosen */}
                  {selectedFlavors.some(f => f.includes('Other')) && (
                    <div className="other-option-input-wrap" style={{ marginTop: '14px' }}>
                      <label className="other-input-label">
                        <span>Enter your custom flavor preference:</span>
                      </label>
                      <input 
                        type="text"
                        value={customFlavorNote}
                        onChange={(e) => setCustomFlavorNote(e.target.value)}
                        placeholder="e.g. Pistachio Rose Water, Lemon Earl Grey, Mango Coconut, Mocha Hazelnut..."
                        className="form-text-input highlight-field"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

              </section>
            )}

            {/* STEP 3: Personalization & Visual Celebration Extras */}
            {currentStep === 3 && (
              <section className="step-view-section">
                <div className="step-view-header">
                  <span className="step-tracker-label">STEP 3 — PERSONALIZATION &amp; EXTRAS</span>
                  <h1 className="step-view-title">Personalize with piped messages &amp; decor</h1>
                  <p className="step-view-subtitle">Select visual add-ons, enter your custom cake wording, and upload reference photos.</p>
                </div>

                {/* Inscription */}
                <div className="step-subblock">
                  <div className="subblock-header-row">
                    <h3 className="subblock-heading">1. Hand-Piped Message on Cake or Board</h3>
                    <label className="no-inscription-toggle">
                      <input 
                        type="checkbox" 
                        checked={noInscription} 
                        onChange={(e) => setNoInscription(e.target.checked)} 
                      />
                      <span>No writing on cake (keep design clean)</span>
                    </label>
                  </div>
                  
                  {!noInscription ? (
                    <div className="input-with-counter">
                      <input 
                        type="text"
                        maxLength={55}
                        value={inscription}
                        onChange={(e) => setInscription(e.target.value)}
                        placeholder="e.g. Happy 30th Birthday Brian! or Welcome Baby Noah"
                        className="form-text-input"
                      />
                      <span className="char-counter">{55 - inscription.length} chars left</span>
                    </div>
                  ) : (
                    <div className="clean-design-notice">
                      <span>✓ We will keep the cake surface completely clean and elegant. You can optionally include a handwritten greeting card in Step 4.</span>
                    </div>
                  )}
                </div>

                {/* Design Photo / Reference Upload */}
                <div className="step-subblock">
                  <div className="subblock-header-row">
                    <h3 className="subblock-heading">2. Upload Cake Design Photo (Optional)</h3>
                    <span className="subblock-badge">Auto-deleted after 7 days</span>
                  </div>
                  {referenceImage ? (
                    <div className="uploaded-preview-box">
                      <img src={referenceImage} alt="Reference Preview" className="preview-thumb" />
                      <div className="preview-meta">
                        <span className="preview-title">
                          {uploadingImage ? 'Uploading Photo...' : 'Reference Image Attached'}
                        </span>
                        <p className="preview-hint">
                          {referenceImageUrl
                            ? 'Uploaded securely — our decorator will review it (auto-deleted after 7 days).'
                            : 'Our head decorator will review this design to prepare your exact quote.'}
                        </p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          setReferenceImage(null);
                          setReferenceImageUrl('');
                        }} 
                        className="preview-remove-btn"
                        aria-label="Remove image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="file-upload-dropzone">
                      <Upload size={24} className="upload-icon" />
                      <span className="upload-text">Upload Cake Design or Pinterest Photo</span>
                      <span className="upload-sub">PNG, JPG, or WEBP up to 10MB</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="file-hidden-input" 
                      />
                    </label>
                  )}
                </div>

                {/* Creative Notes */}
                <div className="step-subblock">
                  <div className="subblock-header-row">
                    <h3 className="subblock-heading">3. Design &amp; Theme Notes (Optional)</h3>
                  </div>
                  <textarea 
                    rows={3}
                    value={colorSchemeNotes}
                    onChange={(e) => setColorSchemeNotes(e.target.value)}
                    placeholder="e.g. Sage green and champagne gold palette, delicate baby breath flowers, not overly sweet..."
                    className="form-textarea-input"
                  />
                </div>
              </section>
            )}

            {/* STEP 4: Personal Details, Delivery Schedule & Single Submit Action */}
            {currentStep === 4 && (
              <section className="step-view-section">
                {/* Fulfillment Mode */}
                <div className="step-subblock">
                  <h3 className="subblock-heading">1. Delivery or Pickup</h3>
                  <div className="fulfillment-toggle-row">
                    <button
                      type="button"
                      className={`fulfill-btn ${fulfillmentMode === 'delivery' ? 'active' : ''}`}
                      onClick={() => setFulfillmentMode('delivery')}
                    >
                      <MapPin size={16} />
                      <span>Doorstep Delivery Across Nairobi</span>
                    </button>
                    <button
                      type="button"
                      className={`fulfill-btn ${fulfillmentMode === 'pickup' ? 'active' : ''}`}
                      onClick={() => setFulfillmentMode('pickup')}
                    >
                      <ShieldCheck size={16} />
                      <span>Studio Pickup (Kamakis Eastern Bypass)</span>
                    </button>
                  </div>

                  {fulfillmentMode === 'delivery' && (
                    <div className="field-group full-width" style={{ marginTop: '14px' }}>
                      <label>Delivery Address (Estate, Road &amp; House / Apt)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Kilimani, Wood Avenue, Apex Apartments Flat 4B"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="form-text-input"
                      />
                    </div>
                  )}
                </div>

                {/* Target Date & Slot */}
                <div className="step-subblock">
                  <h3 className="subblock-heading">2. Celebration Date &amp; Time Slot</h3>
                  <div className="schedule-two-col">
                    <div className="field-group">
                      <label htmlFor="custom-celebration-date">Target Celebration Date *</label>
                      <div className="custom-date-wrap">
                        <Calendar size={16} className="custom-date-icon" />
                        <input 
                          id="custom-celebration-date"
                          type="date" 
                          min={minDeliveryDate}
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch {} }}
                          className="form-text-input custom-date-input"
                          required
                        />
                      </div>
                    </div>
                    <div className="field-group">
                      <label htmlFor="custom-delivery-slot">Preferred Delivery / Pickup Slot</label>
                      <div className="custom-slot-select-wrap">
                        <Clock size={16} className="custom-slot-icon" />
                        <select
                          id="custom-delivery-slot"
                          value={deliverySlot}
                          onChange={(e) => setDeliverySlot(e.target.value)}
                          className="form-select-input custom-slot-select"
                        >
                          {DELIVERY_SLOTS.map((s) => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="step-subblock">
                  <h3 className="subblock-heading">3. Your Contact Information</h3>
                  <div className="schedule-two-col">
                    <div className="field-group">
                      <label>Your Name *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Grace Wanjiku"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="form-text-input"
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>Phone / WhatsApp Number *</label>
                      <input 
                        type="tel" 
                        placeholder="e.g. 0712 345 678"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="form-text-input"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Single Submit Request Action (Unified) */}
                <div className="single-submit-wrap">
                  <button 
                    type="button" 
                    className="action-btn-submit-main"
                    onClick={handleSubmitOrder}
                    disabled={!canProceed()}
                  >
                    <Send size={18} />
                    <span>Submit Request</span>
                  </button>
                </div>
                <p className="final-guarantee-note">
                  Zero payment required now. Your request is sent directly to our WhatsApp bakery team for immediate quote review &amp; design confirmation.
                </p>
              </section>
            )}

            {/* Bottom Stepper Navigation Bar */}
            <div className="step-bottom-nav">
              {currentStep > 1 ? (
                <button type="button" className="nav-back-btn" onClick={handleBack}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
              ) : <div />}

              {currentStep < 4 ? (
                <div className="nav-forward-group">
                  <span className="next-step-hint">
                    Next: {stepTitles[currentStep]}
                  </span>
                  <button 
                    type="button" 
                    className="nav-continue-btn"
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    <span>Continue</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : null}
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Quick Configurator Sidebar */}
          <aside className="custom-app-sidebar-col">
            <div className="quick-configurator-card">
              
              {/* Header */}
              <div className="configurator-header">
                <div className="config-header-top">
                  <span className="config-label">Custom Order</span>
                  <span className="config-step-pill">Step {currentStep} of 4</span>
                </div>
                <h2 className="config-main-title">Plan your cake in 2 minutes.</h2>
                <p className="config-main-sub">
                  Select your theme, size, and flavors. We review your specifications and share an exact tailored quote directly on WhatsApp!
                </p>
              </div>

              {/* Vertical Step Progress List */}
              <div className="config-steps-list">
                
                {/* Step 1 Row */}
                <div 
                  className={`config-step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(1)}
                >
                  <div className="step-pill-badge">Step 1</div>
                  <div className="step-details">
                    <span className="step-title">Celebration Theme</span>
                    <span className="step-summary">{resolvedStyleName}</span>
                  </div>
                  {currentStep > 1 && <Check size={16} className="step-done-icon" />}
                </div>

                {/* Step 2 Row */}
                <div 
                  className={`config-step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(2)}
                >
                  <div className="step-pill-badge">Step 2</div>
                  <div className="step-details">
                    <span className="step-title">Size, Flavor &amp; Fillings</span>
                    <span className="step-summary">
                      {selectedSize.weight} • {selectedFlavors.map(f => f.split(' ')[0]).join(' + ')}
                    </span>
                  </div>
                  {currentStep > 2 && <Check size={16} className="step-done-icon" />}
                </div>

                {/* Step 3 Row */}
                <div 
                  className={`config-step-item ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(3)}
                >
                  <div className="step-pill-badge">Step 3</div>
                  <div className="step-details">
                    <span className="step-title">Personalization</span>
                    <span className="step-summary">
                      {extrasCount > 0 ? `${extrasCount} add-on${extrasCount > 1 ? 's' : ''}` : 'No extras'} • {noInscription ? 'Clean cake' : (inscription ? `"${inscription.slice(0, 15)}..."` : 'Standard design')}
                    </span>
                  </div>
                  {currentStep > 3 && <Check size={16} className="step-done-icon" />}
                </div>

                {/* Step 4 Row */}
                <div 
                  className={`config-step-item ${currentStep === 4 ? 'active' : ''}`}
                  onClick={() => setCurrentStep(4)}
                >
                  <div className="step-pill-badge">Step 4</div>
                  <div className="step-details">
                    <span className="step-title">Personal &amp; Delivery Details</span>
                    <span className="step-summary">
                      {fulfillmentMode === 'pickup' ? 'Studio Pickup (Kamakis Ruiru)' : `Delivery: ${DELIVERY_ZONES.find(z => z.id === selectedZone)?.name?.split('/')[0]}`}
                    </span>
                  </div>
                </div>

              </div>

              {/* Pricing & Consultation Status Box */}
              <div className="config-quote-status-box">
                <span className="quote-status-label">PRICING &amp; QUOTE</span>
                <span className="quote-status-value">Shared Upon Review</span>
                <span className="quote-status-guarantee">✓ 100% Free Consultation • Fast response in 15–30 mins</span>
              </div>

              {/* Sidebar Action Button */}
              {currentStep < 4 ? (
                <div className="config-sidebar-action">
                  <span className="sidebar-action-hint">Next: {stepTitles[currentStep]}</span>
                  <button 
                    type="button"
                    className="sidebar-continue-btn"
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    <span>Continue</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="config-sidebar-action">
                  <button 
                    type="button"
                    className="sidebar-confirm-btn"
                    onClick={handleSubmitOrder}
                    disabled={!canProceed()}
                  >
                    <Send size={16} />
                    <span>Submit Request</span>
                  </button>
                </div>
              )}

            </div>
          </aside>

        </div>
      </main>

      {/* PreFooter CTA */}
      <PreFooterCta />
    </div>
  );
}
