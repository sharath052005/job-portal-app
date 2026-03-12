import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import JobCard from '../components/JobCard'
import SearchBar from '../components/SearchBar'
import { JOBS } from '../data/jobs'
import '../styles/jobs.css'

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance']
const LOCATIONS = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Remote']
const EXPERIENCE = ['0-1 years', '1-3 years', '2-4 years', '3-5 years', '4-6 years', '6+ years']

export default function Jobs() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    type: [],
    remote: false,
    experience: '',
    location: '',
    salary: 200,
  })
  const [sort, setSort] = useState('latest')
  const [page, setPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const PER_PAGE = 6

  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''

  const filtered = useMemo(() => {
    return JOBS.filter(job => {
      if (query && !job.title.toLowerCase().includes(query.toLowerCase()) &&
          !job.company.toLowerCase().includes(query.toLowerCase())) return false
      if (category && job.category !== category) return false
      if (filters.remote && !job.remote) return false
      if (filters.type.length && !filters.type.includes(job.type)) return false
      if (filters.experience && job.experience !== filters.experience) return false
      if (filters.location && job.location !== filters.location) return false
      return true
    })
  }, [query, category, filters])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sort === 'latest') return a.id < b.id ? 1 : -1
      if (sort === 'salary') return a.salary < b.salary ? 1 : -1
      return 0
    })
  }, [filtered, sort])

  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(sorted.length / PER_PAGE)

  const toggleType = (type) => {
    setFilters(f => ({
      ...f,
      type: f.type.includes(type) ? f.type.filter(t => t !== type) : [...f.type, type]
    }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ type: [], remote: false, experience: '', location: '', salary: 200 })
    setPage(1)
  }

  return (
    <div className="jobs-page page-enter">
      {/* Top Bar */}
      <div className="jobs-topbar">
        <div className="container jobs-topbar__inner">
          <div>
            <h1 className="jobs-topbar__title">
              {category || 'All Jobs'}
              <span className="jobs-topbar__count">{sorted.length} results</span>
            </h1>
            {query && <p className="jobs-topbar__query">Showing results for "<strong>{query}</strong>"</p>}
          </div>
          <SearchBar compact />
        </div>
      </div>

      <div className="container jobs-layout">
        {/* Sidebar Toggle (Mobile) */}
        <button className="jobs-filter-toggle btn btn-outline" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Filters {filters.type.length + (filters.remote ? 1 : 0) + (filters.experience ? 1 : 0) > 0
            ? `(${filters.type.length + (filters.remote ? 1 : 0) + (filters.experience ? 1 : 0)})`
            : ''}
        </button>

        {/* Sidebar */}
        <aside className={`jobs-sidebar ${sidebarOpen ? 'jobs-sidebar--open' : ''}`}>
          <div className="jobs-sidebar__header">
            <h3>Filters</h3>
            <button className="jobs-sidebar__clear" onClick={clearFilters}>Clear all</button>
          </div>

          {/* Job Type */}
          <div className="filter-group">
            <h4 className="filter-group__title">Job Type</h4>
            <div className="filter-group__options">
              {JOB_TYPES.map(type => (
                <label key={type} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={() => toggleType(type)}
                  />
                  <span className="filter-checkbox__box" />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Remote */}
          <div className="filter-group">
            <h4 className="filter-group__title">Work Mode</h4>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.remote}
                onChange={e => { setFilters(f => ({ ...f, remote: e.target.checked })); setPage(1) }}
              />
              <span className="filter-checkbox__box" />
              <span>Remote Only</span>
            </label>
          </div>

          {/* Experience */}
          <div className="filter-group">
            <h4 className="filter-group__title">Experience Level</h4>
            <select
              className="filter-select"
              value={filters.experience}
              onChange={e => { setFilters(f => ({ ...f, experience: e.target.value })); setPage(1) }}
            >
              <option value="">Any experience</option>
              {EXPERIENCE.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* Location */}
          <div className="filter-group">
            <h4 className="filter-group__title">Location</h4>
            <select
              className="filter-select"
              value={filters.location}
              onChange={e => { setFilters(f => ({ ...f, location: e.target.value })); setPage(1) }}
            >
              <option value="">Any location</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Salary */}
          <div className="filter-group">
            <h4 className="filter-group__title">
              Max Salary
              <span className="filter-group__value">${filters.salary}k/yr</span>
            </h4>
            <input
              type="range"
              min="50"
              max="200"
              step="10"
              value={filters.salary}
              className="filter-range"
              onChange={e => { setFilters(f => ({ ...f, salary: e.target.value })); setPage(1) }}
            />
            <div className="filter-range__labels">
              <span>$50k</span>
              <span>$200k</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="jobs-main">
          {/* Sort Bar */}
          <div className="jobs-sortbar">
            <p className="jobs-sortbar__info">
              <strong>{sorted.length}</strong> jobs found
            </p>
            <div className="jobs-sortbar__controls">
              <label>Sort by:</label>
              <select className="filter-select filter-select--inline" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="latest">Most Recent</option>
                <option value="salary">Highest Salary</option>
              </select>
            </div>
          </div>

          {/* Job List */}
          {paginated.length === 0 ? (
            <div className="jobs-empty">
              <div className="jobs-empty__icon">🔍</div>
              <h3>No jobs found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="jobs-list">
              {paginated.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination__btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >← Prev</button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`pagination__btn ${p === page ? 'pagination__btn--active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

              <button
                className="pagination__btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}