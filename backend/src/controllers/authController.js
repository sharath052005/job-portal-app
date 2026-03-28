const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const generateToken = require('../utils/generateToken')

// ─── SIGNUP ───────────────────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { name, email, password, role = 'seeker' } = req.body

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.'
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.'
      })
    }

    if (!['seeker', 'recruiter'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be seeker or recruiter.'
      })
    }

    // Check if email already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?', [email]
    )

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, auth_provider)
       VALUES (?, ?, ?, ?, 'local')`,
      [name, email, hashedPassword, role]
    )

    // Generate JWT cookie
    generateToken(res, result.insertId)

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: {
        id: result.insertId,
        name,
        email,
        role,
        avatar: null,
      }
    })

  } catch (err) {
    console.error('Signup error:', err)
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    })
  }
}

// ─── LOGIN ────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      })
    }

    // Find user
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?', [email]
    )

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      })
    }

    const user = rows[0]

    // Check if user signed up with Google
    if (user.auth_provider === 'google' && !user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Google Sign-In. Please continue with Google.'
      })
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      })
    }

    // Generate JWT cookie
    generateToken(res, user.id)

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      }
    })

  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    })
  }
}

// ─── LOGOUT ───────────────────────────────────────────────────
const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  })
}

// ─── GET CURRENT USER ─────────────────────────────────────────
const getMe = async (req, res) => {
  // req.user is set by the protect middleware
  return res.status(200).json({
    success: true,
    user: req.user
  })
}

// ─── GOOGLE OAUTH CALLBACK ────────────────────────────────────
const googleCallback = (req, res) => {
  // Passport has already authenticated user and set req.user
  generateToken(res, req.user.id)

  // Redirect to frontend dashboard or home
  res.redirect(`${process.env.CLIENT_URL}/`)
}

module.exports = { signup, login, logout, getMe, googleCallback }