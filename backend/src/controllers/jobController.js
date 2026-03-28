const pool = require('../config/db')

// GET all active jobs (public)
const getJobs = async (req, res) => {
  try {
    const { q, category, remote, type, location } = req.query

    let sql = `
      SELECT j.*, u.name as recruiter_name
      FROM jobs j
      JOIN users u ON j.recruiter_id = u.id
      WHERE j.status = 'active'
    `
    const params = []

    if (q) {
      sql += ` AND (j.title LIKE ? OR j.company LIKE ?)`
      params.push(`%${q}%`, `%${q}%`)
    }

    if (category) {
      sql += ` AND j.category = ?`
      params.push(category)
    }

    if (remote === 'true') {
      sql += ` AND j.remote = 1`
    }

    if (type) {
      sql += ` AND j.type = ?`
      params.push(type)
    }

    if (location) {
      sql += ` AND j.location = ?`
      params.push(location)
    }

    sql += ` ORDER BY j.created_at DESC`

    const [rows] = await pool.query(sql, params)

    // Parse skills and format salary
    const jobs = rows.map(job => ({
      ...job,
      skills: job.skills ? job.skills.split(',').map(s => s.trim()) : [],
      responsibilities: job.responsibilities
        ? job.responsibilities.split('\n').filter(Boolean)
        : [],
      requirements: job.requirements
        ? job.requirements.split('\n').filter(Boolean)
        : [],
      salary: job.salary_min && job.salary_max
        ? `$${Math.round(job.salary_min / 1000)}k – $${Math.round(job.salary_max / 1000)}k`
        : 'Not disclosed',
      logoColor: job.logo_color,
      posted: timeAgo(job.created_at),
    }))

    return res.status(200).json({ success: true, jobs })
  } catch (err) {
    console.error('Get jobs error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// GET single job
const getJobById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT j.*, u.name as recruiter_name
       FROM jobs j
       JOIN users u ON j.recruiter_id = u.id
       WHERE j.id = ?`,
      [req.params.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found.' })
    }

    const job = rows[0]
    const formatted = {
      ...job,
      skills: job.skills ? job.skills.split(',').map(s => s.trim()) : [],
      responsibilities: job.responsibilities
        ? job.responsibilities.split('\n').filter(Boolean)
        : [],
      requirements: job.requirements
        ? job.requirements.split('\n').filter(Boolean)
        : [],
      salary: job.salary_min && job.salary_max
        ? `$${Math.round(job.salary_min / 1000)}k – $${Math.round(job.salary_max / 1000)}k`
        : 'Not disclosed',
      logoColor: job.logo_color,
      posted: timeAgo(job.created_at),
    }

    return res.status(200).json({ success: true, job: formatted })
  } catch (err) {
    console.error('Get job error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// POST create job (recruiter only)
const createJob = async (req, res) => {
  try {
    const {
      title, company, location, type, remote, work_mode,
      experience, category, salary_min, salary_max,
      description, responsibilities, requirements, skills
    } = req.body

    if (!title || !company || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, company and location are required.'
      })
    }

    // Generate logo from company name
    const logo = company.trim()[0].toUpperCase()

    // Random professional color based on company initial
    const colors = [
      '#2563EB', '#7c3aed', '#db2777', '#d97706',
      '#059669', '#dc2626', '#0891b2', '#0d9488'
    ]
    const logoColor = colors[logo.charCodeAt(0) % colors.length]

    // Convert arrays/multiline to stored format
    const respStr = Array.isArray(responsibilities)
      ? responsibilities.join('\n')
      : (responsibilities || '')

    const reqStr = Array.isArray(requirements)
      ? requirements.join('\n')
      : (requirements || '')

    const skillsStr = Array.isArray(skills)
      ? skills.join(',')
      : (skills || '')

    // In createJob, fix the work_mode logic:
const workMode = remote ? 'Remote' : (work_mode || 'On-site')

const [result] = await pool.query(
  `INSERT INTO jobs
    (recruiter_id, title, company, logo, logo_color, location, type,
     remote, work_mode, experience, category, salary_min, salary_max,
     description, responsibilities, requirements, skills)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    req.user.id, title, company, logo, logoColor,
    remote ? 'Remote' : location,
    type,
    remote ? true : false,
    workMode,   // ← use computed workMode
    experience, category,
    salary_min || null, salary_max || null,
    description, respStr, reqStr, skillsStr
  ]
)

    return res.status(201).json({
      success: true,
      message: 'Job posted successfully!',
      job_id: result.insertId
    })
  } catch (err) {
    console.error('Create job error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}



// GET recruiter's own jobs
const getMyJobs = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT j.*,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as application_count
       FROM jobs j
       WHERE j.recruiter_id = ?
       ORDER BY j.created_at DESC`,
      [req.user.id]
    )

    const jobs = rows.map(job => ({
      ...job,
      skills: job.skills ? job.skills.split(',').map(s => s.trim()) : [],
      salary: job.salary_min && job.salary_max
        ? `$${Math.round(job.salary_min / 1000)}k – $${Math.round(job.salary_max / 1000)}k`
        : 'Not disclosed',
      logoColor: job.logo_color,
      posted: timeAgo(job.created_at),
    }))

    return res.status(200).json({ success: true, jobs })
  } catch (err) {
    console.error('Get my jobs error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// PUT update job status
const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body
    await pool.query(
      'UPDATE jobs SET status = ? WHERE id = ? AND recruiter_id = ?',
      [status, req.params.id, req.user.id]
    )
    return res.status(200).json({ success: true, message: 'Job updated.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// DELETE job
const deleteJob = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM jobs WHERE id = ? AND recruiter_id = ?',
      [req.params.id, req.user.id]
    )
    return res.status(200).json({ success: true, message: 'Job deleted.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// Helper
function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 14) return '1 week ago'
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

module.exports = {
  getJobs, getJobById, createJob,
  getMyJobs, updateJobStatus, deleteJob
}