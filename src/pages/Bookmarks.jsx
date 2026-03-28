import { useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBookmarks } from '../context/BookmarkContext'
import { JOBS } from '../data/jobs'
import JobCard from '../components/JobCard'
import '../styles/bookmarks.css'

export default function Bookmarks() {
  const { user }       = useAuth()
  const { bookmarks }  = useBookmarks()
  const navigate       = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user])

  const savedJobs = JOBS.filter(j => bookmarks.includes(j.id))

  return (
    <div className="bookmarks-page page-enter">
      <div className="container">
        <div className="bookmarks-header">
          <div>
            <h1>My Bookmarks</h1>
            <p>{savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/jobs" className="btn btn-outline">Browse More Jobs</Link>
        </div>

        {savedJobs.length === 0 ? (
          <div className="bookmarks-empty">
            <div className="bookmarks-empty__icon">🔖</div>
            <h3>No saved jobs yet</h3>
            <p>Click the Save button on any job to bookmark it here.</p>
            <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
          </div>
        ) : (
          <div className="bookmarks-grid">
            {savedJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}