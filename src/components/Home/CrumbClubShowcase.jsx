import { Link } from 'react-router-dom';
import './CrumbClubShowcase.css';

export default function CrumbClubShowcase() {
  return (
    <section id="crumb-showcase" className="crumb-showcase-section">
      <div className="crumb-showcase-container">
        {/* Top Left Title */}
        <div className="crumb-title-block">
          <h2 className="crumb-headline">
            A Little Sweetness, <br />
            A Lot Of Joy
          </h2>
        </div>

        {/* Floating Doodle Sticker (Croissant / Sparkle) */}
        <div className="crumb-doodle-wrap">
          <img 
            src="/images/crumb/croissant_doodle.svg" 
            alt="Artisan Pastry Doodle" 
            className="crumb-doodle-img"
          />
        </div>

        {/* Center Hero: Golden Pastry / Cake on Wooden Board with 3D Looping Ribbon */}
        <div className="crumb-center-visual">
          {/* Looping Ribbon Layer Behind/In-front */}
          <img 
            src="/images/crumb/ribbon_loop.png" 
            alt="" 
            className="crumb-ribbon-loop" 
            aria-hidden="true"
          />
          {/* Centerpiece Golden Pastry Stack */}
          <img 
            src="/images/crumb/croissant_hero.png" 
            alt="Freshly baked artisan croissants and cakes" 
            className="crumb-centerpiece-img"
          />
        </div>

        {/* Top Right Sticker Badge */}
        <div className="crumb-badge-wrap">
          <img 
            src="/images/crumb/crumb_club_sticker.png" 
            alt="Crumb Club Badge" 
            className="crumb-sticker-badge"
          />
        </div>

        {/* Bottom Bar: Action Pill & Subtitle */}
        <div className="crumb-bottom-bar">
          <Link to="/cakes" className="crumb-explore-pill-btn">
            <span>Explore the menu</span>
          </Link>

          <p className="crumb-bottom-subtitle">
            An artisan bakery making fresh celebration cakes, buttery pastries, and reasons to stop by.
          </p>
        </div>
      </div>
    </section>
  );
}
