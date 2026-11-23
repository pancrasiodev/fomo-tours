const fs = require('fs')
const path = require('path')
const multer = require('multer')
const db = require('../config/database')

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, unique + path.extname(file.originalname))
  },
})

const upload = multer({ storage })
const uploadBento = upload.fields([
  { name: 'cover_image', maxCount: 1 },
  { name: 'gallery_1', maxCount: 1 },
  { name: 'gallery_2', maxCount: 1 },
])

function safeParseJson(val, fallback) {
  if (!val) return fallback
  if (typeof val === 'object') return val
  try {
    return JSON.parse(val)
  } catch {
    return fallback
  }
}

function formatPackageRow(row) {
  const meta = safeParseJson(row.meta_json, {})
  const included = safeParseJson(row.inclusions, meta.included || [])
  const excluded = safeParseJson(row.exclusions, meta.excluded || [])
  const whatToCarry = safeParseJson(row.what_to_carry || row.highlights, meta.whatToCarry || [])
  const itinerary = safeParseJson(row.itinerary_json, meta.itinerary || [])
  const overviewList = String(row.overview || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return {
    ...meta,
    id: row.record_uid || row.slug || String(row.id),
    db_id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || meta.subtitle || '',
    tripType: row.trip_type || meta.tripType || 'multi_day',
    destination: row.destination || row.destinations || meta.destination || '',
    location: row.location || meta.location || '',
    duration: row.duration || meta.duration || '',
    groupSize: row.group_size || meta.groupSize || 'Private & Scheduled Departures',
    level: row.pace_level || meta.level || 'Easy',
    bestSeason: row.best_season || meta.bestSeason || 'June to March',
    meetingPoint: row.meeting_point || row.nearest_airport || meta.meetingPoint || '',
    currency: row.currency || meta.currency || 'KSh',
    priceAmount: row.price_amount ?? meta.priceAmount ?? '',
    price: row.display_price || meta.price || '',
    depositNote: row.deposit_note || meta.depositNote || '',
    nextDeparture: row.next_departure || meta.nextDeparture || '',
    image: row.cover_image || meta.image || '',
    gallery: [row.gallery_1 || meta.gallery?.[0] || '', row.gallery_2 || meta.gallery?.[1] || ''],
    overview: overviewList.length > 0 ? overviewList : meta.overview || [],
    overviewText: row.overview || meta.overviewText || '',
    included,
    excluded,
    whatToCarry,
    itinerary,
    isFeatured: Boolean(row.is_featured ?? meta.isFeatured),
    sortOrder: Number(row.sort_order ?? meta.sortOrder ?? 100),
    seoKeyword: row.seo_keyword || meta.seoKeyword || '',
    seoTitle: row.seo_title || meta.seoTitle || '',
    seoDescription: row.seo_description || meta.seoDescription || '',
    allowIndexing: row.allow_indexing !== 0 && row.allow_indexing !== false,
    status: row.status || 'draft',
    currentStep: Number(row.current_step ?? meta.currentStep ?? 0),
    updated_at: row.updated_at,
  }
}

const getAllPackages = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM packages WHERE status = 'published' ORDER BY sort_order ASC, updated_at DESC, id ASC"
    )
    return res.json({ packages: rows.map(formatPackageRow) })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const getAllPackagesAdmin = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM packages ORDER BY CASE WHEN status = 'draft' THEN 0 ELSE 1 END ASC, sort_order ASC, updated_at DESC, id ASC"
    )
    return res.json({ packages: rows.map(formatPackageRow) })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const getPackageBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const [rows] = await db.query(
      'SELECT * FROM packages WHERE slug = ? OR record_uid = ? LIMIT 1',
      [slug, slug]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' })
    }

    const row = rows[0]
    const formatted = formatPackageRow(row)
    const [days] = await db.query(
      'SELECT * FROM itinerary_days WHERE package_id = ? ORDER BY day_number ASC',
      [row.id]
    )
    const [dates] = await db.query(
      "SELECT * FROM package_dates WHERE (package_id = ? OR package_slug = ?) AND departure_date >= CURDATE() AND status = 'available' ORDER BY departure_date ASC",
      [row.id, row.slug]
    )

    if ((!Array.isArray(formatted.itinerary) || formatted.itinerary.length === 0) && days.length > 0) {
      formatted.itinerary = days.map((d) => ({
        time: d.time_label || `Day ${d.day_number}`,
        title: d.title || '',
        day: d.time_label && !String(d.title || '').startsWith(d.time_label)
          ? `${d.time_label}: ${d.title}`
          : d.title || `Day ${d.day_number}`,
        desc: d.description || '',
      }))
    }

    return res.json({
      package: formatted,
      days,
      dates,
      gallery: [
        formatted.gallery[0] ? { image_url: formatted.gallery[0] } : null,
        formatted.gallery[1] ? { image_url: formatted.gallery[1] } : null,
      ].filter(Boolean),
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const upsertPackage = async (req, res) => {
  try {
    const body = req.body || {}
    const parsedMeta = safeParseJson(body.meta_json, {})
    const files = req.files || {}

    const uploadedCover = files.cover_image?.[0]
      ? `/uploads/${files.cover_image[0].filename}`
      : req.file
        ? `/uploads/${req.file.filename}`
        : null
    const uploadedG1 = files.gallery_1?.[0] ? `/uploads/${files.gallery_1[0].filename}` : null
    const uploadedG2 = files.gallery_2?.[0] ? `/uploads/${files.gallery_2[0].filename}` : null

    const recordUid = body.id || parsedMeta.id || body.slug || `trip-${Date.now()}`
    const slug = body.slug || parsedMeta.slug || recordUid

    const [existing] = await db.query(
      'SELECT * FROM packages WHERE record_uid = ? OR slug = ? LIMIT 1',
      [recordUid, slug]
    )
    const prev = existing[0] || {}
    const prevMeta = safeParseJson(prev.meta_json, {})

    const coverImage = uploadedCover ?? parsedMeta.image ?? prev.cover_image ?? ''
    const gallery1 = uploadedG1 ?? parsedMeta.gallery?.[0] ?? prev.gallery_1 ?? ''
    const gallery2 = uploadedG2 ?? parsedMeta.gallery?.[1] ?? prev.gallery_2 ?? ''

    const title = body.title || parsedMeta.title || prev.title || 'Untitled Draft'
    const subtitle = parsedMeta.subtitle ?? prev.subtitle ?? ''
    const tripType = parsedMeta.tripType || prev.trip_type || 'multi_day'
    const destination =
      parsedMeta.destination || body.destinations || prev.destination || ''
    const location = parsedMeta.location ?? prev.location ?? ''
    const duration = body.duration || parsedMeta.duration || prev.duration || ''
    const groupSize = parsedMeta.groupSize || prev.group_size || 'Private & Scheduled Departures'
    const paceLevel = parsedMeta.level || prev.pace_level || 'Easy'
    const bestSeason = parsedMeta.bestSeason || prev.best_season || 'June to March'
    const meetingPoint =
      parsedMeta.meetingPoint ?? body.nearest_airport ?? prev.meeting_point ?? ''
    const currency = parsedMeta.currency || prev.currency || 'KSh'
    const priceAmount = Number(
      String(parsedMeta.priceAmount ?? prev.price_amount ?? 0).replace(/[^\d.]/g, '') || 0
    )
    const displayPrice = parsedMeta.price ?? prev.display_price ?? ''
    const depositNote = parsedMeta.depositNote ?? prev.deposit_note ?? ''
    const nextDeparture = parsedMeta.nextDeparture ?? prev.next_departure ?? ''
    const overview =
      typeof body.overview === 'string' && body.overview
        ? body.overview
        : parsedMeta.overviewText ||
          (Array.isArray(parsedMeta.overview) ? parsedMeta.overview.join('\n\n') : '') ||
          prev.overview ||
          ''
    const inclusions =
      body.inclusions ||
      (Array.isArray(parsedMeta.included) ? JSON.stringify(parsedMeta.included) : prev.inclusions) ||
      '[]'
    const exclusions =
      body.exclusions ||
      (Array.isArray(parsedMeta.excluded) ? JSON.stringify(parsedMeta.excluded) : prev.exclusions) ||
      '[]'
    const whatToCarry =
      body.highlights ||
      (Array.isArray(parsedMeta.whatToCarry) ? JSON.stringify(parsedMeta.whatToCarry) : prev.what_to_carry) ||
      '[]'
    const itineraryArr = Array.isArray(parsedMeta.itinerary)
      ? parsedMeta.itinerary
      : safeParseJson(prev.itinerary_json, [])
    const itineraryJson = JSON.stringify(itineraryArr)

    const isFeatured =
      parsedMeta.isFeatured !== undefined
        ? parsedMeta.isFeatured
          ? 1
          : 0
        : Number(prev.is_featured || 0)
    const sortOrder = Number(parsedMeta.sortOrder ?? prev.sort_order ?? 10)
    const seoKeyword = parsedMeta.seoKeyword ?? prev.seo_keyword ?? ''
    const seoTitle = parsedMeta.seoTitle ?? prev.seo_title ?? ''
    const seoDescription = parsedMeta.seoDescription ?? prev.seo_description ?? ''
    const allowIndexing = parsedMeta.allowIndexing === false ? 0 : 1

    const status = body.status || parsedMeta.status || prev.status || 'draft'
    const currentStep = Number(parsedMeta.currentStep ?? prev.current_step ?? 0)

    const mergedMeta = JSON.stringify({
      ...prevMeta,
      ...parsedMeta,
      id: recordUid,
      slug,
      title,
      image: coverImage,
      gallery: [gallery1, gallery2],
      isFeatured: Boolean(isFeatured),
      sortOrder,
      status,
    })

    let pkgDbId = prev.id
    if (prev.id) {
      await db.query(
        `UPDATE packages
         SET record_uid=?, slug=?, title=?, subtitle=?, trip_type=?, destination=?, location=?, destinations=?,
             nearest_airport=?, duration=?, group_size=?, pace_level=?, best_season=?, meeting_point=?,
             currency=?, price_amount=?, display_price=?, deposit_note=?, next_departure=?, overview=?,
             highlights=?, inclusions=?, exclusions=?, what_to_carry=?, itinerary_json=?,
             cover_image=?, gallery_1=?, gallery_2=?, is_featured=?, sort_order=?,
             seo_keyword=?, seo_title=?, seo_description=?, allow_indexing=?,
             status=?, current_step=?, meta_json=?, updated_at=CURRENT_TIMESTAMP
         WHERE id=?`,
        [
          recordUid,
          slug,
          title,
          subtitle,
          tripType,
          destination,
          location,
          destination,
          meetingPoint,
          duration,
          groupSize,
          paceLevel,
          bestSeason,
          meetingPoint,
          currency,
          priceAmount,
          displayPrice,
          depositNote,
          nextDeparture,
          overview,
          whatToCarry,
          inclusions,
          exclusions,
          whatToCarry,
          itineraryJson,
          coverImage,
          gallery1,
          gallery2,
          isFeatured,
          sortOrder,
          seoKeyword,
          seoTitle,
          seoDescription,
          allowIndexing,
          status,
          currentStep,
          mergedMeta,
          prev.id,
        ]
      )
    } else {
      const [ins] = await db.query(
        `INSERT INTO packages
         (record_uid, slug, title, subtitle, trip_type, destination, location, destinations, nearest_airport,
          duration, group_size, pace_level, best_season, meeting_point, currency, price_amount, display_price,
          deposit_note, next_departure, overview, highlights, inclusions, exclusions, what_to_carry,
          itinerary_json, cover_image, gallery_1, gallery_2, is_featured, sort_order,
          seo_keyword, seo_title, seo_description, allow_indexing, status, current_step, meta_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recordUid,
          slug,
          title,
          subtitle,
          tripType,
          destination,
          location,
          destination,
          meetingPoint,
          duration,
          groupSize,
          paceLevel,
          bestSeason,
          meetingPoint,
          currency,
          priceAmount,
          displayPrice,
          depositNote,
          nextDeparture,
          overview,
          whatToCarry,
          inclusions,
          exclusions,
          whatToCarry,
          itineraryJson,
          coverImage,
          gallery1,
          gallery2,
          isFeatured,
          sortOrder,
          seoKeyword,
          seoTitle,
          seoDescription,
          allowIndexing,
          status,
          currentStep,
          mergedMeta,
        ]
      )
      pkgDbId = ins.insertId
    }

    if (pkgDbId && itineraryArr.length > 0) {
      await db.query('DELETE FROM itinerary_days WHERE package_id = ?', [pkgDbId])
      for (let i = 0; i < itineraryArr.length; i += 1) {
        const item = itineraryArr[i]
        await db.query(
          `INSERT INTO itinerary_days (package_id, day_number, time_label, title, description)
           VALUES (?, ?, ?, ?, ?)`,
          [
            pkgDbId,
            i + 1,
            item.time || `Day ${i + 1}`,
            item.title || item.day || `Stop ${i + 1}`,
            item.desc || '',
          ]
        )
      }
    }

    const [savedRows] = await db.query('SELECT * FROM packages WHERE id = ?', [pkgDbId])
    return res.status(200).json({
      message: 'Package saved',
      package: formatPackageRow(savedRows[0]),
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const updatePackageStatus = async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await db.query(
      'SELECT * FROM packages WHERE id = ? OR record_uid = ? OR slug = ? LIMIT 1',
      [id, id, id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' })
    }
    const current = rows[0]
    const nextStatus =
      req.body?.status || (current.status === 'published' ? 'draft' : 'published')
    const meta = safeParseJson(current.meta_json, {})
    meta.status = nextStatus

    await db.query(
      'UPDATE packages SET status = ?, meta_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [nextStatus, JSON.stringify(meta), current.id]
    )

    const [updated] = await db.query('SELECT * FROM packages WHERE id = ?', [current.id])
    return res.json({
      message: 'Package status updated',
      package: formatPackageRow(updated[0]),
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const createPackage = upsertPackage
const updatePackage = upsertPackage

const deletePackage = async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await db.query(
      'SELECT id FROM packages WHERE id = ? OR record_uid = ? OR slug = ? LIMIT 1',
      [id, id, id]
    )
    if (rows.length > 0) {
      await db.query('DELETE FROM itinerary_days WHERE package_id = ?', [rows[0].id])
      await db.query('DELETE FROM packages WHERE id = ?', [rows[0].id])
    }
    return res.json({ message: 'Package deleted' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const addItineraryDay = async (req, res) => {
  try {
    const { package_id, day_number, time_label = '', title, description, accommodation = '', meals = '' } = req.body
    await db.query(
      'INSERT INTO itinerary_days (package_id, day_number, time_label, title, description, accommodation, meals) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [package_id, day_number || 1, time_label, title, description || '', accommodation, meals]
    )
    return res.status(201).json({ message: 'Day added' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const deleteItineraryDay = async (req, res) => {
  try {
    const { id } = req.params
    await db.query('DELETE FROM itinerary_days WHERE id = ?', [id])
    return res.json({ message: 'Day deleted' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

module.exports = {
  upload,
  uploadBento,
  getAllPackages,
  getAllPackagesAdmin,
  getPackageBySlug,
  upsertPackage,
  updatePackageStatus,
  createPackage,
  updatePackage,
  deletePackage,
  addItineraryDay,
  deleteItineraryDay,
}
