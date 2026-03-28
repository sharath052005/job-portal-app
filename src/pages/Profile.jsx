import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getProfileAPI, updateProfileAPI,
  addEducationAPI, updateEducationAPI, deleteEducationAPI,
  addExperienceAPI, updateExperienceAPI, deleteExperienceAPI,
  uploadResumeAPI, deleteResumeAPI,
} from '../api/profile'
import '../styles/profile.css'

const EXPERIENCE_OPTIONS = [
  'Fresher', '0-1 years', '1-3 years',
  '3-5 years', '5-8 years', '8-10 years', '10+ years'
]

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, setUser } = useAuth()
  const navigate          = useNavigate()

  const [profile, setProfile]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [editTarget, setEditTarget]   = useState(null)
  const [successMsg, setSuccessMsg]   = useState('')
  const [skillInput, setSkillInput]   = useState('')
  const [resumeUploading, setResumeUploading] = useState(false)
  const resumeInputRef = useRef(null)
  const [pdfModal, setPdfModal] = useState(false)

  const [basicForm, setBasicForm] = useState({})
  const [eduForm, setEduForm]     = useState({
    degree: '', institution: '', field: '',
    start_year: '', end_year: '', grade: ''
  })
  const [expForm, setExpForm]     = useState({
    job_title: '', company: '', location: '',
    start_date: '', end_date: '', is_current: false, description: ''
  })

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const data = await getProfileAPI()
      setProfile(data.profile)
      setBasicForm({
        name:            data.profile.name || '',
        phone:           data.profile.phone || '',
        location:        data.profile.location || '',
        headline:        data.profile.headline || '',
        bio:             data.profile.bio || '',
        experience_yrs:  data.profile.experience_yrs || '',
        current_role:    data.profile.current_role || '',
        current_company: data.profile.current_company || '',
        skills:          data.profile.skills || [],
        linkedin_url:    data.profile.linkedin_url || '',
        portfolio_url:   data.profile.portfolio_url || '',
        github_url:      data.profile.github_url || '',
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // ── Basic save ──────────────────────────────────────────────
  const handleBasicSave = async () => {
    setSaving(true)
    try {
      await updateProfileAPI(basicForm)
      await fetchProfile()
      setUser(prev => ({ ...prev, name: basicForm.name }))
      setActiveModal(null)
      showSuccess('Profile updated!')
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !basicForm.skills.includes(s)) {
      setBasicForm(f => ({ ...f, skills: [...f.skills, s] }))
    }
    setSkillInput('')
  }

  const removeSkill = (skill) => {
    setBasicForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }))
  }

  // ── Resume upload ───────────────────────────────────────────
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      alert('File size must be under 3MB')
      return
    }
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed')
      return
    }
    setResumeUploading(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      const data = await uploadResumeAPI(formData)
      if (data.success) {
        await fetchProfile()
        showSuccess('Resume uploaded successfully!')
      }
    } catch (err) { console.error(err) }
    finally { setResumeUploading(false) }
  }

  const handleResumeDelete = async () => {
    if (!window.confirm('Remove your resume?')) return
    await deleteResumeAPI()
    await fetchProfile()
    showSuccess('Resume removed.')
  }

  // ── Education ───────────────────────────────────────────────
  const handleEduSave = async () => {
    setSaving(true)
    try {
      if (editTarget) {
        await updateEducationAPI(editTarget.id, eduForm)
      } else {
        await addEducationAPI(eduForm)
      }
      await fetchProfile()
      setActiveModal(null)
      setEditTarget(null)
      setEduForm({ degree: '', institution: '', field: '', start_year: '', end_year: '', grade: '' })
      showSuccess('Education saved!')
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleEduDelete = async (id) => {
    if (!window.confirm('Delete this education entry?')) return
    await deleteEducationAPI(id)
    await fetchProfile()
    showSuccess('Education removed.')
  }

  const openEduEdit = (edu) => {
    setEditTarget(edu)
    setEduForm({ ...edu })
    setActiveModal('edu')
  }

  // ── Experience ──────────────────────────────────────────────
  const handleExpSave = async () => {
    setSaving(true)
    try {
      if (editTarget) {
        await updateExperienceAPI(editTarget.id, expForm)
      } else {
        await addExperienceAPI(expForm)
      }
      await fetchProfile()
      setActiveModal(null)
      setEditTarget(null)
      setExpForm({ job_title: '', company: '', location: '', start_date: '', end_date: '', is_current: false, description: '' })
      showSuccess('Experience saved!')
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleExpDelete = async (id) => {
    if (!window.confirm('Delete this experience entry?')) return
    await deleteExperienceAPI(id)
    await fetchProfile()
    showSuccess('Experience removed.')
  }

  const openExpEdit = (exp) => {
    setEditTarget(exp)
    setExpForm({ ...exp })
    setActiveModal('exp')
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  // Latest education for display under name
  const latestEdu = profile?.education?.[0]

  // Profile completion
  const completionFields = [
    profile?.headline, profile?.phone, profile?.bio,
    profile?.current_role, profile?.skills?.length,
    profile?.education?.length, profile?.experience?.length,
    profile?.linkedin_url,
  ]
  const completionPct = profile
    ? Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100)
    : 0

  if (loading) return (
    <div className="profile-loading">
      <div className="profile-spinner" />
    </div>
  )

  if (!profile) return (
    <div className="profile-loading">
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Could not load profile. Please refresh.
      </p>
    </div>
  )

  return (
    <div className="profile-page page-enter">
      <div className="container profile-layout">

        {/* ── LEFT SIDEBAR ──────────────────────────────────── */}
        <aside className="profile-sidebar">

          {/* Avatar + Name */}
          <div className="profile-card profile-hero-card">
            <div className="profile-avatar-wrap">
              {profile.avatar
                ? <img src={profile.avatar} alt={profile.name} className="profile-avatar-img" />
                : <div className="profile-avatar-letter">{profile.name?.[0]?.toUpperCase()}</div>
              }
            </div>
            <h2 className="profile-name">{profile.name}</h2>

            {/* Headline */}
            {profile.headline && (
              <p className="profile-headline">{profile.headline}</p>
            )}

            {/* Latest education shown under name */}
            {latestEdu && (
              <div className="profile-edu-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>
                  {latestEdu.degree}{latestEdu.field ? ` in ${latestEdu.field}` : ''} · {latestEdu.institution}
                </span>
              </div>
            )}

            {/* Current role */}
            {profile.current_role && (
              <div className="profile-location-row">
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  {profile.current_role}
                  {profile.current_company ? ` at ${profile.current_company}` : ''}
                </span>
                {profile.location && (
                  <span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    {profile.location}
                  </span>
                )}
              </div>
            )}
            <button
              className="profile-hero-edit-btn"
              onClick={() => setActiveModal('basic')}
            >
              ✏️ Edit Details
            </button>
          </div>

          {/* Profile Strength */}
          <div className="profile-card">
            <h4 className="profile-card__title">Profile Strength</h4>
            <div className="profile-completion">
              <div className="profile-completion__bar">
                <div className="profile-completion__fill" style={{ width: `${completionPct}%` }} />
              </div>
              <span className={`profile-completion__pct ${completionPct >= 80 ? 'strong' : completionPct >= 50 ? 'medium' : 'weak'}`}>
                {completionPct}%
              </span>
            </div>
            <p className="profile-completion__label">
              {completionPct >= 80 ? '🟢 Strong profile'
                : completionPct >= 50 ? '🟡 Add more details'
                : '🔴 Complete your profile'}
            </p>
          </div>

          {/* Contact & Links */}
            <div className="profile-card">
              <div className="profile-card__header">
                <h4 className="profile-card__title">Contact & Links</h4>
                <button className="profile-section-edit" onClick={() => setActiveModal('links')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Edit
                </button>
              </div>
              <div className="profile-contact-list">

                {/* Email — always shown */}
                <div className="profile-contact-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>{profile.email}</span>
                </div>

                {/* Phone */}
                {profile.phone ? (
                  <div className="profile-contact-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 0113 2.18 2 2 0 0115.09 4v3a2 2 0 01-2 2 3.39 3.39 0 00-1.33.32 13 13 0 005.09 5.09A3.39 3.39 0 0018 13a2 2 0 012 2v1.92z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{profile.phone}</span>
                  </div>
                ) : (
                  <button className="profile-contact-add" onClick={() => setActiveModal('links')}>
                    + Add phone number
                  </button>
                )}

                {/* LinkedIn */}
                {profile.linkedin_url ? (
                  <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="profile-contact-item profile-contact-link">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#0077B5">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                    <span>LinkedIn</span>
                  </a>
                ) : (
                  <button className="profile-contact-add" onClick={() => setActiveModal('links')}>
                    + Add LinkedIn URL
                  </button>
                )}

                {/* GitHub */}
                {profile.github_url ? (
                  <a href={profile.github_url} target="_blank" rel="noreferrer" className="profile-contact-item profile-contact-link">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
                    </svg>
                    <span>GitHub</span>
                  </a>
                ) : (
                  <button className="profile-contact-add" onClick={() => setActiveModal('links')}>
                    + Add GitHub URL
                  </button>
                )}

                {/* Portfolio */}
                {profile.portfolio_url ? (
                  <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="profile-contact-item profile-contact-link">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Portfolio</span>
                  </a>
                ) : (
                  <button className="profile-contact-add" onClick={() => setActiveModal('links')}>
                    + Add Portfolio URL
                  </button>
                )}

              </div>
            </div>
          </aside>

        {/* ── MAIN CONTENT ──────────────────────────────────── */}
        <div className="profile-main">

          {successMsg && <div className="profile-toast">✅ {successMsg}</div>}

          {/* About Me — just a textarea, no form popup */}
          <div className="profile-card">
            <div className="profile-card__header">
              <h3 className="profile-card__title">About Me</h3>
              <button className="profile-section-edit" onClick={() => setActiveModal('bio')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Edit
              </button>
            </div>
            {profile.bio
              ? <p className="profile-bio">{profile.bio}</p>
              : <button className="profile-add-prompt" onClick={() => setActiveModal('bio')}>
                  + Add a summary about yourself
                </button>
            }
          </div>

          {/* Resume Upload — replaces Key Details */}
          <div className="profile-card">
            <div className="profile-card__header">
              <h3 className="profile-card__title">Resume</h3>
              {!profile.resume_url && (
                <button
                  className="profile-section-edit profile-section-add"
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={resumeUploading}
                >
                  {resumeUploading ? 'Uploading...' : '+ Upload'}
                </button>
              )}
            </div>

            <input
              type="file"
              ref={resumeInputRef}
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={handleResumeUpload}
            />

            {profile.resume_url ? (
              <div className="profile-resume-box">
                <div className="profile-resume-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="16" y1="17" x2="8" y2="17" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    <polyline points="10,9 9,9 8,9" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="profile-resume-info">
                  <strong>Resume.pdf</strong>
                  <span>PDF · Max 3MB</span>
                </div>
                <div className="profile-resume-actions">
                  
                  <button
                  className="btn btn-outline profile-resume-btn"
                  onClick={() => setPdfModal(true)}
                  >
                  View
                  </button>
                  <button
                    className="btn profile-resume-btn profile-resume-btn--replace"
                    onClick={() => resumeInputRef.current?.click()}
                  >
                    Replace
                  </button>
                  <button
                    className="profile-resume-delete"
                    onClick={handleResumeDelete}
                    title="Remove resume"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="profile-resume-dropzone"
                onClick={() => resumeInputRef.current?.click()}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <p><strong>Click to upload your resume</strong></p>
                <span>PDF only · Max 3MB</span>
              </div>
            )}
          </div>

          {/* Skills — inline add, no modal */}
          <div className="profile-card">
            <div className="profile-card__header">
              <h3 className="profile-card__title">Skills</h3>
            </div>

            {/* Inline skill input — always visible */}
            <div className="profile-skill-input-row">
              <input
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSkill()
                  }
                }}
                placeholder="Type a skill and press Enter or Add"
                className="profile-skill-input"
              />
              <button className="btn btn-outline profile-skill-add-btn" onClick={addSkill}>
                Add
              </button>
            </div>

            {basicForm.skills?.length > 0 && (
              <div className="profile-skills-list">
                {basicForm.skills.map(s => (
                  <span key={s} className="profile-skill-tag">
                    {s}
                    <button
                      className="profile-skill-remove"
                      onClick={() => removeSkill(s)}
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {basicForm.skills?.length > 0 && (
              <button
                className="btn btn-primary profile-skills-save-btn"
                onClick={handleBasicSave}
                disabled={saving}
              >
                {saving ? <span className="auth-spinner" /> : 'Save Skills'}
              </button>
            )}
          </div>

          {/* Work Experience */}
          <div className="profile-card">
            <div className="profile-card__header">
              <h3 className="profile-card__title">Work Experience</h3>
              <button
                className="profile-section-edit profile-section-add"
                onClick={() => {
                  setEditTarget(null)
                  setExpForm({ job_title: '', company: '', location: '', start_date: '', end_date: '', is_current: false, description: '' })
                  setActiveModal('exp')
                }}
              >
                + Add
              </button>
            </div>
            {profile.experience?.length > 0 ? (
              <div className="profile-timeline">
                {profile.experience.map((exp, i) => (
                  <div key={exp.id} className="profile-timeline-item">
                    <div className="profile-timeline-dot" />
                    {i < profile.experience.length - 1 && <div className="profile-timeline-line" />}
                    <div className="profile-timeline-content">
                      <div className="profile-timeline-header">
                        <div>
                          <h4>{exp.job_title}</h4>
                          <p className="profile-timeline-sub">
                            {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                          </p>
                          <p className="profile-timeline-date">
                            {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                          </p>
                        </div>
                        <div className="profile-item-actions">
                          <button onClick={() => openExpEdit(exp)}>✏️</button>
                          <button onClick={() => handleExpDelete(exp.id)}>🗑️</button>
                        </div>
                      </div>
                      {exp.description && <p className="profile-timeline-desc">{exp.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <button
                className="profile-add-prompt"
                onClick={() => { setEditTarget(null); setActiveModal('exp') }}
              >
                + Add work experience
              </button>
            )}
          </div>

          {/* Education */}
          <div className="profile-card">
            <div className="profile-card__header">
              <h3 className="profile-card__title">Education</h3>
              <button
                className="profile-section-edit profile-section-add"
                onClick={() => {
                  setEditTarget(null)
                  setEduForm({ degree: '', institution: '', field: '', start_year: '', end_year: '', grade: '' })
                  setActiveModal('edu')
                }}
              >
                + Add
              </button>
            </div>
            {profile.education?.length > 0 ? (
              <div className="profile-timeline">
                {profile.education.map((edu, i) => (
                  <div key={edu.id} className="profile-timeline-item">
                    <div className="profile-timeline-dot profile-timeline-dot--edu" />
                    {i < profile.education.length - 1 && <div className="profile-timeline-line" />}
                    <div className="profile-timeline-content">
                      <div className="profile-timeline-header">
                        <div>
                          <h4>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h4>
                          <p className="profile-timeline-sub">{edu.institution}</p>
                          <p className="profile-timeline-date">
                            {edu.start_year} — {edu.end_year || 'Present'}
                            {edu.grade ? ` · ${edu.grade}` : ''}
                          </p>
                        </div>
                        <div className="profile-item-actions">
                          <button onClick={() => openEduEdit(edu)}>✏️</button>
                          <button onClick={() => handleEduDelete(edu.id)}>🗑️</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <button
                className="profile-add-prompt"
                onClick={() => { setEditTarget(null); setActiveModal('edu') }}
              >
                + Add education
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────── */}

      {/* Bio modal — just a textarea */}
      {activeModal === 'bio' && (
        <Modal title="About Me" onClose={() => setActiveModal(null)}>
          <div className="modal-body">
            <div className="modal-field">
              <label>Write a short summary about yourself</label>
              <textarea
                rows={6}
                value={basicForm.bio}
                onChange={e => setBasicForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Describe your background, skills, and career goals. This is the first thing recruiters read — make it count!"
                autoFocus
              />
              <span className="modal-field__hint">{basicForm.bio?.length || 0} characters</span>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setActiveModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBasicSave} disabled={saving}>
              {saving ? <span className="auth-spinner" /> : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {/* Basic/Key Details modal */}
      {activeModal === 'basic' && (
        <Modal title="Edit Details" onClose={() => setActiveModal(null)}>
          <div className="modal-body">
            <div className="modal-field-row">
              <div className="modal-field">
                <label>Full Name</label>
                <input
                  value={basicForm.name}
                  onChange={e => setBasicForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div className="modal-field">
                <label>Phone</label>
                <input
                  value={basicForm.phone}
                  onChange={e => setBasicForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
            <div className="modal-field-row">
              <div className="modal-field">
                <label>Current Role</label>
                <input
                  value={basicForm.current_role}
                  onChange={e => setBasicForm(f => ({ ...f, current_role: e.target.value }))}
                  placeholder="e.g. Frontend Engineer"
                />
              </div>
              <div className="modal-field">
                <label>Current Company</label>
                <input
                  value={basicForm.current_company}
                  onChange={e => setBasicForm(f => ({ ...f, current_company: e.target.value }))}
                  placeholder="e.g. Google"
                />
              </div>
            </div>
            <div className="modal-field-row">
              <div className="modal-field">
                <label>Location</label>
                <input
                  value={basicForm.location}
                  onChange={e => setBasicForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>
              <div className="modal-field">
                <label>Total Experience</label>
                <select
                  value={basicForm.experience_yrs}
                  onChange={e => setBasicForm(f => ({ ...f, experience_yrs: e.target.value }))}
                >
                  <option value="">Select</option>
                  {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-field">
              <label>Profile Headline</label>
              <input
                value={basicForm.headline}
                onChange={e => setBasicForm(f => ({ ...f, headline: e.target.value }))}
                placeholder="e.g. Full Stack Developer | React & Node.js | Open to work"
                maxLength={250}
              />
              <span className="modal-field__hint">{basicForm.headline?.length || 0}/250</span>
            </div>
            <div className="modal-field">
              <label>LinkedIn URL</label>
              <input
                value={basicForm.linkedin_url}
                onChange={e => setBasicForm(f => ({ ...f, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>
            <div className="modal-field-row">
              <div className="modal-field">
                <label>GitHub URL</label>
                <input
                  value={basicForm.github_url}
                  onChange={e => setBasicForm(f => ({ ...f, github_url: e.target.value }))}
                  placeholder="https://github.com/yourname"
                />
              </div>
              <div className="modal-field">
                <label>Portfolio URL</label>
                <input
                  value={basicForm.portfolio_url}
                  onChange={e => setBasicForm(f => ({ ...f, portfolio_url: e.target.value }))}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setActiveModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBasicSave} disabled={saving}>
              {saving ? <span className="auth-spinner" /> : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {/* Links & Contact modal */}
      {activeModal === 'links' && (
        <Modal title="Contact & Links" onClose={() => setActiveModal(null)}>
          <div className="modal-body">
            <div className="modal-field">
              <label>Phone Number</label>
              <input
                value={basicForm.phone}
                onChange={e => setBasicForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 9876543210"
              />
            </div>
            <div className="modal-field">
              <label>LinkedIn URL</label>
              <input
                value={basicForm.linkedin_url}
                onChange={e => setBasicForm(f => ({ ...f, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>
            <div className="modal-field">
              <label>GitHub URL</label>
              <input
                value={basicForm.github_url}
                onChange={e => setBasicForm(f => ({ ...f, github_url: e.target.value }))}
                placeholder="https://github.com/yourname"
              />
            </div>
            <div className="modal-field">
              <label>Portfolio URL</label>
              <input
                value={basicForm.portfolio_url}
                onChange={e => setBasicForm(f => ({ ...f, portfolio_url: e.target.value }))}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setActiveModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBasicSave} disabled={saving}>
              {saving ? <span className="auth-spinner" /> : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {/* Education modal — with all fields from your reference images */}
      {activeModal === 'edu' && (
        <Modal
          title={editTarget ? 'Edit Education' : 'Add Education'}
          onClose={() => { setActiveModal(null); setEditTarget(null) }}
        >
          <div className="modal-body">
            <div className="modal-field">
              <label>Education Level *</label>
              <select
                value={eduForm.degree}
                onChange={e => setEduForm(f => ({ ...f, degree: e.target.value }))}
              >
                <option value="">Select level</option>
                {[
                  'Class X', 'Class XII', 'Diploma',
                  'B.Tech / B.E.', 'B.Sc', 'B.Com', 'B.A', 'BBA', 'BCA',
                  'M.Tech / M.E.', 'M.Sc', 'M.Com', 'M.A', 'MBA', 'MCA',
                  'Ph.D', 'Other'
                ].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="modal-field">
              <label>Institution / University *</label>
              <input
                value={eduForm.institution}
                onChange={e => setEduForm(f => ({ ...f, institution: e.target.value }))}
                placeholder="e.g. IIT Delhi, VIT University"
              />
            </div>
            <div className="modal-field">
              <label>Field of Study / Specialization</label>
              <input
                value={eduForm.field}
                onChange={e => setEduForm(f => ({ ...f, field: e.target.value }))}
                placeholder="e.g. Computer Science, Mechanical Engineering"
              />
            </div>
            <div className="modal-field-row">
              <div className="modal-field">
                <label>Start Year</label>
                <select
                  value={eduForm.start_year}
                  onChange={e => setEduForm(f => ({ ...f, start_year: e.target.value }))}
                >
                  <option value="">Select year</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="modal-field">
                <label>End Year (or expected)</label>
                <select
                  value={eduForm.end_year}
                  onChange={e => setEduForm(f => ({ ...f, end_year: e.target.value }))}
                >
                  <option value="">Select year</option>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + 5 - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-field">
              <label>Grade / CGPA / Percentage</label>
              <input
                value={eduForm.grade}
                onChange={e => setEduForm(f => ({ ...f, grade: e.target.value }))}
                placeholder="e.g. 8.5 CGPA / 85% / First Class"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => { setActiveModal(null); setEditTarget(null) }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleEduSave} disabled={saving}>
              {saving ? <span className="auth-spinner" /> : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {/* Experience modal */}
      {activeModal === 'exp' && (
        <Modal
          title={editTarget ? 'Edit Experience' : 'Add Experience'}
          onClose={() => { setActiveModal(null); setEditTarget(null) }}
        >
          <div className="modal-body">
            <div className="modal-field-row">
              <div className="modal-field">
                <label>Job Title *</label>
                <input
                  value={expForm.job_title}
                  onChange={e => setExpForm(f => ({ ...f, job_title: e.target.value }))}
                  placeholder="e.g. Frontend Engineer"
                />
              </div>
              <div className="modal-field">
                <label>Company *</label>
                <input
                  value={expForm.company}
                  onChange={e => setExpForm(f => ({ ...f, company: e.target.value }))}
                  placeholder="e.g. Google"
                />
              </div>
            </div>
            <div className="modal-field">
              <label>Location</label>
              <input
                value={expForm.location}
                onChange={e => setExpForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Bangalore, India"
              />
            </div>
            <div className="modal-field-row">
              <div className="modal-field">
                <label>Start Date</label>
                <input
                  type="date"
                  value={expForm.start_date?.slice(0, 10)}
                  onChange={e => setExpForm(f => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              {!expForm.is_current && (
                <div className="modal-field">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={expForm.end_date?.slice(0, 10)}
                    onChange={e => setExpForm(f => ({ ...f, end_date: e.target.value }))}
                  />
                </div>
              )}
            </div>
            <label className="modal-checkbox">
              <input
                type="checkbox"
                checked={expForm.is_current}
                onChange={e => setExpForm(f => ({ ...f, is_current: e.target.checked }))}
              />
              I currently work here
            </label>
            <div className="modal-field" style={{ marginTop: '12px' }}>
              <label>Description</label>
              <textarea
                rows={3}
                value={expForm.description}
                onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Briefly describe your responsibilities and achievements..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => { setActiveModal(null); setEditTarget(null) }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleExpSave} disabled={saving}>
              {saving ? <span className="auth-spinner" /> : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {/* PDF Viewer Modal */}
      {pdfModal && (
        <div className="pdf-modal-overlay" onClick={() => setPdfModal(false)}>
          <div className="pdf-modal-box" onClick={e => e.stopPropagation()}>
            <div className="pdf-modal-header">
              <h3>Resume Preview</h3>
              <div className="pdf-modal-actions">
                
                  <a href={profile.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ padding: '6px 16px', fontSize: '0.82rem' }}
                >
                  Download
                </a>
                <button className="modal-close" onClick={() => setPdfModal(false)}>✕</button>
              </div>
            </div>
            <div className="pdf-modal-body">
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(profile.resume_url)}&embedded=true`}
                className="pdf-iframe"
                title="Resume Preview"
                frameBorder="0"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}