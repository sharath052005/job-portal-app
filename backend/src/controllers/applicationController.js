const pool = require('../config/db')

// Submit application
const applyJob = async (req, res) => {
  try {
    const userId = req.user.id
    const { job_id, availability, has_laptop, work_weekends, resume_url } = req.body

    if (!job_id) {
      return res.status(400).json({ success: false, message: 'job_id is required.' })
    }

    // Check if already applied
    const [existing] = await pool.query(
      'SELECT id FROM applications WHERE user_id = ? AND job_id = ?',
      [userId, job_id]
    )

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job.'
      })
    }

    const [result] = await pool.query(
      `INSERT INTO applications (user_id, job_id, availability, has_laptop, work_weekends, resume_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, job_id, availability, has_laptop, work_weekends, resume_url || null]
    )

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application_id: result.insertId
    })

  } catch (err) {
    console.error('Apply job error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// Get applications for all jobs posted by this recruiter
const getRecruiterApplications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        a.*,
        u.name as applicant_name,
        u.email as applicant_email,
        u.avatar as applicant_avatar,
        j.title as job_title,
        j.company as job_company,
        j.logo as job_logo,
        j.logo_color as job_logo_color,
        j.location as job_location,
        j.type as job_type
       FROM applications a
       JOIN users u ON a.user_id = u.id
       JOIN jobs j ON a.job_id = j.id
       WHERE j.recruiter_id = ?
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    )

    return res.status(200).json({ success: true, applications: rows })
  } catch (err) {
    console.error('Get recruiter applications error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// Update application status (recruiter only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body
    const { id } = req.params

    const validStatuses = ['applied', 'reviewing', 'shortlisted', 'rejected']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' })
    }

    await pool.query(
      `UPDATE applications a
       JOIN jobs j ON a.job_id = j.id
       SET a.status = ?
       WHERE a.id = ? AND j.recruiter_id = ?`,
      [status, id, req.user.id]
    )

    // If rejected — auto disable any conversation between them for this job
    if (status === 'rejected') {
      const [apps] = await pool.query(
        'SELECT user_id, job_id FROM applications WHERE id = ?', [id]
      )

      if (apps.length > 0) {
        await pool.query(
          `UPDATE conversations
           SET is_disabled = 1,
               disabled_reason = 'We appreciate your interest. Unfortunately, the recruiter has moved forward with other candidates. You can no longer message this employer for this position.'
           WHERE seeker_id = ? AND job_id = ? AND recruiter_id = ?`,
          [apps[0].user_id, apps[0].job_id, req.user.id]
        )
      }
    }

    return res.status(200).json({ success: true, message: 'Status updated.' })
  } catch (err) {
    console.error('Update application status error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// Get all applications for logged in seeker — with full job details
const getMyApplications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        a.id, a.job_id, a.status, a.applied_at,
        a.availability, a.has_laptop, a.work_weekends, a.resume_url,
        j.title as job_title,
        j.company as job_company,
        j.logo as job_logo,
        j.logo_color as job_logo_color,
        j.location as job_location,
        j.type as job_type,
        j.work_mode as job_work_mode
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.user_id = ?
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    )

    return res.status(200).json({ success: true, applications: rows })
  } catch (err) {
    console.error('Get applications error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// Check if user applied to a specific job
const checkApplied = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, status FROM applications WHERE user_id = ? AND job_id = ?',
      [req.user.id, req.params.jobId]
    )

    return res.status(200).json({
      success: true,
      applied: rows.length > 0,
      status: rows[0]?.status || null
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

module.exports = {
  applyJob,
  getMyApplications,
  checkApplied,
  getRecruiterApplications,
  updateApplicationStatus,
}