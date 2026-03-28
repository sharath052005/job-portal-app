import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/searchbar.css'

export default function SearchBar({ compact = false }) {
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/jobs?q=${keyword}&loc=${location}`)
  }

  return (
    <form className={`searchbar ${compact ? 'searchbar--compact' : ''}`} onSubmit={handleSearch}>
      <div className="searchbar__field">
        <svg className="searchbar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          placeholder="Job title, keywords, or company"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
      </div>

      <div className="searchbar__divider" />

      <div className="searchbar__field">
        <svg className="searchbar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
        </svg>
        <input
          type="text"
          placeholder="City, state, or remote"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />
      </div>

      <button type="submit" className="searchbar__btn btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2.5"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        {!compact && 'Search Jobs'}
      </button>
    </form>
  )
}