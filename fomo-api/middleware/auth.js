const jwt = require('jsonwebtoken')
const db = require('../config/database')

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const [admins] = await db.query(
      'SELECT id, email, full_name FROM admins WHERE id = ?',
      [decoded.adminId]
    )
    if (admins.length === 0) {
      return res.status(401).json({ error: 'Admin not found' })
    }
    req.admin = admins[0]
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = { authMiddleware }