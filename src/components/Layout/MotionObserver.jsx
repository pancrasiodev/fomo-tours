import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const REVEAL_UP_SELECTORS = [
  '.why__intro',
  '.why__reviews',
  '.why__stats-card',
  '.destinations__header',
  '.destinations__track',
  '.trips-sec__header',
  '.trips-sec__more-wrap',
  '.howworks__content',
  '.ways-sec__header',
  '.reviews-sec__header-inner',
  '.reviews-sec__marquee-wrap',
  '.journal-sec__header',
  '.faq-sec__left',
  '.footer__top',
  '.footer__grid',
  '.trips-catalog__header',
  '.dest-catalog__header',
  '.about-hero__inner',
  '.about-story__left',
  '.about-story__right',
  '.about-promises__inner > .about-eyebrow',
  '.about-promises__inner > .about-section-heading',
  '.about-team__inner > .about-eyebrow',
  '.about-team__inner > .about-section-heading',
  '.about-reviews__inner > .about-eyebrow',
  '.about-reviews__inner > .about-section-heading',
  '.journal-catalog__header',
  '.journal-article__back',
  '.journal-article__meta',
  '.journal-article__title',
  '.journal-article__lead',
  '.journal-article__body',
  '.contact-sec__eyebrow',
  '.contact-sec__heading',
  '.contact-sec__sub',
  '.contact-card',
  '.tdetail-header',
  '.tdetail-facts',
  '.tdetail-section',
  '.tdetail-dest-card',
  '.tdetail-book-card',
  '.auth-split__form-box',
].join(', ')

const REVEAL_SCALE_SELECTORS = [
  '.why__photo-wrap',
  '.howworks__photo-wrap',
  '.ways-sec__media',
  '.fquote',
  '.prefooter',
  '.about-hero__banner',
  '.journal-article__hero',
  '.tdetail-gallery',
  '.auth-split__media',
].join(', ')

const STAGGER_GROUPS = [
  { parent: '.why__stats-list', child: '.why__stat-row', step: 55 },
  { parent: '.trips-sec__grid', child: '.trips-card', step: 70 },
  { parent: '.howworks__steps', child: '.howworks__step', step: 85 },
  { parent: '.ways-sec__list', child: '.ways-sec__row', step: 55 },
  { parent: '.journal-sec__grid', child: '.journal-card', step: 80 },
  { parent: '.faq-sec__right', child: '.faq-item', step: 55 },
  { parent: '.dest-catalog__grid', child: '.dest-card', step: 60 },
  { parent: '.about-promises__grid', child: '.about-promise', step: 85 },
  { parent: '.about-team__grid', child: '.about-member', step: 75 },
  { parent: '.about-reviews__grid', child: '.about-rev-card', step: 65 },
  { parent: '.journal-catalog__grid', child: '.jpost-card', step: 70 },
  { parent: '.contact-sec__details', child: '.contact-detail', step: 65 },
]

export default function MotionObserver() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      document.documentElement.classList.remove('has-motion')
      return undefined
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      document.documentElement.classList.remove('has-motion')
      return undefined
    }

    document.documentElement.classList.add('has-motion')

    let disposed = false
    const observedByInstance = new WeakSet()
    const pendingSet = new Set()

    const revealNow = (el) => {
      if (!el || disposed) return
      pendingSet.delete(el)
      if (el.dataset.reveal !== 'visible' && el.dataset.reveal !== 'done') {
        el.dataset.reveal = 'visible'
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealNow(entry.target)
            io.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.04,
        rootMargin: '0px 0px -24px 0px',
      }
    )

    const registerElement = (el, kind = 'up', delayMs = 0) => {
      if (!el || disposed) return
      // Already revealed or finished — leave untouched
      if (el.dataset.reveal === 'visible' || el.dataset.reveal === 'done') return
      // Already registered on this active observer instance
      if (observedByInstance.has(el)) return

      observedByInstance.add(el)
      el.dataset.revealKind = kind
      if (delayMs > 0) {
        el.style.setProperty('--reveal-delay', `${Math.min(delayMs, 360)}ms`)
      }

      const rect = el.getBoundingClientRect()
      const inInitialView = rect.top < window.innerHeight * 0.94 && rect.bottom > 0

      el.dataset.reveal = 'pending'

      if (inInitialView) {
        window.requestAnimationFrame(() => {
          if (!disposed) revealNow(el)
        })
      } else {
        pendingSet.add(el)
        io.observe(el)
      }
    }

    const scanDom = () => {
      if (disposed) return

      document.querySelectorAll(REVEAL_UP_SELECTORS).forEach((el) => {
        registerElement(el, 'up', 0)
      })

      document.querySelectorAll(REVEAL_SCALE_SELECTORS).forEach((el) => {
        registerElement(el, 'scale', 40)
      })

      STAGGER_GROUPS.forEach(({ parent, child, step }) => {
        document.querySelectorAll(parent).forEach((groupEl) => {
          const items = groupEl.querySelectorAll(`:scope > ${child}`)
          items.forEach((item, idx) => {
            registerElement(item, 'up', (idx % 6) * step)
          })
        })
      })
    }

    // Scroll/resize safety check so no pending element can ever remain hidden
    let scrollRaf = null
    const checkPendingInView = () => {
      scrollRaf = null
      if (disposed || pendingSet.size === 0) return
      const triggerLine = window.innerHeight * 0.94
      pendingSet.forEach((el) => {
        if (!el.isConnected) {
          pendingSet.delete(el)
          return
        }
        const rect = el.getBoundingClientRect()
        if (rect.top < triggerLine && rect.bottom > 0) {
          io.unobserve(el)
          revealNow(el)
        }
      })
    }

    const onViewportChange = () => {
      if (scrollRaf === null) {
        scrollRaf = window.requestAnimationFrame(checkPendingInView)
      }
    }

    const onAnimationEnd = (e) => {
      if (e.animationName === 'fomoRevealUp' || e.animationName === 'fomoRevealScale') {
        const target = e.target
        if (target && target.dataset && target.dataset.reveal === 'visible') {
          target.dataset.reveal = 'done'
          target.style.removeProperty('--reveal-delay')
        }
      }
    }

    document.addEventListener('animationend', onAnimationEnd)
    window.addEventListener('scroll', onViewportChange, { passive: true })
    window.addEventListener('resize', onViewportChange)
    scanDom()

    let moRaf = null
    const mo = new MutationObserver(() => {
      if (moRaf !== null) return
      moRaf = window.requestAnimationFrame(() => {
        moRaf = null
        scanDom()
      })
    })

    const root = document.getElementById('root')
    if (root) {
      mo.observe(root, { childList: true, subtree: true })
    }

    return () => {
      disposed = true
      io.disconnect()
      mo.disconnect()
      if (scrollRaf !== null) window.cancelAnimationFrame(scrollRaf)
      if (moRaf !== null) window.cancelAnimationFrame(moRaf)
      document.removeEventListener('animationend', onAnimationEnd)
      window.removeEventListener('scroll', onViewportChange)
      window.removeEventListener('resize', onViewportChange)
    }
  }, [pathname, search])

  return null
}
