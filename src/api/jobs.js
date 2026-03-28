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

export const getJobsAPI      = (params = {}) => {
  const query = new URLSearchParams(params).toString()
  return apiCall(`/jobs${query ? '?' + query : ''}`)
}
export const getJobByIdAPI   = (id)  => apiCall(`/jobs/${id}`)
export const createJobAPI    = (data) => apiCall('/jobs', 'POST', data)
export const getMyJobsAPI    = ()    => apiCall('/jobs/my')
export const updateJobStatusAPI = (id, status) => apiCall(`/jobs/${id}/status`, 'PUT', { status })
export const deleteJobAPI    = (id)  => apiCall(`/jobs/${id}`, 'DELETE')