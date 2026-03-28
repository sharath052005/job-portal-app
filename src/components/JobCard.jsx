import { Link } from 'react-router-dom'
import '../styles/jobcard.css'

export default function JobCard({ job, featured = false }) {
  return (
    <Link to={`/jobs/${job.id}`} className={`job-card ${featured ? 'job-card--featured' : ''}`}>

      {/* Top Row: Title + Logo */}
      <div className="job-card__top">
        <div className="job-card__title-block">
          <h3 className="job-card__title">{job.title}</h3>
          <div className="job-card__company-row">
            <span className="job-card__company">{job.company}</span>
            <span className="job-card__active-badge">
              <span className="job-card__active-dot" />
              Actively hiring
            </span>
          </div>
        </div>

        {/* Company Logo */}
        <div
          className="job-card__logo"
          style={{ background: job.logoColor + '15', color: job.logoColor }}
        >
          {job.logo}
        </div>
      </div>

      {/* Meta Row: Location, Salary, Experience, Work Mode */}
<div className="job-card__meta-row">
  <span className="job-card__meta-item">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
    </svg>
    {job.location}
  </span>

  <span className="job-card__meta-item">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
    </svg>
    {job.salary}
  </span>

  <span className="job-card__meta-item">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
    {job.experience}
  </span>

  {/* Work mode badge */}
  <span className={`job-card__work-mode ${
    (job.workMode || job.work_mode) === 'Remote'
      ? 'job-card__work-mode--remote'
      : (job.workMode || job.work_mode) === 'Hybrid'
      ? 'job-card__work-mode--hybrid'
      : 'job-card__work-mode--onsite'
  }`}>
    {(job.workMode || job.work_mode) === 'Remote' && (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9M3 12h18" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    )}
    {job.workMode || job.work_mode || 'On-site'}
  </span>
</div>

      {/* Skills — single line, truncated */}
      <div className="job-card__skills-row">
        <span className="job-card__skills-label">Skills:</span>
        <div className="job-card__skills-list">
          {job.skills.map((skill, i) => (
            <span key={skill} className="job-card__skill">
              {i > 0 && <span className="job-card__skill-dot">•</span>}
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Footer: Posted time only */}
      <div className="job-card__footer">
        <span className="job-card__posted-time">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {job.posted}
        </span>
      </div>

      {featured && <div className="job-card__featured-strip" />}
    </Link>
  )
}