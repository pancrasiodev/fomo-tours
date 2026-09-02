const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../config/database')

const register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body

    const [existing] = await db.query(
      'SELECT id FROM admins WHERE email = ?',
      [email]
    )
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    const hashed = await bcrypt.hash(password, 10)

    const [result] = await db.query(
      'INSERT INTO admins (full_name, email, password) VALUES (?, ?, ?)',
      [full_name, email, hashed]
    )

    const token = jwt.sign(
      { adminId: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Admin created',
      token,
      admin: { id: result.insertId, full_name, email }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const [admins] = await db.query(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    )
    if (admins.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const admin = admins[0]
    const match = await bcrypt.compare(password, admin.password)
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { adminId: admin.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      admin: { id: admin.id, full_name: admin.full_name, email: admin.email }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const me = async (req, res) => {
  res.json({ admin: req.admin })
}

module.exports = { register, login, me }