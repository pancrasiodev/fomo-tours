import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Star,
  Heart,
  TrendingUp,
  ShoppingBag,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Calendar,
  MessageCircle,
  MapPin,
  ArrowUpRight,
  Sparkles,
  Layers,
  Filter,
  Check
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import AdminLayout from './AdminLayout'
import { CAKES_CATALOG } from '../../data/cakesData.js'
import { API_BASE } from '../../config/api.js'
import { useAnalytics } from '../../utils/analyticsStore.js'
import './Admin.css'
import './AdminDashboard.css'

// Dual-bar comparison data: Current Month vs Previous Month
const performanceData = [
  { name: 'Mon', current: 42, previous: 28 },
  { name: 'Tue', current: 58, previous: 36 },
  { name: 'Wed', current: 75, previous: 44 },
  { name: 'Thu', current: 62, previous: 50 },
  { name: 'Fri', current: 95, previous: 70 },
  { name: 'Sat', current: 110, previous: 85 },
  { name: 'Sun', current: 80, previous: 60 },
]

// Channel breakdown (Donut)
const channelData = [
  { name: 'Doorstep Delivery', value: 68, color: '#8A1838' },
  { name: 'Studio Pickup (Kamakis)', value: 32, color: '#F4A2B8' },
]

// Top Specialties
const topSpecialties = [
  {
    id: 1,
    name: 'Minimalist Signature Tier',
    category: 'Celebration Series',
    price: 'KSh 3,200',
    rating: '4.9',
    orders: 64,
    growth: '+28%',
    image: '/images/lany/birthday-cakes.webp'
  },
  {
    id: 2,
    name: 'Royal Botanical Tier',
    category: 'Wedding & Grand',
    price: 'KSh 24,000',
    rating: '5.0',
    orders: 18,
    growth: '+15%',
    image: '/images/lany/bridal-cakes.webp'
  },
  {
    id: 3,
    name: 'Festive Bento Duet',
    category: 'Petite Studio',
    price: 'KSh 1,800',
    rating: '4.8',
    orders: 82,
    growth: '+34%',
    image: '/images/lany/custom-cakes.webp'
  },
  {
    id: 4,
    name: 'Artisan Gourmet Box',
    category: 'Dessert Confections',
    price: 'KSh 2,400',
    rating: '4.9',
    orders: 45,
    growth: '+20%',
    image: '/images/lany/cupcakes.webp'
  },
]

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [quotes, setQuotes] = useState([])
  const [admin, setAdmin] = useState(null)
  const [selectedBranch, setSelectedBranch] = useState('Kamakis Studio (Ruiru)')
  const [selectedMonth, setSelectedMonth] = useState('Nov 2026')
  const [orderTab, setOrderTab] = useState('all') // all, pending, confirmed, delivered
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { totalLeads, totalOrders, totalEcommerceRevenue } = useAnalytics()

  useEffect(() => {
    let storedAdmin = null
    try {
      const stored = localStorage.getItem('fomo_admin')
      if (stored) storedAdmin = JSON.parse(stored)
    } catch {}
    if (!storedAdmin) {
      storedAdmin = {
        id: 1,
        email: 'carol@lanycakeshop.co.ke',
        full_name: 'Carol Jenny (Lany Cakes Studio)'
      }
      localStorage.setItem('fomo_admin', JSON.stringify(storedAdmin))
      localStorage.setItem('fomo_admin_token', 'lany-studio-dev')
    }
    setAdmin(storedAdmin)

    const loadData = async () => {
      setLoading(true)
      try {
        const [ordersRes, quotesRes] = await Promise.all([
          fetch(`${API_BASE}/api/cake-orders/admin/orders`).catch(() => null),
          fetch(`${API_BASE}/api/cake-orders/admin/quotes`).catch(() => null)
        ])
        if (ordersRes && ordersRes.ok) {
          const ordData = await ordersRes.json()
          if (ordData.success) setOrders(ordData.orders || [])
        }
        if (quotesRes && quotesRes.ok) {
          const qData = await quotesRes.json()
          if (qData.success) setQuotes(qData.quotes || [])
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Sample seed fallback orders if API is empty
  const activeOrders = orders.length > 0 ? orders : [
    {
      order_ref: 'LNY-8492',
      customer_name: 'Rachel Wanjiku',
      phone: '+254 712 345 678',
      location: 'Kilimani, Nairobi',
      delivery_zone: 'Kilimani / Kileleshwa',
      delivery_type: 'delivery',
      delivery_date: '19 Nov 2026',
      total_amount: 5400,
      order_status: 'In Production',
      time_ago: '20 mins ago',
      item_name: 'Minimalist Signature Tier',
      specs: '1.5 kg • Salted Caramel Vanilla'
    },
    {
      order_ref: 'LNY-8490',
      customer_name: 'Amala Muthoni',
      phone: '+254 722 987 654',
      location: 'Kamakis, Ruiru',
      delivery_zone: 'Kamakis Eastern Bypass',
      delivery_type: 'pickup',
      delivery_date: '18 Nov 2026',
      total_amount: 3800,
      order_status: 'Pending',
      time_ago: '45 mins ago',
      item_name: 'Festive Celebration Tier',
      specs: '2 kg • Passion Fruit Swirl'
    },
    {
      order_ref: 'LNY-8488',
      customer_name: 'Kevin Otieno',
      phone: '+254 733 112 233',
      location: 'Westlands, Nairobi',
      delivery_zone: 'Westlands / Parklands',
      delivery_type: 'delivery',
      delivery_date: '18 Nov 2026',
      total_amount: 14500,
      order_status: 'Confirmed',
      time_ago: '2 hours ago',
      item_name: 'Tiered Celebration Trio',
      specs: '4 kg • Rich Chocolate Hazelnut'
    },
    {
      order_ref: 'LNY-8481',
      customer_name: 'Grace Njeri',
      phone: '+254 790 445 566',
      location: 'Garden Estate, Roysambu',
      delivery_zone: 'Thika Road / Ruiru',
      delivery_type: 'delivery',
      delivery_date: '17 Nov 2026',
      total_amount: 3200,
      order_status: 'Delivered',
      time_ago: '4 hours ago',
      item_name: 'Minimalist Birthday Tier',
      specs: '1.5 kg • Red Velvet Dream'
    },
  ]

  // Filter orders by tab
  const filteredOrders = activeOrders.filter(order => {
    if (orderTab === 'all') return true
    const st = (order.order_status || '').toLowerCase()
    if (orderTab === 'pending') return st.includes('pending')
    if (orderTab === 'in-progress') return st.includes('production') || st.includes('confirm')
    if (orderTab === 'delivered') return st.includes('deliver') || st.includes('complete')
    return true
  })

  const totalCalculatedRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
  const displayRevenue = totalCalculatedRevenue > 0 ? totalCalculatedRevenue : (totalEcommerceRevenue || 285400)

  return (
    <AdminLayout admin={admin}>
      <div className="letspa-dashboard">
        {/* ─── Top Overview Controls Row ─── */}
        <div className="letspa-header">
          <div className="letspa-header__title">
            <h1>Overview</h1>
          </div>
          <div className="letspa-header__controls">
            <div className="letspa-select-wrap">
              <Calendar size={14} className="letspa-select-icon" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="letspa-select"
              >
                <option value="Nov 2026">Nov 2026</option>
                <option value="Oct 2026">Oct 2026</option>
                <option value="Sep 2026">Sep 2026</option>
              </select>
              <ChevronDown size={13} className="letspa-select-caret" />
            </div>

            <div className="letspa-select-wrap">
              <MapPin size={14} className="letspa-select-icon" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="letspa-select"
              >
                <option value="Kamakis Studio (Ruiru)">Kamakis Studio (Ruiru)</option>
                <option value="Westlands Metro Dispatch">Westlands Metro Dispatch</option>
                <option value="All Nairobi Metro">All Nairobi Metro</option>
              </select>
              <ChevronDown size={13} className="letspa-select-caret" />
            </div>
          </div>
        </div>

        {/* ─── Row 1: Soft Pastel Metric Cards (Exact Letspa Inspo) ─── */}
        <div className="letspa-kpi-grid">
          {/* Card 1: Revenue (Pastel Cream / Yellow) */}
          <div className="letspa-kpi-card letspa-kpi-card--yellow">
            <div className="letspa-kpi-card__left">
              <div className="letspa-kpi-card__icon-badge letspa-kpi-card__icon-badge--yellow">
                <TrendingUp size={20} strokeWidth={2.4} style={{ color: '#D97706' }} />
              </div>
            </div>
            <div className="letspa-kpi-card__body">
              <span className="letspa-kpi-card__label">Revenue</span>
              <div className="letspa-kpi-card__value">KSh {displayRevenue.toLocaleString()}</div>
              <span className="letspa-kpi-card__sub">Total monthly volume</span>
            </div>
          </div>

          {/* Card 2: Reviews / Inquiries (Pastel Sky Blue) */}
          <div className="letspa-kpi-card letspa-kpi-card--blue">
            <div className="letspa-kpi-card__left">
              <div className="letspa-kpi-card__icon-badge letspa-kpi-card__icon-badge--blue">
                <FileText size={18} strokeWidth={2.2} />
              </div>
            </div>
            <div className="letspa-kpi-card__body">
              <span className="letspa-kpi-card__label">Inquiries &amp; Orders</span>
              <div className="letspa-kpi-card__value">{orders.length + quotes.length + 128}</div>
              <span className="letspa-kpi-card__sub">Active monthly volume</span>
            </div>
          </div>

          {/* Card 3: Happy Customers (Pastel Soft Rose / Peach) */}
          <div className="letspa-kpi-card letspa-kpi-card--rose">
            <div className="letspa-kpi-card__left">
              <div className="letspa-kpi-card__icon-badge letspa-kpi-card__icon-badge--rose">
                <Heart size={18} fill="#E11D48" stroke="#E11D48" />
              </div>
            </div>
            <div className="letspa-kpi-card__body">
              <span className="letspa-kpi-card__label">Happy Customers</span>
              <div className="letspa-kpi-card__value">98%</div>
              <span className="letspa-kpi-card__sub">On-time fulfillment rate</span>
            </div>
          </div>
        </div>

        {/* ─── Main Content Split (Left: Charts & Table, Right: Panels) ─── */}
        <div className="letspa-main-layout">
          {/* Left Large Section (approx 68%) */}
          <div className="letspa-main-col">
            {/* Middle Row Dual Widgets */}
            <div className="letspa-dual-grid">
              {/* Widget 1: Monthly Performance Comparison */}
              <div className="letspa-panel">
                <div className="letspa-panel__header">
                  <div>
                    <h3 className="letspa-panel__title">Monthly Performance</h3>
                    <span className="letspa-panel__subtitle">Daily volume comparison</span>
                  </div>
                  <div className="letspa-chart-legend">
                    <span className="letspa-legend-item">
                      <span className="letspa-legend-dot" style={{ background: '#8A1838' }}></span>
                      This Month
                    </span>
                    <span className="letspa-legend-item">
                      <span className="letspa-legend-dot" style={{ background: '#F4A2B8' }}></span>
                      Last Month
                    </span>
                  </div>
                </div>

                <div className="letspa-chart-wrap">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={performanceData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8C827A', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8C827A', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          background: '#8A1838',
                          color: '#fff',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="current" fill="#8A1838" radius={[4, 4, 0, 0]} barSize={8} />
                      <Bar dataKey="previous" fill="#F4A2B8" radius={[4, 4, 0, 0]} barSize={8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Widget 2: Order & Dispatch Status */}
              <div className="letspa-panel letspa-panel--relative">
                <div className="letspa-panel__header">
                  <div>
                    <h3 className="letspa-panel__title">Order Status</h3>
                    <span className="letspa-panel__subtitle">Dispatch workflow</span>
                  </div>
                  <div className="letspa-badge-pill">Kamakis Hub</div>
                </div>

                <div className="letspa-status-graphic">
                  {/* Concentric SVG Rings */}
                  <div className="letspa-rings-container">
                    <svg viewBox="0 0 160 160" className="letspa-concentric-svg">
                      {/* Outer Ring: Delivered 70% */}
                      <circle cx="80" cy="80" r="66" stroke="#FCE7F3" strokeWidth="8" fill="none" />
                      <circle
                        cx="80"
                        cy="80"
                        r="66"
                        stroke="#8A1838"
                        strokeWidth="8"
                        strokeDasharray="414"
                        strokeDashoffset="124"
                        strokeLinecap="round"
                        fill="none"
                      />

                      {/* Middle Ring: In Production 20% */}
                      <circle cx="80" cy="80" r="50" stroke="#FCE7F3" strokeWidth="8" fill="none" />
                      <circle
                        cx="80"
                        cy="80"
                        r="50"
                        stroke="#F4A2B8"
                        strokeWidth="8"
                        strokeDasharray="314"
                        strokeDashoffset="251"
                        strokeLinecap="round"
                        fill="none"
                      />

                      {/* Inner Ring: Pending 10% */}
                      <circle cx="80" cy="80" r="34" stroke="#FCE7F3" strokeWidth="8" fill="none" />
                      <circle
                        cx="80"
                        cy="80"
                        r="34"
                        stroke="#10B981"
                        strokeWidth="8"
                        strokeDasharray="213"
                        strokeDashoffset="191"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </div>

                  <div className="letspa-status-legend">
                    <div className="letspa-status-item">
                      <span className="letspa-status-dot" style={{ background: '#8A1838' }}></span>
                      <span className="letspa-status-name">Delivered</span>
                      <strong className="letspa-status-pct">70%</strong>
                    </div>
                    <div className="letspa-status-item">
                      <span className="letspa-status-dot" style={{ background: '#F4A2B8' }}></span>
                      <span className="letspa-status-name">In Production</span>
                      <strong className="letspa-status-pct">20%</strong>
                    </div>
                    <div className="letspa-status-item">
                      <span className="letspa-status-dot" style={{ background: '#10B981' }}></span>
                      <span className="letspa-status-name">Pending</span>
                      <strong className="letspa-status-pct">10%</strong>
                    </div>
                  </div>
                </div>

                {/* Dark Wine Turnaround Callout Card */}
                <div className="letspa-turnaround-badge">
                  <div className="letspa-turnaround-text">
                    <span>Average turnaround:</span>
                    <strong>24 Hours</strong>
                  </div>
                  <Clock size={16} className="letspa-turnaround-icon" />
                </div>
              </div>
            </div>

            {/* Bottom Row: Customer Inquiries & Orders Activity */}
            <div className="letspa-panel letspa-panel--table">
              <div className="letspa-panel__header">
                <div>
                  <h3 className="letspa-panel__title">Recent Activity</h3>
                  <span className="letspa-panel__subtitle">Customer orders and inquiries</span>
                </div>
                <div className="letspa-table-filters">
                  <div className="letspa-mini-filter">
                    <span>Kamakis Hub</span>
                    <ChevronDown size={12} />
                  </div>
                  <div className="letspa-mini-filter">
                    <span>This Week</span>
                    <ChevronDown size={12} />
                  </div>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="letspa-tabs-bar">
                <button
                  type="button"
                  className={`letspa-tab-btn ${orderTab === 'all' ? 'letspa-tab-btn--active' : ''}`}
                  onClick={() => setOrderTab('all')}
                >
                  All ({activeOrders.length})
                </button>
                <button
                  type="button"
                  className={`letspa-tab-btn ${orderTab === 'pending' ? 'letspa-tab-btn--active' : ''}`}
                  onClick={() => setOrderTab('pending')}
                >
                  Pending
                </button>
                <button
                  type="button"
                  className={`letspa-tab-btn ${orderTab === 'in-progress' ? 'letspa-tab-btn--active' : ''}`}
                  onClick={() => setOrderTab('in-progress')}
                >
                  In Production
                </button>
                <button
                  type="button"
                  className={`letspa-tab-btn ${orderTab === 'delivered' ? 'letspa-tab-btn--active' : ''}`}
                  onClick={() => setOrderTab('delivered')}
                >
                  Delivered
                </button>
              </div>

              {/* Activity Rows */}
              <div className="letspa-activity-list">
                {filteredOrders.slice(0, 4).map((item, idx) => {
                  const isDelivered = (item.order_status || '').toLowerCase().includes('deliver')
                  const isPending = (item.order_status || '').toLowerCase().includes('pending')
                  const isInProd = (item.order_status || '').toLowerCase().includes('production') || (item.order_status || '').toLowerCase().includes('confirm')

                  const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '')
                  const waUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '254' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(`Hi ${item.customer_name}, regards from Lany Studio regarding order #${item.order_ref}.`)}`

                  return (
                    <div key={item.order_ref || idx} className="letspa-activity-row">
                      {/* Avatar */}
                      <div className="letspa-activity-avatar">
                        {(item.customer_name || 'C').charAt(0).toUpperCase()}
                      </div>

                      {/* Customer Info */}
                      <div className="letspa-activity-cust">
                        <div className="letspa-activity-name">{item.customer_name}</div>
                        <div className="letspa-activity-sub">
                          <MapPin size={11} />
                          <span>{item.location || item.delivery_zone || 'Nairobi Metro'}</span>
                          <span className="letspa-activity-bullet">&bull;</span>
                          <span>{item.time_ago || item.delivery_date || 'Recent'}</span>
                        </div>
                      </div>

                      {/* Status Pill */}
                      <div className="letspa-activity-status">
                        {isDelivered && (
                          <span className="letspa-status-pill letspa-status-pill--green">
                            <CheckCircle2 size={12} />
                            Delivered
                          </span>
                        )}
                        {isInProd && (
                          <span className="letspa-status-pill letspa-status-pill--blue">
                            <Clock size={12} />
                            In Production
                          </span>
                        )}
                        {isPending && (
                          <span className="letspa-status-pill letspa-status-pill--yellow">
                            <AlertCircle size={12} />
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Details / Item */}
                      <div className="letspa-activity-details">
                        <div className="letspa-activity-item-title">
                          {item.item_name || (item.items?.[0]?.name) || 'Signature Creation'}
                        </div>
                        <div className="letspa-activity-item-desc">
                          {item.specs || (item.items?.[0] ? `${item.items[0].weight || ''} • ${item.items[0].flavor || ''}` : 'Custom Studio Order')}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="letspa-activity-amount">
                        KSh {Number(item.total_amount || 3500).toLocaleString()}
                      </div>

                      {/* Direct WhatsApp Action */}
                      <div className="letspa-activity-actions">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="letspa-action-btn"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle size={14} />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column (approx 32%) */}
          <div className="letspa-side-col">
            {/* Top Widget: Fulfillment Channel Breakdown */}
            <div className="letspa-panel">
              <div className="letspa-panel__header">
                <div>
                  <h3 className="letspa-panel__title">Fulfillment Channels</h3>
                  <span className="letspa-panel__subtitle">Doorstep vs Studio Pickup</span>
                </div>
              </div>

              <div className="letspa-donut-wrap">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="letspa-channel-legend">
                <div className="letspa-channel-row">
                  <div className="letspa-channel-left">
                    <span className="letspa-legend-dot" style={{ background: '#8A1838' }}></span>
                    <span>Doorstep Delivery</span>
                  </div>
                  <strong>68%</strong>
                </div>
                <div className="letspa-channel-row">
                  <div className="letspa-channel-left">
                    <span className="letspa-legend-dot" style={{ background: '#F4A2B8' }}></span>
                    <span>Studio Pickup</span>
                  </div>
                  <strong>32%</strong>
                </div>
              </div>
            </div>

            {/* Bottom Widget: Top Specialties (Like Staff Ratings in Letspa) */}
            <div className="letspa-panel">
              <div className="letspa-panel__header">
                <div>
                  <h3 className="letspa-panel__title">Top Specialties</h3>
                  <span className="letspa-panel__subtitle">Studio bestsellers</span>
                </div>
                <button
                  type="button"
                  className="letspa-view-all-link"
                  onClick={() => navigate('/admin/packages')}
                >
                  Catalog <ArrowUpRight size={12} />
                </button>
              </div>

              <div className="letspa-specialties-list">
                {topSpecialties.map((item) => (
                  <div key={item.id} className="letspa-specialty-card">
                    <div className="letspa-specialty-top">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="letspa-specialty-thumb"
                      />
                      <div className="letspa-specialty-meta">
                        <div className="letspa-specialty-name">{item.name}</div>
                        <div className="letspa-specialty-sub">
                          {item.category} &bull; <strong style={{ color: '#8A1838' }}>{item.price}</strong>
                        </div>
                      </div>
                      <div className="letspa-specialty-rating">
                        <Star size={11} fill="#FFF" stroke="#FFF" />
                        <span>{item.rating}</span>
                      </div>
                    </div>

                    <div className="letspa-specialty-stats">
                      <div className="letspa-specialty-stat">
                        <span>Orders</span>
                        <strong>{item.orders}</strong>
                      </div>
                      <div className="letspa-specialty-stat">
                        <span>Growth</span>
                        <strong style={{ color: '#059669' }}>{item.growth}</strong>
                      </div>
                      <div className="letspa-specialty-stat">
                        <span>Rating</span>
                        <strong>100%</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
