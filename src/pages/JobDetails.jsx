import { useParams, Link } from 'react-router-dom'
import { JOBS } from '../data/jobs'
import '../styles/jobdetails.css'

export default function JobDetails() {
  const { id } = useParams()
  const job = JOBS.find(j => j.id === Number(id))

  if (!job) {
    return (
      <div className="not-found page-enter">
        <div className="container">
          <h2>Job not found</h2>
          <Link to="/jobs" className="btn btn-primary">← Back to Jobs</Link>
        </div>
      </div>
    )
  }

  const related = JOBS.filter(j => j.category === job.category && j.id !== job.id).slice(0, 3)

  return (
    <div className="job-details page-enter">
      {/* Header */}
      <div className="jd-header">
        <div className="container">
          <Link to="/jobs" className="jd-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Jobs
          </Link>

          <div className="jd-hero">
            <div className="jd-hero__left">
              <div
                className="jd-company-logo"
                style={{ background: job.logoColor + '18', color: job.logoColor }}
              >
                {job.logo}
              </div>
              <div>
                <h1 className="jd-title">{job.title}</h1>
                <div className="jd-meta">
                  <span className="jd-company">{job.company}</span>
                  <span className="jd-meta__dot">·</span>
                  <span className="jd-location">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                    </svg>
                    {job.location}
                  </span>
                  <span className="jd-meta__dot">·</span>
                  <span className="jd-posted">Posted {job.posted}</span>
                </div>
                <div className="jd-tags">
                  <span className={`tag ${job.remote ? 'tag-green' : 'tag-blue'}`}>
                    {job.remote ? '🌐 Remote' : '🏢 On-site'}
                  </span>
                  <span className="tag tag-blue">{job.type}</span>
                  <span className="tag tag-purple">{job.experience}</span>
                  <span className="tag tag-amber">{job.category}</span>
                </div>
              </div>
            </div>

            <div className="jd-hero__right">
              <div className="jd-salary">
                <p className="jd-salary__label">Annual Salary</p>
                <strong className="jd-salary__value">{job.salary}</strong>
              </div>
              <button className="btn btn-primary jd-apply-btn">Apply Now →</button>
              <button className="jd-save-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container jd-body">
        <div className="jd-content">
          {/* Overview */}
          <section className="jd-section">
            <h2 className="jd-section__title">About the Role</h2>
            <p className="jd-section__text">{job.description}</p>
          </section>

          {/* Responsibilities */}
          <section className="jd-section">
            <h2 className="jd-section__title">What You'll Do</h2>
            <ul className="jd-list">
              {job.responsibilities.map((r, i) => (
                <li key={i}>
                  <span className="jd-list__check">✓</span>
                  {r}
                </li>
              ))}
            </ul>
          </section>

          {/* Requirements */}
          <section className="jd-section">
            <h2 className="jd-section__title">Requirements</h2>
            <ul className="jd-list">
              {job.requirements.map((r, i) => (
                <li key={i}>
                  <span className="jd-list__dot" />
                  {r}
                </li>
              ))}
            </ul>
          </section>

          {/* Skills */}
          <section className="jd-section">
            <h2 className="jd-section__title">Skills & Technologies</h2>
            <div className="jd-skills">
              {job.skills.map(s => (
                <span key={s} className="jd-skill-tag">{s}</span>
              ))}
            </div>
          </section>

          {/* Apply Box (mobile) */}
          <div className="jd-apply-mobile">
            <button className="btn btn-primary jd-apply-btn">Apply Now →</button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="jd-sidebar">
          {/* Quick Info */}
          <div className="jd-card">
            <h3>Job Overview</h3>
            {[
              { label: 'Job Type', value: job.type, icon: '💼' },
              { label: 'Location', value: job.location, icon: '📍' },
              { label: 'Experience', value: job.experience, icon: '📈' },
              { label: 'Salary', value: job.salary, icon: '💰' },
              { label: 'Category', value: job.category, icon: '🏷️' },
            ].map(item => (
              <div key={item.label} className="jd-info-row">
                <span className="jd-info-icon">{item.icon}</span>
                <div>
                  <p className="jd-info-label">{item.label}</p>
                  <p className="jd-info-value">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Apply Card */}
          <div className="jd-card jd-card--apply">
            <h3>Ready to Apply?</h3>
            <p>Submit your application now and take the next step in your career.</p>
            <button className="btn btn-primary">Apply for this Job</button>
            <button className="btn btn-ghost">Save for Later</button>
          </div>

          {/* Related jobs */}
          {related.length > 0 && (
            <div className="jd-card">
              <h3>Similar Roles</h3>
              <div className="jd-related">
                {related.map(j => (
                  <Link key={j.id} to={`/jobs/${j.id}`} className="jd-related-item">
                    <div
                      className="jd-related-logo"
                      style={{ background: j.logoColor + '18', color: j.logoColor }}
                    >
                      {j.logo}
                    </div>
                    <div>
                      <strong>{j.title}</strong>
                      <span>{j.company} · {j.location}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}