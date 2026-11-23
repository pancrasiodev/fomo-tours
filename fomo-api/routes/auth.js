const express = require('express')
const router = express.Router()
const {
  register,
  login,
  me,
  registerTraveler,
  loginTraveler,
  googleTravelerAuth,
} = require('../controllers/authController')
const { authMiddleware } = require('../middleware/auth')

// Studio Admin Auth
router.post('/register', register)
router.post('/login', login)
router.get('/me', authMiddleware, me)

// Traveler Auth
router.post('/traveler/register', registerTraveler)
router.post('/traveler/login', loginTraveler)
router.post('/traveler/google', googleTravelerAuth)
router.post('/google', googleTravelerAuth)

module.exports = router
