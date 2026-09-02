const express = require('express')
const router = express.Router()
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updatePaymentStatus
} = require('../controllers/bookingsController')
const { authMiddleware } = require('../middleware/auth')

// Public
router.post('/', createBooking)

// Admin
router.get('/', authMiddleware, getAllBookings)
router.get('/:id', authMiddleware, getBookingById)
router.put('/:id/payment', authMiddleware, updatePaymentStatus)

module.exports = router