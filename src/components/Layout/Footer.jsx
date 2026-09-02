import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import './Footer.css'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Our Tours', href: '/trips' },
  { label: 'Travel Plan', href: '/travel-plan' },
  { label: 'Explore', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Frequently Asked Questions', href: '/travel-plan' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__card">
        <div className="footer__top">
          <div>
            <h2 className="footer__heading">Book Your Safari Today!</h2>
            <p className="footer__subheading">Join us for an unforgettable Kenyan adventure</p>
          </div>
          <form className="footer__newsletter" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>

        <div className="footer__divider" />

        <div className="footer__main">
          <div className="footer__brand">
            <span className="footer__logo">FOMO Tours</span>
            <p className="footer__desc">
              Discover the breathtaking beauty of Kenya with our exclusive safari tours.
              Witness the Great Migration, embark on thrilling game drives, and immerse
              yourself in rich Maasai culture.
            </p>
            <Link to="/about" className="footer__more">
              More About Us <ArrowUpRight size={14} />
            </Link>
          </div>

          <nav className="footer__nav">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.href}>{link.label}</Link>
            ))}
          </nav>

          <div className="footer__col">
            <h4>Contact Us</h4>
            <p>+254 700 123 456</p>
            <p>info@fomotours.co.ke</p>
          </div>

          <div className="footer__col">
            <h4>Location</h4>
            <p>FOMO Tours & Travel</p>
            <p>Kimathi Street, Nairobi</p>
            <p>Kenya</p>
          </div>

          <div className="footer__col">
            <h4>Company & Legal</h4>
            {companyLinks.map((link) => (
              <Link key={link.label} to={link.href}>{link.label}</Link>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__socials">
            <a href="#" aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6v1.9H16l-.4 2.9h-2.1v7A10 10 0 0 0 22 12z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 5.9c-.7.3-1.5.6-2.4.7.9-.5 1.5-1.4 1.8-2.3-.8.5-1.7.8-2.7 1a4.2 4.2 0 0 0-7.2 3.8A12 12 0 0 1 2.9 4.5a4.2 4.2 0 0 0 1.3 5.6c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.7 3.3 4.1-.6.1-1.2.2-1.8.1.5 1.7 2.1 2.9 4 3A8.4 8.4 0 0 1 2 18.6 11.9 11.9 0 0 0 8.3 20.5c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1z" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.98 3.5C4.98 5 3.8 6.2 2.4 6.2S-.2 5 -.2 3.5 1 .8 2.4.8s2.58 1.2 2.58 2.7zM.2 8.5h4.4V22H.2zM8.6 8.5h4.2v1.8h.1c.6-1.1 2-2.2 4.1-2.2 4.4 0 5.2 2.9 5.2 6.6V22h-4.4v-6.4c0-1.5 0-3.5-2.1-3.5s-2.5 1.7-2.5 3.4V22H8.6z" />
              </svg>
            </a>
            <a href="#" aria-label="YouTube">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6z" />
              </svg>
            </a>
          </div>
          <p className="footer__copyright">
            © 2026 FOMO Tours & Travel. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}