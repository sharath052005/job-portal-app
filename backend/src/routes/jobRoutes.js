const express = require('express')
const router  = express.Router()
const { protect, restrictTo } = require('../middleware/authMiddleware')
const {
  getJobs, getJobById, createJob,
  getMyJobs, updateJobStatus, deleteJob
} = require('../controllers/jobController')

// Public
router.get('/',           getJobs)
router.get('/my',         protect, restrictTo('recruiter'), getMyJobs)
router.get('/:id',        getJobById)

// Recruiter only
router.post('/',          protect, restrictTo('recruiter'), createJob)
router.put('/:id/status', protect, restrictTo('recruiter'), updateJobStatus)
router.delete('/:id',     protect, restrictTo('recruiter'), deleteJob)

module.exports = router