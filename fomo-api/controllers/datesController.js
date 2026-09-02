const db = require('../config/database')

const getDatesByPackage = async (req, res) => {
  try {
    const { package_id } = req.params
    const [dates] = await db.query(
      'SELECT * FROM package_dates WHERE package_id = ? AND departure_date >= CURDATE() ORDER BY departure_date',
      [package_id]
    )
    res.json({ dates })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const addDate = async (req, res) => {
  try {
    const { package_id, departure_date, return_date, price_per_person, slots_available } = req.body
    const [result] = await db.query(
      'INSERT INTO package_dates (package_id, departure_date, return_date, price_per_person, slots_available) VALUES (?, ?, ?, ?, ?)',
      [package_id, departure_date, return_date, price_per_person, slots_available || 10]
    )
    res.status(201).json({ message: 'Date added', id: result.insertId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateDate = async (req, res) => {
  try {
    const { id } = req.params
    const { departure_date, return_date, price_per_person, slots_available, status } = req.body
    await db.query(
      'UPDATE package_dates SET departure_date=?, return_date=?, price_per_person=?, slots_available=?, status=? WHERE id=?',
      [departure_date, return_date, price_per_person, slots_available, status, id]
    )
    res.json({ message: 'Date updated' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteDate = async (req, res) => {
  try {
    const { id } = req.params
    await db.query('DELETE FROM package_dates WHERE id = ?', [id])
    res.json({ message: 'Date deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getDatesByPackage, addDate, updateDate, deleteDate }