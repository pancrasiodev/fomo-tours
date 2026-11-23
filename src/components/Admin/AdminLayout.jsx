import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LogOut,
  Menu,
  X,
  Search,
  Package,
  BookOpen,
  TrendingUp,
  ExternalLink,
  ShoppingBag,
  FileText,
  LayoutDashboard,
  Bell,
  ChevronDown,
  Sparkles,
  Store,
  Clock
} from 'lucide-react'
import './Admin.css'
import './AdminDashboard.css'

export default function AdminLayout({ children, admin, search, onSearch }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path))
  }

  const logout = () => {
    localStorage.removeItem('fomo_admin_token')
    localStorage.removeItem('fomo_admin')
    navigate('/admin')
  }

  const adminName = admin?.full_name?.split('(')[0]?.trim() || 'Carol Jenny'
  const initials = adminName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CJ'

  return (
    <div className="admin-layout">
      {/* ─── Crimson / Velvet Wine Sidebar ─── */}
      <aside className={`admin-sidebar ${sidebarOpen ? '' : 'admin-sidebar--collapsed'}`}>
        {/* Brand Logo */}
        <div className="admin-sidebar__logo">
          <Link to="/admin/dashboard" className="admin-sidebar__brand">
            <span className="admin-sidebar__brand-script">Lany</span>
            {sidebarOpen && <span className="admin-sidebar__brand-sub">STUDIO MANAGEMENT</span>}
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="admin-sidebar__nav">
          <button
            type="button"
            className={`admin-sidebar__link ${isActive('/admin/dashboard') ? 'admin-sidebar__link--active' : ''}`}
            onClick={() => navigate('/admin/dashboard')}
          >
            <LayoutDashboard size={18} />
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          <button
            type="button"
            className={`admin-sidebar__link ${isActive('/admin/cake-orders') ? 'admin-sidebar__link--active' : ''}`}
            onClick={() => navigate('/admin/cake-orders')}
          >
            <ShoppingBag size={18} />
            {sidebarOpen && (
              <>
                <span>Orders</span>
                <span className="admin-sidebar__badge">Live</span>
              </>
            )}
          </button>

          <button
            type="button"
            className={`admin-sidebar__link ${isActive('/admin/cake-quotes') ? 'admin-sidebar__link--active' : ''}`}
            onClick={() => navigate('/admin/cake-quotes')}
          >
            <FileText size={18} />
            {sidebarOpen && <span>Inquiries</span>}
          </button>

          <button
            type="button"
            className={`admin-sidebar__link ${isActive('/admin/packages') && !location.pathname.endsWith('/new') ? 'admin-sidebar__link--active' : ''}`}
            onClick={() => navigate('/admin/packages')}
          >
            <Package size={18} />
            {sidebarOpen && <span>Catalog</span>}
          </button>

          <button
            type="button"
            className={`admin-sidebar__link ${isActive('/admin/analytics') ? 'admin-sidebar__link--active' : ''}`}
            onClick={() => navigate('/admin/analytics')}
          >
            <TrendingUp size={18} />
            {sidebarOpen && <span>Analytics</span>}
          </button>
        </nav>

        {/* Retain View Storefront Only */}
        <Link
          to="/cakes"
          target="_blank"
          rel="noreferrer"
          className="admin-sidebar__storefront-link"
          title="Open live storefront"
        >
          <ExternalLink size={15} />
          {sidebarOpen && <span>View Storefront</span>}
        </Link>

        {/* Sign Out Footer */}
        <div className="admin-sidebar__footer">
          <button type="button" className="admin-sidebar__logout" onClick={logout}>
            <LogOut size={16} />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ─── Main Content Canvas ─── */}
      <main className={`admin-main ${sidebarOpen ? '' : 'admin-main--collapsed'}`}>
        <header className="admin-header">
          <div className="admin-header__left">
            <button
              type="button"
              className="admin-header__burger"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="admin-header__page-label">Dashboard</span>
          </div>

          <div className="admin-header__right">
            {onSearch && (
              <div className="admin-header__search">
                <Search size={15} />
                <input
                  placeholder="Search orders, inquiries, or catalog…"
                  value={search || ''}
                  onChange={(e) => onSearch(e.target.value)}
                />
              </div>
            )}

            <button type="button" className="admin-header__icon-btn" title="Search">
              <Search size={18} />
            </button>

            <button type="button" className="admin-header__icon-btn admin-header__icon-btn--bell" title="Notifications">
              <Bell size={18} />
              <span className="admin-header__bell-dot"></span>
            </button>

            <Link to="/cakes" target="_blank" rel="noreferrer" className="admin-header__store-btn">
              <Store size={14} />
              <span>Storefront</span>
              <ExternalLink size={12} />
            </Link>

            <div className="admin-header__user-profile">
              <div className="admin-header__avatar">
                {initials}
              </div>
              <div className="admin-header__user-meta">
                <span className="admin-header__user-name">{adminName}</span>
                <span className="admin-header__user-role">Operations Manager</span>
              </div>
              <ChevronDown size={14} className="admin-header__user-chevron" />
            </div>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  )
}
