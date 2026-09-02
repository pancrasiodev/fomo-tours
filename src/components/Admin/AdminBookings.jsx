import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut, Menu, X, Bell, Search,
  Package, Users, TrendingUp, Calendar,
  CheckCircle, XCircle, Clock
} from 'lucide-react'
import './Admin.css'
import './AdminDashboard.css'
import './AdminBookings.css'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('fomo_admin')
    if (!stored) { navigate('/admin'); return }
    setAdmin(JSON.parse(stored))
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('fomo_admin_token')
      const res = await fetch('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updatePayment = async (id, status) => {
    try {
      const token = localStorage.getItem('fomo_admin_token')
      await fetch(`http://localhost:5000/api/bookings/${id}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ payment_status: status })
      })
      fetchBookings()
    } catch (err) {
      console.error(err)
    }
  }

  const logout = () => {
    localStorage.removeItem('fomo_admin_token')
    localStorage.removeItem('fomo_admin')
    navigate('/admin')
  }

  const filtered = bookings.filter(b => {
    const matchSearch =
      b.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.package_title?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || b.payment_status === filter
    return matchSearch && matchFilter
  })

  const stats = {
    total: bookings.length,
    paid: bookings.filter(b => b.payment_status === 'paid').length,
    pending: bookings.filter(b => b.payment_status === 'pending').length,
    failed: bookings.filter(b => b.payment_status === 'failed').length,
  }

  return (
    <div className="admin-layout">
      <div className="admin-layout__bg">
        <img src="/images/hero1.webp" alt="" />
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? '' : 'admin-sidebar--collapsed'}`}>
        <div className="admin-sidebar__logo">
          <img src="/logo.png" alt="FOMO Tours" height="36" />
        </div>
        <nav className="admin-sidebar__nav">
          <span className="admin-sidebar__label">Main Menu</span>
          <button className="admin-sidebar__link" onClick={() => navigate('/admin/dashboard')}>
            <TrendingUp size={18} />{sidebarOpen && <span>Dashboard</span>}
          </button>
          <button className="admin-sidebar__link" onClick={() => navigate('/admin/packages')}>
            <Package size={18} />{sidebarOpen && <span>Packages</span>}
          </button>
          <button className="admin-sidebar__link admin-sidebar__link--active" onClick={() => navigate('/admin/bookings')}>
            <Users size={18} />{sidebarOpen && <span>Bookings</span>}
          </button>
          <button className="admin-sidebar__link">
            <Calendar size={18} />{sidebarOpen && <span>Calendar</span>}
          </button>
        </nav>
        <button className="admin-sidebar__logout" onClick={logout}>
          <LogOut size={18} />{sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <header className="admin-header">
          <button className="admin-header__burger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="admin-header__search">
            <Search size={16} />
            <input
              placeholder="Search bookings..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="admin-header__actions">
            <button className="admin-header__icon-btn"><Bell size={18} /></button>
            <div className="admin-header__avatar">{admin?.full_name?.charAt(0)}</div>
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-page-title">
            <h1>Bookings</h1>
            <p>{bookings.length} total bookings</p>
          </div>

          {/* Booking stats */}
          <div className="admin-booking-stats">
            <div className="admin-booking-stat">
              <span className="admin-booking-stat__value">{stats.total}</span>
              <span className="admin-booking-stat__label">Total</span>
            </div>
            <div className="admin-booking-stat admin-booking-stat--green">
              <span className="admin-booking-stat__value">{stats.paid}</span>
              <span className="admin-booking-stat__label">Paid</span>
            </div>
            <div className="admin-booking-stat admin-booking-stat--yellow">
              <span className="admin-booking-stat__value">{stats.pending}</span>
              <span className="admin-booking-stat__label">Pending</span>
            </div>
            <div className="admin-booking-stat admin-booking-stat--red">
              <span className="admin-booking-stat__value">{stats.failed}</span>
              <span className="admin-booking-stat__label">Failed</span>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="admin-booking-filters">
            {['all', 'paid', 'pending', 'failed'].map(f => (
              <button
                key={f}
                className={`admin-booking-filter ${filter === f ? 'admin-booking-filter--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="admin-card admin-card--glass">
            {loading ? (
              <p className="admin-empty">Loading bookings...</p>
            ) : filtered.length === 0 ? (
              <div className="admin-empty-state">
                <Users size={48} />
                <p>No bookings found</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Package</th>
                      <th>Departure</th>
                      <th>Guests</th>
                      <th>Amount</th>
                      <th>M-Pesa</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <div className="admin-table__client">
                            <div className="admin-table__avatar">{b.full_name?.charAt(0)}</div>
                            <div>
                              <div className="admin-table__name">{b.full_name}</div>
                              <div className="admin-table__email">{b.email}</div>
                              <div className="admin-table__email">{b.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td>{b.package_title}</td>
                        <td>
                          {b.departure_date
                            ? new Date(b.departure_date).toLocaleDateString()
                            : '—'}
                        </td>
                        <td>{b.num_guests}</td>
                        <td>${parseFloat(b.total_amount || 0).toLocaleString()}</td>
                        <td>
                          <span className="admin-table__receipt">
                            {b.mpesa_receipt || '—'}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-badge admin-badge--${b.payment_status}`}>
                            {b.payment_status}
                          </span>
                        </td>
                        <td>
                          <div className="admin-pkg-actions">
                            {b.payment_status !== 'paid' && (
                              <button
                                className="admin-pkg-action admin-pkg-action--view"
                                onClick={() => updatePayment(b.id, 'paid')}
                                title="Mark as paid"
                              >
                                <CheckCircle size={15} />
                              </button>
                            )}
                            {b.payment_status !== 'pending' && (
                              <button
                                className="admin-pkg-action admin-pkg-action--edit"
                                onClick={() => updatePayment(b.id, 'pending')}
                                title="Mark as pending"
                              >
                                <Clock size={15} />
                              </button>
                            )}
                            {b.payment_status !== 'failed' && (
                              <button
                                className="admin-pkg-action admin-pkg-action--delete"
                                onClick={() => updatePayment(b.id, 'failed')}
                                title="Mark as failed"
                              >
                                <XCircle size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}