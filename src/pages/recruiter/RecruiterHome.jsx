import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyJobsAPI } from '../../api/jobs'
import { getRecruiterAppsAPI } from '../../api/applications'
import '../../styles/recruiterhome.css'

export default function RecruiterHome() {
  const { user }              = useAuth()
  const [postedJobs, setPostedJobs] = useState([])
  const [recentApps, setRecentApps] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      getMyJobsAPI().catch(() => ({ jobs: [] })),
      getRecruiterAppsAPI().catch(() => ({ applications: [] })),
    ]).then(([jobsData, appsData]) => {
      setPostedJobs(jobsData.jobs || [])
      setRecentApps(appsData.applications || [])
    }).finally(() => setLoading(false))
  }, [])

  const stats = [
    {
      label: 'Active Jobs',
      value: postedJobs.filter(j => j.status === 'active').length,
      icon: '💼',
      color: '#2563EB',
      bg: '#eff6ff',
      delta: 'Currently live'
    },
    {
      label: 'Total Applications',
      value: recentApps.length,
      icon: '📋',
      color: '#7c3aed',
      bg: '#f5f3ff',
      delta: recentApps.length > 0 ? `${recentApps.filter(a => {
        const d = new Date(a.applied_at)
        const now = new Date()
        return (now - d) < 7 * 24 * 60 * 60 * 1000
      }).length} this week` : 'No applications yet'
    },
    {
      label: 'Shortlisted',
      value: recentApps.filter(a => a.status === 'shortlisted').length,
      icon: '⭐',
      color: '#d97706',
      bg: '#fffbeb',
      delta: recentApps.filter(a => a.status === 'shortlisted').length > 0
        ? 'Candidates shortlisted'
        : 'None shortlisted yet'
    },
    {
      label: 'Hires Made',
      value: 0,
      icon: '🎉',
      color: '#059669',
      bg: '#ecfdf5',
      delta: 'All time'
    },
  ]

  // New applications this week for hero card
  const newThisWeek = recentApps.filter(a => {
    const d = new Date(a.applied_at)
    return (new Date() - d) < 7 * 24 * 60 * 60 * 1000
  }).length

  const STATUS_COLORS = {
    applied:     { bg: '#eff6ff', color: '#2563EB' },
    reviewing:   { bg: '#fffbeb', color: '#d97706' },
    shortlisted: { bg: '#ecfdf5', color: '#059669' },
    rejected:    { bg: '#fef2f2', color: '#dc2626' },
  }

  return (
    <div className="rec-home page-enter">

      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="rec-hero">
        <div className="rec-hero__bg" />
        <div className="container rec-hero__content">
          <div className="rec-hero__left">
            <div className="rec-hero__badge">🏢 Recruiter Dashboard</div>
            <h1>
              Welcome back,<br />
              <span className="rec-hero__name">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p>Manage your job listings, review applications, and find the perfect candidates.</p>
            <div className="rec-hero__actions">
              <Link to="/post-job" className="btn btn-primary rec-hero__btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Post a New Job
              </Link>
              <Link to="/recruiter/applications" className="btn rec-hero__btn-outline">
                View Applications →
              </Link>
            </div>
          </div>
          <div className="rec-hero__right">
            <div className="rec-hero__card">
              <p className="rec-hero__card-label">This week</p>
              <div className="rec-hero__card-stat">
                <strong>{newThisWeek}</strong>
                <span>{newThisWeek === 0 ? 'No new applications' : newThisWeek === 1 ? 'New Application' : 'New Applications'}</span>
              </div>
              {recentApps.length > 0 && (
                <>
                  <div className="rec-hero__card-bar">
                    <div
                      className="rec-hero__card-fill"
                      style={{ width: `${Math.min(100, (newThisWeek / recentApps.length) * 100)}%` }}
                    />
                  </div>
                  <p className="rec-hero__card-sub">
                    {recentApps.length} total applications
                  </p>
                </>
              )}
              {recentApps.length === 0 && (
                <p className="rec-hero__card-sub" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Post a job to start receiving applications
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container rec-body">

        {/* ── STATS ────────────────────────────────────── */}
        <div className="rec-stats">
          {stats.map(stat => (
            <div
              key={stat.label}
              className="rec-stat-card"
              style={{ '--s-color': stat.color, '--s-bg': stat.bg }}
            >
              <div className="rec-stat-icon">{stat.icon}</div>
              <div className="rec-stat-body">
                <strong>{stat.value}</strong>
                <p>{stat.label}</p>
              </div>
              <span className="rec-stat-delta">{stat.delta}</span>
            </div>
          ))}
        </div>

        <div className="rec-grid">

          {/* ── ACTIVE JOBS ──────────────────────────── */}
          <div className="rec-card">
            <div className="rec-card__header">
              <h2>Active Job Posts</h2>
              <Link to="/post-job" className="rec-card__action">+ Post New</Link>
            </div>

            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading...
              </div>
            ) : postedJobs.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', marginBottom: '12px' }}>💼</p>
                <p style={{ fontWeight: 600, marginBottom: '6px' }}>No jobs posted yet</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Post your first job to start receiving applications
                </p>
                <Link to="/post-job" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                  Post a Job
                </Link>
              </div>
            ) : (
              <div className="rec-jobs-list">
                {postedJobs.slice(0, 4).map((job, i) => (
                  <div key={job.id} className="rec-job-row">
                    <div
                      className="rec-job-logo"
                      style={{ background: job.logo_color + '18', color: job.logo_color }}
                    >
                      {job.logo}
                    </div>
                    <div className="rec-job-info">
                      <strong>{job.title}</strong>
                      <span>{job.location} · {job.type}</span>
                    </div>
                    <div className="rec-job-meta">
                      <span className="rec-job-apps">
                        {job.application_count || 0} apps
                      </span>
                      <span
                        className="rec-job-status"
                        style={job.status === 'paused'
                          ? { background: '#fffbeb', color: '#d97706' }
                          : { background: '#ecfdf5', color: '#059669' }
                        }
                      >
                        {job.status === 'paused' ? 'Paused' : 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {postedJobs.length > 0 && (
              <Link to="/dashboard" className="rec-card__footer-link">
                View all posted jobs →
              </Link>
            )}
          </div>

          {/* ── RECENT APPLICATIONS ──────────────────── */}
          <div className="rec-card">
            <div className="rec-card__header">
              <h2>Recent Applications</h2>
              <Link to="/recruiter/applications" className="rec-card__action">View all</Link>
            </div>

            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading...
              </div>
            ) : recentApps.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</p>
                <p style={{ fontWeight: 600, marginBottom: '6px' }}>No applications yet</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Applications from candidates will appear here
                </p>
              </div>
            ) : (
              <div className="rec-apps-list">
                {recentApps.slice(0, 5).map((app, i) => {
                  const sc = STATUS_COLORS[app.status] || STATUS_COLORS.applied
                  return (
                    <div key={app.id} className="rec-app-row">
                      <div className="rec-app-avatar">
                        {app.applicant_avatar ? (
                          <img
                            src={app.applicant_avatar}
                            alt={app.applicant_name}
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          app.applicant_name?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="rec-app-info">
                        <strong>{app.applicant_name}</strong>
                        <span>{app.job_title}</span>
                      </div>
                      <div className="rec-app-meta">
                        <span
                          className="rec-app-status"
                          style={{ background: sc.bg, color: sc.color }}
                        >
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {recentApps.length > 0 && (
              <Link to="/recruiter/applications" className="rec-card__footer-link">
                View all applications →
              </Link>
            )}
          </div>
        </div>

        {/* ── QUICK ACTIONS ──────────────────────────── */}
        <div className="rec-quick-actions">
          <h2>Quick Actions</h2>
          <div className="rec-quick-grid">
            {[
              { icon: '📝', title: 'Post a Job', desc: 'Create a new listing and reach thousands of candidates', link: '/post-job', primary: true },
              { icon: '👥', title: 'Review Applications', desc: `${recentApps.filter(a => a.status === 'applied').length} new applications waiting for review`, link: '/recruiter/applications', primary: false },
              { icon: '📊', title: 'Full Dashboard', desc: 'Detailed analytics and job management', link: '/dashboard', primary: false },
              { icon: '🏢', title: 'Company Profile', desc: 'Update your company info to attract top talent', link: '/profile', primary: false },
            ].map(action => (
              <Link
                key={action.title}
                to={action.link}
                className={`rec-quick-card ${action.primary ? 'rec-quick-card--primary' : ''}`}
              >
                <span className="rec-quick-icon">{action.icon}</span>
                <h3>{action.title}</h3>
                <p>{action.desc}</p>
                <span className="rec-quick-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}