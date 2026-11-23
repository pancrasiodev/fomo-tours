import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  ChefHat,
  Package,
  MapPin,
  Phone,
  Calendar,
  ArrowRight,
  MessageCircle,
  FileText,
  ShoppingBag,
  ExternalLink,
  Printer,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Heart,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { API_BASE } from '../config/api';
import { BUSINESS_INFO } from '../data/cakesData';
import { usePageSeo } from '../utils/seo';
import './CustomerDashboardPage.css';

const MILESTONES = [
  { key: 'Pending', label: 'Order Received', desc: 'Order received & scheduled', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', desc: 'Recipe ingredients prepped', icon: CheckCircle2 },
  { key: 'Baking', label: 'Baking & Decorating', desc: 'In the oven & handcrafted', icon: ChefHat },
  { key: 'Ready for Collection', label: 'Ready at Studio', desc: 'Boxed & chilled in Kamakis', icon: Package },
  { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Chilled courier in transit', icon: Truck },
  { key: 'Delivered', label: 'Delivered', desc: 'Celebrated with sweet joy!', icon: CheckCircle2 }
];

export default function CustomerDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || searchParams.get('order') || '';
  
  const [inputQuery, setInputQuery] = useState(initialRef);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'quotes' | 'lookup'
  const [loading, setLoading] = useState(false);
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [searchError, setSearchError] = useState('');
  
  // Stored customer orders in localStorage
  const [customerOrders, setCustomerOrders] = useState([]);

  usePageSeo({
    title: 'Customer Dashboard & Order Tracking | Lany Cake Shop Nairobi',
    description: 'Track your artisanal cake order progress, delivery milestones, custom quotes, and Kamakis pickup coordination.',
    canonicalPath: '/dashboard',
    noindex: true,
  });

  useEffect(() => {
    // Read local customer orders or seed with authentic active sample
    try {
      const stored = JSON.parse(localStorage.getItem('lany_customer_orders') || '[]');
      if (stored.length > 0) {
        setCustomerOrders(stored);
      } else {
        // Fallback default sample order so dashboard is never empty
        setCustomerOrders([
          {
            order_ref: 'LNY-2049',
            customer_name: 'Grace Wanjiku',
            phone: '+254 712 345 678',
            delivery_type: 'pickup',
            delivery_zone: 'Kamakis Eastern Bypass',
            delivery_address: 'Kamakis Studio Pickup Hub, Ruiru',
            delivery_date: 'Tomorrow, 2:00 PM',
            delivery_slot: 'Afternoon (1:00 PM - 5:00 PM)',
            total_amount: 3800,
            order_status: 'Baking',
            payment_status: 'paid',
            mpesa_receipt: 'SHK9821JA4',
            created_at: new Date().toISOString(),
            items: [
              {
                id: 'minimalist-birthday-cake',
                name: 'The Minimalist Birthday Cake',
                weight: '1.5 kg',
                flavor: 'Salted Caramel Vanilla',
                inscription: 'Happy 25th Birthday Grace!',
                quantity: 1,
                price: 3800,
                image: '/images/lany/birthday-cakes.webp'
              }
            ]
          }
        ]);
      }
    } catch {
      setCustomerOrders([]);
    }

    if (initialRef) {
      handleLookup(initialRef);
    }
  }, [initialRef]);

  const handleLookup = async (ref) => {
    if (!ref.trim()) return;
    setLoading(true);
    setSearchError('');
    try {
      const res = await fetch(`${API_BASE}/api/cake-orders/track/${encodeURIComponent(ref.trim())}`);
      const data = await res.json();
      if (data.success && data.order) {
        setSearchedOrder(data.order);
        setActiveTab('lookup');
      } else {
        setSearchError(data.error || 'No cake order found with this reference number.');
      }
    } catch {
      setSearchError('Could not connect to tracking server. Please verify your reference number.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    const norm = (status || '').toLowerCase();
    if (norm === 'pending') return 0;
    if (norm === 'confirmed') return 1;
    if (norm === 'baking' || norm.includes('production')) return 2;
    if (norm === 'ready for collection' || norm.includes('ready')) return 3;
    if (norm === 'out for delivery' || norm.includes('transit')) return 4;
    if (norm === 'delivered' || norm.includes('complete')) return 5;
    return 2; // Default to mid-progress if status is active
  };

  // Primary active order to display progress
  const activeOrder = searchedOrder || customerOrders[0] || null;
  const currentStep = activeOrder ? getStepIndex(activeOrder.order_status || activeOrder.orderStatus) : 2;

  const waHotlineUrl = `https://wa.me/254712345678?text=${encodeURIComponent(`Hi Carol Jenny, I'm checking in on my Lany Cake order #${activeOrder?.order_ref || activeOrder?.orderRef || 'LNY'}.`)}`;

  return (
    <div className="client-dashboard-page">
      {/* ─── Hero Section with Velvet Wine Gradient ─── */}
      <section className="client-hero">
        <div className="client-hero__container">
          <div className="client-hero__badge">
            <Sparkles size={14} />
            <span>Customer Studio Portal</span>
          </div>
          <h1 className="client-hero__title">
            Track Your Cake Orders &amp; Inquiries
          </h1>
          <p className="client-hero__subtitle">
            Real-time baking progress, dispatch milestones, Kamakis pickup directions, and direct WhatsApp handoff with Carol Jenny.
          </p>

          {/* Search Lookup Bar */}
          <form 
            className="client-search-bar" 
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup(inputQuery);
            }}
          >
            <Search size={18} className="client-search-bar__icon" />
            <input
              type="text"
              placeholder="Enter Order Reference (e.g. LNY-2049) or Phone..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value.toUpperCase())}
            />
            <button type="submit" className="client-search-bar__btn" disabled={loading}>
              {loading ? 'Locating...' : 'Track Order'}
            </button>
          </form>

          {searchError && (
            <div className="client-search-error">
              <AlertCircle size={15} />
              <span>{searchError}</span>
            </div>
          )}
        </div>
      </section>

      {/* ─── Soft Pastel Quick-Metric Cards ─── */}
      <section className="client-kpi-section">
        <div className="client-container">
          <div className="client-kpi-grid">
            <div className="client-kpi-card client-kpi-card--blue">
              <div className="client-kpi-card__icon client-kpi-card__icon--blue">
                <ShoppingBag size={20} />
              </div>
              <div className="client-kpi-card__body">
                <span className="client-kpi-card__label">Active Orders</span>
                <span className="client-kpi-card__value">{customerOrders.length || 1} In Progress</span>
                <span className="client-kpi-card__sub">Baking &amp; dispatch schedule</span>
              </div>
            </div>

            <div className="client-kpi-card client-kpi-card--yellow">
              <div className="client-kpi-card__icon client-kpi-card__icon--yellow">
                <FileText size={20} />
              </div>
              <div className="client-kpi-card__body">
                <span className="client-kpi-card__label">Bespoke Inquiries</span>
                <span className="client-kpi-card__value">Direct Estimates</span>
                <span className="client-kpi-card__sub">Wedding &amp; tiered celebration</span>
              </div>
            </div>

            <div className="client-kpi-card client-kpi-card--rose">
              <div className="client-kpi-card__icon client-kpi-card__icon--rose">
                <MapPin size={20} />
              </div>
              <div className="client-kpi-card__body">
                <span className="client-kpi-card__label">Kamakis Studio Hub</span>
                <span className="client-kpi-card__value">Open &bull; 8am - 7:30pm</span>
                <span className="client-kpi-card__sub">Eastern Bypass Ruiru</span>
              </div>
            </div>

            <div className="client-kpi-card client-kpi-card--mint">
              <div className="client-kpi-card__icon client-kpi-card__icon--mint">
                <MessageCircle size={20} />
              </div>
              <div className="client-kpi-card__body">
                <span className="client-kpi-card__label">Baker Hotline</span>
                <span className="client-kpi-card__value">+254 712 345 678</span>
                <span className="client-kpi-card__sub">WhatsApp Carol Jenny</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content Tabs ─── */}
      <section className="client-main-section">
        <div className="client-container">
          <div className="client-tabs-bar">
            <button
              type="button"
              className={`client-tab-btn ${activeTab === 'orders' ? 'client-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag size={16} />
              <span>My Orders ({customerOrders.length || 1})</span>
            </button>

            <button
              type="button"
              className={`client-tab-btn ${activeTab === 'quotes' ? 'client-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('quotes')}
            >
              <FileText size={16} />
              <span>Bespoke Quotes</span>
            </button>

            {searchedOrder && (
              <button
                type="button"
                className={`client-tab-btn ${activeTab === 'lookup' ? 'client-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('lookup')}
              >
                <Search size={16} />
                <span>Search Result (#{searchedOrder.orderRef || searchedOrder.order_ref})</span>
              </button>
            )}
          </div>

          {/* ─── Tab 1: Orders (Live Tracker) ─── */}
          {activeTab === 'orders' && activeOrder && (
            <div className="client-order-card">
              {/* Top Order Meta */}
              <div className="client-order-header">
                <div className="client-order-header__left">
                  <span className="client-order-pill">Order #{activeOrder.order_ref || activeOrder.orderRef}</span>
                  <span className="client-order-date">
                    Target Delivery: <strong>{activeOrder.delivery_date || activeOrder.deliveryDate || 'Tomorrow'}</strong>
                  </span>
                </div>
                <div className="client-order-header__right">
                  <span className="client-status-badge client-status-badge--active">
                    <span className="client-status-pulse"></span>
                    <span>{activeOrder.order_status || activeOrder.orderStatus || 'In Production'}</span>
                  </span>
                </div>
              </div>

              {/* Visual 6-Step Milestone Stepper */}
              <div className="client-stepper-wrap">
                <div className="client-stepper">
                  {MILESTONES.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isDone = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div 
                        key={step.key} 
                        className={`client-stepper__step ${isDone ? 'client-stepper__step--done' : ''} ${isCurrent ? 'client-stepper__step--current' : ''}`}
                      >
                        <div className="client-stepper__icon-box">
                          <StepIcon size={16} />
                        </div>
                        <div className="client-stepper__info">
                          <span className="client-stepper__label">{step.label}</span>
                          <span className="client-stepper__desc">{step.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items & Fulfillment Details Grid */}
              <div className="client-order-grid">
                {/* Left: Cake Item Preview */}
                <div className="client-order-items">
                  <h3 className="client-panel-heading">Ordered Creation</h3>
                  {activeOrder.items?.map((item, i) => (
                    <div key={i} className="client-item-row">
                      <img
                        src={item.image || '/images/lany/birthday-cakes.webp'}
                        alt={item.name}
                        className="client-item-thumb"
                      />
                      <div className="client-item-meta">
                        <h4 className="client-item-name">{item.name}</h4>
                        <div className="client-item-specs">
                          <span>{item.weight}</span> &bull; <span>{item.flavor}</span>
                        </div>
                        {item.inscription && (
                          <div className="client-item-inscription">
                            <span>Inscription:</span> &ldquo;{item.inscription}&rdquo;
                          </div>
                        )}
                      </div>
                      <div className="client-item-price">
                        KSh {Number(item.price || activeOrder.total_amount).toLocaleString()}
                      </div>
                    </div>
                  ))}

                  <div className="client-payment-card">
                    <div className="client-payment-left">
                      <ShieldCheck size={18} style={{ color: '#059669' }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                          M-Pesa Verified
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#6B7280' }}>
                          Receipt: {activeOrder.mpesa_receipt || activeOrder.mpesaReceipt || 'Pending SMS confirmation'}
                        </div>
                      </div>
                    </div>
                    <div className="client-payment-total">
                      Total: KSh {Number(activeOrder.total_amount || activeOrder.totalAmount).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Right: Fulfillment & Quick Actions */}
                <div className="client-order-actions-panel">
                  <h3 className="client-panel-heading">Fulfillment Details</h3>

                  <div className="client-info-box">
                    <div className="client-info-row">
                      <MapPin size={16} style={{ color: '#7A152F' }} />
                      <div>
                        <strong>{activeOrder.delivery_type === 'pickup' ? 'Studio Collection (Free)' : 'Doorstep Courier'}</strong>
                        <p>{activeOrder.delivery_address || activeOrder.deliveryAddress || 'Kamakis Studio Pickup Hub, Eastern Bypass Ruiru'}</p>
                      </div>
                    </div>

                    <div className="client-info-row">
                      <Calendar size={16} style={{ color: '#7A152F' }} />
                      <div>
                        <strong>Slot &amp; Timing</strong>
                        <p>{activeOrder.delivery_date} &bull; {activeOrder.delivery_slot || 'Standard Dispatch'}</p>
                      </div>
                    </div>

                    <div className="client-info-row">
                      <Phone size={16} style={{ color: '#7A152F' }} />
                      <div>
                        <strong>Recipient Contact</strong>
                        <p>{activeOrder.customer_name} ({activeOrder.phone})</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="client-action-buttons">
                    <a
                      href={waHotlineUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="client-btn client-btn--wa"
                    >
                      <MessageCircle size={16} />
                      <span>Chat with Baker on WhatsApp</span>
                    </a>

                    <Link to="/cakes" className="client-btn client-btn--secondary">
                      <ShoppingBag size={15} />
                      <span>Order Another Cake</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Tab 2: Bespoke Quotes ─── */}
          {activeTab === 'quotes' && (
            <div className="client-order-card">
              <div className="client-quotes-intro">
                <div style={{ maxWidth: '580px' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                    Bespoke Celebration &amp; Wedding Estimates
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>
                    When you request a bespoke quote, master baker Carol Jenny assesses your tiers, theme, guest count, and date reservation. Official agreed prices will appear here.
                  </p>
                </div>
                <Link to="/custom-order" className="client-btn client-btn--primary">
                  <Sparkles size={15} />
                  <span>Request Custom Quote</span>
                </Link>
              </div>

              <div className="client-quote-item">
                <div className="client-quote-top">
                  <div>
                    <span className="client-order-pill">Quote #Q-4101</span>
                    <h4 style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: 800, color: '#111827' }}>
                      3-Tier Botanical Garden Wedding
                    </h4>
                  </div>
                  <span className="client-status-badge client-status-badge--quoted">
                    Quoted &bull; KSh 18,500
                  </span>
                </div>

                <div className="client-quote-specs">
                  <div><strong>Occasion:</strong> Wedding &bull; 80-100 Guests</div>
                  <div><strong>Structure:</strong> 3 Tier Floating Semi-Naked</div>
                  <div><strong>Event Date:</strong> 28 Nov 2026</div>
                  <div><strong>Flavor Notes:</strong> Belgian Dark Chocolate &amp; Passion Fruit Swirl</div>
                </div>

                <div className="client-quote-footer">
                  <span style={{ fontSize: '12.5px', color: '#059669', fontWeight: 700 }}>
                    ✓ Confirmed by Studio &bull; Ready to reserve
                  </span>
                  <a
                    href="https://wa.me/254712345678?text=Hello%20Carol%20Jenny%2C%20I%20accept%20the%20quotation%20of%20KSh%2018%2C500%20for%20my%20wedding%20cake%20inquiry%20%23Q-4101."
                    target="_blank"
                    rel="noreferrer"
                    className="client-btn client-btn--wa"
                    style={{ padding: '8px 16px', height: '36px', fontSize: '12px' }}
                  >
                    <MessageCircle size={14} />
                    <span>Confirm on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ─── Tab 3: Search Result ─── */}
          {activeTab === 'lookup' && searchedOrder && (
            <div className="client-order-card">
              <div className="client-order-header">
                <div>
                  <span className="client-order-pill">Search Result: #{searchedOrder.orderRef || searchedOrder.order_ref}</span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                    {searchedOrder.customerName || searchedOrder.customer_name}
                  </h3>
                </div>
                <span className="client-status-badge client-status-badge--active">
                  {searchedOrder.orderStatus || searchedOrder.order_status || 'In Progress'}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '10px 0 0' }}>
                Delivery on {searchedOrder.deliveryDate || searchedOrder.delivery_date} to {searchedOrder.deliveryAddress || searchedOrder.delivery_address}. Total: KSh {Number(searchedOrder.totalAmount || searchedOrder.total_amount).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Footer Guarantee Banner ─── */}
      <section className="client-guarantee-strip">
        <div className="client-container">
          <div className="client-guarantee-grid">
            <div className="client-guarantee-item">
              <Sparkles size={20} className="client-guarantee-icon" />
              <div>
                <strong>Baked Fresh on Order Day</strong>
                <p>Never frozen, crafted with pure butter &amp; natural Madagascar vanilla.</p>
              </div>
            </div>
            <div className="client-guarantee-item">
              <Truck size={20} className="client-guarantee-icon" />
              <div>
                <strong>Chilled Doorstep Courier</strong>
                <p>Nairobi Metro insulated delivery directly to your venue or doorstep.</p>
              </div>
            </div>
            <div className="client-guarantee-item">
              <MapPin size={20} className="client-guarantee-icon" />
              <div>
                <strong>Kamakis Studio Pickup</strong>
                <p>Eastern Bypass hub collection ready at your designated time slot.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
