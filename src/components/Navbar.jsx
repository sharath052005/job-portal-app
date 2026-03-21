import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/navbar.css'
import logo from '../assets/logo.png'

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
        <Link
          to="/"
          className="navbar__logo"
          onClick={(e) => {
            // If already on home page, smooth scroll to top instead of re-navigating
            if (window.location.pathname === '/') {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
        >
          <img src={logo} alt="HireSphere" className="navbar__logo-img" />
          <span>Hire<strong>Sphere</strong></span>
        </Link>

        {/* Desktop Nav Links */}
<ul className="navbar__links">
  <li><Link to="/jobs" className={isActive('/jobs') ? 'active' : ''}>Find Jobs</Link></li>
  <li>
      <a href="#categories"
      onClick={(e) => {
        e.preventDefault()
        if (window.location.pathname !== '/') {
          window.location.href = '/#categories'
        } else {
          document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
        }
      }}
    >
      Categories
    </a>
  </li>
  <li>
    
      <a href="#companies"
      onClick={(e) => {
        e.preventDefault()
        if (window.location.pathname !== '/') {
          window.location.href = '/#companies'
        } else {
          document.getElementById('companies')?.scrollIntoView({ behavior: 'smooth' })
        }
      }}
    >
      Companies
    </a>
  </li>
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
        <a href="#categories"
          onClick={(e) => {
            e.preventDefault()
            setMenuOpen(false)
            if (window.location.pathname !== '/') {
              window.location.href = '/#categories'
            } else {
              document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        >
          Categories
        </a>
        <a href="#companies"
          onClick={(e) => {
            e.preventDefault()
            setMenuOpen(false)
            if (window.location.pathname !== '/') {
              window.location.href = '/#companies'
            } else {
              document.getElementById('companies')?.scrollIntoView({ behavior: 'smooth' })
            }
          }}
        >
          Companies
        </a>
        <div className="navbar__mobile-auth">
          <Link to="/login" className="btn btn-outline">Log in</Link>
          <Link to="/signup" className="btn btn-primary">Get Started</Link>
        </div>
      </div>
    </nav>
  )
}