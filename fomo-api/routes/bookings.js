const express = require('express')
const router = express.Router()
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updatePaymentStatus,
  deleteBooking,
  getTravelerBookings,
  lookupGuestBooking,
  claimGuestBooking,
  cancelTravelerBooking,
} = require('../controllers/bookingsController')
const { authMiddleware, travelerAuthMiddleware, optionalTravelerAuth } = require('../middleware/auth')

// Public / Guest Endpoints
router.post('/', optionalTravelerAuth, createBooking)
router.post('/upsert', optionalTravelerAuth, createBooking)
router.post('/lookup', lookupGuestBooking)
router.post('/claim', claimGuestBooking)

// Traveler Dashboard Endpoints
router.get('/my-trips', travelerAuthMiddleware, getTravelerBookings)
router.post('/:id/cancel', travelerAuthMiddleware, cancelTravelerBooking)

// Admin Endpoints
router.get('/', authMiddleware, getAllBookings)
router.get('/:id', authMiddleware, getBookingById)
router.put('/:id/payment', authMiddleware, updatePaymentStatus)
router.delete('/:id', authMiddleware, deleteBooking)

module.exports = router
