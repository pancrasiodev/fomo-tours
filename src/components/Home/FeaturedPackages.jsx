import { useState, useEffect } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllManagedTrips, syncTripsFromApi } from '../../utils/tripStore.js'
import './FeaturedPackages.css'

const FEATURED_SLUGS = new Set([
  'mara-migration',
  'amboseli-kili',
  'tsavo-diani',
  'mt-kenya-trek',
  'rift-valley-lakes',
  'tsavo-wilderness',
])

const DEST_OPTIONS = [
  'All',
  'Maasai Mara',
  'Amboseli',
  'Diani Coast',
  'Tsavo',
  'Rift Valley Lakes',
  'Lake Naivasha',
  'Mount Kenya',
]

const STYLE_OPTIONS = ['All', '1-Day Trips', 'Easy', 'Moderate', 'Active']

function selectHomeTrips() {
  const all = getAllManagedTrips({ includeDrafts: false, excludeAliases: false })
  const customPublished = all.filter((t) => !t.isCurated && !FEATURED_SLUGS.has(t.slug))
  const dbFeatured = all.filter((t) => t.isFeatured || FEATURED_SLUGS.has(t.slug))
  const combined = [...customPublished, ...dbFeatured]
  return (combined.length > 0 ? combined : all).slice(0, 6)
}

export default function FeaturedPackages() {
  const [selectedDest, setSelectedDest] = useState('All')
  const [selectedStyle, setSelectedStyle] = useState('All')
  const [homeTrips, setHomeTrips] = useState(() => selectHomeTrips())
  const navigate = useNavigate()

  useEffect(() => {
    const refresh = () => setHomeTrips(selectHomeTrips())
    syncTripsFromApi({ includeDrafts: false })
    window.addEventListener('fomo-trips-updated', refresh)
    return () => window.removeEventListener('fomo-trips-updated', refresh)
  }, [])

  const filteredTrips = homeTrips.filter((t) => {
    const matchDest =
      selectedDest === 'All' ||
      (t.destination || '').toLowerCase().includes(selectedDest.toLowerCase())
    const isDay =
      t.tripType === 'day_trip' || String(t.duration || '').toLowerCase().startsWith('1 day')
    const matchStyle =
      selectedStyle === 'All' ||
      (selectedStyle === '1-Day Trips' ? isDay : t.level === selectedStyle)
    return matchDest && matchStyle
  })

  const handleClear = () => {
    setSelectedDest('All')
    setSelectedStyle('All')
  }

  return (
    <section className="trips-sec">
      <div className="trips-sec__inner">
        <div className="trips-sec__header">
          <span className="trips-sec__eyebrow">TRIPS</span>
          <h2 className="trips-sec__heading">Kenya tour packages that fit your pace</h2>
          <p className="trips-sec__sub">
            Filter multi-day safaris and day excursions. Every price includes KPSGA guides, 4&times;4 Cruisers, park admissions and meals as listed.
          </p>

          <div className="trips-sec__filter-bar" role="group" aria-label="Filter trips">
            <div className="trips-sec__select-wrap">
              <select
                value={selectedDest}
                onChange={(e) => setSelectedDest(e.target.value)}
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
            <p>No trips match that exact filter combination yet.</p>
            <button type="button" onClick={handleClear} className="trips-sec__reset-btn">
              Show all trips
            </button>
          </div>
        ) : (
          <div className="trips-sec__grid">
            {filteredTrips.map((trip) => {
              const slug = trip.slug || trip.id
              return (
                <article
                  key={trip.id}
                  className="trips-card"
                  onClick={() => navigate(`/trips/${slug}`)}
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
                    <span className="trips-card__loc">{trip.location || trip.destination}</span>
                    <h3 className="trips-card__title">{trip.title}</h3>

                    <div className="trips-card__footer">
                      <div className="trips-card__price-wrap">
                        <span className="trips-card__from">from</span>
                        <strong className="trips-card__price">{trip.price}</strong>
                      </div>

                      <Link
                        to={`/trips/${slug}`}
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

        <div className="trips-sec__more-wrap">
          <Link to="/trips" className="trips-sec__more-btn">
            <span>See all trips</span>
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  )
}
