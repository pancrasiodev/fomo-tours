import { useState } from 'react'
import { ArrowUpRight, Calendar, Users, MapPin, Wallet, Sparkles } from 'lucide-react'
import AIPlannerModal from '../Trips/AIPlannerModal.jsx'
import './TravelPlan.css'

const destinations = ['Masai Mara', 'Amboseli', 'Serengeti', 'Mount Kenya', 'Diani Beach', 'Samburu']
const budgets = ['Under $500', '$500 - $1,000', '$1,000 - $2,500', '$2,500+']

export default function TravelPlan() {
  const [selectedDest, setSelectedDest] = useState([])
  const [selectedBudget, setSelectedBudget] = useState('$500 - $1,000')
  const [submitted, setSubmitted] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)

  const toggleDest = (d) => {
    setSelectedDest((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="travelplan__split container">
      {showAiModal && <AIPlannerModal onClose={() => setShowAiModal(false)} />}

      <div className="travelplan__panel">
        <h2 className="travelplan__panel-title">Plan Your Trip</h2>
        <p className="travelplan__panel-sub">Fill in your details and we'll get back to you within 24 hours.</p>

        {submitted ? (
          <div className="travelplan__success">
            <h3>Thank you! 🎉</h3>
            <p>Our team has received your request and will reach out with a custom itinerary.</p>
          </div>
        ) : (
          <form className="travelplan__form" onSubmit={handleSubmit}>
            <div className="travelplan__row">
              <div className="travelplan__field">
                <label>Full Name</label>
                <input type="text" placeholder="Jane Doe" required />
              </div>
              <div className="travelplan__field">
                <label>Email Address</label>
                <input type="email" placeholder="jane@email.com" required />
              </div>
            </div>

            <div className="travelplan__row">
              <div className="travelplan__field">
                <label><Calendar size={14} /> Travel Dates</label>
                <input type="date" required />
              </div>
              <div className="travelplan__field">
                <label><Users size={14} /> Group Size</label>
                <input type="number" min="1" placeholder="e.g. 4" required />
              </div>
            </div>

            <div className="travelplan__field">
              <label><MapPin size={14} /> Destinations</label>
              <div className="travelplan__pills">
                {destinations.map((d) => (
                  <button
                    type="button"
                    key={d}
                    className={`travelplan__pill ${selectedDest.includes(d) ? 'travelplan__pill--active' : ''}`}
                    onClick={() => toggleDest(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="travelplan__field">
              <label><Wallet size={14} /> Budget (per person)</label>
              <div className="travelplan__pills">
                {budgets.map((b) => (
                  <button
                    type="button"
                    key={b}
                    className={`travelplan__pill ${selectedBudget === b ? 'travelplan__pill--active' : ''}`}
                    onClick={() => setSelectedBudget(b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="travelplan__field">
              <label>Tell Us More</label>
              <textarea placeholder="Any special requests or interests?" rows={3} />
            </div>

            <button type="submit" className="travelplan__submit">
              Request My Custom Trip <ArrowUpRight size={16} />
            </button>
          </form>
        )}
      </div>

      <div className="travelplan__panel travelplan__panel--ai">
        <div className="travelplan__ai-icon"><Sparkles size={22} /></div>
        <h2 className="travelplan__panel-title">Plan With AI</h2>
        <p className="travelplan__panel-sub">
          Skip the form. Chat with our AI travel planner and get a personalized
          Kenyan safari itinerary in seconds — powered by Gemini.
        </p>
        <ul className="travelplan__ai-features">
          <li>Instant destination suggestions</li>
          <li>Personalized to your dates and budget</li>
          <li>Ask follow-up questions anytime</li>
        </ul>
        <button className="travelplan__ai-cta" onClick={() => setShowAiModal(true)}>
          <Sparkles size={16} /> Start Planning With AI
        </button>
      </div>
    </div>
  )
}