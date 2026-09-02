const db = require('../config/database')
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

const getAllPackages = async (req, res) => {
  try {
    const [packages] = await db.query(
      'SELECT * FROM packages WHERE status = "published" ORDER BY created_at DESC'
    )
    res.json({ packages })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getAllPackagesAdmin = async (req, res) => {
  try {
    const [packages] = await db.query(
      'SELECT * FROM packages ORDER BY created_at DESC'
    )
    res.json({ packages })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getPackageBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const [packages] = await db.query(
      'SELECT * FROM packages WHERE slug = ?',
      [slug]
    )
    if (packages.length === 0) {
      return res.status(404).json({ error: 'Package not found' })
    }

    const pkg = packages[0]

    const [days] = await db.query(
      'SELECT * FROM itinerary_days WHERE package_id = ? ORDER BY day_number',
      [pkg.id]
    )

    const [dates] = await db.query(
      'SELECT * FROM package_dates WHERE package_id = ? AND departure_date >= CURDATE() AND status = "available" ORDER BY departure_date',
      [pkg.id]
    )

    const [gallery] = await db.query(
      'SELECT * FROM gallery WHERE package_id = ?',
      [pkg.id]
    )

    res.json({ package: pkg, days, dates, gallery })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const createPackage = async (req, res) => {
  try {
    const {
      title, slug, overview, duration,
      destinations, nearest_airport,
      highlights, inclusions, exclusions, status
    } = req.body

    const cover_image = req.file ? `/uploads/${req.file.filename}` : null

    const [result] = await db.query(
      `INSERT INTO packages 
      (title, slug, overview, duration, destinations, nearest_airport, highlights, inclusions, exclusions, cover_image, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, slug, overview, duration,
        destinations, nearest_airport,
        JSON.stringify(highlights),
        JSON.stringify(inclusions),
        JSON.stringify(exclusions),
        cover_image,
        status || 'draft'
      ]
    )

    res.status(201).json({ message: 'Package created', id: result.insertId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updatePackage = async (req, res) => {
  try {
    const { id } = req.params
    const {
      title, slug, overview, duration,
      destinations, nearest_airport,
      highlights, inclusions, exclusions, status
    } = req.body

    const cover_image = req.file ? `/uploads/${req.file.filename}` : null

    const fields = [
      title, slug, overview, duration,
      destinations, nearest_airport,
      JSON.stringify(highlights),
      JSON.stringify(inclusions),
      JSON.stringify(exclusions),
      status
    ]

    let query = `UPDATE packages SET 
      title=?, slug=?, overview=?, duration=?, destinations=?, 
      nearest_airport=?, highlights=?, inclusions=?, exclusions=?, status=?`

    if (cover_image) {
      query += ', cover_image=?'
      fields.push(cover_image)
    }

    query += ' WHERE id=?'
    fields.push(id)

    await db.query(query, fields)
    res.json({ message: 'Package updated' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deletePackage = async (req, res) => {
  try {
    const { id } = req.params
    await db.query('DELETE FROM packages WHERE id = ?', [id])
    res.json({ message: 'Package deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const addItineraryDay = async (req, res) => {
  try {
    const { package_id, day_number, title, description, accommodation, meals } = req.body
    await db.query(
      'INSERT INTO itinerary_days (package_id, day_number, title, description, accommodation, meals) VALUES (?, ?, ?, ?, ?, ?)',
      [package_id, day_number, title, description, accommodation, meals]
    )
    res.status(201).json({ message: 'Day added' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteItineraryDay = async (req, res) => {
  try {
    const { id } = req.params
    await db.query('DELETE FROM itinerary_days WHERE id = ?', [id])
    res.json({ message: 'Day deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  upload,
  getAllPackages,
  getAllPackagesAdmin,
  getPackageBySlug,
  createPackage,
  updatePackage,
  deletePackage,
  addItineraryDay,
  deleteItineraryDay
}