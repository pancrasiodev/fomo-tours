import { Link } from 'react-router-dom';
import { Cake } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  return (
    <section className="lany-hero-outer-frame">
      <div className="lany-hero-card">
        {/* Background Video Layer with Dark Food Cinematography */}
        <div className="lany-hero-backdrop" aria-hidden="true">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/images/hero/hero-cake-clean-bg.png"
            className="lany-hero-bg-video"
          >
            <source src="/videos/cake-hero.webm" type="video/webm" />
            <source src="/videos/cake-hero.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Ambient Dark Chocolate Vignette for Superior Text Contrast */}
        <div className="lany-hero-overlay" aria-hidden="true" />

        {/* Foreground Content */}
        <div className="lany-hero-content-wrap">
          {/* Bottom Area */}
          <div className="lany-hero-bottom-area">
            {/* Left: Social Proof + Large Headline */}
            <div className="lany-hero-col-left">
              <div className="lany-hero-rating-badge">
                <div className="lany-avatar-stack">
                  <img 
                    src="/images/avatars/avatar-1.jpg" 
                    alt="Customer portrait" 
                    className="lany-avatar-img" 
                  />
                  <img 
                    src="/images/avatars/avatar-2.jpg" 
                    alt="Customer portrait" 
                    className="lany-avatar-img" 
                  />
                  <img 
                    src="/images/avatars/avatar-3.jpg" 
                    alt="Customer portrait" 
                    className="lany-avatar-img" 
                  />
                </div>
                <div className="lany-rating-text-wrap">
                  <span className="lany-star-symbol">★</span>
                  <span className="lany-rating-label">5.0 Rated • Best Cake Shop in Nairobi and Ruiru • Kamakis</span>
                </div>
              </div>

              <h1 className="lany-hero-title">
                Cake Shop in{' '}<br />
                Nairobi &amp; Ruiru
              </h1>
            </div>

            {/* Right: Subtitle + Dual Pill Buttons + Keyword Tags */}
            <div className="lany-hero-col-right">
              <p className="lany-hero-description">
                Baking joy from our oven to your table. Whether you're craving an intimate Korean <strong>bento cake</strong>, a vibrant <strong>birthday cake for boys</strong>, or a rich <strong>chocolate brownie cake</strong>, Carol Jenny and our bakers whip up fresh, melt-in-your-mouth celebration cakes daily at Kamakis Eastern Bypass with prompt delivery across Ruiru, Juja &amp; Nairobi.
              </p>

              <div className="lany-hero-actions">
                <Link to="/custom-order" className="lany-btn-order-online">
                  <span>Order Online</span>
                  <span className="lany-btn-icon-bubble">
                    <Cake size={16} />
                  </span>
                </Link>

                <Link to="/cakes" className="lany-btn-view-menu">
                  <span>View Our Menu</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
