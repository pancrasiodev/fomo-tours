import { useState, useEffect } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PreFooterCta from '../components/Home/PreFooterCta.jsx'
import { getAllManagedTrips, syncTripsFromApi } from '../utils/tripStore.js'
import { usePageSeo } from '../utils/seo.jsx'
import '../components/Home/FeaturedPackages.css'
import './TripsPage.css'

const DEST_OPTIONS = [
  'All',
  'Maasai Mara',
  'Diani Coast',
  'Amboseli',
  'Tsavo',
  'Lake Nakuru',
  'Lake Naivasha',
  'Mount Kenya',
  'Samburu',
  'Nairobi & Environs',
]

const STYLE_OPTIONS = ['All', '1-Day Trips', 'Easy', 'Moderate', 'Active']

export default function TripsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialDest = searchParams.get('destination') || 'All'

  const [query, setQuery] = useState('')
  const [selectedDest, setSelectedDest] = useState(
    DEST_OPTIONS.includes(initialDest) ? initialDest : 'All'
  )
  const [selectedStyle, setSelectedStyle] = useState('All')
  const [managedTrips, setManagedTrips] = useState(() =>
    getAllManagedTrips({ includeDrafts: false, excludeAliases: true })
  )

  useEffect(() => {
    const paramDest = searchParams.get('destination')
    if (paramDest && DEST_OPTIONS.includes(paramDest)) {
      setSelectedDest(paramDest)
    }
  }, [searchParams])

  useEffect(() => {
    const refresh = () => {
      setManagedTrips(getAllManagedTrips({ includeDrafts: false, excludeAliases: true }))
    }
    syncTripsFromApi({ includeDrafts: false })
    window.addEventListener('fomo-trips-updated', refresh)
    return () => window.removeEventListener('fomo-trips-updated', refresh)
  }, [])

  const filteredTrips = managedTrips.filter((t) => {
    const dest = (t.destination || '').toLowerCase()
    const loc = (t.location || '').toLowerCase()
    const matchDest =
      selectedDest === 'All' ||
      dest.includes(selectedDest.toLowerCase()) ||
      loc.includes(selectedDest.toLowerCase())

    const isDay =
      t.tripType === 'day_trip' || String(t.duration || '').toLowerCase().startsWith('1 day')
    const matchStyle =
      selectedStyle === 'All' ||
      (selectedStyle === '1-Day Trips' ? isDay : t.level === selectedStyle)

    const q = query.trim().toLowerCase()
    const matchQuery =
      !q ||
      (t.title || '').toLowerCase().includes(q) ||
      loc.includes(q) ||
      dest.includes(q)
    return matchDest && matchStyle && matchQuery
  })

  const handleDestChange = (val) => {
    setSelectedDest(val)
    if (val === 'All') {
      searchParams.delete('destination')
      setSearchParams(searchParams, { replace: true })
    } else {
      setSearchParams({ destination: val }, { replace: true })
    }
  }

  const handleClear = () => {
    setQuery('')
    setSelectedDest('All')
    setSelectedStyle('All')
    if (searchParams.has('destination')) {
      searchParams.delete('destination')
      setSearchParams(searchParams, { replace: true })
    }
  }

  usePageSeo({
    title: 'Kenya Safari Packages & Day Trips | FOMO Tours',
    description:
      'Compare verified Kenya safari packages and day trips across Maasai Mara, Amboseli, and Diani. Salaried KPSGA guides and guaranteed window seats.',
    canonicalPath: '/trips',
    image: '/images/tsavo-elephants.jpg',
  })

  return (
    <div className="trips-page">
      <section className="trips-catalog">
        <div className="trips-catalog__inner">
          <div className="trips-catalog__header">
            <span className="trips-sec__eyebrow">ALL TRIPS</span>

            <h1 className="trips-catalog__heading">
              Kenya Safari Packages &amp;
              <br />
              Guided Tour Departures
            </h1>

            <p className="trips-catalog__sub">
              Explore handpicked Kenya safari packages, coastal reef retreats, and 1-day park excursions led by salaried local guides. Filter by destination or travel style, or search by wildlife park.
            </p>

            {/* 4-Part Search + Destination + Style + Clear Capsule */}
            <div className="trips-catalog__bar" role="search" aria-label="Search and filter trips">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search trips, for example Maasai Mara or Naivasha"
                aria-label="Search trips"
                className="trips-catalog__search"
              />

              <span className="trips-sec__divider" aria-hidden="true" />

              <div className="trips-sec__select-wrap">
                <select
                  value={selectedDest}
                  onChange={(e) => handleDestChange(e.target.value)}
                  aria-label="Filter by destination"
                  className="trips-sec__select"
                >
                  {DEST_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="trips-sec__chevron" aria-hidden="true" />
              </div>

              <span className="trips-sec__divider" aria-hidden="true" />

              <div className="trips-sec__select-wrap">
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  aria-label="Filter by travel style"
                  className="trips-sec__select"
                >
                  {STYLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="trips-sec__chevron" aria-hidden="true" />
              </div>

              <button
                type="button"
                className="trips-sec__clear"
                onClick={handleClear}
              >
                Clear
              </button>
            </div>
          </div>

          {filteredTrips.length === 0 ? (
            <div className="trips-sec__empty">
              <p>No trips match that exact search or filter combination.</p>
              <button type="button" onClick={handleClear} className="trips-sec__reset-btn">
                Show all trips
              </button>
            </div>
          ) : (
            <div className="trips-sec__grid">
              {filteredTrips.map((trip) => {
                const href = `/trips/${trip.slug || trip.id}`
                return (
                  <article
                    key={trip.id}
                    className="trips-card"
                    onClick={() => navigate(href)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={trip.image || '/images/wildbeast.webp'}
                      alt={trip.title}
                      className="trips-card__img"
                      loading="lazy"
                    />
                    <div className="trips-card__overlay" />

                    <div className="trips-card__badges">
                      <span className="trips-card__pill">{trip.duration}</span>
                      <span className="trips-card__pill">{trip.level}</span>
                    </div>

                    <div className="trips-card__body">
                      <span className="trips-card__loc">
                        {trip.location || trip.destination}
                      </span>
                      <h2 className="trips-card__title">{trip.title}</h2>

                      <div className="trips-card__footer">
                        <div className="trips-card__price-wrap">
                          <span className="trips-card__from">from</span>
                          <strong className="trips-card__price">{trip.price}</strong>
                        </div>

                        <Link
                          to={href}
                          className="trips-card__cta"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>View trip</span>
                          <ArrowRight size={14} strokeWidth={2.2} />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <PreFooterCta />
    </div>
  )
}
