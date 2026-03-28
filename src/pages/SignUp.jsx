import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signupAPI, googleAuthURL } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import '../styles/auth.css'

export default function Signup() {
  const [role, setRole]       = useState('seeker')
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const { setUser }           = useAuth()
  const navigate              = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await signupAPI({ ...form, role })
      setUser(data.user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight: "128vh"}} className="auth-page page-enter">
      <div className="auth-side auth-side--right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1>Create your account</h1>
            <p>Start your journey to the perfect job</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="auth-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              {error}
            </div>
          )}

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

          {/* Google Sign Up */}
          <div className="auth-social">
            <a href={googleAuthURL} className="auth-social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </a>
          </div>

          <div className="auth-divider"><span>or sign up with email</span></div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="name">
                {role === 'recruiter' ? 'Company / Full Name' : 'Full Name'}
              </label>
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