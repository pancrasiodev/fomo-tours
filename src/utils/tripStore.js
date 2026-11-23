import { KENYA_TRIPS } from '../data/siteData.js'
import { API_BASE } from '../config/api.js'

const DB_CACHE_KEY = 'fomo_Db_Trips_v5'
const DB_SYNCED_FLAG_KEY = 'fomo_Db_Trips_Synced_v4'
const OFFLINE_DRAFTS_KEY = 'fomo_Offline_Trip_Drafts_v4'

let dbTripsMemory = null
let hasSyncedDbOnce = false
let inflightPublicPromise = null
let inflightAdminPromise = null

export const WIZARD_STEPS = [
  { index: 0, key: 'basics', label: 'Basics & Type', short: 'Basics' },
  { index: 1, key: 'pricing', label: 'Pricing & Facts', short: 'Pricing' },
  { index: 2, key: 'photos', label: '3-Photo Gallery', short: 'Photos' },
  { index: 3, key: 'schedule', label: 'Overview & Schedule', short: 'Schedule' },
  { index: 4, key: 'checklists', label: 'Checklists', short: 'Checklists' },
  { index: 5, key: 'summary', label: 'Summary & Publish', short: 'Summary' },
]

function safeReadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function safeWriteJson(key, value, notify = true) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    if (notify) {
      window.dispatchEvent(new Event('fomo-trips-updated'))
    }
    return true
  } catch (err) {
    console.error('Storage write failed:', err)
    return false
  }
}

function getCachedDbTrips() {
  if (Array.isArray(dbTripsMemory)) return dbTripsMemory
  const stored = safeReadJson(DB_CACHE_KEY, null)
  if (Array.isArray(stored)) {
    dbTripsMemory = stored
    return dbTripsMemory
  }
  return null
}

function setCachedDbTrips(list, notify = true) {
  dbTripsMemory = Array.isArray(list) ? list : []
  hasSyncedDbOnce = true
  try {
    localStorage.setItem(DB_SYNCED_FLAG_KEY, '1')
  } catch {
    // ignore storage quota errors
  }
  safeWriteJson(DB_CACHE_KEY, dbTripsMemory, notify)
}

function isDbAuthoritative() {
  if (hasSyncedDbOnce || Array.isArray(dbTripsMemory)) return true
  try {
    return localStorage.getItem(DB_SYNCED_FLAG_KEY) === '1'
  } catch {
    return false
  }
}

function getValidAdminToken() {
  try {
    const token = localStorage.getItem('fomo_admin_token')
    if (!token || token === 'offline-local-session') return null
    return token
  } catch {
    return null
  }
}

export function slugifyTrip(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function generateDraftId() {
  return `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function computeTripCompletion(trip = {}) {
  let score = 0
  if (trip.title?.trim()) score += 20
  if (trip.destination?.trim() && trip.location?.trim()) score += 10
  if (trip.price?.toString().trim()) score += 20
  if (trip.image?.trim()) score += 20
  const hasOverview = Array.isArray(trip.overview)
    ? trip.overview.some((p) => p?.trim())
    : Boolean(trip.overview?.trim())
  const hasSchedule =
    Array.isArray(trip.itinerary) &&
    trip.itinerary.some((d) => d?.day?.trim() || d?.title?.trim() || d?.desc?.trim())
  if (hasOverview || hasSchedule) score += 15
  if (Array.isArray(trip.included) && trip.included.length > 0) score += 15
  return Math.min(100, score)
}

export function createBlankTripDraft(tripType = 'multi_day') {
  const isDay = tripType === 'day_trip'
  const id = generateDraftId()
  return {
    id,
    slug: '',
    tripType: isDay ? 'day_trip' : 'multi_day',
    status: 'draft',
    currentStep: 0,
    completedSteps: [],
    title: '',
    destination: isDay ? 'Lake Naivasha' : 'Maasai Mara',
    location: '',
    subtitle: '',
    currency: 'KSh',
    priceAmount: '',
    price: '',
    depositNote: isDay
      ? 'Book your seat with KSh 1,500 deposit · Lipa Pole Pole accepted'
      : 'Reserve with 30% deposit · Lipa Pole Pole available',
    nextDeparture: '',
    duration: isDay ? '1 day' : '3 days / 2 nights',
    groupSize: isDay ? 'Day Excursions' : 'Private & Scheduled Departures',
    level: 'Easy',
    bestSeason: 'June to March',
    meetingPoint: isDay ? 'Kencom / Nairobi CBD · 6:00 AM' : '',
    image: '',
    gallery: ['', ''],
    overviewText: '',
    overview: [],
    itinerary: isDay
      ? [
          { time: '06:00 AM', title: 'Meet & Depart Nairobi CBD', desc: 'Board the tour cruiser at Kencom / CBD pickup point with morning briefing.' },
          { time: '09:30 AM', title: 'Main Experience & Guided Exploration', desc: 'Arrive at the destination and begin the main guided activity with photo stops.' },
          { time: '01:00 PM', title: 'Group Lunch & Leisure Break', desc: 'Relax over lunch with scenic views and optional add-on activities.' },
          { time: '05:30 PM', title: 'Return Drop-off in Nairobi', desc: 'Scenic afternoon drive back with drop-off at the CBD meeting point.' },
        ]
      : [
          { time: 'Day 1', title: 'Depart Nairobi & Afternoon Experience', desc: 'Morning pickup, scenic stopovers en route, lunch check-in and afternoon drive.' },
          { time: 'Day 2', title: 'Full-Day Exploration & Sundowner', desc: 'Full day out with our local guide, picnic or lodge lunch, and relaxed evening.' },
          { time: 'Day 3', title: 'Morning Activity & Return to Nairobi', desc: 'Easy breakfast, final morning experience, and return journey arriving late afternoon.' },
        ],
    included: isDay
      ? [
          'Round-trip transport from Nairobi in a comfortable tour van / 4x4 cruiser',
          'Professional FOMO Tours guide & trip photography',
          'Bottled drinking water throughout the day',
        ]
      : [
          'Accommodation on sharing basis in handpicked camp / resort',
          'Round-trip transport & professional Kenyan guide throughout',
          'Meals as per itinerary and bottled drinking water',
        ],
    excluded: [
      'Drinks, alcohol & personal expenses',
      'Tips and gratuities for guide / crew',
    ],
    whatToCarry: isDay
      ? [
          'Original National ID or Passport',
          'Comfortable sneakers / walking shoes',
          'Warm morning fleece & sun hat',
        ]
      : [],
    updatedAt: Date.now(),
  }
}

export function fileToCompressedDataUrl(file, maxWidth = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('')
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read image file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => resolve(String(reader.result || ''))
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(String(reader.result || ''))
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        const out = canvas.toDataURL('image/jpeg', quality)
        resolve(out)
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

export function formatDisplayPrice(currency = 'KSh', priceAmount = '', fallbackPrice = '') {
  const cleaned = String(priceAmount || '').replace(/[^\d.]/g, '')
  if (cleaned && !Number.isNaN(Number(cleaned)) && Number(cleaned) > 0) {
    const formatted = Number(cleaned).toLocaleString('en-US')
    return String(currency).toUpperCase() === 'USD' ? `$${formatted}` : `KSh ${formatted}`
  }
  return fallbackPrice || (String(currency).toUpperCase() === 'USD' ? '$0' : 'KSh 0')
}

function normalizeDbPackage(pkg) {
  const rawItinerary = Array.isArray(pkg.itinerary) ? pkg.itinerary : []
  const itinerary = rawItinerary.map((item, idx) => {
    if (item.day && item.time !== undefined) return item
    if (item.time !== undefined || item.title !== undefined) {
      const prefix = (item.time || `Day ${idx + 1}`).trim()
      const heading = (item.title || '').trim()
      return {
        time: prefix,
        title: heading,
        day: heading ? `${prefix}: ${heading}` : prefix,
        desc: (item.desc || '').trim(),
      }
    }
    const parts = String(item.day || '').split(':')
    const prefix = parts[0]?.trim() || `Day ${idx + 1}`
    const heading = parts.slice(1).join(':').trim()
    return {
      time: prefix,
      title: heading,
      day: item.day || prefix,
      desc: item.desc || '',
    }
  })

  return {
    ...pkg,
    id: pkg.id || pkg.slug,
    slug: pkg.slug || pkg.id,
    status: pkg.status || 'published',
    tripType:
      pkg.tripType ||
      (String(pkg.duration || '').toLowerCase().startsWith('1 day') ? 'day_trip' : 'multi_day'),
    itinerary,
    completion: computeTripCompletion({ ...pkg, itinerary }),
  }
}

/**
 * Fetch trips directly from the live relational database API (`packages` table).
 */
export async function syncTripsFromApi({ includeDrafts = false } = {}) {
  const token = getValidAdminToken()
  const useAdminEndpoint = Boolean(includeDrafts && token)

  if (useAdminEndpoint && inflightAdminPromise) return inflightAdminPromise
  if (!useAdminEndpoint && inflightPublicPromise) return inflightPublicPromise

  const runner = (async () => {
    try {
      const url = useAdminEndpoint
        ? `${API_BASE}/api/packages/admin/all`
        : `${API_BASE}/api/packages`
      const headers = useAdminEndpoint ? { Authorization: `Bearer ${token}` } : {}
      let res = await fetch(url, { headers })

      // Fallback to public endpoint if admin token expired
      if (!res.ok && useAdminEndpoint) {
        res = await fetch(`${API_BASE}/api/packages`)
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const incoming = Array.isArray(data.packages)
        ? data.packages.map(normalizeDbPackage)
        : []

      if (useAdminEndpoint) {
        // Admin endpoint returns every row in `packages` (published + drafts)
        const offlineDrafts = safeReadJson(OFFLINE_DRAFTS_KEY, {})
        const dbIds = new Set(incoming.flatMap((p) => [p.id, p.slug]))
        const unsynced = Object.values(offlineDrafts).filter(
          (d) => d && !dbIds.has(d.id) && !dbIds.has(d.slug)
        )
        setCachedDbTrips([...unsynced, ...incoming], true)
      } else {
        // Public endpoint returns all published rows; preserve any cached drafts from Admin session
        const existing = getCachedDbTrips() || []
        const draftsOnly = existing.filter((t) => t.status === 'draft')
        const pubSlugs = new Set(incoming.flatMap((p) => [p.id, p.slug]))
        const remainingDrafts = draftsOnly.filter(
          (d) => !pubSlugs.has(d.id) && !pubSlugs.has(d.slug)
        )
        setCachedDbTrips([...remainingDrafts, ...incoming], true)
      }

      return getCachedDbTrips()
    } catch {
      return getCachedDbTrips() || []
    } finally {
      if (useAdminEndpoint) inflightAdminPromise = null
      else inflightPublicPromise = null
    }
  })()

  if (useAdminEndpoint) inflightAdminPromise = runner
  else inflightPublicPromise = runner

  return runner
}

/**
 * Returns trips from the database cache (falling back to static seed data only
 * if the backend API has never been reached yet).
 */
export function getAllManagedTrips({ includeDrafts = false, excludeAliases = false } = {}) {
  const cachedDb = getCachedDbTrips()
  let all

  if (isDbAuthoritative() && Array.isArray(cachedDb)) {
    all = cachedDb
  } else {
    // Cold-start fallback while initial DB request is in flight
    all = KENYA_TRIPS.map((base) => ({
      status: 'published',
      tripType: base.duration?.toLowerCase().startsWith('1 day') ? 'day_trip' : 'multi_day',
      isCurated: true,
      currentStep: 5,
      ...base,
      id: base.slug,
      slug: base.slug,
    }))
  }

  const filteredAliases = excludeAliases
    ? all.filter((t) => t.slug !== 'rift-valley-lakes')
    : all

  if (includeDrafts) return filteredAliases
  return filteredAliases.filter((t) => (t.status || 'published') === 'published' && t.title?.trim())
}

export function getManagedTripBySlug(idOrSlug) {
  if (!idOrSlug) return null
  const all = getAllManagedTrips({ includeDrafts: true, excludeAliases: false })
  return all.find((t) => t.id === idOrSlug || t.slug === idOrSlug) || null
}

/**
 * Save or publish a trip directly to the database (`POST /api/packages/upsert`).
 */
export async function saveManagedTrip(tripPayload, { syncApi = true, rawFiles = {} } = {}) {
  const id = tripPayload.id || generateDraftId()
  const computedSlug = slugifyTrip(tripPayload.slug || tripPayload.title) || id

  const rawItinerary = Array.isArray(tripPayload.itinerary) ? tripPayload.itinerary : []
  const normalizedItinerary = rawItinerary
    .filter((item) => item && (item.day || item.title || item.time || item.desc))
    .map((item, idx) => {
      if (item.time !== undefined || item.title !== undefined) {
        const prefix = (
          item.time || (tripPayload.tripType === 'day_trip' ? 'Stop' : `Day ${idx + 1}`)
        ).trim()
        const heading = (item.title || '').trim()
        return {
          time: prefix,
          title: heading,
          day: heading ? `${prefix}: ${heading}` : prefix,
          desc: (item.desc || '').trim(),
        }
      }
      const parts = String(item.day || '').split(':')
      const prefix = parts[0]?.trim() || `Day ${idx + 1}`
      const heading = parts.slice(1).join(':').trim()
      return {
        time: prefix,
        title: heading,
        day: item.day || prefix,
        desc: item.desc || '',
      }
    })

  const overviewArray =
    typeof tripPayload.overviewText === 'string'
      ? tripPayload.overviewText
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean)
      : Array.isArray(tripPayload.overview)
        ? tripPayload.overview.filter(Boolean)
        : []

  const priceDisplay =
    tripPayload.priceAmount !== undefined && String(tripPayload.priceAmount).trim() !== ''
      ? formatDisplayPrice(tripPayload.currency || 'KSh', tripPayload.priceAmount, tripPayload.price)
      : tripPayload.price || ''

  let normalized = {
    ...tripPayload,
    id,
    slug: computedSlug,
    status: tripPayload.status || 'draft',
    tripType: tripPayload.tripType || 'multi_day',
    price: priceDisplay,
    overview: overviewArray,
    overviewText:
      typeof tripPayload.overviewText === 'string'
        ? tripPayload.overviewText
        : overviewArray.join('\n\n'),
    itinerary: normalizedItinerary,
    currentStep: typeof tripPayload.currentStep === 'number' ? tripPayload.currentStep : 0,
    completion: computeTripCompletion({
      ...tripPayload,
      price: priceDisplay,
      overview: overviewArray,
      itinerary: normalizedItinerary,
    }),
    updatedAt: Date.now(),
  }

  // Optimistically update memory/cache immediately
  const currentList = [...(getCachedDbTrips() || getAllManagedTrips({ includeDrafts: true }))]
  const existingIdx = currentList.findIndex(
    (t) => t.id === normalized.id || t.slug === normalized.slug
  )
  if (existingIdx >= 0) {
    currentList[existingIdx] = normalized
  } else {
    currentList.unshift(normalized)
  }
  setCachedDbTrips(currentList, true)

  if (syncApi) {
    const token = getValidAdminToken()
    if (token) {
      try {
        const fd = new FormData()
        fd.append('id', normalized.id)
        fd.append('title', normalized.title || 'Untitled Draft')
        fd.append('slug', normalized.slug)
        fd.append('overview', normalized.overview.join('\n\n'))
        fd.append('duration', normalized.duration || '')
        fd.append('destinations', normalized.destination || '')
        fd.append('nearest_airport', normalized.meetingPoint || normalized.location || '')
        fd.append('highlights', JSON.stringify(normalized.whatToCarry || []))
        fd.append('inclusions', JSON.stringify(normalized.included || []))
        fd.append('exclusions', JSON.stringify(normalized.excluded || []))
        fd.append('status', normalized.status)
        fd.append('meta_json', JSON.stringify(normalized))
        if (rawFiles.cover) fd.append('cover_image', rawFiles.cover)
        if (rawFiles.side1) fd.append('gallery_1', rawFiles.side1)
        if (rawFiles.side2) fd.append('gallery_2', rawFiles.side2)

        const res = await fetch(`${API_BASE}/api/packages/upsert`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
        if (res.ok) {
          const data = await res.json()
          if (data.package) {
            normalized = normalizeDbPackage(data.package)
            const refreshed = [...(getCachedDbTrips() || [])]
            const idx = refreshed.findIndex(
              (t) => t.id === id || t.id === normalized.id || t.slug === normalized.slug
            )
            if (idx >= 0) refreshed[idx] = normalized
            else refreshed.unshift(normalized)
            setCachedDbTrips(refreshed, true)

            const offlineDrafts = safeReadJson(OFFLINE_DRAFTS_KEY, {})
            if (offlineDrafts[id]) {
              delete offlineDrafts[id]
              safeWriteJson(OFFLINE_DRAFTS_KEY, offlineDrafts, false)
            }
          }
        }
      } catch {
        const offlineDrafts = safeReadJson(OFFLINE_DRAFTS_KEY, {})
        offlineDrafts[id] = normalized
        safeWriteJson(OFFLINE_DRAFTS_KEY, offlineDrafts, false)
      }
    }
  }

  return normalized
}

export async function deleteManagedTrip(idOrSlug) {
  if (!idOrSlug) return
  const existing = getManagedTripBySlug(idOrSlug)
  const targetId = existing?.id || idOrSlug
  const targetSlug = existing?.slug || idOrSlug

  const nextList = (getCachedDbTrips() || getAllManagedTrips({ includeDrafts: true })).filter(
    (t) => t.id !== targetId && t.slug !== targetSlug && t.id !== idOrSlug
  )
  setCachedDbTrips(nextList, true)

  const offlineDrafts = safeReadJson(OFFLINE_DRAFTS_KEY, {})
  delete offlineDrafts[targetId]
  delete offlineDrafts[idOrSlug]
  safeWriteJson(OFFLINE_DRAFTS_KEY, offlineDrafts, false)

  const token = getValidAdminToken()
  if (token) {
    try {
      await fetch(`${API_BASE}/api/packages/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {
      // Already removed locally
    }
  }
}

export async function toggleManagedTripStatus(idOrSlug) {
  const existing = getManagedTripBySlug(idOrSlug)
  if (!existing) return null
  const nextStatus = existing.status === 'published' ? 'draft' : 'published'
  const updatedTrip = {
    ...existing,
    status: nextStatus,
    updatedAt: Date.now(),
  }

  const nextList = (getCachedDbTrips() || getAllManagedTrips({ includeDrafts: true })).map((t) =>
    t.id === existing.id || t.slug === existing.slug ? updatedTrip : t
  )
  setCachedDbTrips(nextList, true)

  const token = getValidAdminToken()
  if (token) {
    try {
      const res = await fetch(
        `${API_BASE}/api/packages/${encodeURIComponent(existing.id || existing.slug)}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      )
      if (res.ok) {
        const data = await res.json()
        if (data.package) {
          const dbPkg = normalizeDbPackage(data.package)
          const syncedList = (getCachedDbTrips() || []).map((t) =>
            t.id === existing.id || t.slug === existing.slug ? dbPkg : t
          )
          setCachedDbTrips(syncedList, true)
          return dbPkg
        }
      }
    } catch {
      // Optimistic state kept cleanly
    }
  }

  return updatedTrip
}

// Automatically hydrate from live database API on browser startup
if (typeof window !== 'undefined') {
  syncTripsFromApi({ includeDrafts: Boolean(getValidAdminToken()) })
}
