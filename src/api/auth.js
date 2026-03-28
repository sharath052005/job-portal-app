const BASE_URL = 'http://localhost:5000/api'

// Helper function for all API calls
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',   // sends httpOnly cookie automatically
  }

  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${endpoint}`, options)
  const data = await res.json()

  if (!res.ok) throw new Error(data.message || 'Something went wrong')

  return data
}

export const signupAPI    = (body) => apiCall('/auth/signup', 'POST', body)
export const loginAPI     = (body) => apiCall('/auth/login', 'POST', body)
export const logoutAPI    = ()     => apiCall('/auth/logout', 'POST')
export const getMeAPI     = ()     => apiCall('/auth/me')
export const googleAuthURL = `http://localhost:5000/api/auth/google`