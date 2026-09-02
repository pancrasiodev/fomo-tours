import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import TripHero from '../components/TripDetails/TripHero'
import TripOverview from '../components/TripDetails/TripOverview'
import TripItinerary from '../components/TripDetails/TripItinerary'
import TripInclusions from '../components/TripDetails/TripInclusions'
import TripBooking from '../components/TripDetails/TripBooking'
import '../components/TripDetails/TripDetails.css'

export default function SafariDetailPage() {
  const { slug } = useParams()
  const [pkg, setPkg] = useState(null)
  const [days, setDays] = useState([])
  const [dates, setDates] = useState([])
  const [gallery, setGallery] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPackage()
  }, [slug])

  const fetchPackage = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/packages/${slug}`)
      if (!res.ok) throw new Error('Package not found')
      const data = await res.json()
      setPkg(data.package)
      setDays(data.days || [])
      setDates(data.dates || [])
      setGallery(data.gallery || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="trip-loading">
      <div className="trip-loading__spinner" />
      <p>Loading safari details...</p>
    </div>
  )

  if (error || !pkg) return (
    <div className="trip-error">
      <h2>Safari Not Found</h2>
      <p>The safari you're looking for doesn't exist or has been removed.</p>
      <a href="/trips">Browse All Safaris</a>
    </div>
  )

  const highlights = pkg.highlights ? JSON.parse(pkg.highlights) : []
  const inclusions = pkg.inclusions ? JSON.parse(pkg.inclusions) : []
  const exclusions = pkg.exclusions ? JSON.parse(pkg.exclusions) : []

  return (
    <div className="trip-details">
      <TripHero pkg={pkg} />

      <div className="trip-details__body">
        <div className="trip-details__main">
          <TripOverview pkg={pkg} highlights={highlights} gallery={gallery} />
          <TripItinerary days={days} />
          <TripInclusions inclusions={inclusions} exclusions={exclusions} />
        </div>

        <aside className="trip-details__sidebar">
          <TripBooking pkg={pkg} dates={dates} />
        </aside>
      </div>
    </div>
  )
}