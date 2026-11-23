const db = require('../config/database')

const getAllDates = async (req, res) => {
  try {
    const [dates] = await db.query('SELECT * FROM package_dates ORDER BY departure_date ASC')
    return res.json({ dates })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const getDatesByPackage = async (req, res) => {
  try {
    const { package_id } = req.params
    const [dates] = await db.query(
      'SELECT * FROM package_dates WHERE (package_id = ? OR package_slug = ?) AND departure_date >= CURDATE() ORDER BY departure_date ASC',
      [package_id, package_id]
    )
    return res.json({ dates })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const addDate = async (req, res) => {
  try {
    const {
      package_id = null,
      package_slug = '',
      package_title = '',
      departure_date,
      return_date = null,
      price_per_person = 0,
      currency = 'KSh',
      slots_total = 12,
      slots_available = 12,
      notes = '',
    } = req.body

    const [result] = await db.query(
      `INSERT INTO package_dates
       (package_id, package_slug, package_title, departure_date, return_date, price_per_person, currency, slots_total, slots_available, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?)`,
      [
        package_id,
        package_slug,
        package_title,
        departure_date,
        return_date || departure_date,
        Number(price_per_person || 0),
        currency,
        Number(slots_total || slots_available || 12),
        Number(slots_available || 12),
        notes,
      ]
    )
    return res.status(201).json({ message: 'Date added', id: result.insertId })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const updateDate = async (req, res) => {
  try {
    const { id } = req.params
    const { departure_date, return_date, price_per_person, slots_available, status, notes = '' } = req.body
    await db.query(
      'UPDATE package_dates SET departure_date=?, return_date=?, price_per_person=?, slots_available=?, status=?, notes=? WHERE id=?',
      [departure_date, return_date || departure_date, price_per_person, slots_available, status || 'available', notes, id]
    )
    return res.json({ message: 'Date updated' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const deleteDate = async (req, res) => {
  try {
    const { id } = req.params
    await db.query('DELETE FROM package_dates WHERE id = ?', [id])
    return res.json({ message: 'Date deleted' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

module.exports = { getAllDates, getDatesByPackage, addDate, updateDate, deleteDate }
