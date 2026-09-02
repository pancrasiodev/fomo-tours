import LegalPage from './LegalPage.jsx'

const sections = [
  {
    heading: 'Booking & Payment',
    paragraphs: ['All bookings require a deposit to confirm your reservation. Full payment is due prior to the start of your trip unless otherwise agreed in writing.'],
  },
  {
    heading: 'Cancellations & Refunds',
    paragraphs: ['Cancellations made more than 30 days before departure are eligible for a partial refund. Cancellations within 30 days of departure may not be refundable.'],
  },
  {
    heading: 'Traveler Responsibilities',
    paragraphs: ['Travelers are responsible for ensuring they have valid travel documents, appropriate insurance, and any required vaccinations before departure.'],
  },
  {
    heading: 'Changes to Itinerary',
    paragraphs: ['FOMO Travel reserves the right to modify itineraries due to weather, safety concerns, or circumstances beyond our control. We will make reasonable efforts to notify travelers of any changes.'],
  },
  {
    heading: 'Limitation of Liability',
    paragraphs: ['FOMO Travel is not liable for injury, loss, or damage arising from circumstances outside our reasonable control, including wildlife encounters, weather, or third-party service providers.'],
  },
  {
    heading: 'Governing Law',
    paragraphs: ['These Terms & Conditions are governed by the laws of Kenya.'],
  },
]

export default function TermsPage() {
  return <LegalPage title="Terms & Conditions" updated="August 16, 2026" sections={sections} />
}