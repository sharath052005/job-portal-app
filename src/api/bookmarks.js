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

export const getBookmarksAPI  = ()        => apiCall('/bookmarks')
export const toggleBookmarkAPI = (job_id) => apiCall('/bookmarks/toggle', 'POST', { job_id })