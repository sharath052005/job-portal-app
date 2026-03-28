const jwt = require('jsonwebtoken')
const pool = require('../config/db')

const protect = async (req, res, next) => {
  try {
    // Get token from httpOnly cookie
    const token = req.cookies?.token

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user to request (exclude password)
    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar, auth_provider FROM users WHERE id = ?',
      [decoded.id]
    )

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      })
    }

    req.user = rows[0]
    next()

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token invalid or expired. Please log in again.'
    })
  }
}

// Restrict to specific roles e.g. restrictTo('recruiter')
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.'
      })
    }
    next()
  }
}

module.exports = { protect, restrictTo }