import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CakesPage from './pages/CakesPage';
import CakeDetailPage from './pages/CakeDetailPage';
import TreatsPage from './pages/TreatsPage';
import CustomOrderPage from './pages/CustomOrderPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import OrderTrackPage from './pages/OrderTrackPage';
import RecipesPage from './pages/RecipesPage';
import JournalPage from './pages/JournalPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LocationPage from './pages/LocationPage';
import PrivacyPolicyPage from './pages/Legal/PrivacyPolicyPage';
import TermsPage from './pages/Legal/TermsPage';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import WhatsAppChat from './components/Layout/WhatsAppChat';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminAnalytics from './components/Admin/AdminAnalytics';
import AdminPackages from './components/Admin/AdminPackages';
import AdminPackageForm from './components/Admin/AdminPackageForm';
import AdminJournal from './components/Admin/AdminJournal';
import AdminJournalForm from './components/Admin/AdminJournalForm';
import AdminBookings from './components/Admin/AdminBookings';
import AdminCalendar from './components/Admin/AdminCalendar';
import AdminCakeOrders from './components/Admin/AdminCakeOrders';
import AdminCakeQuotes from './components/Admin/AdminCakeQuotes';
import './index.css';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      }, 50);
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

function PageShell({ children }) {
  const { pathname } = useLocation();
  return (
    <>
      <Navbar />
      <div key={pathname} className="route-shell">
        {children}
        <Footer />
      </div>
      <WhatsAppChat />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Core Pages */}
        <Route path="/" element={<PageShell><HomePage /></PageShell>} />
        <Route path="/best-cake-shop-in-kenya" element={<PageShell><HomePage /></PageShell>} />
        
        {/* Cakes Catalog & Aliases */}
        <Route path="/cakes" element={<PageShell><CakesPage /></PageShell>} />
        <Route path="/buy-cake-online-in-nairobi" element={<PageShell><CakesPage /></PageShell>} />
        <Route path="/cake-store-nairobi" element={<PageShell><CakesPage /></PageShell>} />
        <Route path="/cake/:id" element={<PageShell><CakeDetailPage /></PageShell>} />
        <Route path="/product/:id" element={<PageShell><CakeDetailPage /></PageShell>} />
        {/* 10 Real Customer Cakes - Strict 1:1 Canonical SEO Routes & 301 Redirects */}
        {/* Product #1: Sofia Princess Cake */}
        <Route path="/sofia-the-first-cake" element={<PageShell><CakeDetailPage forcedCakeId="sofia-the-first-princess-cake" /></PageShell>} />
        <Route path="/princess-sofia-cake" element={<Navigate to="/sofia-the-first-cake" replace />} />

        {/* Product #2: Decadent Chocolate Cake */}
        <Route path="/chocolate-cake" element={<PageShell><CakeDetailPage forcedCakeId="chocolate-cake-artisanal-drip" /></PageShell>} />
        <Route path="/chocolate-birthday-cake" element={<Navigate to="/chocolate-cake" replace />} />
        <Route path="/chocolate-drip-cake" element={<Navigate to="/chocolate-cake" replace />} />

        {/* Product #3: Congrats Grad Cake */}
        <Route path="/graduation-cake" element={<PageShell><CakeDetailPage forcedCakeId="graduation-cake-congrats-grad-her" /></PageShell>} />
        <Route path="/graduation-cakes" element={<Navigate to="/graduation-cake" replace />} />
        <Route path="/graduation-cake-designs" element={<Navigate to="/graduation-cake" replace />} />
        <Route path="/congrats-grad-cake" element={<Navigate to="/graduation-cake" replace />} />

        {/* Product #4: Birthday Cake for Mom */}
        <Route path="/birthday-cake-for-mom" element={<PageShell><CakeDetailPage forcedCakeId="birthday-cake-for-mom-gold-butterfly" /></PageShell>} />
        <Route path="/mom-birthday-cake" element={<Navigate to="/birthday-cake-for-mom" replace />} />
        <Route path="/mothers-day-cake" element={<Navigate to="/birthday-cake-for-mom" replace />} />
        <Route path="/happy-birthday-mom-cake" element={<Navigate to="/birthday-cake-for-mom" replace />} />

        {/* Product #5: Paw Patrol 2-Tier Cake */}
        <Route path="/paw-patrol-cake" element={<PageShell><CakeDetailPage forcedCakeId="paw-patrol-birthday-cake-2-tier" /></PageShell>} />
        <Route path="/paw-patrol-birthday-cake" element={<Navigate to="/paw-patrol-cake" replace />} />
        <Route path="/paw-patrol-cake-design" element={<Navigate to="/paw-patrol-cake" replace />} />
        <Route path="/paw-patrol-cakes" element={<Navigate to="/paw-patrol-cake" replace />} />
        <Route path="/2-tier-birthday-cake" element={<Navigate to="/paw-patrol-cake" replace />} />

        {/* Product #6: Kindergarten & Grade 1 Graduation Cake */}
        <Route path="/kindergarten-graduation-cake" element={<PageShell><CakeDetailPage forcedCakeId="kindergarten-grade-1-graduation-cake" /></PageShell>} />
        <Route path="/first-grade-graduation-cake" element={<Navigate to="/kindergarten-graduation-cake" replace />} />
        <Route path="/grade-1-cake" element={<Navigate to="/kindergarten-graduation-cake" replace />} />
        <Route path="/first-grade-cake" element={<Navigate to="/kindergarten-graduation-cake" replace />} />
        <Route path="/pp2-graduation-cake" element={<Navigate to="/kindergarten-graduation-cake" replace />} />
        <Route path="/preschool-graduation-cake" element={<Navigate to="/kindergarten-graduation-cake" replace />} />
        <Route path="/school-graduation-cake" element={<Navigate to="/kindergarten-graduation-cake" replace />} />

        {/* Product #7: Bento Cake & 5-Cupcake Celebration Box */}
        <Route path="/bento-cake-cupcake-combo-nairobi" element={<PageShell><CakeDetailPage forcedCakeId="bento-cupcake-combo" /></PageShell>} />
        <Route path="/bento-cupcake-combo" element={<Navigate to="/bento-cake-cupcake-combo-nairobi" replace />} />
        <Route path="/bento-cake-and-cupcakes" element={<Navigate to="/bento-cake-cupcake-combo-nairobi" replace />} />
        <Route path="/bento-combo" element={<Navigate to="/bento-cake-cupcake-combo-nairobi" replace />} />

        {/* Product #8: Salted Caramel Naked Birthday Cake */}
        <Route path="/salted-caramel-cake" element={<PageShell><CakeDetailPage forcedCakeId="salted-caramel-naked-birthday-cake" /></PageShell>} />
        <Route path="/caramel-cake" element={<Navigate to="/salted-caramel-cake" replace />} />
        <Route path="/caramel-birthday-cake" element={<Navigate to="/salted-caramel-cake" replace />} />
        <Route path="/salted-caramel-birthday-cake" element={<Navigate to="/salted-caramel-cake" replace />} />
        <Route path="/chocolate-caramel-cake" element={<Navigate to="/salted-caramel-cake" replace />} />
        <Route path="/naked-caramel-cake" element={<Navigate to="/salted-caramel-cake" replace />} />

        {/* Product #9: Minecraft 2-Tier Celebration Cake */}
        <Route path="/minecraft-cake" element={<PageShell><CakeDetailPage forcedCakeId="minecraft-birthday-cake-2-tier" /></PageShell>} />
        <Route path="/minecraft-birthday-cake" element={<Navigate to="/minecraft-cake" replace />} />
        <Route path="/minecraft-cakes" element={<Navigate to="/minecraft-cake" replace />} />
        <Route path="/minecraft-cake-design" element={<Navigate to="/minecraft-cake" replace />} />
        <Route path="/minecraft-cake-designs" element={<Navigate to="/minecraft-cake" replace />} />
        <Route path="/2-tier-minecraft-cake" element={<Navigate to="/minecraft-cake" replace />} />
        <Route path="/davids-baptism-cake" element={<Navigate to="/minecraft-cake" replace />} />

        {/* Product #10: Like Nastya 2-Tier Rainbow Birthday Cake */}
        <Route path="/rainbow-cake" element={<PageShell><CakeDetailPage forcedCakeId="like-nastya-rainbow-birthday-cake" /></PageShell>} />
        <Route path="/rainbow-birthday-cake" element={<Navigate to="/rainbow-cake" replace />} />
        <Route path="/rainbow-cakes" element={<Navigate to="/rainbow-cake" replace />} />
        <Route path="/rainbow-cake-nairobi" element={<Navigate to="/rainbow-cake" replace />} />
        <Route path="/like-nastya-cake" element={<Navigate to="/rainbow-cake" replace />} />
        <Route path="/like-nastya-birthday-cake" element={<Navigate to="/rainbow-cake" replace />} />
        <Route path="/rainbow-birthday-cake-girls" element={<Navigate to="/rainbow-cake" replace />} />
        <Route path="/girls-birthday-cake-rainbow" element={<Navigate to="/rainbow-cake" replace />} />
        <Route path="/2-tier-girls-birthday-cake" element={<Navigate to="/rainbow-cake" replace />} />
        <Route path="/nastya-cake" element={<Navigate to="/rainbow-cake" replace />} />
        <Route path="/butterfly-birthday-cake" element={<Navigate to="/rainbow-cake" replace />} />

        {/* Product #11: Spider-Man Superhero Boys Birthday Cake */}
        <Route path="/spiderman-cake" element={<PageShell><CakeDetailPage forcedCakeId="spiderman-superhero-birthday-cake" /></PageShell>} />
        <Route path="/spiderman-birthday-cake" element={<Navigate to="/spiderman-cake" replace />} />
        <Route path="/spider-man-cake" element={<Navigate to="/spiderman-cake" replace />} />
        <Route path="/birthday-cake-for-boys-spiderman" element={<Navigate to="/spiderman-cake" replace />} />
        <Route path="/spiderman-cakes" element={<Navigate to="/spiderman-cake" replace />} />
        <Route path="/spiderman-cake-design" element={<Navigate to="/spiderman-cake" replace />} />
        <Route path="/boys-spiderman-cake" element={<Navigate to="/spiderman-cake" replace />} />

        {/* Product #12: Half and Half Dual-Tone Baby Birthday Cake */}
        <Route path="/half-and-half-cake" element={<PageShell><CakeDetailPage forcedCakeId="half-and-half-baby-birthday-cake" /></PageShell>} />
        <Route path="/half-and-half-birthday-cake" element={<Navigate to="/half-and-half-cake" replace />} />
        <Route path="/split-birthday-cake" element={<Navigate to="/half-and-half-cake" replace />} />
        <Route path="/two-tone-birthday-cake" element={<Navigate to="/half-and-half-cake" replace />} />
        <Route path="/baby-birthday-cake-nairobi" element={<Navigate to="/half-and-half-cake" replace />} />
        <Route path="/baby-lucy-birthday-cake" element={<Navigate to="/half-and-half-cake" replace />} />
        <Route path="/pink-and-yellow-cake" element={<Navigate to="/half-and-half-cake" replace />} />

        {/* Product #13: Spider-Man Comic City Skyline Birthday Cake */}
        <Route path="/spiderman-comic-city-cake" element={<PageShell><CakeDetailPage forcedCakeId="spiderman-comic-city-birthday-cake" /></PageShell>} />
        <Route path="/spiderman-theme-cake" element={<Navigate to="/spiderman-comic-city-cake" replace />} />
        <Route path="/spiderman-11th-birthday-cake" element={<Navigate to="/spiderman-comic-city-cake" replace />} />
        <Route path="/superhero-birthday-cake" element={<Navigate to="/spiderman-comic-city-cake" replace />} />
        <Route path="/spiderman-comic-cake" element={<Navigate to="/spiderman-comic-city-cake" replace />} />
        <Route path="/boys-superhero-cake-nairobi" element={<Navigate to="/spiderman-comic-city-cake" replace />} />
        <Route path="/spiderman-action-cake" element={<Navigate to="/spiderman-comic-city-cake" replace />} />

        {/* Product #14: Holy Spirit Dove & Rosary Baptism Cake */}
        <Route path="/holy-spirit-baptism-cake" element={<PageShell><CakeDetailPage forcedCakeId="holy-spirit-baptism-cake" /></PageShell>} />
        <Route path="/baptism-cake" element={<Navigate to="/holy-spirit-baptism-cake" replace />} />
        <Route path="/baptism-cake-nairobi" element={<Navigate to="/holy-spirit-baptism-cake" replace />} />
        <Route path="/christening-cake" element={<Navigate to="/holy-spirit-baptism-cake" replace />} />
        <Route path="/baby-dedication-cake" element={<Navigate to="/holy-spirit-baptism-cake" replace />} />
        <Route path="/first-communion-cake" element={<Navigate to="/holy-spirit-baptism-cake" replace />} />
        <Route path="/rosary-cross-cake" element={<Navigate to="/holy-spirit-baptism-cake" replace />} />
        <Route path="/girls-baptism-cake" element={<Navigate to="/holy-spirit-baptism-cake" replace />} />

        {/* Product #15: Farewell Bento Cake & 5-Cupcake Celebration Box */}
        <Route path="/farewell-bento-cupcake-combo" element={<PageShell><CakeDetailPage forcedCakeId="farewell-doctor-bento-cupcake-combo" /></PageShell>} />
        <Route path="/farewell-cake" element={<Navigate to="/farewell-bento-cupcake-combo" replace />} />
        <Route path="/doctor-farewell-cake" element={<Navigate to="/farewell-bento-cupcake-combo" replace />} />
        <Route path="/goodbye-cake" element={<Navigate to="/farewell-bento-cupcake-combo" replace />} />
        <Route path="/bento-cupcake-farewell" element={<Navigate to="/farewell-bento-cupcake-combo" replace />} />
        <Route path="/dr-njogu-farewell-cake" element={<Navigate to="/farewell-bento-cupcake-combo" replace />} />

        {/* Product #16: K-Pop Demon Hunters 2-Tier Birthday Cake */}
        <Route path="/kpop-demon-hunters-cake" element={<PageShell><CakeDetailPage forcedCakeId="kpop-demon-hunters-birthday-cake" /></PageShell>} />
        <Route path="/kpop-cake" element={<Navigate to="/kpop-demon-hunters-cake" replace />} />
        <Route path="/k-pop-birthday-cake" element={<Navigate to="/kpop-demon-hunters-cake" replace />} />
        <Route path="/anime-2-tier-cake" element={<Navigate to="/kpop-demon-hunters-cake" replace />} />
        <Route path="/demon-hunters-cake" element={<Navigate to="/kpop-demon-hunters-cake" replace />} />
        <Route path="/happy-birthday-paccy-cake" element={<Navigate to="/kpop-demon-hunters-cake" replace />} />
        <Route path="/2-tier-kpop-cake" element={<Navigate to="/kpop-demon-hunters-cake" replace />} />

        {/* Product #17: Barbie Princess Tiara Birthday Cake */}
        <Route path="/barbie-princess-cake" element={<PageShell><CakeDetailPage forcedCakeId="barbie-princess-tiara-birthday-cake" /></PageShell>} />
        <Route path="/barbie-cake" element={<Navigate to="/barbie-princess-cake" replace />} />
        <Route path="/barbie-birthday-cake" element={<Navigate to="/barbie-princess-cake" replace />} />
        <Route path="/barbie-cake-nairobi" element={<Navigate to="/barbie-princess-cake" replace />} />
        <Route path="/princess-tiara-cake" element={<Navigate to="/barbie-princess-cake" replace />} />
        <Route path="/natalie-9-barbie-cake" element={<Navigate to="/barbie-princess-cake" replace />} />
        <Route path="/pink-barbie-birthday-cake" element={<Navigate to="/barbie-princess-cake" replace />} />

        {/* Product #18: Ocean Azure Blue Combed Buttercream Birthday Cake */}
        <Route path="/ocean-azure-blue-cake" element={<PageShell><CakeDetailPage forcedCakeId="ocean-azure-blue-birthday-cake" /></PageShell>} />
        <Route path="/blue-birthday-cake" element={<Navigate to="/ocean-azure-blue-cake" replace />} />
        <Route path="/blue-cake-nairobi" element={<Navigate to="/ocean-azure-blue-cake" replace />} />
        <Route path="/birthday-cake-for-men" element={<Navigate to="/ocean-azure-blue-cake" replace />} />
        <Route path="/simple-blue-birthday-cake" element={<Navigate to="/ocean-azure-blue-cake" replace />} />
        <Route path="/elegant-blue-cake" element={<Navigate to="/ocean-azure-blue-cake" replace />} />

        {/* Product #19: Sofia the First Fairytale 1st Birthday Cake */}
        <Route path="/sofia-first-birthday-cake" element={<PageShell><CakeDetailPage forcedCakeId="sofia-fairytale-princess-first-birthday-cake" /></PageShell>} />
        <Route path="/sofia-the-first-cake-chloe" element={<Navigate to="/sofia-first-birthday-cake" replace />} />
        <Route path="/chloe-turns-one-cake" element={<Navigate to="/sofia-first-birthday-cake" replace />} />
        <Route path="/sofia-princess-1st-birthday-cake" element={<Navigate to="/sofia-first-birthday-cake" replace />} />
        <Route path="/sofia-cake-pink" element={<Navigate to="/sofia-first-birthday-cake" replace />} />

        {/* Product #20: Happy Mother's Day Butterfly Celebration Cake in Window Box */}
        <Route path="/mothers-day-butterfly-cake" element={<PageShell><CakeDetailPage forcedCakeId="mothers-day-butterfly-gift-cake" /></PageShell>} />
        <Route path="/mothers-day-cake" element={<Navigate to="/mothers-day-butterfly-cake" replace />} />
        <Route path="/mother-day-cake-nairobi" element={<Navigate to="/mothers-day-butterfly-cake" replace />} />
        <Route path="/mom-birthday-cake" element={<Navigate to="/mothers-day-butterfly-cake" replace />} />
        <Route path="/butterfly-mothers-day-cake" element={<Navigate to="/mothers-day-butterfly-cake" replace />} />
        <Route path="/gift-box-cake" element={<Navigate to="/mothers-day-butterfly-cake" replace />} />

        {/* Keyword-Targeted Category Permalinks (Based on Google Search Queries) */}
        <Route path="/bento-cakes" element={<PageShell><CakesPage forcedCategory="bento" /></PageShell>} />
        <Route path="/bento-cake" element={<PageShell><CakesPage forcedCategory="bento" /></PageShell>} />
        <Route path="/bento" element={<PageShell><CakesPage forcedCategory="bento" /></PageShell>} />
        <Route path="/bento-cakes-nairobi" element={<PageShell><CakesPage forcedCategory="bento" /></PageShell>} />

        <Route path="/birthday-cakes" element={<PageShell><CakesPage forcedCategory="birthday" /></PageShell>} />
        <Route path="/birthday-cake" element={<PageShell><CakesPage forcedCategory="birthday" /></PageShell>} />
        <Route path="/birthday-cakes-nairobi" element={<PageShell><CakesPage forcedCategory="birthday" /></PageShell>} />

        <Route path="/birthday-cake-for-boys" element={<PageShell><CakesPage forcedCategory="boys-birthday" /></PageShell>} />
        <Route path="/boys-cakes-for-birthday" element={<PageShell><CakesPage forcedCategory="boys-birthday" /></PageShell>} />

        <Route path="/graduation-cakes" element={<PageShell><CakesPage forcedCategory="graduation" /></PageShell>} />
        <Route path="/graduation-cake" element={<PageShell><CakesPage forcedCategory="graduation" /></PageShell>} />
        <Route path="/graduation-cakes-juja" element={<PageShell><CakesPage forcedCategory="graduation" /></PageShell>} />

        <Route path="/baby-shower-cakes" element={<PageShell><CakesPage forcedCategory="baby-shower" /></PageShell>} />
        <Route path="/baby-shower-cake" element={<PageShell><CakesPage forcedCategory="baby-shower" /></PageShell>} />
        <Route path="/baby-shower-cakes-nairobi" element={<PageShell><CakesPage forcedCategory="baby-shower" /></PageShell>} />

        <Route path="/cupcakes" element={<PageShell><CakesPage forcedCategory="cupcakes" /></PageShell>} />
        <Route path="/cupcake" element={<PageShell><CakesPage forcedCategory="cupcakes" /></PageShell>} />
        <Route path="/cupcakes-delivery-ruiru" element={<PageShell><CakesPage forcedCategory="cupcakes" /></PageShell>} />

        <Route path="/chocolate-brownie-cake" element={<PageShell><CakesPage forcedCategory="brownies" /></PageShell>} />
        <Route path="/fondant-cake" element={<PageShell><CakesPage forcedCategory="fondant" /></PageShell>} />
        <Route path="/fondant-cakes" element={<PageShell><CakesPage forcedCategory="fondant" /></PageShell>} />
        <Route path="/wedding-cakes-nairobi" element={<PageShell><CakesPage forcedCategory="wedding" /></PageShell>} />

        {/* Treats & Snacks */}
        <Route path="/treats-and-snacks" element={<PageShell><TreatsPage /></PageShell>} />

        {/* Custom Cake Order & Aliases */}
        <Route path="/custom-order" element={<PageShell><CustomOrderPage /></PageShell>} />
        <Route path="/custom-birthday-cakes-nairobi" element={<PageShell><CustomOrderPage /></PageShell>} />
        <Route path="/custom-cakes-nairobi" element={<PageShell><CustomOrderPage /></PageShell>} />
        
        {/* Customer / Client Dashboard & Live Order Tracking */}
        <Route path="/dashboard" element={<PageShell><CustomerDashboardPage /></PageShell>} />
        <Route path="/client" element={<PageShell><CustomerDashboardPage /></PageShell>} />
        <Route path="/my-orders" element={<PageShell><CustomerDashboardPage /></PageShell>} />
        <Route path="/track" element={<PageShell><CustomerDashboardPage /></PageShell>} />
        <Route path="/order-track" element={<PageShell><CustomerDashboardPage /></PageShell>} />

        {/* Recipes & Blog (Connected to Content Desk /admin/journal) */}
        <Route path="/recipes" element={<PageShell><RecipesPage /></PageShell>} />
        <Route path="/cake-recipes-and-snack-recipes" element={<PageShell><RecipesPage /></PageShell>} />
        <Route path="/blog" element={<PageShell><JournalPage /></PageShell>} />
        <Route path="/blog/:slug" element={<PageShell><JournalPage /></PageShell>} />

        {/* About Us & Aliases */}
        <Route path="/about" element={<PageShell><AboutPage /></PageShell>} />
        <Route path="/about-lany-cakes" element={<PageShell><AboutPage /></PageShell>} />
        <Route path="/about-lany-cake-shop-nairobi" element={<PageShell><AboutPage /></PageShell>} />

        {/* Contact Us & Aliases */}
        <Route path="/contact" element={<PageShell><ContactPage /></PageShell>} />
        <Route path="/contact-us" element={<PageShell><ContactPage /></PageShell>} />
        <Route path="/cake-shop-kamakis-eastern-bypass" element={<PageShell><ContactPage /></PageShell>} />

        {/* Hyperlocal Search Intent & Neighborhood Landing Pages */}
        <Route path="/cake-shop-in-ruiru" element={<PageShell><LocationPage forcedLocation="ruiru" /></PageShell>} />
        <Route path="/cake-shop-ruiru" element={<PageShell><LocationPage forcedLocation="ruiru" /></PageShell>} />
        <Route path="/bake-cakes-near-ruiru" element={<PageShell><LocationPage forcedLocation="ruiru" /></PageShell>} />
        <Route path="/cake-shop-around-green-spot-eastern-bypass" element={<PageShell><LocationPage forcedLocation="ruiru" /></PageShell>} />
        <Route path="/cke-shop-around-green-spot-eastern-bypass" element={<PageShell><LocationPage forcedLocation="ruiru" /></PageShell>} />
        <Route path="/knord-mall-cake-shop" element={<PageShell><LocationPage forcedLocation="ruiru" /></PageShell>} />
        <Route path="/birthday-cake-within-800m" element={<PageShell><LocationPage forcedLocation="ruiru" /></PageShell>} />
        <Route path="/cake-shop-in-juja" element={<PageShell><LocationPage forcedLocation="juja" /></PageShell>} />
        <Route path="/cake-shop-juja" element={<PageShell><LocationPage forcedLocation="juja" /></PageShell>} />
        <Route path="/cake-shop-in-kahawa" element={<PageShell><LocationPage forcedLocation="kahawa" /></PageShell>} />
        <Route path="/cake-shop-kahawa-sukari" element={<PageShell><LocationPage forcedLocation="kahawa" /></PageShell>} />
        <Route path="/cake-shop-kahawa-wendani" element={<PageShell><LocationPage forcedLocation="kahawa" /></PageShell>} />
        <Route path="/cake-shop-near-kasarani" element={<PageShell><LocationPage forcedLocation="kasarani" /></PageShell>} />
        <Route path="/cake-shop-in-kasarani" element={<PageShell><LocationPage forcedLocation="kasarani" /></PageShell>} />
        <Route path="/cakes-in-kasarani" element={<PageShell><LocationPage forcedLocation="kasarani" /></PageShell>} />
        <Route path="/cake-shop-near-roysambu" element={<PageShell><LocationPage forcedLocation="roysambu" /></PageShell>} />
        <Route path="/cake-shop-in-roysambu" element={<PageShell><LocationPage forcedLocation="roysambu" /></PageShell>} />
        <Route path="/cake-shop-near-garden-city" element={<PageShell><LocationPage forcedLocation="garden-city" /></PageShell>} />
        <Route path="/cake-shop-garden-city" element={<PageShell><LocationPage forcedLocation="garden-city" /></PageShell>} />
        <Route path="/cake-shop-near-ruai" element={<PageShell><LocationPage forcedLocation="ruai" /></PageShell>} />
        <Route path="/cake-shop-in-ruai" element={<PageShell><LocationPage forcedLocation="ruai" /></PageShell>} />
        <Route path="/cake-shop-utawala" element={<PageShell><LocationPage forcedLocation="ruai" /></PageShell>} />
        <Route path="/cake-shop-near-tatu-city" element={<PageShell><LocationPage forcedLocation="tatu-city" /></PageShell>} />
        <Route path="/cake-shop-in-tatu-city" element={<PageShell><LocationPage forcedLocation="tatu-city" /></PageShell>} />
        <Route path="/locations/:slug" element={<PageShell><LocationPage /></PageShell>} />

        {/* Legal */}
        <Route path="/privacy" element={<PageShell><PrivacyPolicyPage /></PageShell>} />
        <Route path="/terms" element={<PageShell><TermsPage /></PageShell>} />

        {/* Admin & Studio Analytics */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/packages" element={<AdminPackages />} />
        <Route path="/admin/packages/new" element={<AdminPackageForm />} />
        <Route path="/admin/packages/edit/:id" element={<AdminPackageForm />} />
        <Route path="/admin/journal" element={<AdminJournal />} />
        <Route path="/admin/journal/new" element={<AdminJournalForm />} />
        <Route path="/admin/journal/edit/:id" element={<AdminJournalForm />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
        <Route path="/admin/cake-orders" element={<AdminCakeOrders />} />
        <Route path="/admin/cake-quotes" element={<AdminCakeQuotes />} />

        {/* Legacy Clean-up Redirects */}
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/signin" element={<Navigate to="/dashboard" replace />} />
        <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
        <Route path="/trips" element={<Navigate to="/cakes" replace />} />
        <Route path="/trips/*" element={<Navigate to="/cakes" replace />} />
        <Route path="/destinations" element={<Navigate to="/cakes" replace />} />
        <Route path="/destinations/*" element={<Navigate to="/cakes" replace />} />
        <Route path="/journal" element={<PageShell><JournalPage /></PageShell>} />
        <Route path="/journal/:slug" element={<PageShell><JournalPage /></PageShell>} />
        <Route path="/safari/*" element={<Navigate to="/cakes" replace />} />

        {/* Fallback */}
        <Route path="*" element={<PageShell><HomePage /></PageShell>} />
      </Routes>
    </BrowserRouter>
  );
}
