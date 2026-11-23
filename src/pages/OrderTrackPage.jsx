import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, CheckCircle2, Clock, Truck, ChefHat, Package, 
  MapPin, Phone, Calendar, ArrowLeft, RefreshCw, AlertCircle 
} from 'lucide-react';
import { API_BASE } from '../config/api';
import { BUSINESS_INFO } from '../data/cakesData';
import './OrderTrackPage.css';

const MILESTONES = [
  { key: 'Pending', label: 'Order Received', desc: 'Awaiting baker confirmation', icon: Clock },
  { key: 'Confirmed', label: 'Order Confirmed', desc: 'Ingredients prepared & scheduled', icon: CheckCircle2 },
  { key: 'Baking', label: 'In the Oven & Decorating', desc: 'Carol Jenny & team crafting design', icon: ChefHat },
  { key: 'Ready for Collection', label: 'Ready for Collection', desc: 'Boxed & chilled in studio', icon: Package },
  { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Chilled courier in transit', icon: Truck },
  { key: 'Delivered', label: 'Delivered & Celebrated', desc: 'Delivered to your celebration', icon: CheckCircle2 }
];

export default function OrderTrackPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const refQuery = searchParams.get('ref') || '';
  const [inputRef, setInputRef] = useState(refQuery);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (ref) => {
    if (!ref.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/cake-orders/track/${encodeURIComponent(ref.trim())}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError(data.error || 'No cake order found with this reference number.');
        setOrder(null);
      }
    } catch (err) {
      setError('Unable to connect to order tracking server. Please check your connection.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (refQuery) {
      fetchOrder(refQuery);
    }
  }, [refQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputRef.trim()) {
      setSearchParams({ ref: inputRef.trim() });
      fetchOrder(inputRef.trim());
    }
  };

  // Resolve step index in milestone progression
  const getStepIndex = (status) => {
    const norm = (status || '').toLowerCase();
    if (norm === 'pending') return 0;
    if (norm === 'confirmed') return 1;
    if (norm === 'baking') return 2;
    if (norm === 'ready for collection') return 3;
    if (norm === 'out for delivery') return 4;
    if (norm === 'delivered') return 5;
    return 0;
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="order-track-page">
      <div className="track-hero-banner">
        <div className="lany-container">
          <span className="section-sub-badge">Live Bakery Status</span>
          <h1 className="track-page-title">Track Your Cake Order</h1>
          <p className="track-page-subtitle">
            Enter your Lany Cakes order reference (e.g. LNY-2049) to see real-time baking and dispatch updates.
          </p>

          <form className="track-search-box" onSubmit={handleSearch}>
            <Search size={20} className="track-search-icon" />
            <input
              type="text"
              placeholder="Enter Order Reference (e.g. LNY-2049)"
              value={inputRef}
              onChange={e => setInputRef(e.target.value.toUpperCase())}
            />
            <button type="submit" className="track-submit-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>
        </div>
      </div>

      <div className="lany-container track-body-container">
        {error && (
          <div className="track-error-card">
            <AlertCircle size={22} />
            <div>
              <h4>Order Not Found</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        {order && (
          <div className="track-results-layout">
            {/* Top Order Card */}
            <div className="track-order-summary-header">
              <div className="track-header-meta">
                <span className="track-ref-badge">#{order.orderRef}</span>
                <h2>{order.customerName}</h2>
                <div className="track-sub-details">
                  <span>Placed: {order.createdAt}</span>
                  <span>&bull;</span>
                  <span>Fulfillment: {order.deliveryType === 'pickup' ? 'Studio Collection' : 'Doorstep Delivery'}</span>
                </div>
              </div>

              <div className="track-status-pill-wrap">
                <span className={`track-order-status-pill ${order.orderStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                  {order.orderStatus}
                </span>
                <button 
                  type="button" 
                  className="track-refresh-btn"
                  onClick={() => fetchOrder(order.orderRef)}
                  title="Refresh status"
                >
                  <RefreshCw size={15} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="track-timeline-card">
              <h3>Baking &amp; Delivery Progress</h3>
              <div className="timeline-stepper">
                {MILESTONES.map((ms, idx) => {
                  const Icon = ms.icon;
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div 
                      key={ms.key} 
                      className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      <div className="step-icon-wrap">
                        <Icon size={18} />
                      </div>
                      <div className="step-info">
                        <h4 className="step-name">{ms.label}</h4>
                        <span className="step-desc">{ms.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Order Items & Fulfillment Card */}
            <div className="track-details-grid">
              {/* Left: Items in Order */}
              <div className="track-card">
                <h3>Items in Your Order</h3>
                <div className="track-items-list">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="track-item-row">
                      <div className="track-item-info">
                        <h4>{item.name}</h4>
                        <div className="track-item-tags">
                          <span>{item.weight}</span>
                          <span>{item.flavor}</span>
                          {item.filling && <span>Filling: {item.filling}</span>}
                        </div>
                        {item.inscription && (
                          <div className="track-item-msg">
                            "{item.inscription}"
                          </div>
                        )}
                        {item.extras && item.extras.length > 0 && (
                          <div className="track-item-extras">
                            {item.extras.join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="track-item-price-qty">
                        <span className="t-qty">x{item.quantity}</span>
                        <span className="t-price">KSh {item.total_price?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="track-financials-card">
                  <div className="f-row">
                    <span>Items Subtotal:</span>
                    <span>KSh {order.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="f-row">
                    <span>Delivery Fee:</span>
                    <span>KSh {order.deliveryFee?.toLocaleString()}</span>
                  </div>
                  <div className="f-row grand-total">
                    <span>Total Amount:</span>
                    <span>KSh {order.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="f-row payment-status-row">
                    <span>Payment Status:</span>
                    <span className={`pay-status-tag ${order.paymentStatus}`}>
                      {order.paymentStatus === 'paid' ? 'Paid & Verified' : 'Pending Payment'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Delivery Information */}
              <div className="track-card">
                <h3>Delivery &amp; Collection Schedule</h3>
                <div className="track-delivery-details">
                  <div className="del-info-row">
                    <Calendar size={18} className="del-icon" />
                    <div>
                      <strong>Target Date:</strong>
                      <p>{order.deliveryDate}</p>
                    </div>
                  </div>

                  <div className="del-info-row">
                    <Clock size={18} className="del-icon" />
                    <div>
                      <strong>Delivery Window:</strong>
                      <p>{order.deliverySlot} Slot</p>
                    </div>
                  </div>

                  <div className="del-info-row">
                    <MapPin size={18} className="del-icon" />
                    <div>
                      <strong>Destination:</strong>
                      <p>
                        {order.deliveryType === 'pickup' 
                          ? 'OJ Ruiru Bakery Studio (Pickup)' 
                          : `${order.deliveryAddress || 'Nairobi Area'} (${order.deliveryZone})`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="del-info-row">
                    <Phone size={18} className="del-icon" />
                    <div>
                      <strong>Contact Number:</strong>
                      <p>{order.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="track-support-card">
                  <h4>Need Assistance with this order?</h4>
                  <p>Our customer coordinator is ready to assist on WhatsApp.</p>
                  <a
                    href={`https://wa.me/${BUSINESS_INFO.whatsapp}?text=Hello%20Carol%20Jenny%2C%20I%20have%20an%20inquiry%20regarding%20my%20order%20%23${order.orderRef}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="track-support-wa-btn"
                  >
                    Chat About Order #{order.orderRef}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
