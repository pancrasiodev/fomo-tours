const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../config/database')

const JWT_SECRET = () => process.env.JWT_SECRET || 'fomotours_secret_key_2026'

const register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const cleanEmail = String(email).trim().toLowerCase()
    const [existing] = await db.query('SELECT id FROM admins WHERE email = ?', [cleanEmail])
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const name = full_name || cleanEmail.split('@')[0]

    const [result] = await db.query(
      'INSERT INTO admins (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, cleanEmail, hashed, 'admin']
    )

    const token = jwt.sign({ adminId: result.insertId, role: 'admin' }, JWT_SECRET(), {
      expiresIn: '7d',
    })

    return res.status(201).json({
      message: 'Admin created',
      token,
      admin: { id: result.insertId, full_name: name, email: cleanEmail },
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const cleanEmail = String(email).trim().toLowerCase()
    const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [cleanEmail])
    if (admins.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const admin = admins[0]
    const match = await bcrypt.compare(password, admin.password)
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ adminId: admin.id, role: 'admin' }, JWT_SECRET(), {
      expiresIn: '7d',
    })

    return res.json({
      token,
      admin: { id: admin.id, full_name: admin.full_name, email: admin.email },
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const me = async (req, res) => {
  return res.json({ admin: req.admin })
}

const registerTraveler = async (req, res) => {
  try {
    const { full_name, name, email, phone = '', password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const cleanEmail = String(email).trim().toLowerCase()
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [cleanEmail])
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const displayName = (full_name || name || cleanEmail.split('@')[0]).trim()

    const [result] = await db.query(
      'INSERT INTO users (full_name, email, phone, password, auth_provider) VALUES (?, ?, ?, ?, ?)',
      [displayName, cleanEmail, phone, hashed, 'email']
    )

    const token = jwt.sign({ userId: result.insertId, role: 'traveler' }, JWT_SECRET(), {
      expiresIn: '14d',
    })

    return res.status(201).json({
      token,
      user: { id: result.insertId, name: displayName, email: cleanEmail, phone },
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const loginTraveler = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const cleanEmail = String(email).trim().toLowerCase()
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail])
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const user = users[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign({ userId: user.id, role: 'traveler' }, JWT_SECRET(), {
      expiresIn: '14d',
    })

    return res.json({
      token,
      user: { id: user.id, name: user.full_name, email: user.email, phone: user.phone },
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

/**
 * POST /api/auth/traveler/google
 * Authenticates traveler with Google Identity Services JWT or Google profile.
 */
const googleTravelerAuth = async (req, res) => {
  try {
    const { credential, email, name } = req.body
    let resolvedEmail = ''
    let resolvedName = ''

    if (credential) {
      const parts = String(credential).split('.')
      if (parts.length >= 2) {
        try {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'))
          resolvedEmail = (payload.email || '').toLowerCase().trim()
          resolvedName = payload.name || (resolvedEmail ? resolvedEmail.split('@')[0] : '')
        } catch {
          // ignore parsing error
        }
      }
    }

    if (!resolvedEmail && email) {
      resolvedEmail = String(email).toLowerCase().trim()
      resolvedName = name || (resolvedEmail.includes('@') ? resolvedEmail.split('@')[0] : 'Traveler')
    }

    if (!resolvedEmail) {
      return res.status(400).json({ error: 'A valid Google credential or email is required' })
    }

    const [rows] = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [resolvedEmail])
    let user = rows[0] || null

    if (!user) {
      const [insertRes] = await db.query(
        "INSERT INTO users (full_name, email, password, auth_provider, created_at) VALUES (?, ?, '', 'google', CURRENT_TIMESTAMP)",
        [resolvedName || 'Safari Traveler', resolvedEmail]
      )
      user = {
        id: insertRes.insertId,
        full_name: resolvedName || 'Safari Traveler',
        email: resolvedEmail,
        phone: '',
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'traveler', auth_provider: 'google' },
      JWT_SECRET(),
      { expiresIn: '14d' }
    )

    return res.json({
      success: true,
      token,
      user: { id: user.id, name: user.full_name, email: user.email, phone: user.phone || '' },
      mode: 'google',
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

module.exports = {
  register,
  login,
  me,
  registerTraveler,
  loginTraveler,
  googleTravelerAuth,
}
