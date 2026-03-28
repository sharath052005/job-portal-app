const express = require('express')
const router = express.Router()
const { getBookmarks, toggleBookmark } = require('../controllers/bookmarkController')
const { protect } = require('../middleware/authMiddleware')

// All bookmark routes require login
router.get('/', protect, getBookmarks)
router.post('/toggle', protect, toggleBookmark)

module.exports = router