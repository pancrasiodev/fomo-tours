import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LogOut, Menu, X, Bell, Search,
  Package, Users, TrendingUp, Calendar
} from 'lucide-react'
import './Admin.css'
import './AdminDashboard.css'

export default function AdminLayout({ children, admin, search, onSearch }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname.startsWith(path)

  const logout = () => {
    localStorage.removeItem('fomo_admin_token')
    localStorage.removeItem('fomo_admin')
    navigate('/admin')
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
          <button
            className={`admin-sidebar__link ${isActive('/admin/dashboard') ? 'admin-sidebar__link--active' : ''}`}
            onClick={() => navigate('/admin/dashboard')}
          >
            <TrendingUp size={18} />
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          <button
            className={`admin-sidebar__link ${isActive('/admin/packages') ? 'admin-sidebar__link--active' : ''}`}
            onClick={() => navigate('/admin/packages')}
          >
            <Package size={18} />
            {sidebarOpen && <span>Packages</span>}
          </button>
          <button
            className={`admin-sidebar__link ${isActive('/admin/bookings') ? 'admin-sidebar__link--active' : ''}`}
            onClick={() => navigate('/admin/bookings')}
          >
            <Users size={18} />
            {sidebarOpen && <span>Bookings</span>}
          </button>
          <button
            className={`admin-sidebar__link ${isActive('/admin/calendar') ? 'admin-sidebar__link--active' : ''}`}
            onClick={() => navigate('/admin/calendar')}
          >
            <Calendar size={18} />
            {sidebarOpen && <span>Calendar</span>}
          </button>
        </nav>

        <button className="admin-sidebar__logout" onClick={logout}>
          <LogOut size={18} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* Main */}
      <main className={`admin-main ${sidebarOpen ? '' : 'admin-main--collapsed'}`}>
        <header className="admin-header">
          <button className="admin-header__burger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="admin-header__search">
            <Search size={16} />
            <input
              placeholder="Search..."
              value={search || ''}
              onChange={e => onSearch?.(e.target.value)}
            />
          </div>
          <div className="admin-header__actions">
            <button className="admin-header__icon-btn"><Bell size={18} /></button>
            <div className="admin-header__avatar">
              {admin?.full_name?.charAt(0)}
            </div>
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  )
}