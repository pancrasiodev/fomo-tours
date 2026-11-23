const express = require('express')
const router = express.Router()
const {
  upload,
  uploadBento,
  getAllPackages,
  getAllPackagesAdmin,
  getPackageBySlug,
  upsertPackage,
  updatePackageStatus,
  createPackage,
  updatePackage,
  deletePackage,
  addItineraryDay,
  deleteItineraryDay,
} = require('../controllers/packagesController')
const { authMiddleware } = require('../middleware/auth')

// Admin list before :slug
router.get('/admin/all', authMiddleware, getAllPackagesAdmin)

// Public
router.get('/', getAllPackages)
router.get('/:slug', getPackageBySlug)

// Admin mutations
router.post('/upsert', authMiddleware, uploadBento, upsertPackage)
router.patch('/:id/status', authMiddleware, updatePackageStatus)
router.post('/', authMiddleware, upload.single('cover_image'), createPackage)
router.put('/:id', authMiddleware, upload.single('cover_image'), updatePackage)
router.delete('/:id', authMiddleware, deletePackage)

// Itinerary days
router.post('/days/add', authMiddleware, addItineraryDay)
router.delete('/days/:id', authMiddleware, deleteItineraryDay)

module.exports = router
