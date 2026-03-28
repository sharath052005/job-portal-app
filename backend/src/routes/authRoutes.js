const express = require('express')
const passport = require('passport')
const router = express.Router()

const {
  signup,
  login,
  logout,
  getMe,
  googleCallback,
} = require('../controllers/authController')

const { protect } = require('../middleware/authMiddleware')

// ─── Email / Password ─────────────────────────────────────────
router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', protect, getMe)   // protected — requires valid JWT

// ─── Google OAuth ─────────────────────────────────────────────
// Step 1: Redirect user to Google consent screen
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
)

// Step 2: Google redirects back here after user consents
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
    session: false,   // we use JWT, not sessions after this point
  }),
  googleCallback
)

module.exports = router