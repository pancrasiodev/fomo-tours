import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import TripsPage from './pages/TripsPage.jsx'
import TravelPlanPage from './pages/TravelPlanPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import PrivacyPolicyPage from './pages/Legal/PrivacyPolicyPage.jsx'
import TermsPage from './pages/Legal/TermsPage.jsx'
import DisclaimerPage from './pages/Legal/DisclaimerPage.jsx'
import Navbar from './components/Layout/Navbar.jsx'
import Footer from './components/Layout/Footer.jsx'
import AdminLogin from './components/Admin/AdminLogin.jsx'
import AdminDashboard from './components/Admin/AdminDashboard.jsx'
import AdminPackages from './components/Admin/AdminPackages.jsx'
import AdminPackageForm from './components/Admin/AdminPackageForm.jsx'
import AdminBookings from './components/Admin/AdminBookings.jsx'
import AdminCalendar from './components/Admin/AdminCalendar.jsx'
import SafariDetailPage from './pages/SafariDetailPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
        <Route path="/trips" element={<><Navbar /><TripsPage /><Footer /></>} />
        <Route path="/trips/:slug" element={<><Navbar /><SafariDetailPage /><Footer /></>} />
        <Route path="/travel-plan" element={<><Navbar /><TravelPlanPage /><Footer /></>} />
        <Route path="/about" element={<><Navbar /><AboutPage /><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><ContactPage /><Footer /></>} />
        <Route path="/privacy-policy" element={<><Navbar /><PrivacyPolicyPage /><Footer /></>} />
        <Route path="/terms" element={<><Navbar /><TermsPage /><Footer /></>} />
        <Route path="/disclaimer" element={<><Navbar /><DisclaimerPage /><Footer /></>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/packages" element={<AdminPackages />} />
        <Route path="/admin/packages/new" element={<AdminPackageForm />} />
        <Route path="/admin/packages/edit/:id" element={<AdminPackageForm />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App