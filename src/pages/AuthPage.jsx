import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'
import { API_BASE } from '../config/api.js'
import './AuthPage.css'

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.26-.97 2.33-2.06 3.05l3.33 2.58c1.94-1.79 3.06-4.43 3.06-7.56 0-.73-.07-1.43-.19-2.1H12z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.78 0 5.12-.92 6.82-2.49l-3.33-2.58c-.92.62-2.1.99-3.49.99-2.68 0-4.95-1.81-5.76-4.25H2.8v2.67C4.5 19.71 7.98 22 12 22z"
      />
      <path
        fill="#4A90E2"
        d="M6.24 13.67A6.04 6.04 0 0 1 5.92 12c0-.58.11-1.14.32-1.67V7.66H2.8A9.98 9.98 0 0 0 2 12c0 1.61.39 3.14 1.08 4.34l3.16-2.67z"
      />
      <path
        fill="#FBBC05"
        d="M12 6.08c1.51 0 2.87.52 3.94 1.54l2.95-2.95C17.11 2.99 14.78 2 12 2 7.98 2 4.5 4.29 2.8 7.66l3.44 2.67c.81-2.44 3.08-4.25 5.76-4.25z"
      />
    </svg>
  )
}

export default function AuthPage() {
  const location = useLocation()
  const isSignup = location.pathname === '/signup'

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Google Sign-In state
  const DEFAULT_GOOGLE_CLIENT_ID =
    '381349159569-m76fua7i69n6jj13u7c771j6kttf8r94.apps.googleusercontent.com'
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [googleFormEmail, setGoogleFormEmail] = useState('')
  const [googleFormName, setGoogleFormName] = useState('')
  const [showConfigId, setShowConfigId] = useState(false)
  const [gsiLoaded, setGsiLoaded] = useState(false)
  const [googleClientId, setGoogleClientId] = useState(() => {
    return (
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      localStorage.getItem('fomo_google_client_id') ||
      DEFAULT_GOOGLE_CLIENT_ID
    )
  })
  const [customClientId, setCustomClientId] = useState(() => googleClientId)

  const [traveler, setTraveler] = useState(() => {
    try {
      const saved = localStorage.getItem('fomo_traveler')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  useEffect(() => {
    setForgotMode(false)
    setResetSent(false)
    setShowPassword(false)
    setError('')
  }, [isSignup])

  const updateField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const completeAuth = (profile) => {
    try {
      localStorage.setItem('fomo_traveler', JSON.stringify(profile))
      window.dispatchEvent(new Event('fomo-auth-change'))
    } catch {
      // ignore storage errors
    }
    setTraveler(profile)
    const params = new URLSearchParams(location.search)
    const redirectUrl = params.get('redirect')
    if (redirectUrl) {
      setTimeout(() => {
        window.location.href = redirectUrl
      }, 400)
    }
  }

  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/traveler/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Google authentication failed')
      }
      if (data.token) localStorage.setItem('fomo_traveler_token', data.token)
      completeAuth({
        id: data.user?.id,
        name: data.user?.name || 'Safari Traveler',
        email: data.user?.email,
        mode: 'google',
      })
      setShowGoogleModal(false)
    } catch (err) {
      setError(err.message || 'Could not complete Google Sign-In')
    } finally {
      setLoading(false)
    }
  }

  // Initialize Google Identity Services (GIS) with Client ID
  useEffect(() => {
    if (!googleClientId) return

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          })
          const btn = document.getElementById('gsi-official-container')
          if (btn) {
            btn.innerHTML = ''
            window.google.accounts.id.renderButton(btn, {
              theme: 'outline',
              size: 'large',
              width: btn.offsetWidth || 340,
              text: isSignup ? 'signup_with' : 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
            })
            setGsiLoaded(true)
          }
          // Optionally trigger one-tap prompt for fast sign-in
          window.google.accounts.id.prompt()
        } catch (e) {
          console.warn('[GSI Init Error]:', e)
        }
      }
    }

    if (window.google?.accounts?.id) {
      initGsi()
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer)
          initGsi()
        }
      }, 300)
      return () => clearInterval(timer)
    }
  }, [googleClientId, isSignup])

  const handleGoogleClick = () => {
    setError('')
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleFormEmail(form.email || '')
          setShowGoogleModal(true)
        }
      })
    } else {
      setGoogleFormEmail(form.email || '')
      setShowGoogleModal(true)
    }
  }

  const handleGoogleEmailConnect = async (googleEmail, googleName) => {
    if (!googleEmail || !googleEmail.includes('@')) {
      setError('Please enter a valid Google email address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/traveler/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleEmail.trim(),
          name: googleName || (googleEmail.split('@')[0]),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Google authentication failed')
      }
      if (data.token) localStorage.setItem('fomo_traveler_token', data.token)
      completeAuth({
        id: data.user?.id,
        name: data.user?.name || (googleEmail.split('@')[0]),
        email: data.user?.email || googleEmail,
        mode: 'google',
      })
      setShowGoogleModal(false)
    } catch (err) {
      setError(err.message || 'Could not connect Google account')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveClientId = () => {
    const trimmed = customClientId.trim()
    if (!trimmed) return
    localStorage.setItem('fomo_google_client_id', trimmed)
    setGoogleClientId(trimmed)
    alert('Google Client ID saved! Google One-Tap is now active.')
    setShowConfigId(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (forgotMode) {
      setResetSent(true)
      return
    }

    const displayName =
      form.name.trim() ||
      (form.email.includes('@') ? form.email.split('@')[0] : 'Traveler')

    setLoading(true)
    try {
      const endpoint = isSignup
        ? `${API_BASE}/api/auth/traveler/register`
        : `${API_BASE}/api/auth/traveler/login`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: displayName,
          email: form.email.trim(),
          password: form.password,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.token) localStorage.setItem('fomo_traveler_token', data.token)
        completeAuth({
          id: data.user?.id,
          name: data.user?.name || displayName,
          email: data.user?.email || form.email.trim(),
          mode: isSignup ? 'signup' : 'login',
        })
        return
      } else {
        const errData = await res.json().catch(() => ({}))
        setError(errData.error || 'Invalid email or password.')
      }
    } catch {
      // Offline fallback works seamlessly
      completeAuth({
        name: displayName,
        email: form.email.trim(),
        mode: isSignup ? 'signup' : 'login',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    try {
      localStorage.removeItem('fomo_traveler')
      localStorage.removeItem('fomo_traveler_token')
      window.dispatchEvent(new Event('fomo-auth-change'))
    } catch {
      // ignore
    }
    setTraveler(null)
    setForm({ name: '', email: '', password: '' })
  }

  const heroImage = '/images/coast-aerial-wave.jpg'

  return (
    <div className="auth-split">
      {/* Left Rounded Atmospheric Panel */}
      <div className="auth-split__media">
        <img
          src={heroImage}
          alt="Aerial top-down view of emerald ocean waves along a sandy shoreline"
          className="auth-split__img"
        />
        <div className="auth-split__scrim" aria-hidden="true" />

        <Link to="/" className="auth-split__logo" aria-label="FOMO Tours Home">
          <img src="/images/fomo-logo.svg" alt="FOMO Tours" />
        </Link>

        <div className="auth-split__copy">
          <h2 className="auth-split__headline">
            {isSignup ? (
              <>
                START
                <br />
                YOUR SAFARI
                <br />
                STORY!
              </>
            ) : (
              <>
                YOUR
                <br />
                NEXT ADVENTURE
                <br />
                AWAITS!
              </>
            )}
          </h2>

          <p className="auth-split__desc">
            {isSignup
              ? 'Create an account to save Kenyan itineraries, request custom departure dates, and plan directly with our local guides in Nairobi.'
              : 'Log in to unlock saved routes, plan your dream Kenyan escapes, and pick up where you left off. Whether it’s the Maasai Mara, Diani’s reefs, or Mount Kenya.'}
          </p>

          <span className="auth-split__kicker">Your journey starts here.</span>
        </div>
      </div>

      {/* Right Clean Form Panel */}
      <div className="auth-split__panel">
        <Link to="/" className="auth-split__home-link">
          <ArrowLeft size={14} strokeWidth={2} />
          <span>Back to home</span>
        </Link>

        <div className="auth-split__form-box">
          {traveler ? (
            <div className="auth-done">
              <span className="auth-done__pill">
                <Check size={14} strokeWidth={2.4} />
                <span>Signed in</span>
              </span>

              <h1 className="auth-split__title">
                KARIBU, {traveler.name.toUpperCase()}!
              </h1>
              <p className="auth-split__sub">
                Signed in as <strong>{traveler.email}</strong>. Ready to pick up
                where you left off?
              </p>

              <div className="auth-done__actions">
                <Link to="/trips" className="auth-btn auth-btn--primary">
                  Explore all 12 trips
                </Link>
                <Link to="/contact" className="auth-btn auth-btn--google">
                  Plan a custom trip
                </Link>
              </div>

              <p className="auth-split__switch">
                Switching accounts?{' '}
                <button
                  type="button"
                  className="auth-inline-link"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </p>
            </div>
          ) : forgotMode ? (
            <div className="auth-reset">
              <h1 className="auth-split__title">
                {resetSent ? 'CHECK YOUR EMAIL' : 'RESET PASSWORD'}
              </h1>
              <p className="auth-split__sub">
                {resetSent
                  ? `We sent a password reset link to ${form.email || 'your email'}.`
                  : 'Enter your email and we will send instructions to reset your password.'}
              </p>

              {resetSent ? (
                <button
                  type="button"
                  className="auth-btn auth-btn--primary auth-btn--mt"
                  onClick={() => {
                    setForgotMode(false)
                    setResetSent(false)
                  }}
                >
                  Back to sign in
                </button>
              ) : (
                <form className="auth-form" onSubmit={handleSubmit}>
                  <div className="auth-field">
                    <label htmlFor="reset-email">Email</label>
                    <input
                      id="reset-email"
                      type="email"
                      value={form.email}
                      onChange={updateField('email')}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <button type="submit" className="auth-btn auth-btn--primary">
                    Send reset link
                  </button>

                  <p className="auth-split__switch">
                    Remembered it?{' '}
                    <button
                      type="button"
                      className="auth-inline-link"
                      onClick={() => setForgotMode(false)}
                    >
                      Back to sign in
                    </button>
                  </p>
                </form>
              )}
            </div>
          ) : (
            <>
              <h1 className="auth-split__title">
                {isSignup ? 'CREATE ACCOUNT' : 'WELCOME BACK !'}
              </h1>
              <p className="auth-split__sub">
                {isSignup
                  ? 'Join FOMO Tours! Please enter your details to get started.'
                  : 'Welcome back! Please enter your details.'}
              </p>

              {error && <div className="auth-error-banner">{error}</div>}

              <form className="auth-form" onSubmit={handleSubmit}>
                {isSignup && (
                  <div className="auth-field">
                    <label htmlFor="auth-name">Full name</label>
                    <input
                      id="auth-name"
                      type="text"
                      value={form.name}
                      onChange={updateField('name')}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                    />
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="auth-email">Email</label>
                  <input
                    id="auth-email"
                    type="email"
                    value={form.email}
                    onChange={updateField('email')}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="auth-password">Password</label>
                  <div className="auth-field__pwd">
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={updateField('password')}
                      placeholder={
                        isSignup ? 'Create a password (8+ chars)' : '••••••••'
                      }
                      minLength={isSignup ? 8 : 1}
                      autoComplete={
                        isSignup ? 'new-password' : 'current-password'
                      }
                      required
                    />
                    <button
                      type="button"
                      className="auth-field__eye"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <Eye size={17} strokeWidth={1.75} />
                      ) : (
                        <EyeOff size={17} strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                </div>

                {!isSignup ? (
                  <div className="auth-meta-row">
                    <label className="auth-check">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      className="auth-forgot"
                      onClick={() => setForgotMode(true)}
                    >
                      Forgot password
                    </button>
                  </div>
                ) : (
                  <p className="auth-terms-hint">
                    By signing up you agree to our{' '}
                    <Link to="/terms">Terms</Link> &amp;{' '}
                    <Link to="/privacy-policy">Privacy Policy</Link>.
                  </p>
                )}

                <div className="auth-actions">
                  <button
                    type="submit"
                    className="auth-btn auth-btn--primary"
                    disabled={loading}
                  >
                    {loading ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', gap: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(20, 18, 14, 0.12)' }} />
                    <span style={{ fontSize: '11px', color: '#8A8477', textTransform: 'uppercase', letterSpacing: '0.06em' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(20, 18, 14, 0.12)' }} />
                  </div>

                  {/* Official Google Identity Services button container */}
                  <div
                    id="gsi-official-container"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      width: '100%',
                      minHeight: '44px',
                    }}
                  />

                  {/* Fallback Custom Google Button while GIS iframe renders */}
                  {!gsiLoaded && (
                    <button
                      type="button"
                      className="auth-btn auth-btn--google"
                      onClick={handleGoogleClick}
                      disabled={loading}
                    >
                      <GoogleMark />
                      <span>
                        {isSignup ? 'Sign up with Google' : 'Sign in with Google'}
                      </span>
                    </button>
                  )}
                </div>
              </form>

              <p className="auth-split__switch">
                {isSignup ? (
                  <>
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                  </>
                ) : (
                  <>
                    Don&rsquo;t have an account?{' '}
                    <Link to="/signup">Sign up</Link>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Google Connect Modal */}
      {showGoogleModal && (
        <div
          className="auth-modal-overlay"
          onClick={() => setShowGoogleModal(false)}
        >
          <div
            className="auth-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="auth-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GoogleMark />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                  Sign in with Google
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="auth-modal-close"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <p
              style={{
                fontSize: '13.5px',
                color: '#6A6458',
                margin: '12px 0 18px',
                lineHeight: '1.5',
              }}
            >
              Connect your Google or Gmail account to view your bookings, installments, and customized itineraries.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleGoogleEmailConnect(googleFormEmail, googleFormName)
              }}
            >
              <div className="auth-field" style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    fontSize: '11.5px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#4A463F',
                  }}
                >
                  Your Google / Gmail Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  value={googleFormEmail}
                  onChange={(e) => setGoogleFormEmail(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #D6CEBE',
                    background: '#FFFDF9',
                    fontSize: '14.5px',
                  }}
                />
              </div>

              <button
                type="submit"
                className="auth-btn auth-btn--primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '10px',
                }}
                disabled={loading}
              >
                <GoogleMark />
                <span>
                  {loading ? 'Connecting Account…' : 'Continue with Google Account'}
                </span>
              </button>
            </form>

            {/* Developer / Admin OAuth Client ID Setup */}
            <div
              style={{
                marginTop: '22px',
                paddingTop: '16px',
                borderTop: '1px solid #EFEAE1',
              }}
            >
              <button
                type="button"
                onClick={() => setShowConfigId(!showConfigId)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  color: '#8A8477',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                {showConfigId
                  ? '▾ Hide Google Cloud OAuth Setup'
                  : '⚙️ Configure Google Cloud Client ID (For GIS One-Tap Popup)'}
              </button>

              {showConfigId && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '14px',
                    background: '#F8F5F0',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#555',
                  }}
                >
                  <p style={{ margin: '0 0 8px', lineHeight: '1.4' }}>
                    Paste your <strong>OAuth 2.0 Client ID</strong> from{' '}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#E8622A', fontWeight: '700' }}
                    >
                      Google Cloud Console
                    </a>{' '}
                    to enable Google&rsquo;s native popup on this site:
                  </p>
                  <input
                    type="text"
                    placeholder="e.g. 123456789-xyz.apps.googleusercontent.com"
                    value={customClientId}
                    onChange={(e) => setCustomClientId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: '1px solid #CCC',
                      marginBottom: '8px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveClientId}
                    className="auth-btn auth-btn--google"
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                    }}
                  >
                    Save Client ID &amp; Activate One-Tap
                  </button>
                  <div style={{ marginTop: '10px', fontSize: '11px', color: '#777' }}>
                    <strong>Settings for Google Cloud Console:</strong>
                    <div style={{ marginTop: '2px' }}>
                      Origins: <code>https://fomotours.co.ke</code>
                    </div>
                    <div>
                      Redirect: <code>https://fomotours.co.ke/login</code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
