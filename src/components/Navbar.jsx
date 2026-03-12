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
        <Link to="/" className="navbar__logo"> 
          <img src={logo} alt="HireSphere" className="navbar__logo-img" />
          <span>Hire<strong>Sphere</strong></span>
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