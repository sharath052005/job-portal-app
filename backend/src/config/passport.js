const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const pool = require('./db')
const dotenv = require('dotenv')

dotenv.config()

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value
      const name  = profile.displayName
      const googleId = profile.id
      const avatar = profile.photos?.[0]?.value || null

      // Check if user already exists by google_id or email
      const [rows] = await pool.query(
        'SELECT * FROM users WHERE google_id = ? OR email = ?',
        [googleId, email]
      )

      if (rows.length > 0) {
        const user = rows[0]

        // If user signed up with email before, link their Google account
        if (!user.google_id) {
          await pool.query(
            'UPDATE users SET google_id = ?, avatar = ? WHERE id = ?',
            [googleId, avatar, user.id]
          )
        }

        return done(null, user)
      }

      // New user — create account
      const [result] = await pool.query(
        `INSERT INTO users (name, email, google_id, avatar, role, auth_provider)
         VALUES (?, ?, ?, ?, 'seeker', 'google')`,
        [name, email, googleId, avatar]
      )

      const [newUser] = await pool.query(
        'SELECT * FROM users WHERE id = ?',
        [result.insertId]
      )

      return done(null, newUser[0])

    } catch (err) {
      return done(err, null)
    }
  }
))

// Store user id in session
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// Retrieve user from session
passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ?', [id]
    )
    done(null, rows[0] || null)
  } catch (err) {
    done(err, null)
  }
})