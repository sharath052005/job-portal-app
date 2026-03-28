import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { JOBS } from '../data/jobs'
import '../styles/dashboard.css'
import { getMyJobsAPI } from '../api/jobs'

const MOCK_APPS = [
  { id: 1, jobId: 1, applicant: 'Sarah Chen', role: 'Senior Frontend Engineer', status: 'reviewing', date: '2 days ago', avatar: 'SC' },
  { id: 2, jobId: 2, applicant: 'Marcus Rivera', role: 'Product Designer', status: 'shortlisted', date: '1 day ago', avatar: 'MR' },
  { id: 3, jobId: 1, applicant: 'Aisha Patel', role: 'Senior Frontend Engineer', status: 'new', date: '3 hours ago', avatar: 'AP' },
  { id: 4, jobId: 3, applicant: 'James Wu', role: 'Data Scientist', status: 'rejected', date: '4 days ago', avatar: 'JW' },
  { id: 5, jobId: 2, applicant: 'Emily Torres', role: 'Product Designer', status: 'shortlisted', date: '5 days ago', avatar: 'ET' },
]

const STATUS_CONFIG = {
  new: { label: 'New', class: 'tag-blue' },
  reviewing: { label: 'Reviewing', class: 'tag-amber' },
  shortlisted: { label: 'Shortlisted', class: 'tag-green' },
  rejected: { label: 'Rejected', class: 'tag-pink' },
}

const STATS = [
  { label: 'Active Jobs', value: '5', icon: '💼', color: '#2563EB', bg: '#eff6ff', delta: '+2 this week' },
  { label: 'Total Applications', value: '84', icon: '📋', color: '#7c3aed', bg: '#f5f3ff', delta: '+12 today' },
  { label: 'Shortlisted', value: '18', icon: '⭐', color: '#d97706', bg: '#fffbeb', delta: '+3 today' },
  { label: 'Hires Made', value: '6', icon: '🎉', color: '#059669', bg: '#ecfdf5', delta: 'All time' },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  
  const [postedJobs, setPostedJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(true)

  useEffect(() => {
    getMyJobsAPI()
      .then(data => setPostedJobs(data.jobs || []))
      .catch(() => setPostedJobs([]))
      .finally(() => setJobsLoading(false))
  }, [])

  return (
    <div className="dashboard page-enter">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar__profile">
          <div className="dash-avatar">S</div>
          <div>
            <strong>Stripe Inc.</strong>
            <p>Recruiter Account</p>
          </div>
        </div>

        <nav className="dash-nav">
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'jobs', icon: '💼', label: 'Posted Jobs' },
            { id: 'applications', icon: '📋', label: 'Applications' },
            { id: 'shortlisted', icon: '⭐', label: 'Shortlisted' },
          ].map(item => (
            <button
              key={item.id}
              className={`dash-nav__item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <Link to="/post-job" className="btn btn-primary dash-post-btn">
          + Post New Job
        </Link>
      </aside>

      {/* Main */}
      <main className="dash-main">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-header__title">Recruiter Dashboard</h1>
            <p className="dash-header__sub">Welcome back, Stripe Inc.!</p>
          </div>
          <Link to="/post-job" className="btn btn-primary dash-header-btn">
            + Post a Job
          </Link>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          {STATS.map(stat => (
            <div key={stat.label} className="dash-stat-card" style={{ '--stat-color': stat.color, '--stat-bg': stat.bg }}>
              <div className="dash-stat-card__icon">{stat.icon}</div>
              <div className="dash-stat-card__body">
                <strong>{stat.value}</strong>
                <p>{stat.label}</p>
              </div>
              <span className="dash-stat-card__delta">{stat.delta}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          {['overview', 'jobs', 'applications'].map(tab => (
            <button
              key={tab}
              className={`dash-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Posted Jobs Table */}
        {(activeTab === 'overview' || activeTab === 'jobs') && (
          <div className="dash-card">
            <div className="dash-card__header">
              <h2>Posted Jobs</h2>
              <Link to="/post-job" className="btn btn-outline" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>+ New</Link>
            </div>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Apps</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {postedJobs.map((job, i) => (
                    <tr key={job.id}>
                      <td>
                        <div className="dash-job-cell">
                          <div className="dash-job-logo" style={{ background: job.logoColor + '18', color: job.logoColor }}>
                            {job.logo}
                          </div>
                          <div>
                            <strong>{job.title}</strong>
                            <span>{job.posted}</span>
                          </div>
                        </div>
                      </td>
                      <td>{job.location}</td>
                      <td><span className="tag tag-blue">{job.type}</span></td>
                      <td><strong>{Math.floor(Math.random() * 30) + 5}</strong></td>
                      <td>
                        <span className={`tag ${i % 3 === 0 ? 'tag-amber' : 'tag-green'}`}>
                          {i % 3 === 0 ? 'Paused' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="dash-actions">
                          <Link to={`/jobs/${job.id}`} className="dash-action-btn">View</Link>
                          <button className="dash-action-btn">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Applications */}
        {(activeTab === 'overview' || activeTab === 'applications') && (
          <div className="dash-card" style={{ marginTop: '24px' }}>
            <div className="dash-card__header">
              <h2>Recent Applications</h2>
              <span className="tag tag-blue">{MOCK_APPS.length} total</span>
            </div>
            <div className="dash-apps">
              {MOCK_APPS.map(app => (
                <div key={app.id} className="dash-app-row">
                  <div className="dash-app-avatar">{app.avatar}</div>
                  <div className="dash-app-info">
                    <strong>{app.applicant}</strong>
                    <p>Applied for {app.role}</p>
                  </div>
                  <span className="dash-app-date">{app.date}</span>
                  <span className={`tag ${STATUS_CONFIG[app.status].class}`}>
                    {STATUS_CONFIG[app.status].label}
                  </span>
                  <div className="dash-actions">
                    <button className="dash-action-btn">View CV</button>
                    <button className="dash-action-btn dash-action-btn--primary">Shortlist</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}