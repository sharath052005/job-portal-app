const express = require('express')
const router  = express.Router()
const { protect, restrictTo } = require('../middleware/authMiddleware')
const {
  applyJob,
  getMyApplications,
  checkApplied,
  getRecruiterApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController')

// Seeker routes
router.post('/',             protect, applyJob)
router.get('/my',            protect, getMyApplications)
router.get('/check/:jobId',  protect, checkApplied)

// Recruiter routes
router.get('/recruiter',     protect, restrictTo('recruiter'), getRecruiterApplications)
router.put('/:id/status',    protect, restrictTo('recruiter'), updateApplicationStatus)

module.exports = router