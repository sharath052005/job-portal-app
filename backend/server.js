// server.js
const dotenv = require('dotenv')
dotenv.config()  // ← MUST be first before any other require that reads process.env

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')

// Passport config must be required after dotenv
require('./src/config/passport')

const authRoutes = require('./src/routes/authRoutes')
const profileRoutes = require('./src/routes/profileRoutes')
const applicationRoutes = require('./src/routes/applicationRoutes')
const jobRoutes = require('./src/routes/jobRoutes')
const chatRoutes = require('./src/routes/chatRoutes')
const bookmarkRoutes = require('./src/routes/bookmarkRoutes')

const app = express()

// ─── Middleware ───────────────────────────────────────────────
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))

// Session is required for passport Google OAuth flow
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  }
}))

app.use(passport.initialize())
app.use(passport.session())

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/bookmarks', bookmarkRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/chat', chatRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'HireSphere API is running' })
})

// ─── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})