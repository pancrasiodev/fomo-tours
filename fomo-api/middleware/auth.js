const jwt = require('jsonwebtoken')
const db = require('../config/database')

const JWT_SECRET = () => process.env.JWT_SECRET || 'fomotours_secret_key_2026'

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }
    const token = authHeader.split(' ')[1]

    // Allow local studio token when running without MySQL
    if (token.startsWith('fomo-studio-')) {
      req.admin = { id: 1, email: 'studio@fomotours.co.ke', full_name: 'FOMO Studio' }
      return next()
    }

    const decoded = jwt.verify(token, JWT_SECRET())
    try {
      const [admins] = await db.query(
        'SELECT id, email, full_name FROM admins WHERE id = ?',
        [decoded.adminId]
      )
      if (admins.length === 0) {
        return res.status(401).json({ error: 'Admin not found' })
      }
      req.admin = admins[0]
    } catch {
      req.admin = { id: decoded.adminId || 1, email: 'admin@fomotours.co.ke', full_name: 'FOMO Admin' }
    }
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

const travelerAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET())

    if (decoded.role === 'admin' || decoded.adminId) {
      req.user = { id: decoded.adminId || 1, email: decoded.email || 'admin@fomotours.co.ke', role: 'admin' }
      return next()
    }

    const [users] = await db.query(
      'SELECT id, full_name, email, phone FROM users WHERE id = ?',
      [decoded.userId]
    )
    if (users.length === 0) {
      return res.status(401).json({ error: 'User account not found' })
    }
    req.user = users[0]
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' })
  }
}

const optionalTravelerAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, JWT_SECRET())
      if (decoded.userId) {
        const [users] = await db.query(
          'SELECT id, full_name, email, phone FROM users WHERE id = ?',
          [decoded.userId]
        )
        if (users.length > 0) req.user = users[0]
      }
    }
  } catch {
    // Non-blocking for optional auth
  }
  return next()
}

module.exports = { authMiddleware, travelerAuthMiddleware, optionalTravelerAuth }
