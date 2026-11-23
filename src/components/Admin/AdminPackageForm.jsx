import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Sun,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import AdminLayout from './AdminLayout'
import {
  WIZARD_STEPS,
  createBlankTripDraft,
  getManagedTripBySlug,
  syncTripsFromApi,
  saveManagedTrip,
  slugifyTrip,
  fileToCompressedDataUrl,
  formatDisplayPrice,
  computeTripCompletion,
} from '../../utils/tripStore.js'
import './Admin.css'
import './AdminDashboard.css'
import './AdminPackageForm.css'

const REGION_OPTIONS = [
  'Maasai Mara',
  'Diani Coast',
  'Amboseli',
  'Tsavo',
  'Lake Naivasha',
  'Lake Nakuru',
  'Mount Kenya',
  'Samburu',
  'Nairobi & Environs',
]

const LIBRARY_PHOTOS = [
  { label: 'Wildebeest', src: '/images/wildbeast.webp' },
  { label: 'Diani Coast', src: '/images/diani-coast.jpg' },
  { label: 'Kilimanjaro', src: '/images/Kilimanjaro.webp' },
  { label: 'Naivasha', src: '/images/lake-naivasha.jpg' },
  { label: 'Nakuru', src: '/images/lake-nakuru.jpg' },
  { label: 'Tsavo', src: '/images/tsavo-elephants.jpg' },
  { label: 'Mt Kenya', src: '/images/mt-kenya.webp' },
  { label: 'Mara Balloon', src: '/images/mara-balloon.jpg' },
  { label: 'Dhow Sunset', src: '/images/dhow-sunset.jpg' },
  { label: 'Ocean Wave', src: '/images/coast-aerial-wave.jpg' },
  { label: 'Sunrise Drive', src: '/images/sun-rise-drive.webp' },
  { label: 'Giraffe', src: '/images/giraffe-hero.webp' },
]

const INCLUDED_CHIPS_MULTI = [
  'Accommodation on sharing basis in handpicked camp / lodge',
  'Round-trip SGR / 4×4 Land Cruiser transport',
  'Meals on full-board / half-board as per itinerary',
  'Park & conservancy entry fees for Kenyan citizens / residents',
  'Professional KPSGA-certified FOMO guide & photography',
  'Bottled drinking water throughout the safari',
]

const INCLUDED_CHIPS_DAY = [
  'Round-trip transport from Nairobi CBD in tour van / cruiser',
  'Park / activity entry ticket included',
  'Buffet lunch & bottled drinking water',
  'Professional FOMO guide, team-building & photography',
  'Guided boat ride / gorge walk',
]

const EXCLUDED_CHIPS = [
  'Drinks, alcohol & personal items',
  'Tips & gratuities for guide and crew',
  'Optional activities not listed in inclusions',
  'Easter / festive supplement if applicable',
]

const CARRY_CHIPS = [
  'Original National ID or Passport',
  'Comfortable sneakers / hiking shoes',
  'Warm morning fleece or light jacket',
  'Sunscreen, sunglasses & sun hat',
  'Refillable water bottle & daypack',
  'Swimwear & change of clothes',
]

function hydrateLoadedTrip(loaded) {
  const rawPrice = String(loaded.price || '')
  const isUsd = rawPrice.trim().startsWith('$')
  const numericAmount =
    loaded.priceAmount !== undefined && String(loaded.priceAmount) !== ''
      ? String(loaded.priceAmount)
      : rawPrice.replace(/[^\d.]/g, '')

  const overviewText =
    typeof loaded.overviewText === 'string'
      ? loaded.overviewText
      : Array.isArray(loaded.overview)
        ? loaded.overview.join('\n\n')
        : String(loaded.overview || '')

  const normalizedItinerary = Array.isArray(loaded.itinerary)
    ? loaded.itinerary.map((row, i) => {
        if (row.time !== undefined && row.title !== undefined) {
          return { time: row.time, title: row.title, desc: row.desc || '' }
        }
        const parts = String(row.day || '').split(':')
        return {
          time: parts[0]?.trim() || `Day ${i + 1}`,
          title: parts.slice(1).join(':').trim(),
          desc: row.desc || '',
        }
      })
    : []

  return {
    ...loaded,
    currency: loaded.currency || (isUsd ? 'USD' : 'KSh'),
    priceAmount: numericAmount,
    gallery: [loaded.gallery?.[0] || '', loaded.gallery?.[1] || ''],
    overviewText,
    itinerary: normalizedItinerary,
    included: Array.isArray(loaded.included) ? loaded.included : [],
    excluded: Array.isArray(loaded.excluded)
      ? loaded.excluded
      : ['Drinks, alcohol & personal expenses'],
    whatToCarry: Array.isArray(loaded.whatToCarry) ? loaded.whatToCarry : [],
    depositNote: loaded.depositNote || '',
    meetingPoint: loaded.meetingPoint || '',
  }
}

export default function AdminPackageForm() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const initialType = searchParams.get('type') === 'day_trip' ? 'day_trip' : 'multi_day'

  const [admin, setAdmin] = useState(null)
  const [trip, setTrip] = useState(() => {
    if (id) {
      const existing = getManagedTripBySlug(id)
      if (existing) return hydrateLoadedTrip(existing)
    }
    return createBlankTripDraft(initialType)
  })

  const [activeStep, setActiveStep] = useState(() => {
    if (id) {
      const existing = getManagedTripBySlug(id)
      if (existing && typeof existing.currentStep === 'number') {
        return Math.min(5, Math.max(0, existing.currentStep))
      }
    }
    return 0
  })

  const [slugTouched, setSlugTouched] = useState(Boolean(id))
  const [publishedBanner, setPublishedBanner] = useState('')
  const [resumedNote, setResumedNote] = useState(() => {
    if (!id) return ''
    const existing = getManagedTripBySlug(id)
    if (existing?.status === 'draft' && (existing.currentStep || 0) > 0) {
      const stepLabel = WIZARD_STEPS[existing.currentStep]?.label || ''
      return `Resumed saved draft right where you left off — Step ${existing.currentStep + 1} of ${WIZARD_STEPS.length} (${stepLabel}).`
    }
    return ''
  })

  const [libraryTarget, setLibraryTarget] = useState('cover') // 'cover' | 'side1' | 'side2'
  const [customInputs, setCustomInputs] = useState({
    included: '',
    excluded: '',
    whatToCarry: '',
  })

  const rawFilesRef = useRef({ cover: null, side1: null, side2: null })
  const hasInteractedRef = useRef(false)
  const coverInputRef = useRef(null)
  const side1InputRef = useRef(null)
  const side2InputRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem('fomo_admin')
    if (!stored) {
      navigate('/admin')
      return
    }
    setAdmin(JSON.parse(stored))
    syncTripsFromApi({ includeDrafts: true })
  }, [navigate])

  // Reload if URL param `:id` changes or once DB trips sync
  useEffect(() => {
    if (!id) return undefined
    const syncFromStore = () => {
      if (hasInteractedRef.current) return
      const existing = getManagedTripBySlug(id)
      if (existing) {
        const hydrated = hydrateLoadedTrip(existing)
        setTrip(hydrated)
        setActiveStep(Math.min(5, Math.max(0, hydrated.currentStep || 0)))
      }
    }
    syncFromStore()
    window.addEventListener('fomo-trips-updated', syncFromStore)
    return () => window.removeEventListener('fomo-trips-updated', syncFromStore)
  }, [id])

  const persistNow = async (nextTrip, nextStepIndex = activeStep, { syncApi = true, forceStatus } = {}) => {
    const payload = {
      ...nextTrip,
      currentStep: nextStepIndex,
      status: forceStatus || nextTrip.status || 'draft',
    }
    const saved = await saveManagedTrip(payload, {
      syncApi,
      rawFiles: rawFilesRef.current,
    })

    // Anchor `/admin/packages/new` onto `/admin/packages/edit/:id` so reload/back never starts afresh
    if (!id) {
      navigate(`/admin/packages/edit/${saved.id}`, { replace: true })
    }
    return saved
  }

  // Debounced auto-save directly to the database whenever fields change after user interaction
  useEffect(() => {
    if (!hasInteractedRef.current) return undefined
    const timer = setTimeout(() => {
      persistNow(trip, activeStep, { syncApi: true })
    }, 650)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip])

  const markDirtyAndSet = (updater) => {
    hasInteractedRef.current = true
    setPublishedBanner('')
    setTrip((prev) => (typeof updater === 'function' ? updater(prev) : updater))
  }

  const handleTypeSwitch = (nextType) => {
    if (nextType === trip.tripType) return
    const isDay = nextType === 'day_trip'
    markDirtyAndSet((prev) => ({
      ...prev,
      tripType: nextType,
      duration: isDay ? '1 day' : prev.duration === '1 day' ? '3 days / 2 nights' : prev.duration,
      meetingPoint: isDay ? prev.meetingPoint || 'Kencom / Nairobi CBD · 6:00 AM' : prev.meetingPoint,
      depositNote:
        prev.depositNote ||
        (isDay
          ? 'Book your seat with KSh 1,500 deposit · Lipa Pole Pole accepted'
          : 'Reserve with 30% deposit · Lipa Pole Pole available'),
      itinerary: prev.itinerary.map((item, idx) => ({
        ...item,
        time: isDay
          ? ['06:00 AM', '09:30 AM', '01:00 PM', '05:30 PM'][idx] || '03:30 PM'
          : `Day ${idx + 1}`,
      })),
    }))
  }

  const handleTitleChange = (val) => {
    markDirtyAndSet((prev) => ({
      ...prev,
      title: val,
      slug: slugTouched ? prev.slug : slugifyTrip(val),
    }))
  }

  const handleField = (key) => (e) => {
    const val = e.target.value
    if (key === 'slug') setSlugTouched(true)
    markDirtyAndSet((prev) => ({ ...prev, [key]: val }))
  }

  const handlePhotoUpload = (slot) => async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    rawFilesRef.current[slot] = file
    const compressed = await fileToCompressedDataUrl(file)
    markDirtyAndSet((prev) => {
      if (slot === 'cover') return { ...prev, image: compressed }
      const g = [...(prev.gallery || ['', ''])]
      g[slot === 'side1' ? 0 : 1] = compressed
      return { ...prev, gallery: g }
    })
  }

  const applyLibraryPhoto = (src) => {
    markDirtyAndSet((prev) => {
      if (libraryTarget === 'cover') return { ...prev, image: src }
      const g = [...(prev.gallery || ['', ''])]
      g[libraryTarget === 'side1' ? 0 : 1] = src
      return { ...prev, gallery: g }
    })
  }

  const clearSlotPhoto = (slot, e) => {
    e.stopPropagation()
    markDirtyAndSet((prev) => {
      if (slot === 'cover') return { ...prev, image: '' }
      const g = [...(prev.gallery || ['', ''])]
      g[slot === 'side1' ? 0 : 1] = ''
      return { ...prev, gallery: g }
    })
  }

  // Timeline row helpers
  const updateTimelineRow = (idx, key, val) => {
    markDirtyAndSet((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((row, i) => (i === idx ? { ...row, [key]: val } : row)),
    }))
  }

  const addTimelineRow = () => {
    const isDay = trip.tripType === 'day_trip'
    markDirtyAndSet((prev) => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        {
          time: isDay ? '03:30 PM' : `Day ${prev.itinerary.length + 1}`,
          title: '',
          desc: '',
        },
      ],
    }))
  }

  const moveTimelineRow = (idx, dir) => {
    const target = idx + dir
    if (target < 0 || target >= trip.itinerary.length) return
    markDirtyAndSet((prev) => {
      const copy = [...prev.itinerary]
      const [moved] = copy.splice(idx, 1)
      copy.splice(target, 0, moved)
      return { ...prev, itinerary: copy }
    })
  }

  const removeTimelineRow = (idx) => {
    markDirtyAndSet((prev) => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== idx),
    }))
  }

  // Checklist helpers
  const toggleChip = (listKey, text) => {
    markDirtyAndSet((prev) => {
      const current = Array.isArray(prev[listKey]) ? prev[listKey] : []
      const exists = current.includes(text)
      return {
        ...prev,
        [listKey]: exists ? current.filter((item) => item !== text) : [...current, text],
      }
    })
  }

  const addCustomBullet = (listKey) => {
    const text = (customInputs[listKey] || '').trim()
    if (!text) return
    markDirtyAndSet((prev) => ({
      ...prev,
      [listKey]: [...(prev[listKey] || []), text],
    }))
    setCustomInputs((prev) => ({ ...prev, [listKey]: '' }))
  }

  const removeBullet = (listKey, index) => {
    markDirtyAndSet((prev) => ({
      ...prev,
      [listKey]: (prev[listKey] || []).filter((_, i) => i !== index),
    }))
  }

  // Step navigation — always saves step immediately!
  const goToStep = async (nextStep) => {
    const clamped = Math.min(5, Math.max(0, nextStep))
    setResumedNote('')
    const nextCompleted = Array.from({ length: clamped }, (_, idx) => idx)
    const updatedTrip = { ...trip, completedSteps: nextCompleted, currentStep: clamped }
    setTrip(updatedTrip)
    setActiveStep(clamped)
    await persistNow(updatedTrip, clamped, { syncApi: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveAndExitDraft = async () => {
    await persistNow(trip, activeStep, { syncApi: true, forceStatus: 'draft' })
    navigate('/admin/packages?tab=drafts')
  }

  const handlePublish = async () => {
    const finalTitle = trip.title?.trim() || 'New Kenyan Getaway'
    const nextPayload = {
      ...trip,
      title: finalTitle,
      slug: trip.slug?.trim() || slugifyTrip(finalTitle),
      status: 'published',
      currentStep: 5,
      completedSteps: [0, 1, 2, 3, 4, 5],
    }
    const saved = await persistNow(nextPayload, 5, {
      syncApi: true,
      forceStatus: 'published',
    })
    setTrip((prev) => ({ ...prev, status: 'published', slug: saved.slug, title: saved.title }))
    setPublishedBanner(saved.slug)
  }

  const isDayTrip = trip.tripType === 'day_trip'
  const liveDisplayPrice = formatDisplayPrice(trip.currency, trip.priceAmount, trip.price)
  const completionPct = computeTripCompletion({
    ...trip,
    price: trip.priceAmount ? liveDisplayPrice : trip.price,
    overview: trip.overviewText ? [trip.overviewText] : trip.overview,
  })

  return (
    <AdminLayout admin={admin}>
      {/* Top Wizard Header */}
      <div className="wizard-topbar">
        <div className="wizard-topbar__left">
          <button
            type="button"
            className="wizard-back-btn"
            onClick={() => navigate('/admin/packages')}
            title="Back to All Trips & Drafts"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="admin-page-title">
            <h1>{trip.title?.trim() ? trip.title : 'Upload Trip — Step by Step'}</h1>
          </div>
        </div>

        <div className="wizard-topbar__actions">
          <button type="button" className="wizard-btn-ghost" onClick={handleSaveAndExitDraft}>
            Save &amp; Exit to Drafts
          </button>

          {trip.status === 'published' && trip.slug && (
            <Link
              to={`/trips/${trip.slug}`}
              target="_blank"
              rel="noreferrer"
              className="wizard-btn-ghost"
            >
              <span>View Live Page</span>
              <ExternalLink size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* Resumed Draft Notice */}
      {resumedNote && (
        <div className="wizard-toast">
          <span>{resumedNote}</span>
          <button type="button" className="wizard-btn-ghost" onClick={() => setResumedNote('')}>
            Got it
          </button>
        </div>
      )}

      {/* Published Confirmation Banner */}
      {publishedBanner && (
        <div className="wizard-toast">
          <span>
            🎉 <strong>{trip.title}</strong> is now live on FOMO Tours!
          </span>
          <Link
            to={`/trips/${publishedBanner}`}
            target="_blank"
            rel="noreferrer"
            className="wizard-btn-dark"
          >
            <span>Open /trips/{publishedBanner}</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      )}

      {/* 6-Step Clickable Stepper */}
      <nav className="wizard-stepper" aria-label="Trip upload steps">
        {WIZARD_STEPS.map((step) => {
          const isCurrent = activeStep === step.index
          const isDone = step.index < activeStep
          return (
            <button
              key={step.key}
              type="button"
              className={`wizard-step-tab ${isCurrent ? 'wizard-step-tab--active' : ''} ${isDone ? 'wizard-step-tab--done' : ''}`}
              onClick={() => goToStep(step.index)}
            >
              <span className="wizard-step-tab__num">{step.index + 1}</span>
              <span className="wizard-step-tab__copy">
                <span className="wizard-step-tab__eyebrow">Step {step.index + 1}</span>
                <span className="wizard-step-tab__label">{step.label}</span>
              </span>
            </button>
          )
        })}
      </nav>

      {/* Main Grid: Active Step Panel + Live Preview */}
      <div className="wizard-grid">
        <div className="wizard-main-col">
          {/* ─── STEP 1: BASICS & TRIP TYPE ─── */}
          {activeStep === 0 && (
            <>
              <div className="wizard-panel">
                <div className="wizard-panel__head">
                  <h2>What kind of trip are you uploading?</h2>
                  <p>
                    Pick Multi-Day for safaris &amp; coastal stays, or 1-Day Trip for same-day
                    excursions with no overnight accommodation.
                  </p>
                </div>

                <div className="wizard-type-cards">
                  <button
                    type="button"
                    className={`wizard-type-card ${!isDayTrip ? 'wizard-type-card--active' : ''}`}
                    onClick={() => handleTypeSwitch('multi_day')}
                  >
                    <div className="wizard-type-card__body">
                      <div className="wizard-type-card__top">
                        <div className="wizard-type-card__icon">
                          <Compass size={19} />
                        </div>
                      </div>
                      <div className="wizard-type-card__title">Multi-Day Getaway / Safari</div>
                      <div className="wizard-type-card__desc">
                        Includes nights in camps, lodges or beach resorts with a Day 1, Day 2…
                        itinerary.
                      </div>
                    </div>
                    <span className="wizard-type-card__select-btn">
                      {!isDayTrip ? (
                        <>
                          <Check size={13} strokeWidth={2.8} />
                          <span>Selected</span>
                        </>
                      ) : (
                        <span>Select</span>
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`wizard-type-card ${isDayTrip ? 'wizard-type-card--active' : ''}`}
                    onClick={() => handleTypeSwitch('day_trip')}
                  >
                    <div className="wizard-type-card__body">
                      <div className="wizard-type-card__top">
                        <div className="wizard-type-card__icon">
                          <Sun size={19} />
                        </div>
                      </div>
                      <div className="wizard-type-card__title">1-Day Trip (No Overnight Stay)</div>
                      <div className="wizard-type-card__desc">
                        Morning CBD pickup, timed day schedule (6:00 AM → 5:30 PM), and What-to-Carry
                        checklist.
                      </div>
                    </div>
                    <span className="wizard-type-card__select-btn">
                      {isDayTrip ? (
                        <>
                          <Check size={13} strokeWidth={2.8} />
                          <span>Selected</span>
                        </>
                      ) : (
                        <span>Select</span>
                      )}
                    </span>
                  </button>
                </div>
              </div>

              <div className="wizard-panel">
                <div className="wizard-fields">
                  <div className="wizard-field">
                    <label htmlFor="wz-title">
                      Trip Headline <span>Appears on flyer cards &amp; page header</span>
                    </label>
                    <input
                      id="wz-title"
                      value={trip.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder={
                        isDayTrip
                          ? 'e.g. Hell’s Gate Cycling & Geothermal Spa Day Trip'
                          : 'e.g. 3 Days Tsavo East & Voi Wildlife Lodge Getaway'
                      }
                    />
                  </div>

                  <div className="wizard-row">
                    <div className="wizard-field">
                      <label htmlFor="wz-dest">Primary Region</label>
                      <select
                        id="wz-dest"
                        value={trip.destination}
                        onChange={handleField('destination')}
                      >
                        {REGION_OPTIONS.map((reg) => (
                          <option key={reg} value={reg}>
                            {reg}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="wizard-field">
                      <label htmlFor="wz-slug">
                        Page URL Slug <span>/trips/{trip.slug || 'your-slug'}</span>
                      </label>
                      <input
                        id="wz-slug"
                        value={trip.slug}
                        onChange={handleField('slug')}
                        placeholder="auto-generated-from-title"
                      />
                    </div>
                  </div>

                  <div className="wizard-field">
                    <label htmlFor="wz-loc">
                      Route / Location Subtitle <span>Shown above title on trip card</span>
                    </label>
                    <input
                      id="wz-loc"
                      value={trip.location}
                      onChange={handleField('location')}
                      placeholder={
                        isDayTrip
                          ? 'e.g. Naivasha & Olkaria, From Nairobi'
                          : 'e.g. Tsavo East via SGR · Voi Wildlife Lodge'
                      }
                    />
                  </div>

                  <div className="wizard-field">
                    <label htmlFor="wz-sub">
                      Short Editorial Hook <span>1–2 punchy sentences top-right of detail page</span>
                    </label>
                    <textarea
                      id="wz-sub"
                      rows={2}
                      value={trip.subtitle}
                      onChange={handleField('subtitle')}
                      placeholder={
                        isDayTrip
                          ? 'Leave Nairobi at dawn, cycle past zebras beneath towering cliffs, and soak in warm mineral pools before sunset.'
                          : 'Red-earth elephants, SGR comfort and waterhole views right from your balcony.'
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── STEP 2: PRICING & QUICK FACTS ─── */}
          {activeStep === 1 && (
            <>
              <div className="wizard-panel">
                <div className="wizard-panel__head">
                  <h2>Set the price, dates &amp; 4 quick facts</h2>
                  <p>
                    Supports KSh or USD pricing plus FOMO’s Lipa Pole Pole deposit note.
                  </p>
                </div>

                <div className="wizard-fields">
                  <div className="wizard-row wizard-row--price">
                    <div className="wizard-field">
                      <label htmlFor="wz-curr">Currency</label>
                      <select
                        id="wz-curr"
                        value={trip.currency}
                        onChange={handleField('currency')}
                      >
                        <option value="KSh">KSh (KES)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>

                    <div className="wizard-field">
                      <label htmlFor="wz-price">
                        Price Per Person{' '}
                        <span>Displays as {liveDisplayPrice}</span>
                      </label>
                      <input
                        id="wz-price"
                        type="number"
                        value={trip.priceAmount}
                        onChange={handleField('priceAmount')}
                        placeholder={trip.currency === 'KSh' ? 'e.g. 4500 or 18500' : 'e.g. 1450'}
                      />
                    </div>
                  </div>

                  <div className="wizard-row">
                    <div className="wizard-field">
                      <label htmlFor="wz-dep">Next Departure Date / Frequency</label>
                      <input
                        id="wz-dep"
                        value={trip.nextDeparture}
                        onChange={handleField('nextDeparture')}
                        placeholder={
                          isDayTrip ? 'e.g. Saturday, Nov 28, 2026' : 'e.g. December 12–14, 2026'
                        }
                      />
                    </div>

                    <div className="wizard-field">
                      <label htmlFor="wz-deposit">Deposit / Lipa Pole Pole Note</label>
                      <input
                        id="wz-deposit"
                        value={trip.depositNote}
                        onChange={handleField('depositNote')}
                        placeholder="e.g. Book with KSh 2,000 · Lipa Pole Pole accepted"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="wizard-panel">
                <div className="wizard-fields">
                  <div className="wizard-row">
                    <div className="wizard-field">
                      <label htmlFor="wz-dur">Trip Length</label>
                      <input
                        id="wz-dur"
                        value={trip.duration}
                        onChange={handleField('duration')}
                        placeholder={isDayTrip ? '1 day' : '3 days / 2 nights'}
                      />
                    </div>

                    <div className="wizard-field">
                      <label htmlFor="wz-group">Group Size</label>
                      <input
                        id="wz-group"
                        value={trip.groupSize}
                        onChange={handleField('groupSize')}
                        placeholder="Private & Scheduled Departures"
                      />
                    </div>
                  </div>

                  <div className="wizard-row">
                    <div className="wizard-field">
                      <label htmlFor="wz-pace">Activity Pace</label>
                      <select id="wz-pace" value={trip.level} onChange={handleField('level')}>
                        <option value="Easy">Easy (Relaxed / All ages)</option>
                        <option value="Moderate">Moderate (Light walks / Active fun)</option>
                        <option value="Active">Active (Hike / Trekking)</option>
                      </select>
                    </div>

                    {isDayTrip ? (
                      <div className="wizard-field">
                        <label htmlFor="wz-meet">
                          Meeting Point &amp; Departure Time <span>Replaces Stay on 1-Day Trips</span>
                        </label>
                        <input
                          id="wz-meet"
                          value={trip.meetingPoint}
                          onChange={handleField('meetingPoint')}
                          placeholder="e.g. Kencom / Hilton CBD · 6:00 AM"
                        />
                      </div>
                    ) : (
                      <div className="wizard-field">
                        <label htmlFor="wz-season">Best Season / Featured Stay</label>
                        <input
                          id="wz-season"
                          value={trip.bestSeason}
                          onChange={handleField('bestSeason')}
                          placeholder="e.g. All year · Voi Wildlife Lodge"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── STEP 3: 3-PHOTO BENTO GALLERY ─── */}
          {activeStep === 2 && (
            <>
              <div className="wizard-panel">
                <div className="wizard-panel__head">
                  <h2>Upload the 3 trip photos</h2>
                  <p>
                    Matches the exact 3-photo editorial gallery on the public trip page. Upload
                    from your device or pick from the FOMO library below — photos save directly into
                    your draft.
                  </p>
                </div>

                {/* Hidden file inputs */}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoUpload('cover')}
                />
                <input
                  ref={side1InputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoUpload('side1')}
                />
                <input
                  ref={side2InputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoUpload('side2')}
                />

                <div className="wizard-bento">
                  {/* Main Hero Slot */}
                  <div
                    className={`wizard-bento__slot wizard-bento__slot--main ${libraryTarget === 'cover' ? 'wizard-bento__slot--active-target' : ''}`}
                    onClick={() => {
                      setLibraryTarget('cover')
                      coverInputRef.current?.click()
                    }}
                  >
                    {trip.image ? (
                      <>
                        <img src={trip.image} alt="Main hero" />
                        <div className="wizard-bento__overlay-actions">
                          <span className="wizard-bento__badge">1 · Main Cover Photo</span>
                          <div className="wizard-bento__btns">
                            <button
                              type="button"
                              className="wizard-bento__mini-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                coverInputRef.current?.click()
                              }}
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              className="wizard-bento__mini-btn"
                              onClick={(e) => clearSlotPhoto('cover', e)}
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="wizard-bento__empty">
                        <Upload size={24} />
                        <strong>1 · Upload Main Hero Photo</strong>
                        <span>Used on Trip Cards + Left Bento Hero</span>
                      </div>
                    )}
                  </div>

                  {/* Top Right Slot */}
                  <div
                    className={`wizard-bento__slot ${libraryTarget === 'side1' ? 'wizard-bento__slot--active-target' : ''}`}
                    onClick={() => {
                      setLibraryTarget('side1')
                      side1InputRef.current?.click()
                    }}
                  >
                    {trip.gallery?.[0] ? (
                      <>
                        <img src={trip.gallery[0]} alt="Gallery top right" />
                        <div className="wizard-bento__overlay-actions">
                          <span className="wizard-bento__badge">2 · Top Right</span>
                          <button
                            type="button"
                            className="wizard-bento__mini-btn"
                            onClick={(e) => clearSlotPhoto('side1', e)}
                          >
                            Clear
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="wizard-bento__empty">
                        <Upload size={18} />
                        <strong>2 · Top-Right Photo</strong>
                        <span>Click to upload</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Right Slot */}
                  <div
                    className={`wizard-bento__slot ${libraryTarget === 'side2' ? 'wizard-bento__slot--active-target' : ''}`}
                    onClick={() => {
                      setLibraryTarget('side2')
                      side2InputRef.current?.click()
                    }}
                  >
                    {trip.gallery?.[1] ? (
                      <>
                        <img src={trip.gallery[1]} alt="Gallery bottom right" />
                        <div className="wizard-bento__overlay-actions">
                          <span className="wizard-bento__badge">3 · Bottom Right</span>
                          <button
                            type="button"
                            className="wizard-bento__mini-btn"
                            onClick={(e) => clearSlotPhoto('side2', e)}
                          >
                            Clear
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="wizard-bento__empty">
                        <Upload size={18} />
                        <strong>3 · Bottom-Right Photo</strong>
                        <span>Click to upload</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick FOMO Library Picker Container */}
              <div className="wizard-panel">
                <div className="wizard-library__top">
                  <span className="wizard-library__title">
                    <Sparkles size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} />
                    Or fill a slot from FOMO’s Kenyan photo library:
                  </span>
                  <div className="wizard-library__slot-pills">
                    {[
                      { key: 'cover', label: 'Target: 1 · Main Cover' },
                      { key: 'side1', label: '2 · Top Right' },
                      { key: 'side2', label: '3 · Bottom Right' },
                    ].map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        className={`wizard-library__slot-pill ${libraryTarget === s.key ? 'wizard-library__slot-pill--active' : ''}`}
                        onClick={() => setLibraryTarget(s.key)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="wizard-library__thumbs">
                  {LIBRARY_PHOTOS.map((photo) => (
                    <button
                      key={photo.src}
                      type="button"
                      className="wizard-library__thumb"
                      onClick={() => applyLibraryPhoto(photo.src)}
                      title={`Use ${photo.label}`}
                    >
                      <img src={photo.src} alt={photo.label} loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── STEP 4: OVERVIEW & SCHEDULE ─── */}
          {activeStep === 3 && (
            <>
              <div className="wizard-panel">
                <div className="wizard-panel__head">
                  <h2>
                    {isDayTrip
                      ? 'Tell the story & outline the day’s time slots'
                      : 'Write the overview & day-by-day plan'}
                  </h2>
                  <p>
                    {isDayTrip
                      ? '1-day trips use simple time slots (e.g. 06:00 AM, 09:30 AM) instead of hotel nights.'
                      : 'Keep each day short and vivid — 1–2 sentences per day reads best.'}
                  </p>
                </div>

                <div className="wizard-field">
                  <label htmlFor="wz-overview">
                    Trip Overview <span>Separate paragraphs with a blank line</span>
                  </label>
                  <textarea
                    id="wz-overview"
                    rows={4}
                    value={trip.overviewText}
                    onChange={handleField('overviewText')}
                    placeholder="Write 1 or 2 relaxed paragraphs about what makes this trip special..."
                  />
                </div>
              </div>

              <div className="wizard-panel">
                <div className="wizard-timeline">
                  <div className="wizard-timeline__header">
                    <h3>{isDayTrip ? 'Day Schedule (Time Slots)' : 'Day-by-Day Itinerary'}</h3>
                    <span className="admin-card__badge">
                      {trip.itinerary.length} {isDayTrip ? 'stops' : 'days'}
                    </span>
                  </div>

                  {trip.itinerary.map((row, idx) => (
                    <div key={idx} className="wizard-timeline-card">
                      <div className="wizard-timeline-card__top">
                        <input
                          value={row.time}
                          onChange={(e) => updateTimelineRow(idx, 'time', e.target.value)}
                          placeholder={isDayTrip ? '06:30 AM' : `Day ${idx + 1}`}
                        />
                        <input
                          value={row.title}
                          onChange={(e) => updateTimelineRow(idx, 'title', e.target.value)}
                          placeholder={
                            isDayTrip
                              ? 'Activity headline (e.g. Gorge Cycling & Wildlife)'
                              : 'Day headline (e.g. Nairobi to Maasai Mara)'
                          }
                        />
                        <div className="wizard-timeline-card__actions">
                          <button
                            type="button"
                            className="wizard-icon-btn"
                            onClick={() => moveTimelineRow(idx, -1)}
                            title="Move up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            className="wizard-icon-btn"
                            onClick={() => moveTimelineRow(idx, 1)}
                            title="Move down"
                          >
                            <ArrowDown size={13} />
                          </button>
                          <button
                            type="button"
                            className="wizard-icon-btn wizard-icon-btn--danger"
                            onClick={() => removeTimelineRow(idx)}
                            title="Remove"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        value={row.desc}
                        onChange={(e) => updateTimelineRow(idx, 'desc', e.target.value)}
                        placeholder="Short description of what travelers experience..."
                      />
                    </div>
                  ))}

                  <button type="button" className="wizard-add-row-btn" onClick={addTimelineRow}>
                    <Plus size={15} />
                    <span>{isDayTrip ? 'Add Another Time Slot' : 'Add Another Day'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ─── STEP 5: CHECKLISTS ─── */}
          {activeStep === 4 && (
            <>
              <div className="wizard-panel">
                <div className="wizard-panel__head">
                  <h2>Tap inclusions, exclusions &amp; packing notes</h2>
                  <p>
                    Click any quick chip to toggle it on/off, or type custom bullets below. Next
                    you will review the full trip summary before publishing.
                  </p>
                </div>

                {/* Included */}
                <div className="wizard-checklist-box">
                  <h3>What is included</h3>
                  <div className="wizard-chips">
                    {(isDayTrip ? INCLUDED_CHIPS_DAY : INCLUDED_CHIPS_MULTI).map((chip) => {
                      const added = (trip.included || []).includes(chip)
                      return (
                        <button
                          key={chip}
                          type="button"
                          className={`wizard-chip ${added ? 'wizard-chip--added' : ''}`}
                          onClick={() => toggleChip('included', chip)}
                        >
                          {added ? '✓ ' : '+ '}
                          {chip}
                        </button>
                      )
                    })}
                  </div>

                  <div className="wizard-bullets">
                    {(trip.included || []).map((line, i) => (
                      <div key={i} className="wizard-bullet-item">
                        <span>{line}</span>
                        <button type="button" onClick={() => removeBullet('included', i)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="wizard-bullet-add">
                    <input
                      value={customInputs.included}
                      onChange={(e) =>
                        setCustomInputs((p) => ({ ...p, included: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomBullet('included')
                        }
                      }}
                      placeholder="Add custom inclusion & press Enter…"
                    />
                    <button type="button" onClick={() => addCustomBullet('included')}>
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="wizard-panel">
                {/* Excluded */}
                <div className="wizard-checklist-box">
                  <h3>What is excluded</h3>
                  <div className="wizard-chips">
                    {EXCLUDED_CHIPS.map((chip) => {
                      const added = (trip.excluded || []).includes(chip)
                      return (
                        <button
                          key={chip}
                          type="button"
                          className={`wizard-chip ${added ? 'wizard-chip--added' : ''}`}
                          onClick={() => toggleChip('excluded', chip)}
                        >
                          {added ? '✓ ' : '+ '}
                          {chip}
                        </button>
                      )
                    })}
                  </div>

                  <div className="wizard-bullets">
                    {(trip.excluded || []).map((line, i) => (
                      <div key={i} className="wizard-bullet-item">
                        <span>{line}</span>
                        <button type="button" onClick={() => removeBullet('excluded', i)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="wizard-bullet-add">
                    <input
                      value={customInputs.excluded}
                      onChange={(e) =>
                        setCustomInputs((p) => ({ ...p, excluded: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomBullet('excluded')
                        }
                      }}
                      placeholder="Add custom exclusion & press Enter…"
                    />
                    <button type="button" onClick={() => addCustomBullet('excluded')}>
                      Add
                    </button>
                  </div>
                </div>

                {/* What to Carry */}
                <div className="wizard-checklist-box">
                  <h3>
                    What to carry{' '}
                    {isDayTrip ? '(Recommended for 1-Day Trips)' : '(Optional packing tips)'}
                  </h3>
                  <div className="wizard-chips">
                    {CARRY_CHIPS.map((chip) => {
                      const added = (trip.whatToCarry || []).includes(chip)
                      return (
                        <button
                          key={chip}
                          type="button"
                          className={`wizard-chip ${added ? 'wizard-chip--added' : ''}`}
                          onClick={() => toggleChip('whatToCarry', chip)}
                        >
                          {added ? '✓ ' : '+ '}
                          {chip}
                        </button>
                      )
                    })}
                  </div>

                  <div className="wizard-bullets">
                    {(trip.whatToCarry || []).map((line, i) => (
                      <div key={i} className="wizard-bullet-item">
                        <span>{line}</span>
                        <button type="button" onClick={() => removeBullet('whatToCarry', i)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="wizard-bullet-add">
                    <input
                      value={customInputs.whatToCarry}
                      onChange={(e) =>
                        setCustomInputs((p) => ({ ...p, whatToCarry: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomBullet('whatToCarry')
                        }
                      }}
                      placeholder="Add packing item & press Enter…"
                    />
                    <button type="button" onClick={() => addCustomBullet('whatToCarry')}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── STEP 6: PRE-PUBLISH SUMMARY ─── */}
          {activeStep === 5 && (
            <div className="wizard-panel">
              <div className="wizard-panel__head">
                <h2>Review everything before going live</h2>
                <p>
                  Double-check your photos, pricing, {isDayTrip ? 'day schedule' : 'itinerary'}, and
                  checklists below. Click <strong>Edit</strong> on any section to jump straight back.
                </p>
              </div>

              <div className="wizard-summary-stack">
                {/* Readiness Banner */}
                {(() => {
                  const missing = []
                  if (!trip.title?.trim()) missing.push('Headline')
                  if (!trip.priceAmount && !trip.price) missing.push('Price')
                  if (!trip.image) missing.push('Main Cover Photo')
                  return missing.length === 0 ? (
                    <div className="wizard-summary-readiness">
                      <span>✓ Ready to publish — all core details and cover photo are in place.</span>
                      <span>{completionPct}% complete</span>
                    </div>
                  ) : (
                    <div className="wizard-summary-readiness wizard-summary-readiness--warn">
                      <span>Heads up — recommended before publishing: {missing.join(', ')}</span>
                      <span>{completionPct}% complete</span>
                    </div>
                  )
                })()}

                {/* 1. Basics & Bento Photos */}
                <div className="wizard-summary-block">
                  <div className="wizard-summary-block__head">
                    <h3 className="wizard-summary-block__title">Basics &amp; 3-Photo Gallery</h3>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="wizard-summary-edit" onClick={() => goToStep(0)}>
                        Edit Basics
                      </button>
                      <button type="button" className="wizard-summary-edit" onClick={() => goToStep(2)}>
                        Edit Photos
                      </button>
                    </div>
                  </div>

                  <div className="wizard-summary-hero">
                    <div className="wizard-summary-bento-mini">
                      <div>
                        <img src={trip.image || '/images/wildbeast.webp'} alt="Main cover" />
                      </div>
                      <div>
                        <img
                          src={trip.gallery?.[0] || trip.image || '/images/safari-trip.webp'}
                          alt="Side 1"
                        />
                      </div>
                      <div>
                        <img
                          src={trip.gallery?.[1] || trip.image || '/images/sun-rise-drive.webp'}
                          alt="Side 2"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="admin-pkg-type">
                        {isDayTrip ? '1-Day Trip (No Stay)' : 'Multi-Day Getaway'} · {trip.destination}
                      </span>
                      <h4 className="wizard-summary-headline">
                        {trip.title || 'Untitled Trip Draft'}
                      </h4>
                      <div className="wizard-summary-slug">
                        {trip.location || trip.destination} · /trips/{trip.slug || slugifyTrip(trip.title || 'new-trip')}
                      </div>
                      {trip.subtitle && <p className="wizard-summary-sub">{trip.subtitle}</p>}
                    </div>
                  </div>
                </div>

                {/* 2. Pricing & Quick Facts */}
                <div className="wizard-summary-block">
                  <div className="wizard-summary-block__head">
                    <h3 className="wizard-summary-block__title">Pricing &amp; Quick Facts</h3>
                    <button type="button" className="wizard-summary-edit" onClick={() => goToStep(1)}>
                      Edit Pricing
                    </button>
                  </div>

                  <div className="wizard-summary-facts">
                    <div className="wizard-summary-fact">
                      <span>Price / Person</span>
                      <strong>{liveDisplayPrice}</strong>
                    </div>
                    <div className="wizard-summary-fact">
                      <span>Next Departure</span>
                      <strong>{trip.nextDeparture || 'Flexible / Every weekend'}</strong>
                    </div>
                    <div className="wizard-summary-fact">
                      <span>Length &amp; Pace</span>
                      <strong>
                        {trip.duration || '1 day'} · {trip.level || 'Easy'}
                      </strong>
                    </div>
                    <div className="wizard-summary-fact">
                      <span>Group Size</span>
                      <strong>{trip.groupSize || 'Private & Scheduled Departures'}</strong>
                    </div>
                    <div className="wizard-summary-fact">
                      <span>{isDayTrip ? 'Meeting Point' : 'Season / Stay'}</span>
                      <strong>{(isDayTrip ? trip.meetingPoint : trip.bestSeason) || '—'}</strong>
                    </div>
                    <div className="wizard-summary-fact">
                      <span>Payment Plan</span>
                      <strong>{trip.depositNote || 'Standard booking'}</strong>
                    </div>
                  </div>
                </div>

                {/* 3. Overview & Schedule */}
                <div className="wizard-summary-block">
                  <div className="wizard-summary-block__head">
                    <h3 className="wizard-summary-block__title">
                      Overview &amp; {isDayTrip ? 'Day Schedule' : 'Day-by-Day Itinerary'} (
                      {trip.itinerary.length})
                    </h3>
                    <button type="button" className="wizard-summary-edit" onClick={() => goToStep(3)}>
                      Edit Schedule
                    </button>
                  </div>

                  {trip.overviewText && (
                    <p className="wizard-summary-sub" style={{ marginTop: 0 }}>
                      {trip.overviewText}
                    </p>
                  )}

                  <div className="wizard-summary-days">
                    {trip.itinerary.map((row, idx) => (
                      <div key={idx} className="wizard-summary-day">
                        <strong>
                          {row.time}
                          {row.title ? ` — ${row.title}` : ''}
                        </strong>
                        {row.desc}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Checklists */}
                <div className="wizard-summary-block">
                  <div className="wizard-summary-block__head">
                    <h3 className="wizard-summary-block__title">Included, Excluded &amp; Carry</h3>
                    <button type="button" className="wizard-summary-edit" onClick={() => goToStep(4)}>
                      Edit Checklists
                    </button>
                  </div>

                  <div className="wizard-summary-lists">
                    <div className="wizard-summary-list-col">
                      <h4>Included ({(trip.included || []).length})</h4>
                      <ul>
                        {(trip.included || []).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="wizard-summary-list-col">
                      <h4>Excluded ({(trip.excluded || []).length})</h4>
                      <ul>
                        {(trip.excluded || []).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {(trip.whatToCarry || []).length > 0 && (
                      <div className="wizard-summary-list-col">
                        <h4>What to Carry ({trip.whatToCarry.length})</h4>
                        <ul>
                          {trip.whatToCarry.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step Navigation Footer — on plain background below containers */}
          <div className="wizard-footer">
            <div>
              {activeStep > 0 && (
                <button
                  type="button"
                  className="wizard-btn-ghost"
                  onClick={() => goToStep(activeStep - 1)}
                >
                  <ArrowLeft size={15} />
                  <span>Previous Step</span>
                </button>
              )}
            </div>

            <div className="wizard-footer__right">
              <button type="button" className="wizard-btn-ghost" onClick={handleSaveAndExitDraft}>
                Save Draft for Later
              </button>

              {activeStep < 5 ? (
                <button
                  type="button"
                  className="wizard-btn-primary"
                  onClick={() => goToStep(activeStep + 1)}
                >
                  <span>
                    {activeStep === 4 ? 'Review Summary' : 'Save & Continue'}
                  </span>
                  <ArrowRight size={15} />
                </button>
              ) : (
                <button type="button" className="wizard-btn-primary" onClick={handlePublish}>
                  <Check size={16} strokeWidth={2.6} />
                  <span>
                    {trip.status === 'published' ? 'Update Live Trip' : 'Publish Trip Live'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Right Sticky Live Card & Progress Summary ─── */}
        <aside className="wizard-preview" aria-label="Live trip card preview">
          <div className="wizard-preview__card">
            <img
              src={trip.image || '/images/wildbeast.webp'}
              alt={trip.title || 'Preview'}
            />
            <div className="wizard-preview__scrim" />

            <div className="wizard-preview__pills">
              <span className="wizard-preview__pill">
                {trip.duration || (isDayTrip ? '1 day' : '3 days')}
              </span>
              <span className="wizard-preview__pill">{trip.level || 'Easy'}</span>
            </div>

            <div className="wizard-preview__body">
              <div className="wizard-preview__loc">
                {trip.location || trip.destination || 'Kenya'}
              </div>
              <h3 className="wizard-preview__title">
                {trip.title || 'Your Trip Headline Preview'}
              </h3>
              <div className="wizard-preview__price-bar">
                <span>from</span>
                <strong>{liveDisplayPrice}</strong>
              </div>
            </div>
          </div>

          <div className="wizard-preview__summary">
            <div className="wizard-preview__summary-row">
              <span>Format</span>
              <strong>{isDayTrip ? '1-Day Trip (No Stay)' : 'Multi-Day Getaway'}</strong>
            </div>
            <div className="wizard-preview__summary-row">
              <span>{isDayTrip ? 'Meeting Point' : 'Best Season / Stay'}</span>
              <strong>
                {(isDayTrip ? trip.meetingPoint : trip.bestSeason) || '—'}
              </strong>
            </div>
            <div className="wizard-preview__summary-row">
              <span>Photos Uploaded</span>
              <strong>
                {[trip.image, trip.gallery?.[0], trip.gallery?.[1]].filter(Boolean).length} / 3
                bento slots
              </strong>
            </div>
            <div className="wizard-preview__summary-row">
              <span>{isDayTrip ? 'Time Slots' : 'Itinerary Days'}</span>
              <strong>{trip.itinerary.length}</strong>
            </div>
            <div className="wizard-preview__summary-row">
              <span>Draft Completion</span>
              <strong>{completionPct}%</strong>
            </div>
          </div>
        </aside>
      </div>
    </AdminLayout>
  )
}
