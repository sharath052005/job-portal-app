const jwt = require('jsonwebtoken')

/**
 * Generate a JWT and set it as an httpOnly cookie
 */
const generateToken = (res, userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

  const isProduction = process.env.NODE_ENV === 'production'

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    // 'strict' blocks the cookie on cross-origin requests (different domains in production)
    // Must use 'none' in production so Vercel frontend can send cookies to Render backend
    sameSite: isProduction ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })

  return token
}

module.exports = generateToken