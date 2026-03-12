import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/auth.css'

export default function Signup() {
  const [role, setRole] = useState('seeker')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 1500)
  }

  return (
    <div className="auth-page page-enter">
      <div className="auth-side auth-side--left auth-side--signup">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 7H4C2.9 7 2 7.9 2 9V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7Z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="12" x2="12" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="10" y1="14" x2="14" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            Job<strong>Portal</strong>
          </Link>
          <div className="auth-perks">
            {[
              { icon: '🔍', title: 'Find faster', desc: 'AI-powered job matching to your skills' },
              { icon: '🚀', title: 'Apply instantly', desc: 'One-click apply to top companies' },
              { icon: '📬', title: 'Get notified', desc: 'Real-time alerts for new openings' },
              { icon: '🌐', title: 'Work anywhere', desc: 'Access thousands of remote roles' },
            ].map(p => (
              <div key={p.title} className="auth-perk">
                <span className="auth-perk__icon">{p.icon}</span>
                <div>
                  <strong>{p.title}</strong>
                  <p>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-side auth-side--right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1>Create your account</h1>
            <p>Start your journey to the perfect job</p>
          </div>

          {/* Role Selector */}
          <div className="auth-role-selector">
            <button
              className={`auth-role-btn ${role === 'seeker' ? 'active' : ''}`}
              onClick={() => setRole('seeker')}
              type="button"
            >
              <span>🎯</span> Job Seeker
            </button>
            <button
              className={`auth-role-btn ${role === 'recruiter' ? 'active' : ''}`}
              onClick={() => setRole('recruiter')}
              type="button"
            >
              <span>🏢</span> Recruiter
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="name">{role === 'recruiter' ? 'Company / Full Name' : 'Full Name'}</label>
              <input
                id="name"
                type="text"
                placeholder={role === 'recruiter' ? 'Acme Corp or John Smith' : 'Your full name'}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
              />
            </div>

            <p className="auth-terms">
              By creating an account, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : `Create ${role === 'recruiter' ? 'Recruiter' : ''} Account →`}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}