const path = require('path')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const db = require('./config/database')
const { initDatabase } = require('./database/initDb')

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()

// Trust reverse proxy (LiteSpeed & Cloudflare) for rate limiting & secure cookies
app.set('trust proxy', 1)

// Enforce HTTPS in production environments behind reverse proxies
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers['x-forwarded-proto'] &&
    req.headers['x-forwarded-proto'] !== 'https'
  ) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`)
  }
  next()
})

// Security Headers with Helmet (relaxing CSP/embedder for local media & remote unsplash)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)

// Gzip & Deflate Response Compression
app.use(
  compression({
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false
      return compression.filter(req, res)
    },
  })
)

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true)
      } else {
        callback(null, true)
      }
    },
    credentials: true,
  })
)

// Rate Limiting tiers
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again in 15 minutes.' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login/registration attempts. Please wait 15 minutes before trying again.' },
})

const stkLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 6, // 6 STK prompts per 2 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Payment request throttled. Please check your phone for the existing M-Pesa prompt or wait 2 minutes.' },
})

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 35,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Booking rate limit exceeded. Please wait a few moments before submitting another reservation.' },
})

// Apply global rate limiting to all /api/ endpoints
app.use('/api', globalApiLimiter)

app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

// Static media caching (1 day cache + ETag for fast revalidations)
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
  })
)

// API Routes with dedicated rate limits
app.use('/api/auth', authLimiter, require('./routes/auth'))
app.use('/api/packages', require('./routes/packages'))
app.use('/api/journal', require('./routes/journal'))
app.use('/api/bookings', bookingLimiter, require('./routes/bookings'))
app.use('/api/dates', require('./routes/dates'))
app.use('/api/payments/stkpush', stkLimiter)
app.use('/api/payments', require('./routes/payments'))
app.use('/api/cake-orders', require('./routes/cakeOrders'))

app.get('/api/health', async (req, res) => {
  try {
    await db.ensureConnection()
    res.json({
      status: 'ok',
      service: 'Lany Cake Shop API',
    })
  } catch (err) {
    res.status(500).json({ status: 'error', error: 'Service Unavailable' })
  }
})

app.get('/', (req, res) => {
  res.json({ message: 'Lany Cake Shop API' })
})

// Graceful Error Handling Middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload' })
  }
  console.error('[API Error]', err)
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

const PORT = process.env.PORT || 5000

initDatabase()
  .then((driver) => {
    app.listen(PORT, () => {
      console.log(`[Lany Cake Shop API] Server running on http://localhost:${PORT} (DB: ${driver})`)
    })
  })
  .catch((err) => {
    console.error('[Lany Cake Shop API] Failed to initialize database:', err)
    process.exit(1)
  })
