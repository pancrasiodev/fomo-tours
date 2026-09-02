const express = require('express')
const router = express.Router()
const {
  upload,
  getAllPackages,
  getAllPackagesAdmin,
  getPackageBySlug,
  createPackage,
  updatePackage,
  deletePackage,
  addItineraryDay,
  deleteItineraryDay
} = require('../controllers/packagesController')
const { authMiddleware } = require('../middleware/auth')

// Public
router.get('/', getAllPackages)
router.get('/:slug', getPackageBySlug)

// Admin
router.get('/admin/all', authMiddleware, getAllPackagesAdmin)
router.post('/', authMiddleware, upload.single('cover_image'), createPackage)
router.put('/:id', authMiddleware, upload.single('cover_image'), updatePackage)
router.delete('/:id', authMiddleware, deletePackage)

// Itinerary days
router.post('/days/add', authMiddleware, addItineraryDay)
router.delete('/days/:id', authMiddleware, deleteItineraryDay)

module.exports = router