import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { API_BASE } from '../../config/api.js'

const DEFAULT_GOOGLE_CLIENT_ID =
  '381349159569-m76fua7i69n6jj13u7c771j6kttf8r94.apps.googleusercontent.com'

export default function GoogleOneTap() {
  const { pathname } = useLocation()

  useEffect(() => {
    // 1. Never prompt on Admin portal
    if (pathname.startsWith('/admin')) return

    // 2. Do not prompt if already signed in
    try {
      const saved = localStorage.getItem('fomo_traveler')
      if (saved) return
    } catch {
      // ignore
    }

    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      localStorage.getItem('fomo_google_client_id') ||
      DEFAULT_GOOGLE_CLIENT_ID

    if (!clientId) return

    let cancelled = false
    let timerId = null

    const handleCredentialResponse = async (response) => {
      if (!response || !response.credential || cancelled) return
      try {
        const res = await fetch(`${API_BASE}/api/auth/traveler/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        })
        const data = await res.json()
        if (res.ok && data.user) {
          if (data.token) localStorage.setItem('fomo_traveler_token', data.token)
          localStorage.setItem(
            'fomo_traveler',
            JSON.stringify({
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              mode: 'google',
            })
          )
          window.dispatchEvent(new Event('fomo-auth-change'))
        }
      } catch (err) {
        console.warn('[Google One-Tap Error]:', err)
      }
    }

    const initOneTap = () => {
      if (cancelled || !window.google?.accounts?.id) return
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          itp_support: true,
        })

        // Polite delay: 600ms on login/signup, 2.8s on content/packages to let page render smoothly
        const delay = pathname === '/login' || pathname === '/signup' ? 600 : 2800
        timerId = setTimeout(() => {
          if (cancelled) return
          if (localStorage.getItem('fomo_traveler')) return
          window.google?.accounts?.id?.prompt()
        }, delay)
      } catch (e) {
        console.warn('[One-Tap Setup Error]:', e)
      }
    }

    if (window.google?.accounts?.id) {
      initOneTap()
    } else {
      const checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval)
          initOneTap()
        }
      }, 400)

      return () => {
        cancelled = true
        clearInterval(checkInterval)
        if (timerId) clearTimeout(timerId)
      }
    }

    return () => {
      cancelled = true
      if (timerId) clearTimeout(timerId)
    }
  }, [pathname])

  return null
}
