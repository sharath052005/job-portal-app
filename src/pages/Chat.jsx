import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getConversationsAPI,
  getMessagesAPI,
  sendMessageAPI,
  uploadChatFileAPI,
} from '../api/chat'
import '../styles/chat.css'

export default function Chat() {
  const { user }         = useAuth()
  const navigate         = useNavigate()
  const [searchParams]   = useSearchParams()
  const fileInputRef     = useRef(null)
  const messagesEndRef   = useRef(null)

  // Track whether we should auto-scroll (only on send or first load)
  const shouldScrollRef  = useRef(false)

  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv]       = useState(null)
  const [messages, setMessages]           = useState([])
  const [input, setInput]                 = useState('')
  const [loading, setLoading]             = useState(true)
  const [sending, setSending]             = useState(false)
  const [uploading, setUploading]         = useState(false)
  const [convLoading, setConvLoading]     = useState(false)

  const convIdParam = searchParams.get('conv')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    loadConversations()
  }, [user])

  useEffect(() => {
    if (convIdParam && conversations.length > 0) {
      const conv = conversations.find(c => String(c.id) === convIdParam)
      if (conv) openConversation(conv)
    }
  }, [convIdParam, conversations])

  // ✅ FIX: Only scroll when shouldScrollRef is true (send or first open)
  useEffect(() => {
    if (shouldScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      shouldScrollRef.current = false
    }
  }, [messages])

  // ✅ FIX: Polling only updates state if new messages actually arrived
  useEffect(() => {
    if (!activeConv) return
    const interval = setInterval(() => {
      getMessagesAPI(activeConv.id)
        .then(data => {
          const newMessages = data.messages || []
          setMessages(prev => {
            // Only update (and scroll) if a new message came in
            if (newMessages.length > prev.length) {
              shouldScrollRef.current = true
              return newMessages
            }
            return prev
          })
        })
        .catch(() => {})
    }, 5000)
    return () => clearInterval(interval)
  }, [activeConv])

  const loadConversations = async () => {
    try {
      const data = await getConversationsAPI()
      setConversations(data.conversations || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openConversation = async (conv) => {
    setActiveConv(conv)
    setConvLoading(true)
    try {
      const data = await getMessagesAPI(conv.id)
      // ✅ FIX: Scroll on first load of a conversation
      shouldScrollRef.current = true
      setMessages(data.messages || [])
      setConversations(prev => prev.map(c =>
        c.id === conv.id ? { ...c, unread_count: 0 } : c
      ))
    } catch (err) {
      console.error(err)
    } finally {
      setConvLoading(false)
    }
  }

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!input.trim() || !activeConv || sending) return

    const urlRegex = /^(https?:\/\/[^\s]+)/
    const isLink   = urlRegex.test(input.trim())

    setSending(true)
    try {
      await sendMessageAPI(activeConv.id, {
        content:      input.trim(),
        message_type: isLink ? 'link' : 'text',
      })
      setInput('')
      const data = await getMessagesAPI(activeConv.id)
      // ✅ FIX: Scroll after you send a message
      shouldScrollRef.current = true
      setMessages(data.messages || [])
      loadConversations()
    } catch (err) {
      if (err.message.includes('disabled')) {
        alert('This conversation has been disabled.')
      }
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const isImage = file.type.startsWith('image/')
    const isPdf   = file.type === 'application/pdf'

    if (!isImage && !isPdf) {
      alert('Only images (JPG, PNG) and PDF files are allowed.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB.')
      return
    }

    setUploading(true)
    try {
      const uploadData = await uploadChatFileAPI(file)
      if (!uploadData.success) throw new Error('Upload failed')

      await sendMessageAPI(activeConv.id, {
        content:      file.name,
        message_type: isImage ? 'image' : 'file',
        file_url:     uploadData.file_url,
        file_name:    uploadData.file_name,
      })

      const data = await getMessagesAPI(activeConv.id)
      // ✅ FIX: Scroll after file send
      shouldScrollRef.current = true
      setMessages(data.messages || [])
      loadConversations()
    } catch (err) {
      alert('Failed to upload file.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  })

  const formatDate = (d) => {
    const date = new Date(d)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  }

  const getConvName = (conv) => {
    if (!user) return ''
    return user.role === 'recruiter'
      ? conv.seeker_name
      : conv.recruiter_name
  }

  const getConvAvatar = (conv) => {
    if (!user) return ''
    const name = getConvName(conv)
    return name?.[0]?.toUpperCase()
  }

  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.created_at)
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
    return groups
  }, {})

  return (
    <div className="chat-page page-enter">
      <div className="chat-layout">

        {/* ── SIDEBAR ───────────────────────────────────── */}
        <div className="chat-sidebar">
          <div className="chat-sidebar__header">
            <h2>Messages</h2>
            {conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0) > 0 && (
              <span className="chat-unread-total">
                {conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)}
              </span>
            )}
          </div>

          {loading ? (
            <div className="chat-sidebar__loading">
              <div className="profile-spinner" style={{ width: 28, height: 28 }} />
            </div>
          ) : conversations.length === 0 ? (
            <div className="chat-empty-sidebar">
              <div className="chat-empty-sidebar__icon">💬</div>
              <h3>No conversations yet</h3>
              <p>
                {user?.role === 'recruiter'
                  ? 'Shortlist an applicant and start a conversation to move them forward.'
                  : 'Apply to jobs and connect with hiring managers. When a recruiter shortlists you, they can start a conversation here.'}
              </p>
              {user?.role === 'seeker' && (
                <button
                  className="btn btn-primary chat-empty-cta"
                  onClick={() => navigate('/jobs')}
                >
                  Browse Jobs →
                </button>
              )}
            </div>
          ) : (
            <div className="chat-conv-list">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`chat-conv-item ${activeConv?.id === conv.id ? 'active' : ''} ${conv.is_disabled ? 'disabled' : ''}`}
                  onClick={() => openConversation(conv)}
                >
                  <div className="chat-conv-avatar">
                    {getConvAvatar(conv)}
                    {conv.is_disabled && <span className="chat-conv-disabled-dot" />}
                  </div>
                  <div className="chat-conv-info">
                    <div className="chat-conv-top">
                      <strong>{getConvName(conv)}</strong>
                      {conv.last_message_at && (
                        <span className="chat-conv-time">
                          {formatTime(conv.last_message_at)}
                        </span>
                      )}
                    </div>
                    <div className="chat-conv-bottom">
                      <span className="chat-conv-last">
                        {conv.is_disabled
                          ? '🔒 Conversation closed'
                          : conv.last_message || (conv.job_title ? `Re: ${conv.job_title}` : 'No messages yet')}
                      </span>
                      {conv.unread_count > 0 && (
                        <span className="chat-conv-badge">{conv.unread_count}</span>
                      )}
                    </div>
                    {conv.job_title && (
                      <span className="chat-conv-job">{conv.job_title}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── MAIN CHAT AREA ────────────────────────────── */}
        <div className="chat-main">
          {!activeConv ? (
            <div className="chat-main-empty">
              <div className="chat-main-empty__icon">💬</div>
              <h2>Your Messages</h2>
              <p>
                {user?.role === 'seeker'
                  ? 'When a recruiter reaches out after shortlisting you, their message will appear here. Keep applying to increase your chances!'
                  : 'Select a conversation or shortlist a candidate to start chatting.'}
              </p>
              {user?.role === 'seeker' && (
                <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
                  Browse Jobs →
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="chat-header">
                <div className="chat-header__left">
                  <div className="chat-header-avatar">
                    {getConvAvatar(activeConv)}
                  </div>
                  <div>
                    <h3>{getConvName(activeConv)}</h3>
                    {activeConv.job_title && (
                      <p>
                        Re: {activeConv.job_title}
                        {activeConv.job_company ? ` · ${activeConv.job_company}` : ''}
                      </p>
                    )}
                  </div>
                </div>
                {activeConv.is_disabled && (
                  <span className="chat-disabled-badge">🔒 Closed</span>
                )}
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {convLoading ? (
                  <div className="chat-messages-loading">
                    <div className="profile-spinner" style={{ width: 28, height: 28 }} />
                  </div>
                ) : (
                  <>
                    {Object.entries(groupedMessages).map(([date, msgs]) => (
                      <div key={date}>
                        <div className="chat-date-divider">
                          <span>{date}</span>
                        </div>
                        {msgs.map(msg => {
                          const isMine = msg.sender_id === user?.id
                          return (
                            <div
                              key={msg.id}
                              className={`chat-message ${isMine ? 'chat-message--mine' : 'chat-message--theirs'}`}
                            >
                              {!isMine && (
                                <div className="chat-message-avatar">
                                  {msg.sender_name?.[0]?.toUpperCase()}
                                </div>
                              )}
                              <div className="chat-message-content">
                                {msg.message_type === 'text' && (
                                  <div className="chat-bubble">{msg.content}</div>
                                )}
                                {msg.message_type === 'link' && (
                                  <div className="chat-bubble chat-bubble--link">
                                    <a href={msg.content} target="_blank" rel="noreferrer">
                                      🔗 {msg.content}
                                    </a>
                                  </div>
                                )}
                                {msg.message_type === 'image' && (
                                  <div className="chat-bubble chat-bubble--image">
                                    <a href={msg.file_url} target="_blank" rel="noreferrer">
                                      <img src={msg.file_url} alt={msg.file_name} />
                                    </a>
                                  </div>
                                )}
                                {msg.message_type === 'file' && (
                                  <div className="chat-bubble chat-bubble--file">
                                    <a href={msg.file_url} target="_blank" rel="noreferrer">
                                      <span className="chat-file-icon">📄</span>
                                      <span>{msg.file_name || msg.content}</span>
                                    </a>
                                  </div>
                                )}
                                <span className="chat-message-time">
                                  {formatTime(msg.created_at)}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input area */}
              {activeConv.is_disabled ? (
                <div className="chat-disabled-notice">
                  <span>🔒</span>
                  <p>{activeConv.disabled_reason || 'You can no longer message this employer.'}</p>
                </div>
              ) : (
                <div className="chat-input-area">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".jpg,.jpeg,.png,.pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />

                  <button
                    className="chat-attach-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Attach image or PDF"
                  >
                    {uploading ? (
                      <div className="profile-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>

                  <form className="chat-input-form" onSubmit={handleSend}>
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Type a message, paste a link..."
                      disabled={sending}
                      autoComplete="off"
                    />
                    <button
                      type="submit"
                      className="chat-send-btn"
                      disabled={!input.trim() || sending}
                    >
                      {sending ? (
                        <div className="profile-spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: 'white' }} />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}