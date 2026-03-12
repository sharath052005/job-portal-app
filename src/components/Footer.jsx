import { Link } from 'react-router-dom'
import '../styles/footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 7H4C2.9 7 2 7.9 2 9V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7Z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="12" y1="12" x2="12" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="10" y1="14" x2="14" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              Job<strong>Portal</strong>
            </Link>
            <p>Your launchpad to the world's most exciting careers. Connecting talent with opportunity.</p>
            <div className="footer__social">
              {['Twitter', 'LinkedIn', 'GitHub'].map(s => (
                <a key={s} href="#" className="footer__social-link">{s[0]}</a>
              ))}
            </div>
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
          <p>© 2024 JobPortal, Inc. All rights reserved.</p>
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