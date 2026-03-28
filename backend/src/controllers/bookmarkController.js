const pool = require('../config/db')

// GET all bookmarks for logged in user
const getBookmarks = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT job_id FROM bookmarks WHERE user_id = ?',
      [req.user.id]
    )
    return res.status(200).json({
      success: true,
      bookmarks: rows.map(r => r.job_id)
    })
  } catch (err) {
    console.error('Get bookmarks error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// POST — toggle bookmark (save/unsave)
const toggleBookmark = async (req, res) => {
  try {
    const { job_id } = req.body

    if (!job_id) {
      return res.status(400).json({ success: false, message: 'job_id is required.' })
    }

    // Check if already bookmarked
    const [existing] = await pool.query(
      'SELECT id FROM bookmarks WHERE user_id = ? AND job_id = ?',
      [req.user.id, job_id]
    )

    if (existing.length > 0) {
      // Already saved — remove it
      await pool.query(
        'DELETE FROM bookmarks WHERE user_id = ? AND job_id = ?',
        [req.user.id, job_id]
      )
      return res.status(200).json({ success: true, saved: false, message: 'Bookmark removed.' })
    } else {
      // Not saved — add it
      await pool.query(
        'INSERT INTO bookmarks (user_id, job_id) VALUES (?, ?)',
        [req.user.id, job_id]
      )
      return res.status(201).json({ success: true, saved: true, message: 'Job bookmarked.' })
    }

  } catch (err) {
    console.error('Toggle bookmark error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

module.exports = { getBookmarks, toggleBookmark }