const express = require('express')
const cors    = require('cors')
const { errorHandler } = require('./middleware/errorHandler')
const symptomsRouter       = require('./routes/symptoms')
const videoRouter          = require('./routes/video')
const consultationsRouter  = require('./routes/consultations')
const doctorsRouter        = require('./routes/doctors')
const doctorAuthRouter     = require('./routes/doctorAuth')
const doctorStatusRouter   = require('./routes/doctorStatus')

const app = express()

// ─── CORS ────────────────────────────────────────────────────────────────────
// Allow the Vite dev server (port 3000) and any production domain
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'https://arogyabodhini-1.onrender.com',
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS policy: origin ${origin} is not allowed`))
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// ─── BODY PARSING ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }))
app.use(express.urlencoded({ extended: true, limit: '50kb' }))

// ─── REQUEST LOGGER (dev only) ────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    next()
  })
}

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:  'ok',
    service: 'MediAI Backend',
    version: '2.0.0',
    env:     process.env.NODE_ENV || 'development',
  })
})

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api', symptomsRouter)
app.use('/api', videoRouter)
app.use('/api', consultationsRouter)
app.use('/api', doctorsRouter)
app.use('/api', doctorAuthRouter)
app.use('/api', doctorStatusRouter)

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error:   'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} does not exist.`,
  })
})

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use(errorHandler)

module.exports = app
