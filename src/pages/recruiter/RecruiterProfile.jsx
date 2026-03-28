import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getProfileAPI, updateProfileAPI } from '../../api/profile'
import { JOBS } from '../../data/jobs'
import '../../styles/recruiterprofile.css'
import { getMyJobsAPI } from '../../api/jobs'
import { getRecruiterAppsAPI } from '../../api/applications'

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

export default function RecruiterProfile() {
  const { user, setUser } = useAuth()
  const navigate          = useNavigate()
  const [profile, setProfile]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [successMsg, setSuccessMsg]   = useState('')
  const [form, setForm] = useState({
    name: '', phone: '', location: '', headline: '',
    bio: '', linkedin_url: '', portfolio_url: '', github_url: '',
  })
  const [jobStats, setJobStats] = useState({ jobs: 0, apps: 0, shortlisted: 0 })

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const data = await getProfileAPI()
      setProfile(data.profile)
      setForm({
        name:          data.profile.name || '',
        phone:         data.profile.phone || '',
        location:      data.profile.location || '',
        headline:      data.profile.headline || '',
        bio:           data.profile.bio || '',
        linkedin_url:  data.profile.linkedin_url || '',
        portfolio_url: data.profile.portfolio_url || '',
        github_url:    data.profile.github_url || '',
      })
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => {
  if (!user) return
  Promise.all([
    getMyJobsAPI().catch(() => ({ jobs: [] })),
    getRecruiterAppsAPI().catch(() => ({ applications: [] })),
  ]).then(([jobsData, appsData]) => {
    setJobStats({
      jobs:        jobsData.jobs?.length || 0,
      apps:        appsData.applications?.length || 0,
      shortlisted: appsData.applications?.filter(a => a.status === 'shortlisted').length || 0,
    })
  })
}, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfileAPI(form)
      await fetchProfile()
      setUser(prev => ({ ...prev, name: form.name }))
      setActiveModal(null)
      setSuccessMsg('Profile updated!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const postedJobs = JOBS.slice(0, 3)

  if (loading) return (
    <div className="profile-loading">
      <div className="profile-spinner" />
    </div>
  )

  return (
    <div className="rec-profile-page page-enter">
      <div className="container rec-profile-layout">

        {/* ── LEFT SIDEBAR ────────────────────────────────── */}
        <aside className="rec-profile-sidebar">

          {/* Company card */}
          <div className="profile-card rec-company-card">
            <div className="rec-company-logo">
              {profile?.avatar
                ? <img src={profile.avatar} alt={profile.name} />
                : <span>{profile?.name?.[0]?.toUpperCase()}</span>
              }
            </div>
            <h2 className="profile-name">{profile?.name}</h2>
            <span className="rec-role-badge">Recruiter Account</span>
            {profile?.headline && (
              <p className="profile-headline">{profile.headline}</p>
            )}
            {profile?.location && (
              <div className="profile-location-row">
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  {profile.location}
                </span>
              </div>
            )}
            <button
              className="profile-hero-edit-btn"
              onClick={() => setActiveModal('info')}
            >
              ✏️ Edit Company Info
            </button>
          </div>

          {/* Contact */}
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
              <div className="profile-contact-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{profile?.email}</span>
              </div>
              {profile?.phone && (
                <div className="profile-contact-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 0113 2.18 2 2 0 0115.09 4v3a2 2 0 01-2 2 3.39 3.39 0 00-1.33.32 13 13 0 005.09 5.09A3.39 3.39 0 0018 13a2 2 0 012 2v1.92z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile?.linkedin_url ? (
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
              {profile?.portfolio_url ? (
                <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="profile-contact-item profile-contact-link">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>Company Website</span>
                </a>
              ) : (
                <button className="profile-contact-add" onClick={() => setActiveModal('links')}>
                  + Add Company Website
                </button>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="profile-card">
            <h4 className="profile-card__title" style={{ marginBottom: '14px' }}>Quick Links</h4>
            <div className="rec-quick-links">
              <Link to="/post-job" className="rec-quick-link rec-quick-link--primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Post a New Job
              </Link>
              <Link to="/dashboard" className="rec-quick-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Manage Dashboard
              </Link>
              <Link to="/recruiter/applications" className="rec-quick-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                View Applications
              </Link>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ────────────────────────────────── */}
        <div className="profile-main">

          {successMsg && <div className="profile-toast">✅ {successMsg}</div>}

          {/* About company */}
          <div className="profile-card">
            <div className="profile-card__header">
              <h3 className="profile-card__title">About the Company</h3>
              <button className="profile-section-edit" onClick={() => setActiveModal('bio')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Edit
              </button>
            </div>
            {profile?.bio ? (
              <p className="profile-bio">{profile.bio}</p>
            ) : (
              <button className="profile-add-prompt" onClick={() => setActiveModal('bio')}>
                + Add a description about your company
              </button>
            )}
          </div>

          {/* Active job posts */}
          <div className="profile-card">
            <div className="profile-card__header">
              <h3 className="profile-card__title">Active Job Posts</h3>
              <Link to="/post-job" className="profile-section-edit profile-section-add">
                + Post New Job
              </Link>
            </div>
            <div className="rec-posted-jobs">
              {postedJobs.map(job => (
                <div key={job.id} className="rec-posted-job">
                  <div
                    className="rec-posted-logo"
                    style={{ background: job.logoColor + '18', color: job.logoColor }}
                  >
                    {job.logo}
                  </div>
                  <div className="rec-posted-info">
                    <strong>{job.title}</strong>
                    <span>{job.location} · {job.type} · {job.experience}</span>
                    <div className="rec-posted-tags">
                      <span className="app-tag">{job.salary}</span>
                      {job.remote && <span className="app-tag">Remote</span>}
                    </div>
                  </div>
                  <div className="rec-posted-actions">
                    <span className="rec-job-apps-count">
                      {Math.floor(Math.random() * 30) + 5} applicants
                    </span>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="btn btn-outline"
                      style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: '20px' }}
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/dashboard" className="rec-card__footer-link" style={{ display: 'block', padding: '14px 24px', borderTop: '1px solid var(--border)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', background: 'var(--bg-subtle)' }}>
              Manage all jobs in dashboard →
            </Link>
          </div>

          {/* Hiring stats */}
          <div className="profile-card">
            <h3 className="profile-card__title" style={{ marginBottom: '20px' }}>Hiring Stats</h3>
            <div className="rec-hiring-stats">
              {[
                { label: 'Jobs Posted',   value: jobStats.jobs,        icon: '💼' },
                { label: 'Applications',  value: jobStats.apps,        icon: '📋' },
                { label: 'Shortlisted',   value: jobStats.shortlisted, icon: '⭐' },
                { label: 'Hires Made',    value: 0,                    icon: '🎉' },
              ].map(s => (
                <div key={s.label} className="rec-hiring-stat">
                  <span>{s.icon}</span>
                  <strong>{s.value}</strong>
                  <p>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── MODALS ────────────────────────────────────────── */}

      {activeModal === 'bio' && (
        <Modal title="About the Company" onClose={() => setActiveModal(null)}>
          <div className="modal-body">
            <div className="modal-field">
              <label>Company Description</label>
              <textarea
                rows={6}
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Describe your company culture, mission, and what makes it a great place to work..."
                autoFocus
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setActiveModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="auth-spinner" /> : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {activeModal === 'info' && (
        <Modal title="Edit Company Info" onClose={() => setActiveModal(null)}>
          <div className="modal-body">
            <div className="modal-field-row">
              <div className="modal-field">
                <label>Company / Recruiter Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div className="modal-field">
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
            <div className="modal-field">
              <label>Location / Headquarters</label>
              <input
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Bangalore, India"
              />
            </div>
            <div className="modal-field">
              <label>Tagline / Headline</label>
              <input
                value={form.headline}
                onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
                placeholder="e.g. Building the future of fintech · 500+ employees"
                maxLength={250}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setActiveModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="auth-spinner" /> : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {activeModal === 'links' && (
        <Modal title="Contact & Links" onClose={() => setActiveModal(null)}>
          <div className="modal-body">
            <div className="modal-field">
              <label>Phone</label>
              <input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 9876543210"
              />
            </div>
            <div className="modal-field">
              <label>LinkedIn Company Page</label>
              <input
                value={form.linkedin_url}
                onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
            <div className="modal-field">
              <label>Company Website</label>
              <input
                value={form.portfolio_url}
                onChange={e => setForm(f => ({ ...f, portfolio_url: e.target.value }))}
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setActiveModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="auth-spinner" /> : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}