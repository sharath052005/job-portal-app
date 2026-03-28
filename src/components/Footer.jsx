import { Link } from 'react-router-dom'
import '../styles/footer.css'
import logo from '../assets/logo.png'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <img src={logo} alt="HireSphere" className="navbar__logo-img" />
              <span className='title'>Hire<strong>Sphere</strong></span>
            </Link>
            <p>Your launchpad to the world's most exciting careers. Connecting talent with opportunity.</p>
            
          </div>

          {/* Links */}
          <div className="footer__col">
            <h4>For Job Seekers</h4>
            <Link to="/jobs">Browse Jobs</Link>
            <Link to="/jobs">Remote Jobs</Link>
            <Link to="/jobs">Internships</Link>
            <Link to="/signup">Create Profile</Link>
          </div>

          <div className="footer__col">
            <h4>For Employers</h4>
            <Link to="/post-job">Post a Job</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/signup">Employer Signup</Link>
            <a href="#">Pricing</a>
          </div>

          <div className="footer__col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 JobPortal, Inc. All rights reserved.</p>
          <div className="footer__legal">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}