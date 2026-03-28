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

export const getProfileAPI        = ()       => apiCall('/profile')
export const updateProfileAPI     = (data)   => apiCall('/profile', 'PUT', data)
export const addEducationAPI      = (data)   => apiCall('/profile/education', 'POST', data)
export const updateEducationAPI   = (id, data) => apiCall(`/profile/education/${id}`, 'PUT', data)
export const deleteEducationAPI   = (id)     => apiCall(`/profile/education/${id}`, 'DELETE')
export const addExperienceAPI     = (data)   => apiCall('/profile/experience', 'POST', data)
export const updateExperienceAPI  = (id, data) => apiCall(`/profile/experience/${id}`, 'PUT', data)
export const deleteExperienceAPI  = (id)     => apiCall(`/profile/experience/${id}`, 'DELETE')

// Add these two functions at the bottom
export const uploadResumeAPI = (formData) => {
  return fetch(`${BASE_URL}/profile/resume`, {
    method: 'POST',
    credentials: 'include',
    body: formData,   // no Content-Type header — browser sets it with boundary
  }).then(res => res.json())
}

export const deleteResumeAPI = () => apiCall('/profile/resume', 'DELETE')