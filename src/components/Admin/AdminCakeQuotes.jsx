import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, CheckCircle2, Clock, Phone, Mail, Calendar, 
  MapPin, MessageCircle, DollarSign, RefreshCw, AlertCircle, Eye,
  Edit2, Check, X, Tag, ChevronDown, Send, ArrowRight
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { API_BASE } from '../../config/api';
import './AdminCakeOrders.css';

export default function AdminCakeQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quotedAmountInput, setQuotedAmountInput] = useState('');
  const [quoteStatusInput, setQuoteStatusInput] = useState('quoted');
  const [actionNotice, setActionNotice] = useState('');
  
  // Inline price editing state
  const [editingQuoteRef, setEditingQuoteRef] = useState(null);
  const [inlinePrice, setInlinePrice] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    let storedAdmin = null;
    try {
      const stored = localStorage.getItem('fomo_admin');
      if (stored) storedAdmin = JSON.parse(stored);
    } catch {}
    if (!storedAdmin) {
      storedAdmin = {
        id: 1,
        email: 'carol@lanycakeshop.co.ke',
        full_name: 'Carol Jenny (Lany Cakes Studio)'
      };
      localStorage.setItem('fomo_admin', JSON.stringify(storedAdmin));
      localStorage.setItem('fomo_admin_token', 'lany-studio-dev');
    }
    setAdmin(storedAdmin);
    fetchQuotes();
  }, [navigate]);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/cake-orders/admin/quotes`);
      const data = await res.json();
      if (data.success) {
        setQuotes(data.quotes || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin cake quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuote = async (quoteRef, status, amount) => {
    try {
      const payload = {};
      if (status) payload.status = status;
      if (amount !== undefined && amount !== '') {
        payload.quotedAmount = Number(amount);
      }

      const res = await fetch(`${API_BASE}/api/cake-orders/admin/quotes/${quoteRef}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        const amountDisplay = amount ? `at KSh ${Number(amount).toLocaleString()}` : '';
        setActionNotice(`Quotation #${quoteRef} updated ${amountDisplay} (${status || 'saved'}).`);
        setTimeout(() => setActionNotice(''), 3500);

        setQuotes(prev => prev.map(q => {
          if (q.quote_ref === quoteRef) {
            return {
              ...q,
              status: status || q.status,
              quoted_amount: amount !== undefined && amount !== '' ? Number(amount) : q.quoted_amount
            };
          }
          return q;
        }));

        if (selectedQuote && selectedQuote.quote_ref === quoteRef) {
          setSelectedQuote(prev => ({
            ...prev,
            status: status || prev.status,
            quoted_amount: amount !== undefined && amount !== '' ? Number(amount) : prev.quoted_amount
          }));
        }

        setEditingQuoteRef(null);
        setInlinePrice('');
      }
    } catch (err) {
      alert('Could not update quotation price.');
    }
  };

  const handleStartInlineEdit = (quote) => {
    setEditingQuoteRef(quote.quote_ref);
    setInlinePrice(quote.quoted_amount ? String(quote.quoted_amount) : '');
  };

  const handleSaveInlineEdit = (quoteRef, currentStatus) => {
    if (!inlinePrice) {
      setEditingQuoteRef(null);
      return;
    }
    // Automatically transition to 'quoted' if was pending
    const newStatus = (!currentStatus || currentStatus === 'pending') ? 'quoted' : currentStatus;
    updateQuote(quoteRef, newStatus, inlinePrice);
  };

  return (
    <AdminLayout admin={admin}>
      <div className="admin-cake-orders-page">
        {/* Header */}
        <div className="admin-orders-header">
          <div>
            <h1>Inquiries &amp; Quotations</h1>
            <p>Review bespoke customer requests, contact clients, and update agreed quotation pricing in real time.</p>
          </div>
          <button 
            type="button" 
            className="admin-refresh-orders-btn"
            onClick={fetchQuotes}
            title="Refresh Inquiries"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>

        {actionNotice && (
          <div className="admin-action-notice" style={{ marginBottom: '18px' }}>
            <CheckCircle2 size={16} />
            <span>{actionNotice}</span>
          </div>
        )}

        {loading ? (
          <div className="admin-loading-state">Loading quotation requests...</div>
        ) : quotes.length === 0 ? (
          <div className="admin-empty-state">
            <FileText size={42} />
            <h3>No quotation requests yet</h3>
            <p>Customers requesting quotes on wedding &amp; corporate cakes will appear here.</p>
          </div>
        ) : (
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Quote Ref</th>
                  <th>Customer</th>
                  <th>Occasion &amp; Tiers</th>
                  <th>Guests</th>
                  <th>Event Date</th>
                  <th style={{ minWidth: '180px' }}>Agreed / Quoted Price</th>
                  <th>Inquiry Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map(q => {
                  const isEditingThis = editingQuoteRef === q.quote_ref;
                  const hasPrice = Number(q.quoted_amount) > 0;
                  const cleanPhone = (q.phone || '').replace(/\D/g, '');
                  const intlPhone = cleanPhone.startsWith('0') ? '254' + cleanPhone.slice(1) : (cleanPhone.startsWith('254') ? cleanPhone : '254' + cleanPhone);
                  
                  const waText = hasPrice 
                    ? `Hello ${q.customer_name}! Master baker Carol Jenny here from Lany Studio regarding your ${q.occasion} cake inquiry (#${q.quote_ref}). Following our discussion, your confirmed quotation is KSh ${Number(q.quoted_amount).toLocaleString()}. Would you like us to reserve your event date for ${q.event_date}?`
                    : `Hello ${q.customer_name}! Master baker Carol Jenny from Lany Studio regarding your ${q.occasion} cake inquiry (#${q.quote_ref}). We'd love to finalize your design details and provide you with an exact quotation!`;

                  return (
                    <tr key={q.quote_ref} className={isEditingThis ? 'selected-row' : ''}>
                      <td>
                        <span className="order-ref-pill">#{q.quote_ref}</span>
                        <span className="order-time-sub">{q.created_at?.slice(0, 10)}</span>
                      </td>
                      <td>
                        <strong>{q.customer_name}</strong>
                        <div className="order-phone-sub">
                          <Phone size={12} />
                          <span>{q.phone}</span>
                        </div>
                      </td>
                      <td>
                        <strong>{q.occasion}</strong>
                        <span className="order-slot-sub">{q.tier_structure}</span>
                      </td>
                      <td>
                        <span>{q.guest_count || 'Unspecified'}</span>
                      </td>
                      <td>
                        <div className="order-date-pill">
                          <Calendar size={13} />
                          <span>{q.event_date}</span>
                        </div>
                      </td>

                      {/* ─── INLINE QUOTED PRICE CELL ─── */}
                      <td>
                        {isEditingThis ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ position: 'relative', width: '92px' }}>
                              <span style={{ position: 'absolute', left: '6px', top: '7px', fontSize: '10px', fontWeight: 800, color: '#7A152F' }}>
                                KSh
                              </span>
                              <input
                                type="number"
                                autoFocus
                                placeholder="18500"
                                value={inlinePrice}
                                onChange={e => setInlinePrice(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSaveInlineEdit(q.quote_ref, q.status);
                                  if (e.key === 'Escape') setEditingQuoteRef(null);
                                }}
                                style={{
                                  width: '100%',
                                  height: '30px',
                                  padding: '0 4px 0 28px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  border: '2px solid #7A152F',
                                  borderRadius: '6px',
                                  outline: 'none'
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSaveInlineEdit(q.quote_ref, q.status)}
                              title="Save Price"
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '6px',
                                background: '#059669',
                                color: '#fff',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <Check size={13} strokeWidth={2.5} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingQuoteRef(null)}
                              title="Cancel"
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '6px',
                                background: '#E5E7EB',
                                color: '#4B5563',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : hasPrice ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong className="order-total-price" style={{ color: '#7A152F' }}>
                              KSh {Number(q.quoted_amount).toLocaleString()}
                            </strong>
                            <button
                              type="button"
                              onClick={() => handleStartInlineEdit(q)}
                              title="Update price"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#6B7280',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                            >
                              <Edit2 size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartInlineEdit(q)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              background: '#FFF0F3',
                              color: '#7A152F',
                              border: '1px solid rgba(122, 21, 47, 0.2)',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Tag size={12} />
                            <span>+ Set Price</span>
                          </button>
                        )}
                      </td>

                      {/* ─── INTERACTIVE STATUS SELECTOR ─── */}
                      <td>
                        <select
                          value={q.status || 'pending'}
                          onChange={e => updateQuote(q.quote_ref, e.target.value, q.quoted_amount)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            outline: 'none',
                            textTransform: 'uppercase',
                            background: q.status === 'confirmed' ? '#ECFDF5' : (q.status === 'quoted' ? '#FFF0F3' : (q.status === 'contacted' ? '#EFF6FF' : '#FEF3C7')),
                            color: q.status === 'confirmed' ? '#065F46' : (q.status === 'quoted' ? '#7A152F' : (q.status === 'contacted' ? '#1E40AF' : '#92400E')),
                            border: '1px solid currentColor'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="quoted">Quoted</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* ─── ACTION BUTTONS ─── */}
                      <td>
                        <div className="order-actions-cell" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            className="view-order-btn"
                            title="Update Price & Details"
                            onClick={() => {
                              setSelectedQuote(q);
                              setQuotedAmountInput(q.quoted_amount ? String(q.quoted_amount) : '');
                              setQuoteStatusInput(q.status || 'quoted');
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              background: '#7A152F',
                              color: '#fff',
                              borderRadius: '6px',
                              border: 'none',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <DollarSign size={13} />
                            <span>Update Price</span>
                          </button>

                          <button
                            type="button"
                            className="view-order-btn"
                            title="Review Requirements"
                            onClick={() => {
                              setSelectedQuote(q);
                              setQuotedAmountInput(q.quoted_amount ? String(q.quoted_amount) : '');
                              setQuoteStatusInput(q.status || 'quoted');
                            }}
                          >
                            <Eye size={14} />
                          </button>

                          <a
                            href={`https://wa.me/${intlPhone}?text=${encodeURIComponent(waText)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="wa-order-btn"
                            title="Chat with client on WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── REVIEW / UPDATE QUOTATION MODAL DRAWER ─── */}
        {selectedQuote && (
          <div className="admin-order-modal-overlay" onClick={() => setSelectedQuote(null)}>
            <div className="admin-order-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
              <div className="modal-header">
                <div>
                  <span className="modal-ref-tag">Inquiry #{selectedQuote.quote_ref}</span>
                  <h3>{selectedQuote.customer_name}</h3>
                </div>
                <button type="button" className="close-btn" onClick={() => setSelectedQuote(null)}>&times;</button>
              </div>

              <div className="modal-body">
                {/* Requirements Summary */}
                <div className="modal-card">
                  <h4>Client Requirements</h4>
                  <div className="modal-grid-2">
                    <div><strong>Occasion:</strong> {selectedQuote.occasion}</div>
                    <div><strong>Event Date:</strong> {selectedQuote.event_date}</div>
                    <div><strong>Guests:</strong> {selectedQuote.guest_count || 'Not specified'}</div>
                    <div><strong>Tier Structure:</strong> {selectedQuote.tier_structure || 'Standard'}</div>
                    <div><strong>Venue:</strong> {selectedQuote.delivery_location || 'Not specified'}</div>
                    <div><strong>Phone:</strong> {selectedQuote.phone}</div>
                    <div className="full-span"><strong>Email:</strong> {selectedQuote.email || 'None'}</div>
                    {selectedQuote.notes && (
                      <div className="full-span modal-notes-box">
                        <strong>Design &amp; Theme Notes:</strong> {selectedQuote.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing & Status Section */}
                <div className="modal-card" style={{ background: '#FFFDF9', border: '1.5px solid #F3E8E2' }}>
                  <h4 style={{ color: '#7A152F', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={16} />
                    <span>Update Agreed Price &amp; Status</span>
                  </h4>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 12px' }}>
                    Once you discuss design specs with {selectedQuote.customer_name}, update the price here and send the confirmed estimate.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '4px' }}>
                        Agreed Price (KSh)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 24000"
                        value={quotedAmountInput}
                        onChange={e => setQuotedAmountInput(e.target.value)}
                        style={{
                          width: '100%',
                          height: '40px',
                          padding: '0 12px',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 700
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '4px' }}>
                        Inquiry Status
                      </label>
                      <select
                        value={quoteStatusInput}
                        onChange={e => setQuoteStatusInput(e.target.value)}
                        style={{
                          width: '100%',
                          height: '40px',
                          padding: '0 10px',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <option value="pending">Pending Review</option>
                        <option value="contacted">Contacted Client</option>
                        <option value="quoted">Quoted &amp; Awaiting Response</option>
                        <option value="confirmed">Confirmed &amp; Reserved</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Shortcut Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>Quick Presets:</span>
                    {[3800, 5500, 8500, 12000, 18500, 25000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setQuotedAmountInput(String(amt))}
                        style={{
                          background: '#F3F4F6',
                          border: '1px solid #E5E7EB',
                          borderRadius: '999px',
                          padding: '2px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#374151',
                          cursor: 'pointer'
                        }}
                      >
                        KSh {amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        height: '42px',
                        background: '#7A152F',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onClick={() => {
                        updateQuote(selectedQuote.quote_ref, quoteStatusInput, quotedAmountInput);
                        setSelectedQuote(null);
                      }}
                    >
                      <Check size={16} />
                      <span>Save &amp; Update Price</span>
                    </button>

                    <button
                      type="button"
                      style={{
                        height: '42px',
                        padding: '0 16px',
                        background: '#25D366',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onClick={() => {
                        updateQuote(selectedQuote.quote_ref, 'quoted', quotedAmountInput);
                        const cleanPhone = (selectedQuote.phone || '').replace(/\D/g, '');
                        const intlPhone = cleanPhone.startsWith('0') ? '254' + cleanPhone.slice(1) : (cleanPhone.startsWith('254') ? cleanPhone : '254' + cleanPhone);
                        const amountStr = quotedAmountInput ? `KSh ${Number(quotedAmountInput).toLocaleString()}` : '';
                        const text = `Hello ${selectedQuote.customer_name}! Master baker Carol Jenny here from Lany Studio regarding your ${selectedQuote.occasion} cake inquiry (#${selectedQuote.quote_ref}). Following our discussion, your confirmed quotation estimate is ${amountStr}. Please let us know if you would like us to reserve your event date!`;
                        window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                    >
                      <MessageCircle size={15} />
                      <span>Send on WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
