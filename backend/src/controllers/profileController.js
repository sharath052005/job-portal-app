const pool = require('../config/db')

// GET full profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const [users] = await pool.query(
      `SELECT id, name, email, role, avatar, headline, bio, phone,
              location, experience_yrs, current_role, current_company,
              skills, resume_url, linkedin_url, portfolio_url, github_url,
              auth_provider, created_at
       FROM users WHERE id = ?`,
      [userId]
    )

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    const [education] = await pool.query(
      'SELECT * FROM education WHERE user_id = ? ORDER BY end_year DESC',
      [userId]
    )

    const [experience] = await pool.query(
      'SELECT * FROM experience WHERE user_id = ? ORDER BY is_current DESC, start_date DESC',
      [userId]
    )

    const user = users[0]
    if (user.skills) user.skills = user.skills.split(',').map(s => s.trim())
    else user.skills = []

    return res.status(200).json({
      success: true,
      profile: { ...user, education, experience }
    })

  } catch (err) {
    console.error('Get profile error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// PUT update basic profile info
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      name, phone, location, headline, bio,
      experience_yrs, current_role, current_company,
      skills, linkedin_url, portfolio_url, github_url
    } = req.body

    const skillsStr = Array.isArray(skills) ? skills.join(',') : (skills || '')

    // Only update resume_url if explicitly provided — never null it out
    await pool.query(
      `UPDATE users SET
        name = ?, phone = ?, location = ?, headline = ?, bio = ?,
        experience_yrs = ?, current_role = ?, current_company = ?,
        skills = ?, linkedin_url = ?, portfolio_url = ?, github_url = ?
       WHERE id = ?`,
      [
        name, phone, location, headline, bio,
        experience_yrs, current_role, current_company,
        skillsStr, linkedin_url, portfolio_url, github_url,
        userId
      ]
    )

    return res.status(200).json({ success: true, message: 'Profile updated.' })
  } catch (err) {
    console.error('Update profile error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// POST add education
const addEducation = async (req, res) => {
  try {
    const { degree, institution, field, start_year, end_year, grade } = req.body

    if (!degree || !institution) {
      return res.status(400).json({ success: false, message: 'Degree and institution are required.' })
    }

    const [result] = await pool.query(
      `INSERT INTO education (user_id, degree, institution, field, start_year, end_year, grade)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, degree, institution, field, start_year, end_year, grade]
    )

    return res.status(201).json({
      success: true,
      education: { id: result.insertId, degree, institution, field, start_year, end_year, grade }
    })

  } catch (err) {
    console.error('Add education error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// PUT update education
const updateEducation = async (req, res) => {
  try {
    const { id } = req.params
    const { degree, institution, field, start_year, end_year, grade } = req.body

    await pool.query(
      `UPDATE education SET degree=?, institution=?, field=?, start_year=?, end_year=?, grade=?
       WHERE id=? AND user_id=?`,
      [degree, institution, field, start_year, end_year, grade, id, req.user.id]
    )

    return res.status(200).json({ success: true, message: 'Education updated.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// DELETE education
const deleteEducation = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM education WHERE id=? AND user_id=?',
      [req.params.id, req.user.id]
    )
    return res.status(200).json({ success: true, message: 'Education deleted.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// POST add experience
const addExperience = async (req, res) => {
  try {
    const { job_title, company, location, start_date, end_date, is_current, description } = req.body

    if (!job_title || !company) {
      return res.status(400).json({ success: false, message: 'Job title and company are required.' })
    }

    const [result] = await pool.query(
      `INSERT INTO experience (user_id, job_title, company, location, start_date, end_date, is_current, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, job_title, company, location, start_date, is_current ? null : end_date, is_current, description]
    )

    return res.status(201).json({
      success: true,
      experience: { id: result.insertId, job_title, company, location, start_date, end_date, is_current, description }
    })

  } catch (err) {
    console.error('Add experience error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// PUT update experience
const updateExperience = async (req, res) => {
  try {
    const { id } = req.params
    const { job_title, company, location, start_date, end_date, is_current, description } = req.body

    await pool.query(
      `UPDATE experience SET job_title=?, company=?, location=?, start_date=?, end_date=?, is_current=?, description=?
       WHERE id=? AND user_id=?`,
      [job_title, company, location, start_date, is_current ? null : end_date, is_current, description, id, req.user.id]
    )

    return res.status(200).json({ success: true, message: 'Experience updated.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// DELETE experience
const deleteExperience = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM experience WHERE id=? AND user_id=?',
      [req.params.id, req.user.id]
    )
    return res.status(200).json({ success: true, message: 'Experience deleted.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

module.exports = {
  getProfile, updateProfile,
  addEducation, updateEducation, deleteEducation,
  addExperience, updateExperience, deleteExperience,
}