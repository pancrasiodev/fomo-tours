import ContactHero from '../components/ContactUs/ContactHero.jsx'
import ContactSection from '../components/ContactUs/ContactSection.jsx'
import MapSection from '../components/ContactUs/MapSection.jsx'

export default function ContactPage() {
  return (
    <div className="contact-page">
      <ContactHero />
      <ContactSection />
      <MapSection />
    </div>
  )
}