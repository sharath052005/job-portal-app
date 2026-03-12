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
               Job Seeker
            </button>
            <button
              className={`auth-role-btn ${role === 'recruiter' ? 'active' : ''}`}
              onClick={() => setRole('recruiter')}
              type="button"
            >
               Recruiter
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