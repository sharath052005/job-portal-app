import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import CategoryCard from '../components/CategoryCard'
import JobCard from '../components/JobCard'
import { JOBS, CATEGORIES, COMPANIES } from '../data/jobs'
import '../styles/home.css'

const STATS = [
  { value: '50K+', label: 'Active Jobs' },
  { value: '10K+', label: 'Companies' },
  { value: '2M+', label: 'Job Seekers' },
  { value: '500K+', label: 'Hires Made' },
]

export default function Home() {
  const featuredJobs = JOBS.filter(j => j.featured).slice(0, 4)
  const latestJobs = JOBS.slice(0, 6)

  return (
    <div className="home page-enter">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__blob hero__blob--1" />
          <div className="hero__blob hero__blob--2" />
          <div className="hero__grid" />
        </div>

        <div className="container hero__content">
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            🎉 Over 10,000 new jobs this month
          </div>

          <h1 className="hero__title">
            Find Your<br />
            <span className="hero__title-highlight">Dream Job</span><br />
            Today
          </h1>

          <p className="hero__subtitle">
            Connect with top companies, discover remote opportunities,<br className="desktop-br" />
            and land the role that changes everything.
          </p>

          <div className="hero__search">
            <SearchBar />
          </div>
        </div>

        {/* Stats */}
        <div className="hero__stats">
          <div className="container">
            <div className="stats-grid">
              {STATS.map(stat => (
                <div key={stat.label} className="stat-item">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section" id="categories">
        <div className="container">
          <div className="section__header">
            <div>
              <p className="section__label">Explore by field</p>
              <h2 className="section__title">Browse Job Categories</h2>
            </div>
            <Link to="/jobs" className="btn btn-outline">View all categories →</Link>
          </div>

          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <CategoryCard key={cat.name} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="section section--alt">
        <div className="container">
          <div className="section__header">
            <div>
              <p className="section__label">Handpicked for you</p>
              <h2 className="section__title">Featured Opportunities</h2>
            </div>
            <Link to="/jobs" className="btn btn-outline">See all jobs →</Link>
          </div>

          <div className="jobs-grid">
            {featuredJobs.map(job => (
              <JobCard key={job.id} job={job} featured />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <div>
              <p className="section__label">Fresh listings</p>
              <h2 className="section__title">Latest Jobs</h2>
            </div>
            <Link to="/jobs" className="btn btn-outline">Browse all →</Link>
          </div>

          <div className="jobs-grid">
            {latestJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* Companies */}
      <section className="section section--alt" id="companies">
        <div className="container">
          <div className="section__header" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <p className="section__label">Hiring now</p>
              <h2 className="section__title">Top Companies Hiring</h2>
              <p className="section__desc">Join thousands of companies building their teams with HireSphere</p>
            </div>
          </div>
          <div className="companies-grid">
            {COMPANIES.map(c => (
              <div key={c.name} className="company-pill">
                <div className="company-pill__logo">{c.name[0]}</div>
                <div>
                  <strong>{c.name}</strong>
                  <span>{c.jobs} open roles</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-banner__inner">
            <div className="cta-banner__content">
              <h2>Ready to hire top talent?</h2>
              <p>Post your first job for free and reach millions of qualified candidates.</p>
            </div>
            <div className="cta-banner__actions">
              <Link to="/post-job" className="btn btn-primary cta-banner__btn">Post a Job</Link>
              <Link to="/signup" className="btn cta-banner__btn-outline">Learn more</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}