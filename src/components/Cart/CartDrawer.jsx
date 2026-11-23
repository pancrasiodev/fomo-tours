import { useState, useMemo, useEffect } from 'react';
import { 
  X, Trash2, Plus, Minus, MessageCircle, ShoppingBag, ArrowRight, 
  ArrowLeft, CheckCircle2, ShieldCheck, MapPin, Truck, Calendar, 
  Clock, Phone, User, Mail, AlertCircle, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../utils/cartStore';
import { DELIVERY_ZONES, DELIVERY_SLOTS, BUSINESS_INFO } from '../../data/cakesData';
import { API_BASE } from '../../config/api';
import './CartDrawer.css';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();

  // Multi-step checkout: 1: Cart, 2: Delivery & Contact, 3: Payment
  const [checkoutStep, setCheckoutStep] = useState(1);

  // Fulfillment & Schedule
  const [fulfillmentType, setFulfillmentType] = useState('delivery'); // 'delivery' | 'pickup'
  const [deliveryZone, setDeliveryZone] = useState('westlands_kilimani');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [deliverySlot, setDeliverySlot] = useState('afternoon');

  // Customer Contact Info
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showNoteField, setShowNoteField] = useState(false);

  // Server-side Authoritative Pricing State
  const [serverTotals, setServerTotals] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Payment & Submission State
  const [paymentMethod, setPaymentMethod] = useState('mpesa_stk'); // 'mpesa_stk' | 'whatsapp'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stkPending, setStkPending] = useState(false);
  const [stkStatusMsg, setStkStatusMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Minimum Delivery Date
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Compute local delivery fee (0 when pickup or confirmed on follow-up)
  const deliveryFee = 0;

  const localGrandTotal = totalPrice + deliveryFee;

  // Re-verify totals with the backend pricing engine whenever items or delivery change
  useEffect(() => {
    if (items.length === 0) return;

    let isMounted = true;
    setPricingLoading(true);

    fetch(`${API_BASE}/api/cake-orders/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(i => ({
          cakeId: i.id || i.cakeId,
          name: i.name,
          weight: i.weight,
          flavor: i.flavor,
          filling: i.filling,
          icing: i.icing,
          inscription: i.inscription,
          extras: i.extras || {},
          quantity: i.quantity,
          basePrice: i.price
        })),
        deliveryType: fulfillmentType,
        deliveryZone: deliveryZone
      })
    })
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success && data.totals) {
          setServerTotals(data.totals);
        }
      })
      .catch(() => {
        // Fallback to local
      })
      .finally(() => {
        if (isMounted) setPricingLoading(false);
      });

    return () => { isMounted = false; };
  }, [items, fulfillmentType, deliveryZone]);

  if (!isOpen) return null;

  // Handle Order Submission with Authoritative Server Verification
  const handleProceedOrder = async () => {
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your phone number (e.g. 0712 345 678).');
      return;
    }
    if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Please enter your delivery address / estate in Nairobi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        deliveryType: fulfillmentType,
        deliveryAddress: deliveryAddress.trim(),
        deliveryZone: deliveryZone,
        deliveryDate: deliveryDate,
        deliverySlot: deliverySlot,
        specialInstructions: specialInstructions.trim(),
        paymentMethod: 'Follow-up Payment',
        items: items.map(i => ({
          cakeId: i.id || i.cakeId,
          name: i.name,
          weight: i.weight,
          flavor: i.flavor,
          filling: i.filling,
          icing: i.icing,
          inscription: i.inscription,
          extras: i.extras || {},
          quantity: i.quantity,
          basePrice: i.price
        }))
      };

      const res = await fetch(`${API_BASE}/api/cake-orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error('Unable to reach order server. Please try again or confirm via WhatsApp.');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order.');
      }

      setConfirmedOrder({
        orderRef: data.orderRef,
        totalAmount: data.totals?.finalTotal || localGrandTotal,
        paymentStatus: 'pending_followup',
        customerName: customerName.trim(),
        phone: phone.trim(),
        deliveryDate,
        deliverySlot
      });

      // Clear the local cart
      clearCart();

    } catch (err) {
      console.error('[Cart Order] Submission failed:', err);
      setErrorMessage(err.message || 'Something went wrong. Please try again or order on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Poll for Daraja STK status update
  const pollPaymentStatus = (orderRef, checkoutRequestId) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 12) { // 36 seconds
        clearInterval(interval);
        setStkPending(false);
        setStkStatusMsg('M-Pesa prompt timed out. You can re-prompt or confirm via WhatsApp.');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/cake-orders/track/${orderRef}`);
        const data = await res.json();
        if (data.success && data.order && data.order.paymentStatus === 'paid') {
          clearInterval(interval);
          setStkPending(false);
          setStkStatusMsg('Payment Confirmed! Your cake is now scheduled for baking.');
          setConfirmedOrder(prev => ({
            ...prev,
            paymentStatus: 'paid',
            receipt: data.order.mpesaReceipt
          }));
        }
      } catch {
        // Continue polling
      }
    }, 3000);
  };

  // WhatsApp Order Handoff
  const triggerWhatsAppOrderHandoff = (orderRef, amount) => {
    let text = `*NEW CAKE ORDER - #${orderRef}*\n\n`;
    text += `👤 *Customer:* ${customerName}\n`;
    text += `📞 *Phone:* ${phone}\n`;
    text += `📦 *Fulfillment:* ${fulfillmentType === 'pickup' ? 'Studio Collection (Lany Studio, Kamakis Eastern Bypass)' : `Doorstep Delivery (${deliveryAddress}, ${deliveryZone})`}\n`;
    text += `📅 *Date & Slot:* ${deliveryDate} (${DELIVERY_SLOTS.find(s => s.id === deliverySlot)?.label})\n`;
    text += `💰 *Authoritative Total:* KSh ${amount.toLocaleString()}\n\n`;
    text += `*Items:*\n`;
    items.forEach((item, idx) => {
      text += `${idx + 1}. *${item.name}* (${item.weight})\n`;
      text += `   • Flavor: ${item.flavor} | Filling: ${item.filling || 'Classic'}\n`;
      if (item.inscription) text += `   • Inscription: "${item.inscription}"\n`;
      if (item.extrasList && item.extrasList.length > 0) {
        text += `   • Extras: ${item.extrasList.join(', ')}\n`;
      }
      text += `   • Qty: ${item.quantity} x KSh ${item.price.toLocaleString()}\n`;
    });
    if (specialInstructions) text += `\n📝 *Notes:* ${specialInstructions}\n`;
    text += `\nHello Carol Jenny, I have placed order #${orderRef}. Please confirm baking schedule!`;

    const url = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const finalPayTotal = serverTotals ? serverTotals.finalTotal : localGrandTotal;

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer-content" onClick={e => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <ShoppingBag size={22} className="cart-title-icon" />
            <h3>Your Cake Order</h3>
            <span className="cart-count-badge">{totalItems}</span>
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* ORDER CONFIRMATION VIEW */}
        {confirmedOrder ? (
          <div className="cart-confirmed-view">
            <CheckCircle2 size={54} className="confirmed-icon" />
            <h3>Order Received!</h3>
            <div className="confirmed-ref-badge">
              Order Ref: <strong>#{confirmedOrder.orderRef}</strong>
            </div>
            <p className="confirmed-desc">
              Thank you, {confirmedOrder.customerName}! We have scheduled your fresh bake for{' '}
              <strong>{confirmedOrder.deliveryDate}</strong>. Our team will follow up with you personally on <strong>{confirmedOrder.phone}</strong> to arrange payment.
            </p>

            {stkPending && (
              <div className="stk-prompt-notice">
                <Loader2 size={18} className="spinner" />
                <span>{stkStatusMsg}</span>
              </div>
            )}

            {confirmedOrder.paymentStatus === 'paid' && (
              <div className="stk-success-notice">
                <CheckCircle2 size={18} />
                <span>M-Pesa Payment Confirmed! Receipt: {confirmedOrder.receipt || 'Verified'}</span>
              </div>
            )}

            <div className="confirmed-actions">
              <Link 
                to={`/order-track?ref=${confirmedOrder.orderRef}`} 
                className="confirmed-track-btn"
                onClick={onClose}
              >
                Track Order Progress
              </Link>

              <button
                type="button"
                className="confirmed-wa-btn"
                onClick={() => triggerWhatsAppOrderHandoff(confirmedOrder.orderRef, confirmedOrder.totalAmount)}
              >
                <MessageCircle size={18} />
                <span>Confirm on WhatsApp</span>
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* EMPTY CART VIEW */
          <div className="cart-empty-state">
            <div className="cart-empty-icon"><ShoppingBag size={36} /></div>
            <h4>Your cart is empty</h4>
            <p>Explore our artisan birthday, wedding, and custom cakes freshly baked in Nairobi.</p>
            <Link to="/cakes" className="cart-browse-btn" onClick={onClose}>
              Browse Cake Menu
            </Link>
          </div>
        ) : (
          /* MULTI-STEP CHECKOUT */
          <>
            {/* Step Breadcrumbs */}
            <div className="cart-step-indicator">
              <div className={`step-node ${checkoutStep >= 1 ? 'active' : ''}`}>
                <span className="step-circle">1</span>
                <span className="step-label">Items</span>
              </div>
              <div className="step-divider" />
              <div className={`step-node ${checkoutStep >= 2 ? 'active' : ''}`}>
                <span className="step-circle">2</span>
                <span className="step-label">Delivery</span>
              </div>
              <div className="step-divider" />
              <div className={`step-node ${checkoutStep >= 3 ? 'active' : ''}`}>
                <span className="step-circle">3</span>
                <span className="step-label">Customer Info</span>
              </div>
            </div>

            {errorMessage && (
              <div className="cart-error-banner">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: REVIEW ITEMS */}
            {checkoutStep === 1 && (
              <div className="cart-step-pane">
                <div className="cart-items-list">
                  {items.map(item => (
                    <div key={item.itemKey} className="cart-item-card">
                      <img src={item.image} alt={item.name} className="cart-item-img" />
                      <div className="cart-item-details">
                        <div className="cart-item-row">
                          <h4 className="cart-item-name">{item.name}</h4>
                          <button 
                            className="cart-item-remove"
                            onClick={() => removeFromCart(item.itemKey)}
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="cart-item-meta">
                          <span className="cart-meta-tag">{item.weight}</span>
                          <span className="cart-meta-flavor">{item.flavor}</span>
                        </div>
                        {item.filling && (
                          <div className="cart-meta-sub">Filling: {item.filling}</div>
                        )}
                        {item.inscription && (
                          <p className="cart-item-inscription">
                            <strong>Message:</strong> "{item.inscription}"
                          </p>
                        )}
                        {item.extrasList && item.extrasList.length > 0 && (
                          <div className="cart-item-extras-tags">
                            {item.extrasList.map((extra, eIdx) => (
                              <span key={eIdx} className="cart-extra-pill">{extra}</span>
                            ))}
                          </div>
                        )}
                        <div className="cart-item-bottom">
                          <div className="cart-item-price">
                            KSh {(item.price * item.quantity).toLocaleString()}
                          </div>
                          <div className="cart-item-qty-controls">
                            <button onClick={() => updateQuantity(item.itemKey, -1)} aria-label="Decrease">
                              <Minus size={14} />
                            </button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.itemKey, 1)} aria-label="Increase">
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-pane-footer">
                  <div className="cart-subtotal-row">
                    <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                    <span className="cart-subtotal-val">KSh {totalPrice.toLocaleString()}</span>
                  </div>
                  <button 
                    className="cart-next-btn"
                    onClick={() => setCheckoutStep(2)}
                  >
                    <span>Proceed to Delivery &amp; Contact</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DELIVERY OR PICKUP */}
            {checkoutStep === 2 && (
              <div className="cart-step-pane">
                <div className="cart-form-section">
                  <h4 className="section-head">
                    <Truck size={16} />
                    <span>Do you prefer delivery or pick up?</span>
                  </h4>
                  <div className="fulfillment-toggles">
                    <button
                      type="button"
                      className={`f-toggle ${fulfillmentType === 'delivery' ? 'active' : ''}`}
                      onClick={() => {
                        setFulfillmentType('delivery');
                        setErrorMessage('');
                      }}
                    >
                      <Truck size={16} />
                      <span>Doorstep Delivery</span>
                    </button>
                    <button
                      type="button"
                      className={`f-toggle ${fulfillmentType === 'pickup' ? 'active' : ''}`}
                      onClick={() => {
                        setFulfillmentType('pickup');
                        setErrorMessage('');
                      }}
                    >
                      <MapPin size={16} />
                      <span>Studio Pickup</span>
                    </button>
                  </div>

                  {fulfillmentType === 'delivery' ? (
                    <div className="form-group-fields">
                      <label>Delivery Address (Estate, Road &amp; House / Apt) *</label>
                      <input
                        type="text"
                        placeholder="e.g. Kilimani, Kindaruma Rd, Rose Garden Apt 4B"
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        className="cart-input"
                      />
                    </div>
                  ) : (
                    <div className="cart-order-summary-box" style={{ marginTop: '12px' }}>
                      <h4 style={{ marginBottom: '6px' }}>Studio Pickup Location</h4>
                      <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, color: '#554245' }}>
                        <strong>Lany Cake Shop Studio</strong><br />
                        Kamakis, Eastern Bypass, Ruiru<br />
                        Free collection — we will notify you as soon as your cake is boxed and chilled.
                      </p>
                    </div>
                  )}

                  <h4 className="section-head" style={{ marginTop: '18px' }}>
                    <Calendar size={16} />
                    <span>{fulfillmentType === 'pickup' ? 'Preferred Pickup Schedule' : 'Preferred Delivery Schedule'}</span>
                  </h4>
                  <div className="schedule-stack">
                    <div className="schedule-field">
                      <label htmlFor="cart-delivery-date">{fulfillmentType === 'pickup' ? 'Pickup Date *' : 'Delivery Date *'}</label>
                      <input
                        id="cart-delivery-date"
                        type="date"
                        min={minDate}
                        value={deliveryDate}
                        onChange={e => setDeliveryDate(e.target.value)}
                        onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch {} }}
                        className="cart-input cart-date-input"
                      />
                    </div>
                    <div className="schedule-field">
                      <label>Time Slot *</label>
                      <div className="slot-pills-grid">
                        {DELIVERY_SLOTS.map(slot => (
                          <button
                            key={slot.id}
                            type="button"
                            className={`slot-pill-btn ${deliverySlot === slot.id ? 'active' : ''}`}
                            onClick={() => setDeliverySlot(slot.id)}
                          >
                            <Clock size={14} />
                            <span>{slot.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cart-pane-footer">
                  <div className="cart-footer-buttons">
                    <button 
                      className="cart-back-btn"
                      onClick={() => setCheckoutStep(1)}
                    >
                      <ArrowLeft size={16} />
                      <span>Back</span>
                    </button>
                    <button 
                      className="cart-next-btn"
                      onClick={() => {
                        if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
                          setErrorMessage('Please enter your delivery address / estate in Nairobi.');
                          return;
                        }
                        if (!deliveryDate) {
                          setErrorMessage('Please choose your preferred date.');
                          return;
                        }
                        setErrorMessage('');
                        setCheckoutStep(3);
                      }}
                    >
                      <span>Customer Info</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CUSTOMER CONTACT INFO */}
            {checkoutStep === 3 && (
              <div className="cart-step-pane">
                <div className="cart-form-section">
                  <h4 className="section-head">
                    <User size={16} />
                    <span>Customer Contact Information</span>
                  </h4>
                  <div className="form-group-fields">
                    <label>Your Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Cynthia Moraa"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="cart-input"
                    />

                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 0712 345 678"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="cart-input"
                    />

                    <button
                      type="button"
                      className="cart-note-toggle-btn"
                      onClick={() => setShowNoteField(prev => !prev)}
                    >
                      <Plus size={14} style={{ transform: showNoteField ? 'rotate(45deg)' : 'none', transition: 'transform 0.15s ease' }} />
                      <span>{showNoteField ? 'Hide baking / delivery note' : 'Add baking / delivery note (optional)'}</span>
                    </button>

                    {showNoteField && (
                      <div className="form-group-fields" style={{ marginTop: '4px' }}>
                        <label>Special Baking / Delivery Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Please ring gate bell, call upon arrival"
                          value={specialInstructions}
                          onChange={e => setSpecialInstructions(e.target.value)}
                          className="cart-input"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="cart-order-summary-box" style={{ marginTop: '14px' }}>
                  <div className="summary-line">
                    <span>Items Subtotal:</span>
                    <span>KSh {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="summary-line">
                    <span>{fulfillmentType === 'pickup' ? 'Studio Pickup:' : 'Delivery Fee:'}</span>
                    <span>{fulfillmentType === 'pickup' ? 'FREE' : 'Confirmed on follow-up'}</span>
                  </div>
                  <div className="summary-line total-line">
                    <span>Total:</span>
                    <span className="total-highlight">KSh {totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="cart-pane-footer">
                  <div className="cart-footer-buttons">
                    <button 
                      className="cart-back-btn"
                      onClick={() => setCheckoutStep(2)}
                      disabled={isSubmitting}
                    >
                      <ArrowLeft size={16} />
                      <span>Back</span>
                    </button>
                    <button 
                      className="cart-confirm-order-btn"
                      onClick={handleProceedOrder}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="spinner" />
                          <span>Submitting Order...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Order</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
