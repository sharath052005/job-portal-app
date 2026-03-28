import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/postjob.css'
import { createJobAPI } from '../api/jobs'

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']
const CATEGORIES = ['Software Development', 'Design', 'Data Science', 'Marketing', 'Finance', 'Product', 'Operations']
const EXPERIENCE_LEVELS = ['Entry Level (0-1 yrs)', 'Junior (1-3 yrs)', 'Mid-Level (3-5 yrs)', 'Senior (5-8 yrs)', 'Lead (8+ yrs)']

const STEPS = ['Job Details', 'Description', 'Requirements', 'Review']

export default function PostJob() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    title: '', company: '', location: '', remote: false,
    type: 'Full-time', category: '', experience: '',
    salaryMin: '', salaryMax: '',
    description: '', responsibilities: '', requirements: '',
    skills: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
  }

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Parse skills string into array
      const skillsArray = form.skills
        ? form.skills.split(',').map(s => s.trim()).filter(Boolean)
        : []

      // Parse responsibilities and requirements into newline format
      const respLines = form.responsibilities
        .split('\n')
        .map(l => l.replace(/^[-•]\s*/, '').trim())
        .filter(Boolean)
        .join('\n')

      const reqLines = form.requirements
        .split('\n')
        .map(l => l.replace(/^[-•]\s*/, '').trim())
        .filter(Boolean)
        .join('\n')

      await createJobAPI({
        title:            form.title,
        company:          form.company,
        location:         form.remote ? 'Remote' : form.location,
        type:             form.type,
        remote:           form.remote,
        work_mode:        form.remote ? 'Remote' : 'On-site',
        experience:       form.experience,
        category:         form.category,
        salary_min:       form.salaryMin ? Number(form.salaryMin) : null,
        salary_max:       form.salaryMax ? Number(form.salaryMax) : null,
        description:      form.description,
        responsibilities: respLines,
        requirements:     reqLines,
        skills:           skillsArray,
      })

      setSubmitted(true)
    } catch (err) {
      alert(err.message || 'Failed to post job. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="postjob-success page-enter">
        <div className="postjob-success__card">
          <div className="postjob-success__icon">🎉</div>
          <h1>Job Posted Successfully!</h1>
          <p>Your job listing for <strong>{form.title || 'the position'}</strong> is now live and visible to thousands of candidates.</p>
          <div className="postjob-success__actions">
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
            <button className="btn btn-outline" onClick={() => { setSubmitted(false); setStep(0); setForm({ title: '', company: '', location: '', remote: false, type: 'Full-time', category: '', experience: '', salaryMin: '', salaryMax: '', description: '', responsibilities: '', requirements: '', skills: '' }) }}>
              Post Another Job
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="postjob page-enter">
      <div className="container postjob__inner">
        {/* Left: Form */}
        <div className="postjob__form-col">
          {/* Progress */}
          <div className="postjob__progress">
            {STEPS.map((s, i) => (
              <div key={s} className={`postjob__step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                <div className="postjob__step-num">
                  {i < step ? '✓' : i + 1}
                </div>
                <span>{s}</span>
              </div>
            ))}
          </div>

          <div className="postjob__card">
            <h2 className="postjob__section-title">{STEPS[step]}</h2>

            <form onSubmit={handleSubmit}>
              {/* Step 0: Job Details */}
              {step === 0 && (
                <div className="postjob__fields">
                  <div className="postjob__field-group">
                    <label>Job Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={form.title}
                      onChange={e => update('title', e.target.value)}
                      required
                    />
                  </div>

                  <div className="postjob__field-row">
                    <div className="postjob__field-group">
                      <label>Company Name *</label>
                      <input
                        type="text"
                        placeholder="Your company name"
                        value={form.company}
                        onChange={e => update('company', e.target.value)}
                        required
                      />
                    </div>
                    <div className="postjob__field-group">
                      <label>Location *</label>
                      <input
                        type="text"
                        placeholder="City, State or Remote"
                        value={form.location}
                        onChange={e => update('location', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="postjob__field-row">
                    <div className="postjob__field-group">
                      <label>Job Type</label>
                      <select value={form.type} onChange={e => update('type', e.target.value)}>
                        {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="postjob__field-group">
                      <label>Category</label>
                      <select value={form.category} onChange={e => update('category', e.target.value)}>
                        <option value="">Select category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="postjob__field-row">
                    <div className="postjob__field-group">
                      <label>Min Salary ($/yr)</label>
                      <input
                        type="number"
                        placeholder="e.g. 80000"
                        value={form.salaryMin}
                        onChange={e => update('salaryMin', e.target.value)}
                      />
                    </div>
                    <div className="postjob__field-group">
                      <label>Max Salary ($/yr)</label>
                      <input
                        type="number"
                        placeholder="e.g. 120000"
                        value={form.salaryMax}
                        onChange={e => update('salaryMax', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="postjob__field-group">
                    <label>Experience Level</label>
                    <select value={form.experience} onChange={e => update('experience', e.target.value)}>
                      <option value="">Select level</option>
                      {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  <label className="postjob__toggle">
                    <div className={`postjob__toggle-track ${form.remote ? 'on' : ''}`} onClick={() => update('remote', !form.remote)}>
                      <div className="postjob__toggle-thumb" />
                    </div>
                    <span>This is a remote position</span>
                  </label>
                </div>
              )}

              {/* Step 1: Description */}
              {step === 1 && (
                <div className="postjob__fields">
                  <div className="postjob__field-group">
                    <label>Job Description *</label>
                    <p className="postjob__field-hint">Write a compelling overview of this role and what makes your company exciting.</p>
                    <textarea
                      rows={6}
                      placeholder="Describe the role, team, and company culture..."
                      value={form.description}
                      onChange={e => update('description', e.target.value)}
                      required
                    />
                  </div>

                  <div className="postjob__field-group">
                    <label>Key Responsibilities</label>
                    <p className="postjob__field-hint">List the main responsibilities. Add each one on a new line.</p>
                    <textarea
                      rows={5}
                      placeholder="- Build and maintain frontend applications&#10;- Collaborate with design and product teams&#10;- Lead technical discussions..."
                      value={form.responsibilities}
                      onChange={e => update('responsibilities', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Requirements */}
              {step === 2 && (
                <div className="postjob__fields">
                  <div className="postjob__field-group">
                    <label>Requirements *</label>
                    <p className="postjob__field-hint">List qualifications and must-haves. Each on a new line.</p>
                    <textarea
                      rows={6}
                      placeholder="- 3+ years of React experience&#10;- Strong TypeScript skills&#10;- Bachelor's degree or equivalent..."
                      value={form.requirements}
                      onChange={e => update('requirements', e.target.value)}
                      required
                    />
                  </div>

                  <div className="postjob__field-group">
                    <label>Required Skills</label>
                    <p className="postjob__field-hint">Enter comma-separated skills (e.g., React, TypeScript, Node.js)</p>
                    <input
                      type="text"
                      placeholder="React, TypeScript, CSS, GraphQL..."
                      value={form.skills}
                      onChange={e => update('skills', e.target.value)}
                    />
                    {form.skills && (
                      <div className="postjob__skill-preview">
                        {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                          <span key={s} className="tag tag-blue">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="postjob__review">
                  <div className="postjob__review-hero">
                    <div className="postjob__review-logo">
                      {(form.company || 'C')[0]}
                    </div>
                    <div>
                      <h3>{form.title || 'Job Title'}</h3>
                      <p>{form.company || 'Company'} · {form.location || 'Location'}</p>
                    </div>
                  </div>

                  <div className="postjob__review-tags">
                    <span className="tag tag-blue">{form.type}</span>
                    {form.remote && <span className="tag tag-green">🌐 Remote</span>}
                    {form.category && <span className="tag tag-amber">{form.category}</span>}
                    {form.experience && <span className="tag tag-purple">{form.experience}</span>}
                  </div>

                  {(form.salaryMin || form.salaryMax) && (
                    <div className="postjob__review-salary">
                      💰 ${Number(form.salaryMin).toLocaleString()} – ${Number(form.salaryMax).toLocaleString()} / yr
                    </div>
                  )}

                  {form.description && (
                    <div className="postjob__review-section">
                      <h4>Description</h4>
                      <p>{form.description}</p>
                    </div>
                  )}

                  {form.skills && (
                    <div className="postjob__review-section">
                      <h4>Skills</h4>
                      <div className="postjob__skill-preview">
                        {form.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                          <span key={s} className="tag tag-blue">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="postjob__review-notice">
                    ✅ Looks good! Your job will be reviewed and published within 24 hours.
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="postjob__nav">
                {step > 0 && (
                  <button type="button" className="btn btn-ghost" onClick={handleBack}>
                    ← Back
                  </button>
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                  {step < STEPS.length - 1 ? (
                    <button type="button" className="btn btn-primary" onClick={handleNext}>
                      Continue →
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-primary">
                      🚀 Publish Job
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Tips Panel */}
        <aside className="postjob__tips">
          <h3>💡 Tips for a great listing</h3>
          <div className="postjob__tip-list">
            {[
              { icon: '✍️', title: 'Be specific with the title', desc: 'Use exact job titles like "Senior React Engineer" over generic titles.' },
              { icon: '💰', title: 'Include salary range', desc: 'Jobs with salary info get 3x more qualified applications.' },
              { icon: '🎯', title: 'List must-have skills clearly', desc: 'Candidates filter by skills—be precise about your requirements.' },
              { icon: '🌟', title: 'Sell your culture', desc: 'Mention perks, team culture, and what makes your company special.' },
            ].map(tip => (
              <div key={tip.title} className="postjob__tip">
                <span className="postjob__tip-icon">{tip.icon}</span>
                <div>
                  <strong>{tip.title}</strong>
                  <p>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}