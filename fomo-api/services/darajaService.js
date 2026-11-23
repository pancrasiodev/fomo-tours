const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.join(__dirname, '..', '.env') })

let cachedToken = null
let cachedTokenExpiresAt = 0

function getDarajaConfig() {
  const env = (process.env.DARAJA_ENV || 'production').toLowerCase()
  const baseUrl =
    env === 'sandbox' ? 'https://sandbox.safaricom.co.ke' : 'https://api.safaricom.co.ke'

  return {
    env,
    baseUrl,
    consumerKey: process.env.DARAJA_CONSUMER_KEY || process.env.MPESA_CONSUMER_KEY || '',
    consumerSecret:
      process.env.DARAJA_CONSUMER_SECRET || process.env.MPESA_CONSUMER_SECRET || '',
    shortcode: process.env.DARAJA_SHORTCODE || process.env.MPESA_SHORTCODE || '7746566',
    partyB:
      process.env.DARAJA_PARTY_B ||
      process.env.DARAJA_SHORTCODE ||
      process.env.MPESA_SHORTCODE ||
      '9689363',
    passkey: process.env.DARAJA_PASSKEY || process.env.MPESA_PASSKEY || '',
    transactionType: process.env.DARAJA_TRANSACTION_TYPE || 'CustomerBuyGoodsOnline',
    callbackUrl:
      process.env.DARAJA_CALLBACK_URL ||
      process.env.MPESA_CALLBACK_URL ||
      'https://api.cronyproductions.co.ke/api/payments/callback',
    usdToKesRate: Number(process.env.USD_TO_KES_RATE || 130),
  }
}

/**
 * Formats Nairobi EAT timestamp as YYYYMMDDHHmmss for Daraja Password generation.
 */
function getDarajaTimestamp() {
  const eatNow = new Date(Date.now() + 3 * 60 * 60 * 1000)
  const yyyy = eatNow.getUTCFullYear()
  const mm = String(eatNow.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(eatNow.getUTCDate()).padStart(2, '0')
  const hh = String(eatNow.getUTCHours()).padStart(2, '0')
  const mi = String(eatNow.getUTCMinutes()).padStart(2, '0')
  const ss = String(eatNow.getUTCSeconds()).padStart(2, '0')
  return `${yyyy}${mm}${dd}${hh}${mi}${ss}`
}

/**
 * Normalizes Kenyan phone numbers (07..., 01..., +2547..., 2547..., 7...) to 254XXXXXXXXX.
 */
function normalizeKenyanPhone(rawPhone = '') {
  const digits = String(rawPhone).replace(/\D/g, '')
  if (digits.startsWith('254') && digits.length === 12) return digits
  if ((digits.startsWith('07') || digits.startsWith('01')) && digits.length === 10) {
    return `254${digits.slice(1)}`
  }
  if ((digits.startsWith('7') || digits.startsWith('1')) && digits.length === 9) {
    return `254${digits}`
  }
  return null
}

function convertToKes(amount, currency = 'KSh') {
  const cfg = getDarajaConfig()
  const numeric = Number(amount || 0)
  if (numeric <= 0) return 0
  if (String(currency).toUpperCase() === 'USD') {
    return Math.max(1, Math.round(numeric * cfg.usdToKesRate))
  }
  return Math.max(1, Math.round(numeric))
}

async function getAccessToken() {
  if (cachedToken && Date.now() < cachedTokenExpiresAt) {
    return cachedToken
  }

  const cfg = getDarajaConfig()
  if (!cfg.consumerKey || !cfg.consumerSecret) {
    throw new Error('Daraja Consumer Key / Secret missing in environment')
  }

  const auth = Buffer.from(`${cfg.consumerKey}:${cfg.consumerSecret}`).toString('base64')
  const res = await fetch(`${cfg.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: { Authorization: `Basic ${auth}` },
  })

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    throw new Error(`Daraja OAuth failed (${res.status}): ${errBody || 'Invalid credentials'}`)
  }

  const data = await res.json()
  cachedToken = data.access_token
  const ttlSec = Math.max(60, Number(data.expires_in || 3599) - 90)
  cachedTokenExpiresAt = Date.now() + ttlSec * 1000
  return cachedToken
}

/**
 * Initiates a live Safaricom M-Pesa Express (STK Push) prompt to the traveler's phone.
 */
async function initiateStkPush({
  phone,
  amountKes,
  accountReference = 'FOMOTOURS',
  transactionDesc = 'FOMO Tours Booking',
}) {
  const formattedPhone = normalizeKenyanPhone(phone)
  if (!formattedPhone) {
    throw new Error(
      'Enter a valid Kenyan M-Pesa phone number (e.g. 0712 345 678 or +254 712 345 678)'
    )
  }

  const intAmount = Math.max(1, Math.round(Number(amountKes || 0)))
  const cfg = getDarajaConfig()
  const token = await getAccessToken()
  const timestamp = getDarajaTimestamp()
  const password = Buffer.from(`${cfg.shortcode}${cfg.passkey}${timestamp}`).toString('base64')

  const payload = {
    BusinessShortCode: String(cfg.shortcode),
    Password: password,
    Timestamp: timestamp,
    TransactionType: cfg.transactionType,
    Amount: intAmount,
    PartyA: formattedPhone,
    PartyB: String(cfg.partyB),
    PhoneNumber: formattedPhone,
    CallBackURL: cfg.callbackUrl,
    AccountReference: String(accountReference || 'FOMOTOURS').slice(0, 12),
    TransactionDesc: String(transactionDesc || 'FOMO Safari').slice(0, 13),
  }

  const res = await fetch(`${cfg.baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.errorCode || String(data.ResponseCode) !== '0') {
    throw new Error(
      data.errorMessage ||
        data.ResponseDescription ||
        `M-Pesa STK Push rejected (${res.status})`
    )
  }

  return {
    merchantRequestId: data.MerchantRequestID,
    checkoutRequestId: data.CheckoutRequestID,
    responseCode: data.ResponseCode,
    customerMessage: data.CustomerMessage || 'Enter M-Pesa PIN on your phone to complete payment',
    phone: formattedPhone,
    amountKes: intAmount,
    tillNumber: cfg.partyB,
  }
}

/**
 * Actively queries Safaricom Daraja for the status of an in-flight STK Push.
 * Works both in production AND on localhost without needing ngrok!
 */
async function queryStkPushStatus(checkoutRequestId) {
  if (!checkoutRequestId) {
    throw new Error('checkoutRequestId is required')
  }

  const cfg = getDarajaConfig()
  const token = await getAccessToken()
  const timestamp = getDarajaTimestamp()
  const password = Buffer.from(`${cfg.shortcode}${cfg.passkey}${timestamp}`).toString('base64')

  const res = await fetch(`${cfg.baseUrl}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: String(cfg.shortcode),
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  })

  const data = await res.json().catch(() => ({}))

  // Safaricom returns errorCode '500.001.1001' or ResponseDescription ("The transaction is still under processing") while user hasn't entered PIN yet
  const rawErrMsg = String(data.errorMessage || data.ResponseDescription || '')
  if (
    data.errorCode === '500.001.1001' ||
    rawErrMsg.toLowerCase().includes('being processed') ||
    rawErrMsg.toLowerCase().includes('under processing')
  ) {
    return {
      state: 'pending',
      resultCode: null,
      resultDesc: 'Waiting for M-Pesa PIN on handset…',
    }
  }

  if (data.ResultCode !== undefined) {
    const code = String(data.ResultCode)
    if (code === '0') {
      return {
        state: 'completed',
        resultCode: code,
        resultDesc: data.ResultDesc || 'The service request is processed successfully.',
      }
    }
    const desc = String(data.ResultDesc || '').toLowerCase()
    if (code === '4999' || desc.includes('under processing') || desc.includes('being processed')) {
      return {
        state: 'pending',
        resultCode: code,
        resultDesc: 'Waiting for M-Pesa PIN on handset…',
      }
    }
    return {
      state: 'failed',
      resultCode: code,
      resultDesc: data.ResultDesc || 'M-Pesa prompt was cancelled or timed out.',
    }
  }

  return {
    state: 'pending',
    resultCode: null,
    resultDesc: data.ResponseDescription || rawErrMsg || 'Processing M-Pesa request…',
  }
}

/**
 * Parses Safaricom asynchronous webhook payload (`Body.stkCallback`).
 */
function parseStkCallback(body = {}) {
  const cb = body?.Body?.stkCallback
  if (!cb) return null

  const items = cb?.CallbackMetadata?.Item || []
  const meta = {}
  for (const entry of items) {
    if (entry && entry.Name) {
      meta[entry.Name] = entry.Value
    }
  }

  return {
    merchantRequestId: cb.MerchantRequestID || '',
    checkoutRequestId: cb.CheckoutRequestID || '',
    resultCode: String(cb.ResultCode ?? ''),
    resultDesc: cb.ResultDesc || '',
    isSuccess: Number(cb.ResultCode) === 0,
    amountKes: meta.Amount ? Number(meta.Amount) : 0,
    mpesaReceipt: meta.MpesaReceiptNumber ? String(meta.MpesaReceiptNumber) : '',
    phone: meta.PhoneNumber ? String(meta.PhoneNumber) : '',
    transactionDate: meta.TransactionDate ? String(meta.TransactionDate) : '',
  }
}

module.exports = {
  getDarajaConfig,
  normalizeKenyanPhone,
  convertToKes,
  getAccessToken,
  initiateStkPush,
  queryStkPushStatus,
  parseStkCallback,
}
