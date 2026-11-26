import { RECIPES_AND_POSTS } from '../data/cakesData.js'
import { API_BASE } from '../config/api.js'
import { slugifyTrip } from './tripStore.js'

const DB_JOURNAL_CACHE_KEY = 'lany_Db_Journals_v1'
const DB_JOURNAL_SYNCED_KEY = 'lany_Db_Journals_Synced_v1'
const OFFLINE_JOURNAL_DRAFTS_KEY = 'lany_Offline_Journal_Drafts_v1'

let dbJournalsMemory = null
let hasSyncedJournalsOnce = false
let inflightPublicJournals = null
let inflightAdminJournals = null

export const JOURNAL_STEPS = [
  { index: 0, key: 'headline', label: 'Headline & Topic', short: 'Headline' },
  { index: 1, key: 'cover', label: 'Cover Photo', short: 'Photo' },
  { index: 2, key: 'story', label: 'Write Story', short: 'Story' },
  { index: 3, key: 'summary', label: 'Summary & Publish', short: 'Summary' },
]

export const JOURNAL_CATEGORIES = [
  'PLANNING',
  'DESTINATIONS',
  'ON THE ROAD',
  '1-DAY GUIDES',
  'PACKING & TIPS',
]

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function safeWrite(key, value, notify = true) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    if (notify) {
      window.dispatchEvent(new Event('fomo-journals-updated'))
    }
    return true
  } catch (err) {
    console.error('Journal storage write failed:', err)
    return false
  }
}

function getCachedDbJournals() {
  if (Array.isArray(dbJournalsMemory)) return dbJournalsMemory
  const stored = safeRead(DB_JOURNAL_CACHE_KEY, null)
  if (Array.isArray(stored)) {
    dbJournalsMemory = stored
    return dbJournalsMemory
  }
  return null
}

function setCachedDbJournals(list, notify = true) {
  dbJournalsMemory = Array.isArray(list) ? list : []
  hasSyncedJournalsOnce = true
  try {
    localStorage.setItem(DB_JOURNAL_SYNCED_KEY, '1')
  } catch {
    // ignore storage errors
  }
  safeWrite(DB_JOURNAL_CACHE_KEY, dbJournalsMemory, notify)
}

function isJournalDbAuthoritative() {
  if (hasSyncedJournalsOnce || Array.isArray(dbJournalsMemory)) return true
  try {
    return localStorage.getItem(DB_JOURNAL_SYNCED_KEY) === '1'
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

export function estimateReadTime(text = '') {
  const words = String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  const mins = Math.max(2, Math.round(words / 185))
  return `${mins} MIN READ`
}

export function computeJournalCompletion(post = {}) {
  let score = 0
  if (post.title?.trim()) score += 30
  if (post.excerpt?.trim()) score += 20
  if (post.image?.trim()) score += 25
  const hasBody =
    (typeof post.bodyText === 'string' && post.bodyText.trim().length > 20) ||
    (Array.isArray(post.body) && post.body.some((p) => p?.trim()))
  if (hasBody) score += 25
  return Math.min(100, score)
}

export function createBlankJournalDraft() {
  const id = `jdraft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  return {
    id,
    slug: '',
    status: 'draft',
    currentStep: 0,
    completedSteps: [],
    category: 'ON THE ROAD',
    readTime: '4 MIN READ',
    autoReadTime: true,
    title: '',
    excerpt: '',
    image: '',
    alt: '',
    bodyText: '',
    body: [],
    relatedTripSlug: '',
    seoKeyword: '',
    seoTitle: '',
    seoDescription: '',
    allowIndexing: true,
    updatedAt: Date.now(),
  }
}

function normalizeDbJournal(post) {
  const bodyArray =
    Array.isArray(post.body) && post.body.length > 0
      ? post.body
      : String(post.bodyText || '')
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean)

  const bodyText =
    typeof post.bodyText === 'string' && post.bodyText
      ? post.bodyText
      : bodyArray.join('\n\n')

  return {
    ...post,
    id: post.id || post.slug,
    slug: post.slug || post.id,
    status: post.status || 'published',
    body: bodyArray,
    bodyText,
    completion: computeJournalCompletion({ ...post, body: bodyArray, bodyText }),
  }
}

function getSeededJournals() {
  return RECIPES_AND_POSTS.map((base) => {
    const bodyArray = base.body || base.content || []
    return {
      status: 'published',
      isCurated: true,
      currentStep: 3,
      ...base,
      body: bodyArray,
      bodyText: base.bodyText || bodyArray.join('\n\n'),
      id: base.slug || base.id,
      slug: base.slug || base.id,
    }
  })
}

function mergeJournalsWithSeed(primaryList = []) {
  const seen = new Set()
  const merged = []
  for (const item of primaryList) {
    if (!item) continue
    const key = item.slug || item.id
    if (key) seen.add(key)
    if (item.id) seen.add(item.id)
    merged.push(item)
  }
  for (const seed of getSeededJournals()) {
    if (!seen.has(seed.slug) && !seen.has(seed.id)) {
      merged.push(seed)
    }
  }
  return merged
}

/**
 * Fetch journal stories directly from the live Content Desk API (`/api/journal`),
 * preserving built-in bakery guides alongside any newly published Content Desk posts.
 */
export async function syncJournalsFromApi({ includeDrafts = false } = {}) {
  const token = getValidAdminToken()
  const useAdminEndpoint = Boolean(includeDrafts && token)

  if (useAdminEndpoint && inflightAdminJournals) return inflightAdminJournals
  if (!useAdminEndpoint && inflightPublicJournals) return inflightPublicJournals

  const runner = (async () => {
    try {
      const url = useAdminEndpoint
        ? `${API_BASE}/api/journal/admin/all`
        : `${API_BASE}/api/journal`
      const headers = useAdminEndpoint ? { Authorization: `Bearer ${token}` } : {}
      let res = await fetch(url, { headers })

      if (!res.ok && useAdminEndpoint) {
        res = await fetch(`${API_BASE}/api/journal`)
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const incoming = Array.isArray(data.posts) ? data.posts.map(normalizeDbJournal) : []

      if (useAdminEndpoint) {
        const offlineDrafts = safeRead(OFFLINE_JOURNAL_DRAFTS_KEY, {})
        const dbIds = new Set(incoming.flatMap((p) => [p.id, p.slug]))
        const unsynced = Object.values(offlineDrafts).filter(
          (d) => d && !dbIds.has(d.id) && !dbIds.has(d.slug)
        )
        setCachedDbJournals(mergeJournalsWithSeed([...unsynced, ...incoming]), true)
      } else {
        const existing = getCachedDbJournals() || []
        const draftsOnly = existing.filter((p) => p.status === 'draft')
        const pubSlugs = new Set(incoming.flatMap((p) => [p.id, p.slug]))
        const remainingDrafts = draftsOnly.filter(
          (d) => !pubSlugs.has(d.id) && !pubSlugs.has(d.slug)
        )
        setCachedDbJournals(mergeJournalsWithSeed([...remainingDrafts, ...incoming]), true)
      }

      return getCachedDbJournals()
    } catch {
      return getCachedDbJournals() || getSeededJournals()
    } finally {
      if (useAdminEndpoint) inflightAdminJournals = null
      else inflightPublicJournals = null
    }
  })()

  if (useAdminEndpoint) inflightAdminJournals = runner
  else inflightPublicJournals = runner

  return runner
}

export function getAllManagedJournals({ includeDrafts = false } = {}) {
  const cachedDb = getCachedDbJournals()
  const all = isJournalDbAuthoritative() && Array.isArray(cachedDb)
    ? mergeJournalsWithSeed(cachedDb)
    : getSeededJournals()

  if (includeDrafts) return all
  return all.filter((p) => (p.status || 'published') === 'published' && p.title?.trim())
}

export function getManagedJournalBySlug(idOrSlug) {
  if (!idOrSlug) return null
  const all = getAllManagedJournals({ includeDrafts: true })
  return all.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null
}

export async function saveManagedJournal(postPayload, { syncApi = true, rawCoverFile = null } = {}) {
  const id = postPayload.id || `jdraft-${Date.now().toString(36)}`
  const computedSlug = slugifyTrip(postPayload.slug || postPayload.title) || id

  const bodyArray =
    typeof postPayload.bodyText === 'string'
      ? postPayload.bodyText
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean)
      : Array.isArray(postPayload.body)
        ? postPayload.body.filter(Boolean)
        : []

  const fullBodyText =
    typeof postPayload.bodyText === 'string'
      ? postPayload.bodyText
      : bodyArray.join('\n\n')

  const computedReadTime =
    postPayload.autoReadTime !== false && fullBodyText.trim()
      ? estimateReadTime(fullBodyText)
      : postPayload.readTime || '4 MIN READ'

  let normalized = {
    ...postPayload,
    id,
    slug: computedSlug,
    status: postPayload.status || 'draft',
    category: (postPayload.category || 'ON THE ROAD').toUpperCase(),
    readTime: computedReadTime.toUpperCase(),
    alt: postPayload.alt || postPayload.title || 'FOMO Tours Kenya Journal',
    body: bodyArray,
    bodyText: fullBodyText,
    currentStep: typeof postPayload.currentStep === 'number' ? postPayload.currentStep : 0,
    completion: computeJournalCompletion({
      ...postPayload,
      body: bodyArray,
      bodyText: fullBodyText,
    }),
    updatedAt: Date.now(),
  }

  const currentList = [...(getCachedDbJournals() || getAllManagedJournals({ includeDrafts: true }))]
  const existingIdx = currentList.findIndex(
    (p) => p.id === normalized.id || p.slug === normalized.slug
  )
  if (existingIdx >= 0) currentList[existingIdx] = normalized
  else currentList.unshift(normalized)
  setCachedDbJournals(currentList, true)

  if (syncApi) {
    const token = getValidAdminToken()
    if (token) {
      try {
        const fd = new FormData()
        fd.append('id', normalized.id)
        fd.append('slug', normalized.slug)
        fd.append('title', normalized.title || 'Untitled Story')
        fd.append('status', normalized.status)
        fd.append('meta_json', JSON.stringify(normalized))
        if (rawCoverFile) fd.append('cover_image', rawCoverFile)

        const res = await fetch(`${API_BASE}/api/journal/upsert`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
        if (res.ok) {
          const data = await res.json()
          if (data.post) {
            normalized = normalizeDbJournal(data.post)
            const refreshed = [...(getCachedDbJournals() || [])]
            const idx = refreshed.findIndex(
              (p) => p.id === id || p.id === normalized.id || p.slug === normalized.slug
            )
            if (idx >= 0) refreshed[idx] = normalized
            else refreshed.unshift(normalized)
            setCachedDbJournals(refreshed, true)

            const offlineDrafts = safeRead(OFFLINE_JOURNAL_DRAFTS_KEY, {})
            if (offlineDrafts[id]) {
              delete offlineDrafts[id]
              safeWrite(OFFLINE_JOURNAL_DRAFTS_KEY, offlineDrafts, false)
            }
          }
        }
      } catch {
        const offlineDrafts = safeRead(OFFLINE_JOURNAL_DRAFTS_KEY, {})
        offlineDrafts[id] = normalized
        safeWrite(OFFLINE_JOURNAL_DRAFTS_KEY, offlineDrafts, false)
      }
    }
  }

  return normalized
}

export async function deleteManagedJournal(idOrSlug) {
  if (!idOrSlug) return
  const existing = getManagedJournalBySlug(idOrSlug)
  const targetId = existing?.id || idOrSlug
  const targetSlug = existing?.slug || idOrSlug

  const nextList = (getCachedDbJournals() || getAllManagedJournals({ includeDrafts: true })).filter(
    (p) => p.id !== targetId && p.slug !== targetSlug && p.id !== idOrSlug
  )
  setCachedDbJournals(nextList, true)

  const offlineDrafts = safeRead(OFFLINE_JOURNAL_DRAFTS_KEY, {})
  delete offlineDrafts[targetId]
  delete offlineDrafts[idOrSlug]
  safeWrite(OFFLINE_JOURNAL_DRAFTS_KEY, offlineDrafts, false)

  const token = getValidAdminToken()
  if (token) {
    try {
      await fetch(`${API_BASE}/api/journal/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {
      // Already removed locally
    }
  }
}

export async function toggleManagedJournalStatus(idOrSlug) {
  const existing = getManagedJournalBySlug(idOrSlug)
  if (!existing) return null
  const nextStatus = existing.status === 'published' ? 'draft' : 'published'
  const updatedPost = {
    ...existing,
    status: nextStatus,
    updatedAt: Date.now(),
  }

  const nextList = (getCachedDbJournals() || getAllManagedJournals({ includeDrafts: true })).map((p) =>
    p.id === existing.id || p.slug === existing.slug ? updatedPost : p
  )
  setCachedDbJournals(nextList, true)

  const token = getValidAdminToken()
  if (token) {
    try {
      const res = await fetch(
        `${API_BASE}/api/journal/${encodeURIComponent(existing.id || existing.slug)}/status`,
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
        if (data.post) {
          const dbPost = normalizeDbJournal(data.post)
          const syncedList = (getCachedDbJournals() || []).map((p) =>
            p.id === existing.id || p.slug === existing.slug ? dbPost : p
          )
          setCachedDbJournals(syncedList, true)
          return dbPost
        }
      }
    } catch {
      // Optimistic state kept cleanly
    }
  }

  return updatedPost
}

if (typeof window !== 'undefined') {
  syncJournalsFromApi({ includeDrafts: Boolean(getValidAdminToken()) })
}
