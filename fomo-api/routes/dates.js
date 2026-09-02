const express = require('express')
const router = express.Router()
const { getDatesByPackage, addDate, updateDate, deleteDate } = require('../controllers/datesController')
const { authMiddleware } = require('../middleware/auth')

// Public
router.get('/:package_id', getDatesByPackage)

// Admin
router.post('/', authMiddleware, addDate)
router.put('/:id', authMiddleware, updateDate)
router.delete('/:id', authMiddleware, deleteDate)

module.exports = router