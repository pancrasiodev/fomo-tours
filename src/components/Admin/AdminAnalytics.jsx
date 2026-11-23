import { useState } from 'react';
import { 
  TrendingUp, Users, ShoppingBag, DollarSign, Calendar, MessageCircle, 
  Search, Filter, CheckCircle2, Clock, ArrowUpRight, FileText, ChevronRight, PackageCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import AdminLayout from './AdminLayout';
import { useAnalytics } from '../../utils/analyticsStore';
import './Admin.css';
import './AdminAnalytics.css';

export default function AdminAnalytics() {
  const { 
    leads, 
    orders, 
    totalLeads, 
    totalOrders, 
    totalEcommerceRevenue, 
    totalPipelineRevenue, 
    avgOrderValue, 
    monthlyTrends,
    updateLeadStatus,
    updateOrderStatus
  } = useAnalytics();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'leads', 'orders'
  const [searchTerm, setSearchTerm] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = leadStatusFilter === 'all' || lead.status === leadStatusFilter;
    const matchesSearch = searchTerm === '' ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.occasion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredOrders = orders.filter(order => {
    const matchesStatus = orderStatusFilter === 'all' || order.orderStatus === orderStatusFilter;
    const matchesSearch = searchTerm === '' ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      order.deliveryLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const conversionRate = totalLeads > 0 
    ? Math.round(((leads.filter(l => l.status === 'Converted').length + totalOrders) / (totalLeads + totalOrders)) * 100)
    : 100;

  return (
    <AdminLayout>
      <div className="admin-analytics-wrapper">
        {/* Top Header */}
        <div className="analytics-page-top">
          <div>
            <div className="analytics-badge">
              <TrendingUp size={14} />
              <span>Performance &amp; Conversions</span>
            </div>
            <h1>Analytics: Leads &amp; Orders</h1>
            <p className="analytics-subtitle">
              Distinguishing <strong>Leads</strong> (captured from inquiry forms &amp; custom cake builder) and <strong>Orders</strong> (from ecommerce cart checkouts).
            </p>
          </div>

          <div className="analytics-quick-summary">
            <span className="summary-date">Live Studio Data &bull; Nairobi</span>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="analytics-kpi-grid">
          {/* Orders Card */}
          <div className="kpi-card kpi-orders" onClick={() => setActiveTab('orders')}>
            <div className="kpi-top">
              <span className="kpi-tag ecommerce-tag">Ecommerce Orders</span>
              <div className="kpi-icon-wrap orders-icon">
                <ShoppingBag size={20} />
              </div>
            </div>
            <div className="kpi-val">{totalOrders}</div>
            <div className="kpi-desc">
              <span>Revenue: <strong>KSh {totalEcommerceRevenue.toLocaleString()}</strong></span>
              <small>AOV: KSh {avgOrderValue.toLocaleString()}</small>
            </div>
          </div>

          {/* Leads Card */}
          <div className="kpi-card kpi-leads" onClick={() => setActiveTab('leads')}>
            <div className="kpi-top">
              <span className="kpi-tag forms-tag">Form Leads</span>
              <div className="kpi-icon-wrap leads-icon">
                <FileText size={20} />
              </div>
            </div>
            <div className="kpi-val">{totalLeads}</div>
            <div className="kpi-desc">
              <span>Pipeline: <strong>KSh {totalPipelineRevenue.toLocaleString()}</strong></span>
              <small>{leads.filter(l => l.status === 'New').length} pending follow-up</small>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-tag neutral-tag">Conversion Rate</span>
              <div className="kpi-icon-wrap neutral-icon">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="kpi-val">{conversionRate}%</div>
            <div className="kpi-desc">
              <span>Leads converted to active bakes</span>
              <small>High WhatsApp engagement</small>
            </div>
          </div>

          {/* Total Combined Volume */}
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-tag neutral-tag">Total Pipeline</span>
              <div className="kpi-icon-wrap revenue-icon">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="kpi-val">KSh {(totalEcommerceRevenue + totalPipelineRevenue).toLocaleString()}</div>
            <div className="kpi-desc">
              <span>Total Gross Value (Orders + Inquiries)</span>
              <small>{totalOrders + totalLeads} customer interactions</small>
            </div>
          </div>
        </div>

        {/* Visual Charts Section */}
        <div className="analytics-chart-card">
          <div className="chart-header">
            <div>
              <h3>Conversion Volume: Leads vs. Orders</h3>
              <p>Monthly trends tracking inbound form inquiries alongside direct ecommerce checkout orders.</p>
            </div>
            <div className="chart-legend-custom">
              <span className="legend-indicator orders">Orders (Ecommerce)</span>
              <span className="legend-indicator leads">Leads (Forms)</span>
            </div>
          </div>

          <div className="chart-container-inner">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE6DF" />
                <XAxis dataKey="month" stroke="#7A6F68" fontSize={12} tickLine={false} />
                <YAxis stroke="#7A6F68" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(val, name) => [val, name === 'orders' ? 'Ecommerce Orders' : 'Form Leads']}
                  contentStyle={{ backgroundColor: '#1E1614', color: '#fff', borderRadius: '8px', border: 'none' }}
                />
                <Bar dataKey="orders" fill="#D43859" radius={[4, 4, 0, 0]} barSize={22} />
                <Bar dataKey="leads" fill="#E07A5F" radius={[4, 4, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Navigation Tabs */}
        <div className="analytics-tabs-nav">
          <button 
            className={`analytics-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Activity ({totalLeads + totalOrders})
          </button>
          <button 
            className={`analytics-tab-btn ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            Form Leads ({totalLeads})
          </button>
          <button 
            className={`analytics-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Ecommerce Orders ({totalOrders})
          </button>
        </div>

        {/* Global Filter Bar */}
        <div className="analytics-search-bar">
          <div className="search-field-wrap">
            <Search size={16} className="search-ico" />
            <input
              type="text"
              placeholder="Search by customer name, phone, occasion, or location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="analytics-search-input"
            />
          </div>
        </div>

        {/* TAB 1: FORM LEADS SECTION */}
        {(activeTab === 'all' || activeTab === 'leads') && (
          <div className="analytics-table-section">
            <div className="table-section-header">
              <div className="table-title-group">
                <span className="forms-tag badge-pill">Form Inquiries</span>
                <h3>Customer Leads ({filteredLeads.length})</h3>
                <p>Captures from Contact Us, Custom Cake Designer, and Wedding consultation requests.</p>
              </div>

              <div className="table-filter-group">
                <Filter size={15} />
                <select 
                  value={leadStatusFilter} 
                  onChange={e => setLeadStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Lead Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Quoted">Quoted</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>
            </div>

            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Lead / Contact</th>
                    <th>Form Source</th>
                    <th>Occasion &amp; Date</th>
                    <th>Message / Custom Brief</th>
                    <th>Estimated Value</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id}>
                      <td>
                        <div className="customer-cell">
                          <strong>{lead.name}</strong>
                          <span>{lead.phone}</span>
                          {lead.email && <small>{lead.email}</small>}
                        </div>
                      </td>
                      <td>
                        <span className="source-pill form-source">{lead.source}</span>
                      </td>
                      <td>
                        <div className="occasion-cell">
                          <strong>{lead.occasion}</strong>
                          {lead.eventDate && <span>Event: {lead.eventDate}</span>}
                        </div>
                      </td>
                      <td>
                        <p className="lead-msg-cell" title={lead.message}>{lead.message}</p>
                      </td>
                      <td>
                        <strong className="lead-value">KSh {lead.budgetEstimate.toLocaleString()}</strong>
                      </td>
                      <td>
                        <select
                          value={lead.status}
                          onChange={e => updateLeadStatus(lead.id, e.target.value)}
                          className={`status-pill-select status-${lead.status.toLowerCase()}`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Quoted">Quoted</option>
                          <option value="Converted">Converted</option>
                        </select>
                      </td>
                      <td>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(lead.name)}%2C%20thank%20you%20for%20contacting%20Lany%20Cake%20Shop%20regarding%20your%20${encodeURIComponent(lead.occasion)}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="table-wa-btn"
                          title="Follow up on WhatsApp"
                        >
                          <MessageCircle size={15} />
                          <span>Chat</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ECOMMERCE ORDERS SECTION */}
        {(activeTab === 'all' || activeTab === 'orders') && (
          <div className="analytics-table-section">
            <div className="table-section-header">
              <div className="table-title-group">
                <span className="ecommerce-tag badge-pill">Ecommerce Checkouts</span>
                <h3>Online Orders ({filteredOrders.length})</h3>
                <p>Purchases initiated via online Cart Drawer &amp; instant cake order selections.</p>
              </div>

              <div className="table-filter-group">
                <Filter size={15} />
                <select 
                  value={orderStatusFilter} 
                  onChange={e => setOrderStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Order Statuses</option>
                  <option value="Received">Received</option>
                  <option value="Baking">Baking</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>

            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Order ID / Date</th>
                    <th>Customer</th>
                    <th>Items Ordered</th>
                    <th>Delivery Estate</th>
                    <th>Total Price</th>
                    <th>Order Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <div className="order-id-cell">
                          <strong>{order.id}</strong>
                          <span>{order.createdAt.split('T')[0]}</span>
                        </div>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <strong>{order.customerName}</strong>
                          <span>{order.customerPhone || 'Online Checkout'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="items-list-cell">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="item-row">
                              <strong>{it.qty}x {it.name}</strong> ({it.weight})
                              {it.flavor && <span>Flavor: {it.flavor}</span>}
                              {it.inscription && <em>"{it.inscription}"</em>}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="delivery-cell">
                          <span>{order.deliveryLocation}</span>
                          {order.deliveryDate && <small>Date: {order.deliveryDate}</small>}
                        </div>
                      </td>
                      <td>
                        <div className="price-status-cell">
                          <strong className="order-price">KSh {order.totalAmount.toLocaleString()}</strong>
                          <span className="payment-status-tag">{order.paymentStatus}</span>
                        </div>
                      </td>
                      <td>
                        <select
                          value={order.orderStatus}
                          onChange={e => updateOrderStatus(order.id, e.target.value)}
                          className={`status-pill-select status-${order.orderStatus.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <option value="Received">Received</option>
                          <option value="Baking">Baking</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                      <td>
                        <a
                          href={`https://wa.me/254758582215?text=Hello%20Lany%20Cakes%2C%20following%20up%20on%20Order%20${order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="table-wa-btn"
                          title="Open WhatsApp Order"
                        >
                          <MessageCircle size={15} />
                          <span>View</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
