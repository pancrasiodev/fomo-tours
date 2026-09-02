import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import './Navbar.css'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Our Tours', href: '/trips' },
  { label: 'Travel Plan', href: '/travel-plan' },
  { label: 'Explore', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [active, setActive] = useState('Home')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = (label, href) => {
    setActive(label)
    setMenuOpen(false)
    if (href.startsWith('/')) {
      navigate(href)
    } else {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <a href="/" className="navbar__logo" onClick={(e) => { e.preventDefault(); handleClick('Home', '/') }}>
          FOMO Travel
        </a>

        <nav className="navbar__capsule navbar__capsule--desktop">
          {links.map((link) => (
            <button
              key={link.label}
              className={`navbar__link ${active === link.label ? 'navbar__link--active' : ''}`}
              onClick={() => handleClick(link.label, link.href)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <a
          href="/travel-plan"
          className="navbar__book navbar__book--desktop"
          onClick={(e) => { e.preventDefault(); handleClick('Travel Plan', '/travel-plan') }}
        >
          Book Now
          <span className="navbar__book-icon"><ArrowUpRight size={16} /></span>
        </a>

        <button
          className="navbar__menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="navbar__mobile-menu">
          {links.map((link) => (
            <button
              key={link.label}
              className={`navbar__mobile-link ${active === link.label ? 'navbar__mobile-link--active' : ''}`}
              onClick={() => handleClick(link.label, link.href)}
            >
              {link.label}
            </button>
          ))}
          <a
            href="/travel-plan"
            className="navbar__book navbar__mobile-book"
            onClick={(e) => { e.preventDefault(); handleClick('Travel Plan', '/travel-plan'); setMenuOpen(false) }}
          >
            Book Now
            <span className="navbar__book-icon"><ArrowUpRight size={16} /></span>
          </a>
        </div>
      )}
    </header>
  )
}