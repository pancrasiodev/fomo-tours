import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import './Admin.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      localStorage.setItem('fomo_admin_token', data.token)
      localStorage.setItem('fomo_admin', JSON.stringify(data.admin))
      navigate('/admin/dashboard')
    } catch (err) {
      setError('Server error. Make sure API is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__bg">
        <img src="/images/giraffe-hero.webp" alt="FOMO Tours" />
        <div className="admin-login__bg-overlay" />
      </div>

      <div className="admin-login__container">
        <div className="admin-login__left">
          <img src="/logo.png" alt="FOMO Tours" className="admin-login__logo" />
          <div className="admin-login__hero-text">
            <h1 className="admin-login__title">
              EXPLORE<br />AFRICA
            </h1>
            <p className="admin-login__subtitle">
              Where Every Safari Is A Story<br />Waiting To Happen.
            </p>
            <p className="admin-login__desc">
              Manage your tours, packages, bookings<br />
              and client journeys from one place.
            </p>
          </div>
        </div>

        <div className="admin-login__right">
          <div className="admin-login__card">
            <h2 className="admin-login__card-title">Admin Portal</h2>
            <p className="admin-login__card-sub">Sign in to manage FOMO Tours</p>

            {error && (
              <div className="admin-login__error">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="admin-login__form">
              <div className="admin-login__field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="admin-login__field">
                <label>Password</label>
                <div className="admin-login__password">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="admin-login__eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="admin-login__btn"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'SIGN IN'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}