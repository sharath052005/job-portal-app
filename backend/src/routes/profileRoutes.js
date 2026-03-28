const express  = require('express')
const router   = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { upload } = require('../config/cloudinary')
const pool     = require('../config/db')
const {
  getProfile, updateProfile,
  addEducation, updateEducation, deleteEducation,
  addExperience, updateExperience, deleteExperience,
} = require('../controllers/profileController')

router.get('/',                protect, getProfile)
router.put('/',                protect, updateProfile)

// Resume upload
router.post('/resume', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' })
    }
    const resumeUrl = req.file.path
    await pool.query('UPDATE users SET resume_url = ? WHERE id = ?', [resumeUrl, req.user.id])
    return res.status(200).json({ success: true, resume_url: resumeUrl, message: 'Resume uploaded.' })
  } catch (err) {
    console.error('Resume upload error:', err)
    return res.status(500).json({ success: false, message: 'Upload failed.' })
  }
})

// Resume delete
router.delete('/resume', protect, async (req, res) => {
  try {
    await pool.query('UPDATE users SET resume_url = NULL WHERE id = ?', [req.user.id])
    return res.status(200).json({ success: true, message: 'Resume removed.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
})

router.post('/education',       protect, addEducation)
router.put('/education/:id',    protect, updateEducation)
router.delete('/education/:id', protect, deleteEducation)

router.post('/experience',      protect, addExperience)
router.put('/experience/:id',   protect, updateExperience)
router.delete('/experience/:id', protect, deleteExperience)

module.exports = router