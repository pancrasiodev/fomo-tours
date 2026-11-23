import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const marqueeItems = [
    { text: "Lany Cakes", img: "/images/home/cta-card-2.jpg" },
    { text: "Lany Cakes", img: "/images/home/cta-card-4.jpg" },
    { text: "Lany Cakes", img: "/images/home/cta-card-3.jpg" },
    { text: "Lany Cakes", img: "/images/home/cta-card-1.jpg" },
    { text: "Lany Cakes", img: "/images/home/cta-card-2.jpg" },
    { text: "Lany Cakes", img: "/images/home/cta-card-4.jpg" },
    { text: "Lany Cakes", img: "/images/home/cta-card-3.jpg" },
    { text: "Lany Cakes", img: "/images/home/cta-card-1.jpg" }
  ];

  return (
    <footer className="framer-bakery-footer" id="footer">
      <div className="framer-footer-container">
        
        {/* Main Grid: Left Brand + Newsletter | Vertical Line | Right Navigation Columns */}
        <div className="framer-footer-top-grid">
          
          {/* Left Column: Brand Logo, Bio, and Newsletter */}
          <div className="footer-left-col">
            <Link to="/" className="footer-brand-logo" aria-label="Lany Cakes Home">
              <img 
                src="/images/lany/lany-official-logo.png" 
                alt="Lany Cakes - Baked with love, made to delight" 
                className="footer-official-logo-img" 
              />
            </Link>

            <p className="footer-brand-bio">
              We help celebrations taste sweeter through freshly baked artisan cakes, handcrafted pastries, and prompt doorstep delivery across Nairobi.
            </p>

            {/* Newsletter Subscription Box */}
            <div className="footer-newsletter-wrap">
              <span className="newsletter-label">SUBSCRIBE TO OUR NEWSLETTER</span>
              <form onSubmit={handleSubscribe} className="newsletter-form-row">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@example.com"
                  required
                  className="newsletter-input"
                  aria-label="Email address"
                />
                <button type="submit" className="newsletter-submit-btn">
                  {subscribed ? "JOINED!" : "SUBSCRIBE"}
                </button>
              </form>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="footer-vertical-divider" aria-hidden="true" />

          {/* Right Navigation Columns */}
          <div className="footer-nav-columns">
            {/* Column 1: Main Page */}
            <div className="footer-nav-col">
              <h3 className="footer-nav-heading">MAIN PAGES</h3>
              <ul className="footer-nav-list">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/cakes">All Cakes Menu</Link></li>
                <li><Link to="/buy-cake-online-in-nairobi">Buy Cake Online</Link></li>
                <li><Link to="/about">About Carol &amp; Studio</Link></li>
                <li><Link to="/custom-order">Custom Orders</Link></li>
                <li><Link to="/blog">Cake Blog &amp; Guides</Link></li>
                <li><Link to="/contact">Studio Pickup</Link></li>
              </ul>
            </div>

            {/* Column 2: Popular Categories */}
            <div className="footer-nav-col">
              <h3 className="footer-nav-heading">POPULAR BAKES</h3>
              <ul className="footer-nav-list">
                <li><Link to="/bento-cakes">Bento Cakes</Link></li>
                <li><Link to="/birthday-cakes-nairobi">Birthday Cakes</Link></li>
                <li><Link to="/birthday-cake-for-boys">Cakes for Boys</Link></li>
                <li><Link to="/graduation-cakes-juja">Graduation Cakes</Link></li>
                <li><Link to="/cupcakes-delivery-ruiru">Artisan Cupcakes</Link></li>
              </ul>
            </div>

            {/* Column 3: Locations (Delivery Hubs) */}
            <div className="footer-nav-col">
              <h3 className="footer-nav-heading">DELIVERY HUBS</h3>
              <ul className="footer-nav-list">
                <li><Link to="/cake-shop-in-ruiru">Cake Shop Ruiru</Link></li>
                <li><Link to="/cake-shop-around-green-spot-eastern-bypass">Green Spot Kamakis</Link></li>
                <li><Link to="/cake-shop-in-juja">Cake Shop Juja</Link></li>
                <li><Link to="/cake-shop-in-kahawa">Kahawa Sukari &amp; Wendani</Link></li>
                <li><Link to="/cake-shop-near-kasarani">Cake Shop Kasarani</Link></li>
                <li><Link to="/cake-shop-near-roysambu">Roysambu &amp; TRM</Link></li>
                <li><Link to="/cake-shop-near-garden-city">Garden City &amp; Thika Rd</Link></li>
                <li><Link to="/cake-shop-near-ruai">Ruai &amp; Utawala</Link></li>
                <li><Link to="/cake-shop-near-tatu-city">Tatu City &amp; Membley</Link></li>
              </ul>
            </div>

            {/* Column 4: Social */}
            <div className="footer-nav-col">
              <h3 className="footer-nav-heading">SOCIAL</h3>
              <ul className="footer-nav-list">
                <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">X ( Twitter )</a></li>
                <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                <li><a href="https://wa.me/254758582215" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Running Big Typography Marquee Ticker */}
        <div className="framer-footer-marquee-strip">
          <div className="marquee-track">
            {marqueeItems.concat(marqueeItems).map((item, idx) => (
              <div key={idx} className="marquee-item">
                <div className="marquee-circle-photo">
                  <img src={item.img} alt="Pastry" />
                </div>
                <span className="marquee-display-word">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Copyright & Credit Bar */}
        <div className="framer-footer-bottom-bar">
          <p className="footer-copyright">
            &copy; Copyright 2026, All Rights Reserved By Lany Cake Shop
          </p>
          <p className="footer-developed-by">
            Developed by <strong className="credit-highlight">Bluegift Digital</strong>
          </p>
        </div>

      </div>
    </footer>
  );
}
