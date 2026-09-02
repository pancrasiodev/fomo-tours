import LegalPage from './LegalPage.jsx'

const sections = [
  {
    heading: 'Information We Collect',
    paragraphs: ['We collect information you provide directly to us when you book a trip, request a custom itinerary, or contact our team.'],
    list: ['Name, email address, and phone number', 'Travel dates, group size, and destination preferences', 'Payment information (processed securely via third-party providers)'],
  },
  {
    heading: 'How We Use Your Information',
    paragraphs: ['We use the information we collect to plan and confirm your safari bookings, respond to inquiries, and improve our services.'],
  },
  {
    heading: 'Sharing Your Information',
    paragraphs: ['We do not sell your personal information. We may share limited details with trusted partners such as accommodation providers or transport operators solely to fulfill your booking.'],
  },
  {
    heading: 'Data Security',
    paragraphs: ['We implement reasonable safeguards to protect your personal information from unauthorized access, alteration, or disclosure.'],
  },
  {
    heading: 'Your Rights',
    paragraphs: ['You may request access to, correction of, or deletion of your personal data at any time by contacting us at info@fomotours.co.ke.'],
  },
  {
    heading: 'Contact Us',
    paragraphs: ['If you have questions about this Privacy Policy, please reach out to us at info@fomotours.co.ke or +254 700 123 456.'],
  },
]

export default function PrivacyPolicyPage() {
  return <LegalPage title="Privacy Policy" updated="August 16, 2026" sections={sections} />
}