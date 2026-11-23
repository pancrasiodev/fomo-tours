import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Filter, Clock, CheckCircle2, Truck, 
  ChefHat, Package, AlertCircle, RefreshCw, Eye, MessageCircle, Phone, Calendar,
  DollarSign, ArrowUpRight
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { API_BASE } from '../../config/api';
import { BUSINESS_INFO } from '../../data/cakesData';
import './AdminCakeOrders.css';

const ORDER_STATUSES = [
  'All',
  'Pending',
  'Confirmed',
  'Baking',
  'Ready for Collection',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

export default function AdminCakeOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionNotice, setActionNotice] = useState('');
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
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async (status = statusFilter) => {
    setLoading(true);
    try {
      const q = status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
      const res = await fetch(`${API_BASE}/api/cake-orders/admin/orders${q}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin cake orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    fetchOrders(status);
  };

  const updateOrderStatus = async (orderRef, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/cake-orders/admin/orders/${orderRef}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Order #${orderRef} updated to "${newStatus}"`);
        setTimeout(() => setActionNotice(''), 3000);
        // Update local state
        setOrders(prev => prev.map(o => o.order_ref === orderRef ? { ...o, order_status: newStatus } : o));
        if (selectedOrder && selectedOrder.order_ref === orderRef) {
          setSelectedOrder(prev => ({ ...prev, order_status: newStatus }));
        }
      }
    } catch (err) {
      alert('Could not update order status.');
    }
  };

  const updatePaymentStatus = async (orderRef, newStatus, mpesaReceipt = '') => {
    try {
      const res = await fetch(`${API_BASE}/api/cake-orders/admin/orders/${orderRef}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus, mpesaReceipt })
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Payment for #${orderRef} marked as "${newStatus}"`);
        setTimeout(() => setActionNotice(''), 3000);
        setOrders(prev => prev.map(o => o.order_ref === orderRef ? { ...o, payment_status: newStatus, mpesa_receipt: mpesaReceipt || o.mpesa_receipt } : o));
        if (selectedOrder && selectedOrder.order_ref === orderRef) {
          setSelectedOrder(prev => ({ ...prev, payment_status: newStatus, mpesa_receipt: mpesaReceipt || prev.mpesa_receipt }));
        }
      }
    } catch (err) {
      alert('Could not update payment status.');
    }
  };

  const filteredOrders = orders.filter(o => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      o.order_ref?.toLowerCase().includes(term) ||
      o.customer_name?.toLowerCase().includes(term) ||
      o.phone?.includes(term) ||
      o.delivery_address?.toLowerCase().includes(term)
    );
  });

  const kpiStats = {
    total: orders.length,
    pending: orders.filter(o => o.order_status === 'Pending').length,
    inProgress: orders.filter(o => ['Confirmed', 'Baking', 'Ready for Collection', 'Out for Delivery'].includes(o.order_status)).length,
    revenue: orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
  };

  return (
    <AdminLayout admin={admin}>
      <div className="admin-cake-orders-page">
        {/* Top Header */}
        <div className="admin-orders-header">
          <div>
            <h1>Orders &amp; Dispatch</h1>
            <p>Live customer order stream, custom specifications, payment tracking, and WhatsApp coordination.</p>
          </div>
          <button 
            type="button" 
            className="admin-refresh-orders-btn"
            onClick={() => fetchOrders()}
            title="Reload orders"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Executive KPI Bar */}
        <div className="admin-orders-kpi-grid">
          <div className="admin-kpi-card">
            <div className="admin-kpi-icon kpi-total">
              <ShoppingBag size={22} />
            </div>
            <div className="admin-kpi-content">
              <span className="admin-kpi-val">{kpiStats.total}</span>
              <span className="admin-kpi-lbl">Total Orders</span>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-icon kpi-pending">
              <Clock size={22} />
            </div>
            <div className="admin-kpi-content">
              <span className="admin-kpi-val">{kpiStats.pending}</span>
              <span className="admin-kpi-lbl">Pending Confirmation</span>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-icon kpi-baking">
              <ChefHat size={22} />
            </div>
            <div className="admin-kpi-content">
              <span className="admin-kpi-val">{kpiStats.inProgress}</span>
              <span className="admin-kpi-lbl">Baking / Dispatch</span>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-icon kpi-revenue">
              <DollarSign size={22} />
            </div>
            <div className="admin-kpi-content">
              <span className="admin-kpi-val">KSh {kpiStats.revenue.toLocaleString()}</span>
              <span className="admin-kpi-lbl">Gross Order Value</span>
            </div>
          </div>
        </div>

        {actionNotice && (
          <div className="admin-action-notice">
            <CheckCircle2 size={16} />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="admin-orders-controls">
          <div className="status-filter-scroll">
            {ORDER_STATUSES.map(st => (
              <button
                key={st}
                type="button"
                className={`st-filter-btn ${statusFilter === st ? 'active' : ''}`}
                onClick={() => handleStatusFilterChange(st)}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="orders-search-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by order ref, customer name, phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="admin-loading-state">Loading cake orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-empty-state">
            <ShoppingBag size={42} />
            <h3>No cake orders found</h3>
            <p>Orders submitted by customers via cart or STK push will appear here immediately.</p>
          </div>
        ) : (
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th>Delivery Date &amp; Slot</th>
                  <th>Items &amp; Flavor</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.order_ref} className={selectedOrder?.order_ref === order.order_ref ? 'selected-row' : ''}>
                    <td>
                      <span className="order-ref-pill">#{order.order_ref}</span>
                      <span className="order-time-sub">{order.created_at?.slice(0, 16)}</span>
                    </td>
                    <td>
                      <strong>{order.customer_name}</strong>
                      <div className="order-phone-sub">
                        <Phone size={12} />
                        <span>{order.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div className="order-date-pill">
                        <Calendar size={13} />
                        <span>{order.delivery_date}</span>
                      </div>
                      <div className="order-slot-sub" style={{ marginTop: '4px' }}>
                        {order.delivery_type === 'pickup' ? (
                          <span style={{ color: '#059669', fontWeight: 600 }}>📍 Pickup (Kamakis)</span>
                        ) : (
                          <span style={{ color: '#2563EB', fontWeight: 600 }}>🚚 Delivery ({order.delivery_zone})</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="order-items-snippet">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="item-snippet-line">
                            <div>
                              <strong>{item.quantity}x {item.name}</strong> ({item.weight})
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#4B5563', marginTop: '2px' }}>
                              <span>Flavor: <strong>{item.flavor}</strong></span>
                              {(item.design || item.icing) && (
                                <span> &bull; Design: <strong>{item.design || item.icing}</strong></span>
                              )}
                            </div>
                            {item.inscription && (
                              <div style={{ fontSize: '0.78rem', color: '#B45309', fontStyle: 'italic', marginTop: '2px' }}>
                                "{item.inscription}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <strong className="order-total-price">
                        KSh {Number(order.total_amount).toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      <span className={`payment-badge ${order.payment_status}`}>
                        {order.payment_status}
                      </span>
                      {order.mpesa_receipt && (
                        <span className="mpesa-code-sub">{order.mpesa_receipt}</span>
                      )}
                    </td>
                    <td>
                      <select
                        value={order.order_status}
                        onChange={e => updateOrderStatus(order.order_ref, e.target.value)}
                        className={`status-select ${order.order_status.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {ORDER_STATUSES.filter(s => s !== 'All').map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="order-actions-cell">
                        <button
                          type="button"
                          className="view-order-btn"
                          onClick={() => setSelectedOrder(order)}
                          title="View order details"
                        >
                          <Eye size={15} />
                          <span>View</span>
                        </button>
                        <a
                          href={`https://wa.me/254${(order.phone || '').replace(/\D/g, '').replace(/^0+/, '').replace(/^254/, '')}?text=Hello%20${encodeURIComponent(order.customer_name)}%2C%20this%20is%20Carol%20Jenny%20from%20Lany%20Cakes%20regarding%20your%20order%20%23${order.order_ref}...`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="wa-order-btn"
                          title="Message customer on WhatsApp"
                        >
                          <MessageCircle size={15} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ORDER DETAILS INSPECTION DRAWER */}
        {selectedOrder && (
          <div className="admin-order-modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="admin-order-modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <span className="modal-ref-tag">Order #{selectedOrder.order_ref}</span>
                  <h3>{selectedOrder.customer_name}</h3>
                </div>
                <button type="button" className="close-btn" onClick={() => setSelectedOrder(null)}>&times;</button>
              </div>

              <div className="modal-body">
                {/* Status Quick Updater */}
                <div className="modal-status-bar">
                  <div className="ms-col">
                    <label>Order Fulfillment Status:</label>
                    <select
                      value={selectedOrder.order_status}
                      onChange={e => updateOrderStatus(selectedOrder.order_ref, e.target.value)}
                      className="modal-select"
                    >
                      {ORDER_STATUSES.filter(s => s !== 'All').map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ms-col">
                    <label>Payment Status:</label>
                    <div className="payment-toggle-actions">
                      <button
                        type="button"
                        className={`pm-btn ${selectedOrder.payment_status === 'paid' ? 'active-paid' : ''}`}
                        onClick={() => updatePaymentStatus(selectedOrder.order_ref, 'paid', 'MANUAL-ADMIN-OK')}
                      >
                        Mark as Paid
                      </button>
                      <button
                        type="button"
                        className={`pm-btn ${selectedOrder.payment_status === 'pending' ? 'active-pending' : ''}`}
                        onClick={() => updatePaymentStatus(selectedOrder.order_ref, 'pending')}
                      >
                        Pending
                      </button>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="modal-card">
                  <h4>Customer &amp; Delivery Information</h4>
                  <div className="modal-grid-2">
                    <div><strong>Phone:</strong> {selectedOrder.phone}</div>
                    <div><strong>Email:</strong> {selectedOrder.email || 'None provided'}</div>
                    <div><strong>Fulfillment:</strong> {selectedOrder.delivery_type === 'pickup' ? 'Studio Collection (Lany Studio, Kamakis Eastern Bypass, Ruiru)' : 'Doorstep Delivery'}</div>
                    <div><strong>Zone:</strong> {selectedOrder.delivery_zone}</div>
                    <div className="full-span"><strong>Address:</strong> {selectedOrder.delivery_address || 'Lany Studio, Kamakis Eastern Bypass'}</div>
                    <div><strong>Target Date:</strong> {selectedOrder.delivery_date}</div>
                    <div><strong>Time Slot:</strong> {selectedOrder.delivery_slot} slot</div>
                  </div>
                  {selectedOrder.special_instructions && (
                    <div className="modal-notes-box">
                      <strong>Special Instructions:</strong> {selectedOrder.special_instructions}
                    </div>
                  )}
                </div>

                {/* Cake Customisations */}
                <div className="modal-card">
                  <h4>Cake Items &amp; Customisation Snapshot</h4>
                  <div className="modal-items-list">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="modal-item-card">
                        <div className="m-item-head">
                          <h5>{item.name}</h5>
                          <span className="m-item-price">KSh {Number(item.total_price).toLocaleString()}</span>
                        </div>
                        <div className="m-item-specs">
                          <span><strong>Size / Weight:</strong> {item.weight}</span>
                          <span><strong>Cake Flavor:</strong> {item.flavor}</span>
                          <span><strong>Cake Design:</strong> {item.design || item.icing || 'Signature Bakery Finish'}</span>
                          <span><strong>Quantity:</strong> {item.quantity}</span>
                        </div>
                        {item.inscription && (
                          <div className="m-item-inscription">
                            <strong>Inscription on Cake:</strong> "{item.inscription}"
                          </div>
                        )}
                        {item.extras && item.extras.length > 0 && (
                          <div className="m-item-extras">
                            <strong>Add-ons:</strong> {item.extras.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="modal-financials">
                    <div className="fin-line"><span>Items Subtotal:</span> <span>KSh {Number(selectedOrder.subtotal).toLocaleString()}</span></div>
                    <div className="fin-line"><span>Delivery Fee:</span> <span>KSh {Number(selectedOrder.delivery_fee).toLocaleString()}</span></div>
                    <div className="fin-line total"><span>Total Amount:</span> <span>KSh {Number(selectedOrder.total_amount).toLocaleString()}</span></div>
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
