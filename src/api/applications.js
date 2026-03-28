const BASE_URL = 'http://localhost:5000/api'

const apiCall = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  }
  if (body) options.body = JSON.stringify(body)
  const res = await fetch(`${BASE_URL}${endpoint}`, options)
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

export const applyJobAPI              = (data)         => apiCall('/applications', 'POST', data)
export const getMyApplicationsAPI     = ()             => apiCall('/applications/my')
export const checkAppliedAPI          = (jobId)        => apiCall(`/applications/check/${jobId}`)
export const getRecruiterAppsAPI      = ()             => apiCall('/applications/recruiter')
export const updateAppStatusAPI       = (id, status)   => apiCall(`/applications/${id}/status`, 'PUT', { status })