const express = require('express')
const router = express.Router()
const {
  initiateBookingStkPush,
  handleDarajaCallback,
  checkStkPaymentStatus,
  checkGatewayHealth,
} = require('../controllers/paymentsController')

// Gateway health check
router.get('/health', checkGatewayHealth)

// Initiate STK Push (Pay All or Lipa Pole Pole deposit/installment)
router.post('/stkpush', initiateBookingStkPush)
router.post('/mpesa', initiateBookingStkPush)

// Safaricom Daraja webhook callback
router.post('/callback', handleDarajaCallback)

// Live STK Push status query (works on both production & localhost)
router.get('/status/:checkoutRequestId', checkStkPaymentStatus)

module.exports = router
