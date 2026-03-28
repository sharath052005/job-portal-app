import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/navbar.css'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'
import { useRecruiter } from '../context/RecruiterContext'
import { getUnreadCountAPI } from '../api/chat'

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false)
  const [menuOpen, setMenuOpen]         = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location                        = useLocation()
  const { user, logout }                = useAuth()
  const dropdownRef                     = useRef(null)
  const [unreadCount, setUnreadCount]   = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close everything on route change
  useEffect(() => {
    setMenuOpen(false)
    setDropdownOpen(false)
  }, [location])

  useEffect(() => {
  if (user) {
    getUnreadCountAPI()
      .then(data => setUnreadCount(data.count || 0))
      .catch(() => {})
    // Poll every 30 seconds
    const interval = setInterval(() => {
      getUnreadCountAPI()
        .then(data => setUnreadCount(data.count || 0))
        .catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  } else {
    setUnreadCount(0)
  }
}, [user])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isActive = (path) => location.pathname === path

  const { isRecruiter } = useRecruiter()

  const handleLogout = async () => {
    setDropdownOpen(false)
    setMenuOpen(false)
    await logout()
  }

  const scrollTo = (id) => {
    setMenuOpen(false)
    if (window.location.pathname !== '/') {
      window.location.href = `/#${id}`
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* ── NAVBAR ────────────────────────────────────────── */}
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner container">

          {/* Logo */}
          <Link
            to="/"
            className="navbar__logo"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
          >
            <img src={logo} alt="HireSphere" className="navbar__logo-img" />
            <span className='title'>Hire<strong>Sphere</strong></span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="navbar__links">
            {isRecruiter ? (
              <>
                <li>
                  <Link to="/" className={isActive('/') ? 'active' : ''}>Dashboard</Link>
                </li>
                <li>
                  <Link to="/post-job" className={isActive('/post-job') ? 'active' : ''}>Post a Job</Link>
                </li>
                <li>
                  <Link to="/recruiter/applications" className={isActive('/recruiter/applications') ? 'active' : ''}>Applications</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/jobs" className={isActive('/jobs') ? 'active' : ''}>Find Jobs</Link>
                </li>
                <li>
                  <a href="#categories" onClick={(e) => { e.preventDefault(); scrollTo('categories') }}>
                    Categories
                  </a>
                </li>
                <li>
                  <a href="#companies" onClick={(e) => { e.preventDefault(); scrollTo('companies') }}>
                    Companies
                  </a>
                </li>
              </>
            )}
          </ul>

          {/* Desktop Auth */}
          <div className="navbar__auth">
            {user && (
              <Link to="/chat" className="navbar__chat-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="navbar__chat-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </Link>
            )}
            {user ? (
              <div className="navbar__profile" ref={dropdownRef}>
                <button
                  className="navbar__avatar-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="navbar__avatar-img" />
                  ) : (
                    <div className="navbar__avatar-letter">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <svg
                    className={`navbar__avatar-chevron ${dropdownOpen ? 'open' : ''}`}
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                  >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-user">
                      <div className="navbar__dropdown-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} />
                        ) : (
                          <div className="navbar__dropdown-avatar-letter">
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="navbar__dropdown-info">
                        <strong>{user.name?.toUpperCase()}</strong>
                        <span>{user.email}</span>
                        {isRecruiter && (
                          <span className="navbar__recruiter-badge">Recruiter</span>
                        )}
                      </div>
                    </div>

                    <div className="navbar__dropdown-divider" />

                    {isRecruiter ? (
                      <>
                        <Link to="/profile" className="navbar__dropdown-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Company Profile
                        </Link>
                        <Link to="/post-job" className="navbar__dropdown-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Post a Job
                        </Link>
                        <Link to="/recruiter/applications" className="navbar__dropdown-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          View Applications
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/profile" className="navbar__dropdown-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          View Profile
                        </Link>
                        <Link to="/bookmarks" className="navbar__dropdown-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          My Bookmarks
                        </Link>
                        <Link to="/applications" className="navbar__dropdown-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          My Applications
                        </Link>
                      </>
                    )}

                    <div className="navbar__dropdown-divider" />

                    <button className="navbar__dropdown-item navbar__dropdown-logout" onClick={handleLogout}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost navbar__login">Log in</Link>
                <Link to="/signup" className="btn btn-primary navbar__signup">Get Started</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* ── MOBILE OVERLAY ────────────────────────────────── */}
      {menuOpen && (
        <div className="navbar__overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* ── MOBILE SLIDE PANEL ────────────────────────────── */}
      <div className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}>

        {/* Close button */}
        <button className="navbar__mobile-close" onClick={() => setMenuOpen(false)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* User info OR guest buttons */}
        {user ? (
          <div className="navbar__mobile-profile">
            <div className="navbar__mobile-avatar">
              {user.avatar
                ? <img src={user.avatar} alt={user.name} />
                : <span>{user.name?.[0]?.toUpperCase()}</span>
              }
            </div>
            <div className="navbar__mobile-userinfo">
              <strong>{user.name?.toUpperCase()}</strong>
              <span>{user.email}</span>
            </div>
          </div>
        ) : (
          <div className="navbar__mobile-guest">
            <Link to="/login" className="btn btn-outline" onClick={() => setMenuOpen(false)}>Log in</Link>
            <Link to="/signup" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Get Started</Link>
          </div>
        )}

        <div className="navbar__mobile-divider" />

        {/* Main nav links */}
        <div className="navbar__mobile-section">
          <Link to="/jobs" className="navbar__mobile-item" onClick={() => setMenuOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.8"/>
            </svg>
            Find Jobs
          </Link>
          <button className="navbar__mobile-item" onClick={() => scrollTo('categories')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
            </svg>
            Categories
          </button>
          <button className="navbar__mobile-item" onClick={() => scrollTo('companies')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a3 3 0 016 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Companies
          </button>
        </div>

        {/* Logged-in only links */}
        {user && (
          <>
            <div className="navbar__mobile-divider" />
            <div className="navbar__mobile-section">
              {isRecruiter ? (
                <>
                  <Link to="/chat" className="navbar__mobile-item" onClick={() => setMenuOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Messages
                    {unreadCount > 0 && (
                      <span className="navbar__chat-badge" style={{ position: 'static', marginLeft: 'auto' }}>
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/profile" className="navbar__mobile-item" onClick={() => setMenuOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
                    </svg>
                    Company Profile
                  </Link>
                  <Link to="/post-job" className="navbar__mobile-item" onClick={() => setMenuOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                      <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    Post a Job
                  </Link>
                  <Link to="/recruiter/applications" className="navbar__mobile-item" onClick={() => setMenuOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    View Applications
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/profile" className="navbar__mobile-item" onClick={() => setMenuOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
                    </svg>
                    View Profile
                  </Link>
                  <Link to="/applications" className="navbar__mobile-item" onClick={() => setMenuOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    My Applications
                  </Link>
                  <Link to="/bookmarks" className="navbar__mobile-item" onClick={() => setMenuOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    My Bookmarks
                  </Link>
                </>
              )}
            </div>
            <div className="navbar__mobile-divider" />
            <div className="navbar__mobile-section">
              <button className="navbar__mobile-item navbar__mobile-item--logout" onClick={handleLogout}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}