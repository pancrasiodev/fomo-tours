const fs = require('fs')
const path = require('path')
const express = require('express')
const multer = require('multer')
const db = require('../config/database')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = `journal-${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, unique + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

function safeParse(raw, fallback = {}) {
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function formatJournalRow(row) {
  const meta = safeParse(row.meta_json, {})
  const bodyArray = String(row.body_text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return {
    ...meta,
    id: row.record_uid || row.slug || String(row.id),
    db_id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category || meta.category || 'ON THE ROAD',
    readTime: row.read_time || meta.readTime || '4 MIN READ',
    excerpt: row.excerpt || meta.excerpt || '',
    image: row.cover_image || meta.image || '',
    alt: row.image_alt || meta.alt || row.title,
    bodyText: row.body_text || meta.bodyText || '',
    body: bodyArray.length > 0 ? bodyArray : meta.body || [],
    relatedTripSlug: row.related_trip_slug || meta.relatedTripSlug || '',
    seoKeyword: row.seo_keyword || meta.seoKeyword || '',
    seoTitle: row.seo_title || meta.seoTitle || '',
    seoDescription: row.seo_description || meta.seoDescription || '',
    allowIndexing: row.allow_indexing !== 0 && row.allow_indexing !== false,
    status: row.status || 'draft',
    currentStep: Number(row.current_step ?? meta.currentStep ?? 0),
    updated_at: row.updated_at,
  }
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM journal_posts WHERE status = 'published' ORDER BY updated_at DESC, id DESC"
    )
    return res.json({ posts: rows.map(formatJournalRow) })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM journal_posts ORDER BY updated_at DESC, id DESC')
    return res.json({ posts: rows.map(formatJournalRow) })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM journal_posts WHERE slug = ? OR record_uid = ? LIMIT 1',
      [req.params.slug, req.params.slug]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Story not found' })
    return res.json({ post: formatJournalRow(rows[0]) })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

router.post('/upsert', authMiddleware, upload.single('cover_image'), async (req, res) => {
  try {
    const body = req.body || {}
    const parsed = safeParse(body.meta_json, {})
    const recordUid = body.id || parsed.id || body.slug || `journal-${Date.now()}`
    const slug = body.slug || parsed.slug || recordUid
    const uploadedPath = req.file ? `/uploads/${req.file.filename}` : null

    const [existing] = await db.query(
      'SELECT * FROM journal_posts WHERE record_uid = ? OR slug = ? LIMIT 1',
      [recordUid, slug]
    )
    const prev = existing[0] || {}
    const prevMeta = safeParse(prev.meta_json, {})

    const title = body.title || parsed.title || prev.title || 'Untitled Story'
    const category = parsed.category || prev.category || 'ON THE ROAD'
    const readTime = parsed.readTime || prev.read_time || '4 MIN READ'
    const excerpt = parsed.excerpt || prev.excerpt || ''
    const coverImage = uploadedPath || parsed.image || prev.cover_image || ''
    const imageAlt = parsed.alt || prev.image_alt || title
    const bodyText =
      parsed.bodyText ||
      (Array.isArray(parsed.body) ? parsed.body.join('\n\n') : '') ||
      prev.body_text ||
      ''
    const relatedTripSlug = parsed.relatedTripSlug ?? prev.related_trip_slug ?? ''
    const seoKeyword = parsed.seoKeyword ?? prev.seo_keyword ?? ''
    const seoTitle = parsed.seoTitle ?? prev.seo_title ?? ''
    const seoDescription = parsed.seoDescription ?? prev.seo_description ?? ''
    const allowIndexing = parsed.allowIndexing === false ? 0 : 1
    const status = body.status || parsed.status || prev.status || 'draft'
    const currentStep = Number(parsed.currentStep ?? prev.current_step ?? 0)

    const mergedMeta = JSON.stringify({
      ...prevMeta,
      ...parsed,
      id: recordUid,
      slug,
      title,
      image: coverImage,
      status,
    })

    let postId = prev.id
    if (prev.id) {
      await db.query(
        `UPDATE journal_posts
         SET record_uid=?, slug=?, title=?, category=?, read_time=?, excerpt=?, cover_image=?, image_alt=?,
             body_text=?, related_trip_slug=?, seo_keyword=?, seo_title=?, seo_description=?,
             allow_indexing=?, status=?, current_step=?, meta_json=?, updated_at=CURRENT_TIMESTAMP
         WHERE id=?`,
        [
          recordUid,
          slug,
          title,
          category,
          readTime,
          excerpt,
          coverImage,
          imageAlt,
          bodyText,
          relatedTripSlug,
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
        `INSERT INTO journal_posts
         (record_uid, slug, title, category, read_time, excerpt, cover_image, image_alt, body_text,
          related_trip_slug, seo_keyword, seo_title, seo_description, allow_indexing, status, current_step, meta_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recordUid,
          slug,
          title,
          category,
          readTime,
          excerpt,
          coverImage,
          imageAlt,
          bodyText,
          relatedTripSlug,
          seoKeyword,
          seoTitle,
          seoDescription,
          allowIndexing,
          status,
          currentStep,
          mergedMeta,
        ]
      )
      postId = ins.insertId
    }

    const [saved] = await db.query('SELECT * FROM journal_posts WHERE id = ?', [postId])
    return res.status(200).json({ message: 'Journal saved', post: formatJournalRow(saved[0]) })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM journal_posts WHERE id = ? OR record_uid = ? OR slug = ? LIMIT 1',
      [req.params.id, req.params.id, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Story not found' })
    const current = rows[0]
    const nextStatus =
      req.body?.status || (current.status === 'published' ? 'draft' : 'published')
    const meta = safeParse(current.meta_json, {})
    meta.status = nextStatus

    await db.query(
      'UPDATE journal_posts SET status = ?, meta_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [nextStatus, JSON.stringify(meta), current.id]
    )
    const [updated] = await db.query('SELECT * FROM journal_posts WHERE id = ?', [current.id])
    return res.json({ message: 'Story status updated', post: formatJournalRow(updated[0]) })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM journal_posts WHERE id = ? OR record_uid = ? OR slug = ?', [
      req.params.id,
      req.params.id,
      req.params.id,
    ])
    return res.json({ message: 'Story deleted' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

module.exports = router
