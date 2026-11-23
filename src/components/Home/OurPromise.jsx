import { useEffect, useRef } from 'react'
import './OurPromise.css'

const PROMISE_TEXT =
  'Seven iconic parks. Endless savanna horizons. Unforgettable guided safaris, and always a local Kenyan guide who calls the wild home.'

const WORDS = PROMISE_TEXT.split(' ')
const TOTAL_CHARS = WORDS.reduce((sum, w) => sum + w.length, 0)

export default function OurPromise() {
  const sectionRef = useRef(null)
  const charRefs = useRef([])

  useEffect(() => {
    const chars = charRefs.current
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      chars.forEach((el) => {
        if (el) el.style.opacity = '1'
      })
      return
    }

    let rafId = null

    const update = () => {
      rafId = null
      const el = sectionRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const start = window.innerHeight * 0.78
      const end = window.innerHeight * 0.24
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)))

      // Start the dark shadow right at the middle of the paragraph (~48%)
      // and sweep + fade it out completely as the user scrolls through.
      const cutoff = 0.48 + progress * 0.64
      const feather = 0.13
      const baseShadowFloor = 0.15 + progress * 0.85

      for (let i = 0; i < chars.length; i++) {
        const span = chars[i]
        if (!span) continue
        const pos = i / TOTAL_CHARS
        let alpha
        if (pos <= cutoff - feather) {
          alpha = 1
        } else if (pos >= cutoff) {
          alpha = baseShadowFloor
        } else {
          const t = (cutoff - pos) / feather
          const smooth = t * t * (3 - 2 * t)
          alpha = baseShadowFloor + smooth * (1 - baseShadowFloor)
        }
        span.style.opacity = alpha.toFixed(3)
      }
    }

    const onScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, { passive: true })
      window.removeEventListener('resize', onScroll)
      if (rafId !== null) window.cancelAnimationFrame(rafId)
    }
  }, [])

  let charCursor = 0

  return (
    <section className="promise" ref={sectionRef}>
      <div className="promise__inner">
        <span className="promise__eyebrow">OUR PROMISE</span>

        <h2 className="promise__text" aria-label={PROMISE_TEXT}>
          <span aria-hidden="true">
            {WORDS.map((word, wIdx) => (
              <span key={wIdx} className="promise__word">
                {word.split('').map((char, cIdx) => {
                  const idx = charCursor++
                  return (
                    <span
                      key={cIdx}
                      ref={(node) => {
                        charRefs.current[idx] = node
                      }}
                      className="promise__char"
                    >
                      {char}
                    </span>
                  )
                })}
                {wIdx < WORDS.length - 1 ? '\u00A0' : ''}
              </span>
            ))}
          </span>
        </h2>
      </div>
    </section>
  )
}
