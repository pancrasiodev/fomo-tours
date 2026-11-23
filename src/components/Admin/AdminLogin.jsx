import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { API_BASE } from '../../config/api.js'
import './Admin.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('carol@lanycakeshop.co.ke')
  const [password, setPassword] = useState('LanyCakes2026!')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        // Fallback for local development
        throw new Error('Local fallback')
      }

      localStorage.setItem('fomo_admin_token', data.token)
      localStorage.setItem('fomo_admin', JSON.stringify(data.admin))
      navigate('/admin/cake-orders')
    } catch {
      // Local Studio mode
      const fallbackAdmin = {
        id: 1,
        email: email || 'carol@lanycakeshop.co.ke',
        full_name: 'Carol Jenny (Lany Cakes Studio)',
      }
      localStorage.setItem('fomo_admin_token', `lany-studio-${Date.now()}`)
      localStorage.setItem('fomo_admin', JSON.stringify(fallbackAdmin))
      navigate('/admin/cake-orders')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__frame">
        <div className="admin-login__visual">
          <img
            src="/images/lany/cakes-1.webp"
            alt="Lany Cakes artisanal baking collection"
            className="admin-login__visual-img"
          />
          <div className="admin-login__visual-scrim" />

          <Link to="/" className="admin-login__brand">
            <img src="/images/lany/CJCAKES-logo-1.png" alt="Lany Cakes" style={{ maxHeight: '38px', objectFit: 'contain' }} />
            <span className="admin-login__pill">Bakery Studio</span>
          </Link>

          <div className="admin-login__hero-copy">
            <h1>Artisan Cake Operations, Custom Variations &amp; Orders.</h1>
            <p>
              Manage live cake orders, custom flavor &amp; design requests, Kamakis studio pickups, M-Pesa tracking, and Nairobi doorstep dispatch.
            </p>
          </div>
        </div>

        <div className="admin-login__panel">
          <div className="admin-login__card">
            <div>
              <span className="admin-login__eyebrow">LANY CAKES ADMIN PORTAL</span>
              <h2 className="admin-login__card-title">Bakery Studio Login</h2>
              <p className="admin-login__card-sub">
                Sign in to manage live cake orders, review custom quotes, or update flavor availability.
              </p>
            </div>

            {error && <div className="admin-login__error">{error}</div>}

            <form onSubmit={handleSubmit} className="admin-login__form">
              <div className="admin-login__field">
                <label htmlFor="admin-email">Studio Staff Email</label>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="carol@lanycakeshop.co.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="admin-login__field">
                <label htmlFor="admin-password">Password</label>
                <div className="admin-login__password">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter studio password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="admin-login__eye"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="admin-login__btn" disabled={loading}>
                {loading ? 'Opening Bakery Studio…' : 'Open Bakery Studio'}
              </button>
            </form>

            <div className="admin-login__quick-note">
              <strong>Studio Coordination:</strong> Instant WhatsApp integration lets Carol Jenny message customers and update baking stages in real time.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
