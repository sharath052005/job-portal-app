import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyApplicationsAPI } from '../api/applications'
import { JOBS } from '../data/jobs'
import '../styles/applications.css'

const STATUS_CONFIG = {
  applied: {
    label: 'Applied',
    color: '#2563EB',
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: '📤',
  },
  reviewing: {
    label: 'Under Review',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    icon: '🔍',
  },
  shortlisted: {
    label: 'Shortlisted',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    icon: '⭐',
  },
  rejected: {
    label: 'Not Selected',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    icon: '❌',
  },
}

export default function Applications() {
  const { user }          = useAuth()
  const navigate          = useNavigate()
  const [apps, setApps]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchApplications()
  }, [user])

  const fetchApplications = async () => {
    try {
      const data = await getMyApplicationsAPI()
      setApps(data.applications)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Match application job_id to JOBS data
  const enriched = apps.map(app => ({
    ...app,
    jobData: JOBS.find(j => j.id === app.job_id) || null,
  }))

  const filtered = filter === 'all'
    ? enriched
    : enriched.filter(a => a.status === filter)

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  if (loading) return (
    <div className="apps-loading">
      <div className="profile-spinner" />
    </div>
  )

  return (
    <div className="apps-page page-enter">
      <div className="container">

        {/* Header */}
        <div className="apps-header">
          <div>
            <h1>My Applications</h1>
            <p>{apps.length} total application{apps.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/jobs" className="btn btn-outline">Browse More Jobs</Link>
        </div>

        {/* Stats row */}
        <div className="apps-stats">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="apps-stat-card" style={{ '--stat-color': cfg.color, '--stat-bg': cfg.bg }}>
              <span className="apps-stat-icon">{cfg.icon}</span>
              <div>
                <strong>{apps.filter(a => a.status === key).length}</strong>
                <p>{cfg.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="apps-filters">
          {[
            { key: 'all', label: 'All' },
            { key: 'applied', label: 'Applied' },
            { key: 'reviewing', label: 'Under Review' },
            { key: 'shortlisted', label: 'Shortlisted' },
            { key: 'rejected', label: 'Not Selected' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`apps-filter-tab ${filter === tab.key ? 'active' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              <span className="apps-filter-count">
                {tab.key === 'all'
                  ? apps.length
                  : apps.filter(a => a.status === tab.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Applications list */}
        {filtered.length === 0 ? (
          <div className="apps-empty">
            <div className="apps-empty__icon">📋</div>
            <h3>No applications {filter !== 'all' ? `with status "${STATUS_CONFIG[filter]?.label}"` : 'yet'}</h3>
            <p>
              {filter !== 'all'
                ? 'Try selecting a different filter above.'
                : 'Start applying to jobs and track your progress here.'}
            </p>
            {filter === 'all' && (
              <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
            )}
          </div>
        ) : (
          <div className="apps-list">
            {filtered.map(app => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
              const job = app.jobData

              return (
                <div key={app.id} className="app-card">

                  {/* Left: job info */}
                  <div className="app-card__left">
                    {job ? (
                      <div
                        className="app-card__logo"
                        style={{ background: job.logoColor + '18', color: job.logoColor }}
                      >
                        {job.logo}
                      </div>
                    ) : (
                      <div className="app-card__logo app-card__logo--unknown">?</div>
                    )}

                    <div className="app-card__info">
                      <h3 className="app-card__title">
                        {job ? job.title : `Job #${app.job_id}`}
                      </h3>
                      <p className="app-card__company">
                        {job ? `${job.company} · ${job.location}` : 'Company unavailable'}
                      </p>

                      {/* Tags */}
                      <div className="app-card__tags">
                        {job && (
                          <>
                            <span className="app-tag">{job.type}</span>
                            {job.remote && <span className="app-tag">Remote</span>}
                            <span className="app-tag">{job.experience}</span>
                          </>
                        )}
                      </div>

                      {/* Application details */}
                      <div className="app-card__details">
                        <span className="app-detail">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Applied on {formatDate(app.applied_at)}
                        </span>
                        <span className="app-detail">
                          {app.availability === 'immediate' ? '✅ Available immediately' : '⏳ Notice period required'}
                        </span>
                        <span className="app-detail">
                          {app.has_laptop ? '💻 Has laptop & internet' : '❌ No laptop'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: status + actions */}
                  <div className="app-card__right">
                    <div
                      className="app-status-badge"
                      style={{
                        background: cfg.bg,
                        color: cfg.color,
                        border: `1px solid ${cfg.border}`,
                      }}
                    >
                      {cfg.icon} {cfg.label}
                    </div>

                    <div className="app-card__actions">
                      {job && (
                        <Link
                          to={`/jobs/${job.id}`}
                          className="btn btn-outline app-action-btn"
                        >
                          View Job
                        </Link>
                      )}
                      {app.resume_url && (
                        
                          <a href={app.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost app-action-btn"
                        >
                          View Resume
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}