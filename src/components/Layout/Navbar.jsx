import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, ArrowUpRight, ArrowRight } from 'lucide-react';
import { useCart } from '../../utils/cartStore';
import { CAKE_CATEGORIES } from '../../data/cakesData';
import CartDrawer from '../Cart/CartDrawer';
import './Navbar.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  const location = useLocation();
  const closeTimerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    const handleOpenCart = () => setCartOpen(true);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('lany_open_cart', handleOpenCart);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('lany_open_cart', handleOpenCart);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  }, [location.pathname]);

  const handleMenuMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setMegaMenuOpen(true);
  };

  const handleMenuMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 200);
  };

  // 4 Featured Products matching inspiration layout top row
  const featuredBakes = [
    {
      id: 'minimalist-birthday-cake',
      name: 'Minimalist Birthday Cake',
      price: 'KSh 2,500',
      image: '/images/lany/birthday-cake.webp'
    },
    {
      id: 'royal-floral-wedding-tier',
      name: '3-Tier Botanical Wedding',
      price: 'KSh 14,000',
      image: '/images/lany/bridal-cakes.webp'
    },
    {
      id: 'confetti-dream-birthday',
      name: 'Festive Celebration Cake',
      price: 'KSh 3,200',
      image: '/images/lany/birthday-cakes.webp'
    },
    {
      id: 'gourmet-artisan-cupcake-box',
      name: 'Artisan Cupcake Box',
      price: 'KSh 2,400',
      image: '/images/lany/cupcakes.webp'
    }
  ];

  return (
    <>
      {/* Floating Transparent Navigation Header */}
      <header className={`lany-transparent-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="lany-header-row">
          {/* Left: Official Brand Logo */}
          <Link to="/" className="lany-nav-brand" aria-label="Lany Cake Shop Home">
            <img 
              src="/images/lany/lany-official-logo.png" 
              alt="Lany Cakes - Baked with love, made to delight" 
              className="lany-nav-logo-img" 
            />
          </Link>

          {/* Center: Floating Maroon Pill Menu */}
          <nav className="lany-center-pill-menu" aria-label="Main Navigation">
            {/* Menu NavLink with Hover Mega Menu */}
            <div 
              className="lany-menu-wrapper"
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuMouseLeave}
            >
              <NavLink 
                to="/cakes" 
                className={({ isActive }) => `lany-pill-link ${isActive ? 'active' : ''}`}
              >
                Menu
              </NavLink>

              {/* Mega Menu Dropdown in Signature Dark Chocolate */}
              {megaMenuOpen && (
                <div 
                  className="lany-mega-menu-dropdown"
                  onMouseEnter={handleMenuMouseEnter}
                  onMouseLeave={handleMenuMouseLeave}
                >
                  <div className="mega-menu-layout">
                    {/* Left Column: Title, 4 Products Row, and 2 Link Lists */}
                    <div className="mega-menu-main">
                      {/* Top Header */}
                      <div className="mega-main-header">
                        <h3 className="mega-main-title">Our Cakes &amp; Bakes</h3>
                        <Link 
                          to="/cakes" 
                          className="mega-view-all"
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          <span>View all products</span>
                          <ArrowRight size={15} />
                        </Link>
                      </div>

                      {/* 4 Featured Products Row */}
                      <div className="mega-products-grid">
                        {featuredBakes.map((product) => (
                          <Link 
                            key={product.id} 
                            to={`/cake/${product.id}`}
                            className="mega-product-card"
                            onClick={() => setMegaMenuOpen(false)}
                          >
                            <div className="mega-product-img-box">
                              <img src={product.image} alt={product.name} />
                            </div>
                            <h4 className="mega-product-title">{product.name}</h4>
                            <span className="mega-product-price">{product.price}</span>
                          </Link>
                        ))}
                      </div>

                      {/* 2 Navigation Sub-Columns */}
                      <div className="mega-links-subgrid">
                        {/* Sub-column 1: Occasions */}
                        <div className="mega-sub-col">
                          <span className="mega-sub-kicker">POPULAR CATEGORIES</span>
                          <ul className="mega-sub-list">
                            <li><Link to="/bento-cakes" onClick={() => setMegaMenuOpen(false)}>Bento Cakes (From KSh 1,500)</Link></li>
                            <li><Link to="/birthday-cakes-nairobi" onClick={() => setMegaMenuOpen(false)}>Birthday Cakes</Link></li>
                            <li><Link to="/birthday-cake-for-boys" onClick={() => setMegaMenuOpen(false)}>Birthday Cakes for Boys</Link></li>
                            <li><Link to="/graduation-cakes-juja" onClick={() => setMegaMenuOpen(false)}>Graduation Cakes (JKUAT)</Link></li>
                            <li><Link to="/wedding-cakes-nairobi" onClick={() => setMegaMenuOpen(false)}>Wedding &amp; Tiered Cakes</Link></li>
                            <li><Link to="/cupcakes-delivery-ruiru" onClick={() => setMegaMenuOpen(false)}>Artisan Cupcakes</Link></li>
                          </ul>
                        </div>

                        {/* Sub-column 2: Delivery Hubs */}
                        <div className="mega-sub-col">
                          <span className="mega-sub-kicker">DELIVERY &amp; HUBS</span>
                          <ul className="mega-sub-list">
                            <li><Link to="/cake-shop-in-ruiru" onClick={() => setMegaMenuOpen(false)}>Cakeshop Ruiru (Kamakis Bypass)</Link></li>
                            <li><Link to="/cake-shop-around-green-spot-eastern-bypass" onClick={() => setMegaMenuOpen(false)}>Green Spot Eastern Bypass</Link></li>
                            <li><Link to="/cake-shop-in-juja" onClick={() => setMegaMenuOpen(false)}>Cakeshop Juja (JKUAT)</Link></li>
                            <li><Link to="/custom-order" onClick={() => setMegaMenuOpen(false)}>Custom Orders &amp; WhatsApp</Link></li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Dark Promo Card matching inspiration */}
                    <div className="mega-promo-card">
                      <div className="mega-promo-top">
                        <span className="mega-promo-tag">NEW IN</span>
                        <h4 className="mega-promo-heading">CELEBRATE SWEETER</h4>
                      </div>

                      <div className="mega-promo-img-wrap">
                        <img 
                          src="/images/home/cta-card-4.jpg" 
                          alt="Gourmet artisanal celebration cakes in Nairobi" 
                        />
                      </div>

                      <Link 
                        to="/cakes" 
                        className="mega-promo-btn"
                        onClick={() => setMegaMenuOpen(false)}
                      >
                        Shop cakes
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <NavLink 
              to="/about" 
              className={({ isActive }) => `lany-pill-link ${isActive ? 'active' : ''}`}
            >
              About
            </NavLink>
            <NavLink 
              to="/custom-order" 
              className={({ isActive }) => `lany-pill-link ${isActive ? 'active' : ''}`}
            >
              Custom
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => `lany-pill-link ${isActive ? 'active' : ''}`}
            >
              Visit
            </NavLink>
          </nav>

          {/* Right: Cream Action Pill & Cart */}
          <div className="lany-header-right-group">
            <Link to="/cakes" className="lany-find-us-pill">
              <span>Shop</span>
              <ArrowUpRight size={15} className="lany-find-arrow" />
            </Link>

            {/* Cart Trigger */}
            <button 
              className="lany-nav-cart-btn" 
              onClick={() => setCartOpen(true)}
              aria-label={`Cart with ${totalItems} items`}
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && <span className="lany-nav-cart-count">{totalItems}</span>}
            </button>

            {/* Mobile Toggle */}
            <button 
              className="lany-mobile-toggle-btn" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lany-mobile-drawer">
            <nav className="lany-mobile-nav">
              <Link to="/cakes" className="lany-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                Menu
              </Link>
              <Link to="/about" className="lany-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
              <Link to="/custom-order" className="lany-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                Custom
              </Link>
              <Link to="/contact" className="lany-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Cart Drawer Overlay Component */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
