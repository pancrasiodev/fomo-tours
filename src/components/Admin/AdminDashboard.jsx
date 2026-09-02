import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Users, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import AdminLayout from './AdminLayout'
import './Admin.css'
import './AdminDashboard.css'

const monthlyData = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 6800 },
  { month: 'Mar', revenue: 5200 },
  { month: 'Apr', revenue: 8900 },
  { month: 'May', revenue: 7400 },
  { month: 'Jun', revenue: 11200 },
  { month: 'Jul', revenue: 13500 },
  { month: 'Aug', revenue: 9800 },
  { month: 'Sep', revenue: 7600 },
  { month: 'Oct', revenue: 6400 },
  { month: 'Nov', revenue: 8100 },
  { month: 'Dec', revenue: 12400 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__label">{label}</p>
        <p className="chart-tooltip__value">${payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ packages: 0, bookings: 0, revenue: 0, upcoming: 0 })
  const [bookings, setBookings] = useState([])
  const [packages, setPackages] = useState([])
  const [admin, setAdmin] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('fomo_admin')
    if (!stored) { navigate('/admin'); return }
    setAdmin(JSON.parse(stored))
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('fomo_admin_token')
      const headers = { Authorization: `Bearer ${token}` }
      const [pkgRes, bookRes] = await Promise.all([
        fetch('http://localhost:5000/api/packages/admin/all', { headers }),
        fetch('http://localhost:5000/api/bookings', { headers })
      ])
      const pkgData = await pkgRes.json()
      const bookData = await bookRes.json()
      const revenue = bookData.bookings?.reduce(
        (sum, b) => sum + parseFloat(b.total_amount || 0), 0
      ) || 0
      setPackages(pkgData.packages || [])
      setBookings(bookData.bookings || [])
      setStats({
        packages: pkgData.packages?.length || 0,
        bookings: bookData.bookings?.length || 0,
        revenue,
        upcoming: pkgData.packages?.filter(p => p.status === 'published').length || 0
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AdminLayout admin={admin}>
      <div className="admin-page-title">
        <h1>Dashboard</h1>
        <p>Welcome back, {admin?.full_name}</p>
      </div>

      <div className="admin-stats">
        <div className="admin-stat admin-stat--glass">
          <div className="admin-stat__icon admin-stat__icon--blue"><Package size={22} /></div>
          <div className="admin-stat__info">
            <span className="admin-stat__value">{stats.packages}</span>
            <span className="admin-stat__label">Total Packages</span>
          </div>
          <ArrowUpRight size={16} className="admin-stat__arrow" />
        </div>
        <div className="admin-stat admin-stat--glass">
          <div className="admin-stat__icon admin-stat__icon--orange"><Users size={22} /></div>
          <div className="admin-stat__info">
            <span className="admin-stat__value">{stats.bookings}</span>
            <span className="admin-stat__label">Total Bookings</span>
          </div>
          <ArrowUpRight size={16} className="admin-stat__arrow" />
        </div>
        <div className="admin-stat admin-stat--glass">
          <div className="admin-stat__icon admin-stat__icon--green"><TrendingUp size={22} /></div>
          <div className="admin-stat__info">
            <span className="admin-stat__value">${stats.revenue.toLocaleString()}</span>
            <span className="admin-stat__label">Total Revenue</span>
          </div>
          <ArrowUpRight size={16} className="admin-stat__arrow" />
        </div>
        <div className="admin-stat admin-stat--glass">
          <div className="admin-stat__icon admin-stat__icon--purple"><Calendar size={22} /></div>
          <div className="admin-stat__info">
            <span className="admin-stat__value">{stats.upcoming}</span>
            <span className="admin-stat__label">Published Tours</span>
          </div>
          <ArrowUpRight size={16} className="admin-stat__arrow" />
        </div>
      </div>

      <div className="admin-grid-2">
        <div className="admin-card admin-card--glass">
          <div className="admin-card__header">
            <h2 className="admin-card__title">Revenue Overview</h2>
            <span className="admin-card__badge">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#9a9a9a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9a9a9a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="revenue" fill="#F26522" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-card admin-card--glass">
          <div className="admin-card__header">
            <h2 className="admin-card__title">Top Packages</h2>
            <button className="admin-card__link" onClick={() => navigate('/admin/packages')}>
              View all <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="admin-pkg-list">
            {packages.length === 0 ? (
              <p className="admin-empty">No packages yet</p>
            ) : (
              packages.slice(0, 5).map((pkg, i) => (
                <div key={i} className="admin-pkg-item">
                  <div className="admin-pkg-item__num">{i + 1}</div>
                  <div className="admin-pkg-item__info">
                    <span className="admin-pkg-item__title">{pkg.title}</span>
                    <span className="admin-pkg-item__duration">{pkg.duration}</span>
                  </div>
                  <span className={`admin-pkg-item__status admin-pkg-item__status--${pkg.status}`}>
                    {pkg.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="admin-card admin-card--glass">
        <div className="admin-card__header">
          <h2 className="admin-card__title">Recent Bookings</h2>
          <button className="admin-card__link" onClick={() => navigate('/admin/bookings')}>
            View all <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Package</th>
                <th>Departure</th>
                <th>Guests</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={6} className="admin-empty">No bookings yet</td></tr>
              ) : (
                bookings.slice(0, 6).map((b, i) => (
                  <tr key={i}>
                    <td>
                      <div className="admin-table__client">
                        <div className="admin-table__avatar">{b.full_name?.charAt(0)}</div>
                        <div>
                          <div className="admin-table__name">{b.full_name}</div>
                          <div className="admin-table__email">{b.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{b.package_title}</td>
                    <td>{b.departure_date ? new Date(b.departure_date).toLocaleDateString() : '—'}</td>
                    <td>{b.num_guests}</td>
                    <td>${parseFloat(b.total_amount).toLocaleString()}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${b.payment_status}`}>
                        {b.payment_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}