import { Link } from 'react-router-dom'
import '../styles/jobcard.css'

export default function JobCard({ job, featured = false }) {
  return (
    <Link to={`/jobs/${job.id}`} className={`job-card ${featured ? 'job-card--featured' : ''}`}>
      {/* Header */}
      <div className="job-card__header">
        {/* Company Logo */}
        <div
          className="job-card__logo"
          style={{ background: job.logoColor + '18', color: job.logoColor }}
        >
          {job.logo}
        </div>

        <div className="job-card__meta">
          <span className="job-card__company">{job.company}</span>
          <span className="job-card__location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
            </svg>
            {job.location}
          </span>
        </div>

        <span className="job-card__posted">{job.posted}</span>
      </div>

      {/* Title */}
      <h3 className="job-card__title">{job.title}</h3>

      {/* Tags */}
      <div className="job-card__tags">
        <span className={`tag ${job.remote ? 'tag-green' : 'tag-blue'}`}>
          {job.remote ? '🌐 Remote' : '🏢 On-site'}
        </span>
        <span className="tag tag-blue">{job.type}</span>
        <span className="tag tag-purple">{job.experience}</span>
      </div>

      {/* Footer */}
      <div className="job-card__footer">
        <span className="job-card__salary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 6v2M12 16v2M9 9h4.5a1.5 1.5 0 010 3H9m0 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {job.salary}
        </span>
        <span className="job-card__cta">View Job →</span>
      </div>

      {featured && <div className="job-card__featured-badge">Featured</div>}
    </Link>
  )
}