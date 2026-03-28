import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getRecruiterAppsAPI, updateAppStatusAPI } from '../../api/applications'
import '../../styles/recruiterapps.css'
import { startConversationAPI } from '../../api/chat'

const STATUS_CONFIG = {
  applied:     { label: 'New',          color: '#2563EB', bg: '#eff6ff', border: '#bfdbfe' },
  reviewing:   { label: 'Reviewing',    color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  shortlisted: { label: 'Shortlisted',  color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  rejected:    { label: 'Not Selected', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
}

export default function RecruiterApplications() {
  const { user }                  = useAuth()
  const [apps, setApps]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [jobFilter, setJobFilter] = useState('all')
  const [selected, setSelected]   = useState(null)
  const [updating, setUpdating]   = useState(null)
  const [startChatApp, setStartChatApp] = useState(null)
const [chatMessage, setChatMessage]   = useState('')
const [chatSending, setChatSending]   = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const data = await getRecruiterAppsAPI()
      setApps(data.applications || [])
    } catch (err) {
      console.error(err)
      setApps([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (appId, newStatus) => {
    setUpdating(appId)
    try {
      await updateAppStatusAPI(appId, newStatus)
      // Update local state immediately
      setApps(prev => prev.map(a =>
        a.id === appId ? { ...a, status: newStatus } : a
      ))
      // Update selected panel if open
      if (selected?.id === appId) {
        setSelected(prev => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      console.error(err)
      alert('Failed to update status. Please try again.')
    } finally {
      setUpdating(null)
    }
  }

  const handleStartChat = async () => {
  if (!chatMessage.trim()) return
  setChatSending(true)
  try {
    const data = await startConversationAPI({
      seeker_id:       startChatApp.user_id,
      job_id:          startChatApp.job_id,
      application_id:  startChatApp.id,
      initial_message: chatMessage,
    })
    setStartChatApp(null)
    setChatMessage('')
    alert('Chat started! The candidate will be notified.')
  } catch (err) {
    alert(err.message)
  } finally {
    setChatSending(false)
  }
}

  // Get unique jobs for filter dropdown
  const uniqueJobs = apps.reduce((acc, app) => {
    if (!acc.find(j => j.id === app.job_id)) {
      acc.push({ id: app.job_id, title: app.job_title, company: app.job_company })
    }
    return acc
  }, [])

  const filtered = apps
    .filter(a => filter === 'all' || a.status === filter)
    .filter(a => jobFilter === 'all' || String(a.job_id) === jobFilter)

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  if (loading) return (
    <div className="apps-loading">
      <div className="profile-spinner" />
    </div>
  )

  return (
    <div className="rec-apps-page page-enter">
      <div className="container">

        {/* Header */}
        <div className="rec-apps-header">
          <div>
            <h1>Applications Received</h1>
            <p>
              {apps.length} total ·{' '}
              {apps.filter(a => a.status === 'applied').length} new
            </p>
          </div>
          <Link to="/post-job" className="btn btn-primary">+ Post a Job</Link>
        </div>

        {/* Stats */}
        <div className="rec-apps-stats">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div
              key={key}
              className={`rec-apps-stat ${filter === key ? 'active' : ''}`}
              style={{ '--c': cfg.color, '--b': cfg.bg }}
              onClick={() => setFilter(filter === key ? 'all' : key)}
            >
              <strong>{apps.filter(a => a.status === key).length}</strong>
              <span>{cfg.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rec-apps-filters">
          <div className="rec-apps-filter-row">
            {/* Status tabs */}
            <div className="apps-filters">
              {[
                { key: 'all',         label: 'All' },
                { key: 'applied',     label: 'New' },
                { key: 'reviewing',   label: 'Reviewing' },
                { key: 'shortlisted', label: 'Shortlisted' },
                { key: 'rejected',    label: 'Rejected' },
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

            {/* Job filter */}
            {uniqueJobs.length > 0 && (
              <select
                className="filter-select rec-job-select"
                value={jobFilter}
                onChange={e => setJobFilter(e.target.value)}
              >
                <option value="all">All Jobs</option>
                {uniqueJobs.map(j => (
                  <option key={j.id} value={String(j.id)}>
                    {j.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Applications list */}
        {filtered.length === 0 ? (
          <div className="apps-empty">
            <div className="apps-empty__icon">
              {apps.length === 0 ? '📭' : '🔍'}
            </div>
            <h3>
              {apps.length === 0
                ? 'No applications yet'
                : 'No applications match this filter'}
            </h3>
            <p>
              {apps.length === 0
                ? 'Applications will appear here once candidates apply to your jobs.'
                : 'Try selecting a different filter.'}
            </p>
            {apps.length === 0 && (
              <Link to="/post-job" className="btn btn-primary">
                Post a Job
              </Link>
            )}
          </div>
        ) : (
          <div className="rec-apps-list">
            {filtered.map(app => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
              return (
                <div key={app.id} className="rec-app-card">

                  {/* Left: applicant info */}
                  <div className="rec-app-card__left">
                    <div className="rec-app-card__avatar">
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

                    <div className="rec-app-card__info">
                      <h3>{app.applicant_name}</h3>
                      <p className="rec-app-card__job">
                        Applied for{' '}
                        <strong
                          style={{
                            color: app.job_logo_color,
                            background: app.job_logo_color + '15',
                            padding: '1px 8px',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                          }}
                        >
                          {app.job_title}
                        </strong>
                        {' · '}{app.job_company}
                      </p>

                      <div className="rec-app-card__details">
                        <span>
                          📅 {formatDate(app.applied_at)}
                        </span>
                        <span>
                          {app.availability === 'immediate'
                            ? '✅ Immediate joiner'
                            : '⏳ Notice period'}
                        </span>
                        <span>
                          {app.has_laptop ? '💻 Has laptop' : '❌ No laptop'}
                        </span>
                        <span>
                          {app.work_weekends ? '📅 Available weekends' : '🚫 No weekends'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: status + actions */}
                  <div className="rec-app-card__right">
                    <div
                      className="app-status-badge"
                      style={{
                        background: cfg.bg,
                        color: cfg.color,
                        border: `1px solid ${cfg.border}`,
                      }}
                    >
                      {cfg.label}
                    </div>

                    <div className="rec-app-card__actions">
                      {/* Status dropdown */}
                      <select
                        className="filter-select rec-status-select"
                        value={app.status}
                        disabled={updating === app.id}
                        onChange={e => handleStatusChange(app.id, e.target.value)}
                      >
                        <option value="applied">Mark: New</option>
                        <option value="reviewing">Mark: Reviewing</option>
                        <option value="shortlisted">Mark: Shortlist</option>
                        <option value="rejected">Mark: Reject</option>
                      </select>

                      {app.resume_url && (
                        
                        <a  href={app.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline rec-app-btn"
                        >
                          Resume
                        </a>
                      )}

                      <button
                        className="btn btn-primary rec-app-btn"
                        onClick={() => setSelected(app)}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── DETAIL SLIDE PANEL ──────────────────────────────── */}
      {selected && (
        <div className="rec-detail-overlay" onClick={() => setSelected(null)}>
          <div className="rec-detail-panel" onClick={e => e.stopPropagation()}>
            <div className="rec-detail-header">
              <h3>Applicant Details</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="rec-detail-body">
              {/* Applicant top */}
              <div className="rec-detail-top">
                <div className="rec-app-card__avatar rec-detail-avatar">
                  {selected.applicant_avatar ? (
                    <img
                      src={selected.applicant_avatar}
                      alt={selected.applicant_name}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    selected.applicant_name?.[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <h2>{selected.applicant_name}</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {selected.applicant_email}
                  </p>
                </div>
              </div>

              {/* Application details */}
              <div className="rec-detail-section">
                <h4>Application Details</h4>
                <div className="rec-detail-grid">
                  {[
                    { label: 'Applied On',       value: formatDate(selected.applied_at) },
                    { label: 'Availability',      value: selected.availability === 'immediate' ? '✅ Immediate joiner' : '⏳ Notice period' },
                    { label: 'Laptop & Internet', value: selected.has_laptop ? '✅ Yes' : '❌ No' },
                    { label: 'Work Weekends',     value: selected.work_weekends ? '✅ Yes' : '❌ No' },
                    { label: 'Current Status',    value: STATUS_CONFIG[selected.status]?.label },
                  ].map(item => (
                    <div key={item.label} className="rec-detail-item">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job applied for */}
              <div className="rec-detail-section">
                <h4>Job Applied For</h4>
                <div className="rec-detail-job">
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: selected.job_logo_color + '18',
                      color: selected.job_logo_color,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 800,
                      fontFamily: 'var(--font-display)', flexShrink: 0,
                      fontSize: '1.1rem',
                    }}
                  >
                    {selected.job_logo}
                  </div>
                  <div>
                    <strong>{selected.job_title}</strong>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {selected.job_company} · {selected.job_location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resume */}
              {selected.resume_url && (
                <div className="rec-detail-section">
                  <h4>Resume</h4>
                  
                  <a  href={selected.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    📄 View Resume
                  </a>
                </div>
              )}

              {/* Action buttons */}
              <div className="rec-detail-actions">
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={updating === selected.id}
                  onClick={() => handleStatusChange(selected.id, 'shortlisted')}
                >
                  ⭐ Shortlist
                </button>
                {selected?.status === 'shortlisted' && (
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setStartChatApp(selected)
                      setSelected(null)
                    }}
                  >
                    💬 Start Chat
                  </button>
                )}
                <button
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  disabled={updating === selected.id}
                  onClick={() => handleStatusChange(selected.id, 'reviewing')}
                >
                  🔍 Mark Reviewing
                </button>
                <button
                  className="btn"
                  style={{
                    flex: 1,
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: 'var(--radius-full)',
                  }}
                  disabled={updating === selected.id}
                  onClick={() => handleStatusChange(selected.id, 'rejected')}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {startChatApp && (
      <div className="modal-overlay" onClick={() => setStartChatApp(null)}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Start Conversation with {startChatApp.applicant_name}</h3>
            <button className="modal-close" onClick={() => setStartChatApp(null)}>✕</button>
          </div>
          <div className="modal-body">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              You're reaching out to <strong>{startChatApp.applicant_name}</strong> regarding the{' '}
              <strong>{startChatApp.job_title}</strong> position.
            </p>
            <div className="modal-field">
              <label>Your message</label>
              <textarea
                rows={4}
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                placeholder="Hi! We've reviewed your application and would like to discuss the next steps..."
                autoFocus
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setStartChatApp(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleStartChat} disabled={chatSending || !chatMessage.trim()}>
              {chatSending ? <span className="auth-spinner" /> : '💬 Send & Start Chat'}
            </button>
          </div>
        </div>
      </div>
      )}

    </div>
  )
}