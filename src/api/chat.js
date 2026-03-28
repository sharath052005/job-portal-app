const BASE_URL = 'http://localhost:5000/api'

const apiCall = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  }
  if (body) options.body = JSON.stringify(body)
  const res  = await fetch(`${BASE_URL}${endpoint}`, options)
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

export const getConversationsAPI    = ()             => apiCall('/chat')
export const getMessagesAPI         = (convId)       => apiCall(`/chat/${convId}`)
export const startConversationAPI   = (data)         => apiCall('/chat', 'POST', data)
export const sendMessageAPI         = (convId, data) => apiCall(`/chat/${convId}/messages`, 'POST', data)
export const getUnreadCountAPI      = ()             => apiCall('/chat/unread')
export const disableConversationAPI = (data)         => apiCall('/chat/disable', 'POST', data)

export const uploadChatFileAPI = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return fetch(`${BASE_URL}/chat/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  }).then(r => r.json())
}