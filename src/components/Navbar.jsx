import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 7H4C2.9 7 2 7.9 2 9V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="12" x2="12" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="10" y1="14" x2="14" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <span>Job<strong>Portal</strong></span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="navbar__links">
          <li><Link to="/jobs" className={isActive('/jobs') ? 'active' : ''}>Find Jobs</Link></li>
          <li><Link to="/#companies" className="">Companies</Link></li>
          <li><Link to="/#about" className="">About</Link></li>
          <li><Link to="/#contact" className="">Contact</Link></li>
        </ul>

        {/* Auth Buttons */}
        <div className="navbar__auth">
          <Link to="/login" className="btn btn-ghost navbar__login">Log in</Link>
          <Link to="/signup" className="btn btn-primary navbar__signup">Get Started</Link>
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

      {/* Mobile Menu */}
      <div className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}>
        <Link to="/jobs">Find Jobs</Link>
        <Link to="/#companies">Companies</Link>
        <Link to="/#about">About</Link>
        <Link to="/#contact">Contact</Link>
        <div className="navbar__mobile-auth">
          <Link to="/login" className="btn btn-outline">Log in</Link>
          <Link to="/signup" className="btn btn-primary">Get Started</Link>
        </div>
      </div>
    </nav>
  )
}