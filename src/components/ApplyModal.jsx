import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { applyJobAPI } from '../api/applications'
import { getProfileAPI } from '../api/profile'
import '../styles/applymodal.css'

export default function ApplyModal({ job, onClose, onSuccess }) {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const fileInputRef = useRef(null)

  const [step, setStep]               = useState(1) // 1 = form, 2 = success
  const [profileResume, setProfileResume] = useState(null)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')
  const [customResumeFile, setCustomResumeFile] = useState(null)
  const [useCustomResume, setUseCustomResume]   = useState(false)

  const [form, setForm] = useState({
    availability:  'immediate',
    has_laptop:    true,
    work_weekends: true,
  })

  // Load user's profile resume
  useEffect(() => {
    if (user) {
      getProfileAPI()
        .then(data => setProfileResume(data.profile?.resume_url || null))
        .catch(() => {})
    }
  }, [user])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      setError('File size must be under 3MB')
      return
    }
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed')
      return
    }
    setError('')
    setCustomResumeFile(file)
    setUseCustomResume(true)
  }

  const handleSubmit = async () => {
    if (!user) { navigate('/login'); return }

    setSubmitting(true)
    setError('')

    try {
      let resumeUrl = profileResume

      // If custom resume selected, upload it first
      if (useCustomResume && customResumeFile) {
        const formData = new FormData()
        formData.append('resume', customResumeFile)
        const uploadRes = await fetch('http://localhost:5000/api/profile/resume', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })
        const uploadData = await uploadRes.json()
        if (uploadData.success) {
          resumeUrl = uploadData.resume_url
        }
      }

      await applyJobAPI({
        job_id:        job.id,
        availability:  form.availability,
        has_laptop:    form.has_laptop,
        work_weekends: form.work_weekends,
        resume_url:    resumeUrl,
      })

      setStep(2)
      if (onSuccess) onSuccess()

    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="apply-overlay" onClick={onClose}>
      <div className="apply-modal" onClick={e => e.stopPropagation()}>

        {step === 1 ? (
          <>
            {/* Header */}
            <div className="apply-modal__header">
              <div className="apply-modal__job-info">
                <div
                  className="apply-modal__job-logo"
                  style={{ background: job.logoColor + '18', color: job.logoColor }}
                >
                  {job.logo}
                </div>
                <div>
                  <h3>{job.title}</h3>
                  <p>{job.company} · {job.location}</p>
                </div>
              </div>
              <button className="apply-modal__close" onClick={onClose}>✕</button>
            </div>

            <div className="apply-modal__body">
              <h2 className="apply-modal__title">Apply Now</h2>

              {error && (
                <div className="apply-modal__error">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Resume section */}
              <div className="apply-section">
                <h4 className="apply-section__title">
                  Your Resume
                  {profileResume && (
                    <span className="apply-section__badge">· Updated recently</span>
                  )}
                </h4>

                {profileResume && !useCustomResume ? (
                  <div className="apply-resume-info">
                    <p>Your current resume will be submitted along with this application.</p>
                    <button
                      className="apply-link-btn"
                      onClick={() => setUseCustomResume(true)}
                    >
                      Use a different resume
                    </button>
                  </div>
                ) : (
                  <div className="apply-resume-info">
                    {!profileResume && (
                      <p className="apply-resume-warn">
                        ⚠️ You haven't uploaded a resume yet.
                      </p>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    {customResumeFile ? (
                      <div className="apply-custom-resume">
                        <div className="apply-custom-resume__icon">PDF</div>
                        <div className="apply-custom-resume__info">
                          <strong>{customResumeFile.name}</strong>
                          <span>{(customResumeFile.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <button
                          className="apply-custom-resume__remove"
                          onClick={() => {
                            setCustomResumeFile(null)
                            if (profileResume) setUseCustomResume(false)
                          }}
                        >✕</button>
                      </div>
                    ) : (
                      <button
                        className="apply-upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Upload Resume (PDF · Max 3MB)
                      </button>
                    )}
                    {profileResume && (
                      <button
                        className="apply-link-btn"
                        onClick={() => { setUseCustomResume(false); setCustomResumeFile(null) }}
                      >
                        Use my profile resume instead
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="apply-section">
                <h4 className="apply-section__title">Confirm your availability</h4>
                <div className="apply-radio-group">
                  <label className={`apply-radio ${form.availability === 'immediate' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="availability"
                      value="immediate"
                      checked={form.availability === 'immediate'}
                      onChange={() => setForm(f => ({ ...f, availability: 'immediate' }))}
                    />
                    <span className="apply-radio__dot" />
                    Yes, I am available to join immediately
                  </label>
                  <label className={`apply-radio ${form.availability === 'later' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="availability"
                      value="later"
                      checked={form.availability === 'later'}
                      onChange={() => setForm(f => ({ ...f, availability: 'later' }))}
                    />
                    <span className="apply-radio__dot" />
                    No (will join after notice period)
                  </label>
                </div>
              </div>

              {/* Additional questions */}
              <div className="apply-section">
                <h4 className="apply-section__title">Additional Questions</h4>

                {/* Laptop & Internet */}
                <p className="apply-question">Do you have a working laptop and internet?</p>
                <div className="apply-radio-group">
                  <label className={`apply-radio ${form.has_laptop ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="has_laptop"
                      checked={form.has_laptop === true}
                      onChange={() => setForm(f => ({ ...f, has_laptop: true }))}
                    />
                    <span className="apply-radio__dot" />
                    Yes
                  </label>
                  <label className={`apply-radio ${!form.has_laptop ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="has_laptop"
                      checked={form.has_laptop === false}
                      onChange={() => setForm(f => ({ ...f, has_laptop: false }))}
                    />
                    <span className="apply-radio__dot" />
                    No
                  </label>
                </div>

                {/* Weekends */}
                <p className="apply-question" style={{ marginTop: '16px' }}>
                  Are you available to work on weekends?
                </p>
                <div className="apply-radio-group">
                  <label className={`apply-radio ${form.work_weekends ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="work_weekends"
                      checked={form.work_weekends === true}
                      onChange={() => setForm(f => ({ ...f, work_weekends: true }))}
                    />
                    <span className="apply-radio__dot" />
                    Yes
                  </label>
                  <label className={`apply-radio ${!form.work_weekends ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="work_weekends"
                      checked={form.work_weekends === false}
                      onChange={() => setForm(f => ({ ...f, work_weekends: false }))}
                    />
                    <span className="apply-radio__dot" />
                    No
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="apply-modal__footer">
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button
                className="btn btn-primary apply-submit-btn"
                onClick={handleSubmit}
                disabled={submitting || (!profileResume && !customResumeFile)}
              >
                {submitting ? <span className="auth-spinner" /> : 'Submit Application'}
              </button>
            </div>
          </>
        ) : (
          /* Success state */
          <div className="apply-success">
            <button className="apply-modal__close apply-modal__close--success" onClick={onClose}>✕</button>
            <div className="apply-success__icon">🎉</div>
            <h2>Application Submitted!</h2>
            <p>
              Your application for <strong>{job.title}</strong> at{' '}
              <strong>{job.company}</strong> has been sent successfully.
            </p>
            <div className="apply-success__tips">
              <p>💡 <strong>What's next?</strong></p>
              <ul>
                <li>The recruiter will review your application</li>
                <li>You'll be notified if shortlisted</li>
                <li>Keep your profile updated for better chances</li>
              </ul>
            </div>
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}