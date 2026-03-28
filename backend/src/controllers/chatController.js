const pool = require('../config/db')
const { cloudinary } = require('../config/cloudinary')
const { upload }     = require('../config/cloudinary')
const multer         = require('multer')
const path           = require('path')

// ── GET all conversations for current user ─────────────────
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id
    const role   = req.user.role

    const [rows] = await pool.query(
      `SELECT
        c.*,
        r.name  as recruiter_name,
        r.avatar as recruiter_avatar,
        s.name  as seeker_name,
        s.avatar as seeker_avatar,
        j.title as job_title,
        j.company as job_company,
        j.logo as job_logo,
        j.logo_color as job_logo_color,
        (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message_at,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != ? AND m.is_read = 0) as unread_count
       FROM conversations c
       JOIN users r ON c.recruiter_id = r.id
       JOIN users s ON c.seeker_id = s.id
       LEFT JOIN jobs j ON c.job_id = j.id
       WHERE c.recruiter_id = ? OR c.seeker_id = ?
       ORDER BY COALESCE(last_message_at, c.created_at) DESC`,
      [userId, userId, userId]
    )

    return res.status(200).json({ success: true, conversations: rows })
  } catch (err) {
    console.error('Get conversations error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// ── GET messages for a conversation ───────────────────────
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id
    const convId = req.params.conversationId

    // Check user belongs to this conversation
    const [conv] = await pool.query(
      'SELECT * FROM conversations WHERE id = ? AND (recruiter_id = ? OR seeker_id = ?)',
      [convId, userId, userId]
    )

    if (conv.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied.' })
    }

    // Mark messages as read
    await pool.query(
      'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?',
      [convId, userId]
    )

    const [messages] = await pool.query(
      `SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [convId]
    )

    return res.status(200).json({
      success: true,
      messages,
      conversation: conv[0]
    })
  } catch (err) {
    console.error('Get messages error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// ── START conversation (recruiter only) ───────────────────
const startConversation = async (req, res) => {
  try {
    const recruiterId = req.user.id
    const { seeker_id, job_id, application_id, initial_message } = req.body

    if (!seeker_id || !initial_message) {
      return res.status(400).json({
        success: false,
        message: 'seeker_id and initial_message are required.'
      })
    }

    // Check existing conversation
    const [existing] = await pool.query(
      'SELECT * FROM conversations WHERE recruiter_id = ? AND seeker_id = ? AND job_id = ?',
      [recruiterId, seeker_id, job_id || null]
    )

    let convId

    if (existing.length > 0) {
      convId = existing[0].id
    } else {
      const [result] = await pool.query(
        'INSERT INTO conversations (recruiter_id, seeker_id, job_id, application_id) VALUES (?, ?, ?, ?)',
        [recruiterId, seeker_id, job_id || null, application_id || null]
      )
      convId = result.insertId
    }

    // Send initial message
    await pool.query(
      'INSERT INTO messages (conversation_id, sender_id, content, message_type) VALUES (?, ?, ?, ?)',
      [convId, recruiterId, initial_message, 'text']
    )

    // Update conversation timestamp
    await pool.query(
      'UPDATE conversations SET updated_at = NOW() WHERE id = ?',
      [convId]
    )

    return res.status(201).json({
      success: true,
      conversation_id: convId,
      message: 'Conversation started.'
    })
  } catch (err) {
    console.error('Start conversation error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// ── SEND message ───────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id
    const convId   = req.params.conversationId
    const { content, message_type = 'text', file_url, file_name } = req.body

    // Check conversation exists and user belongs to it
    const [conv] = await pool.query(
      'SELECT * FROM conversations WHERE id = ? AND (recruiter_id = ? OR seeker_id = ?)',
      [convId, senderId, senderId]
    )

    if (conv.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied.' })
    }

    if (conv[0].is_disabled) {
      return res.status(403).json({
        success: false,
        message: 'This conversation has been disabled.'
      })
    }

    await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, content, message_type, file_url, file_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [convId, senderId, content, message_type, file_url || null, file_name || null]
    )

    await pool.query(
      'UPDATE conversations SET updated_at = NOW() WHERE id = ?',
      [convId]
    )

    return res.status(201).json({ success: true, message: 'Message sent.' })
  } catch (err) {
    console.error('Send message error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// ── UPLOAD file in chat ────────────────────────────────────
const uploadChatFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' })
    }
    return res.status(200).json({
      success: true,
      file_url: req.file.path,
      file_name: req.file.originalname,
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Upload failed.' })
  }
}

// ── DISABLE conversation (recruiter only, on rejection) ────
const disableConversation = async (req, res) => {
  try {
    const { conversation_id, reason } = req.body

    await pool.query(
      'UPDATE conversations SET is_disabled = 1, disabled_reason = ? WHERE id = ? AND recruiter_id = ?',
      [reason || 'The recruiter has closed this conversation.', conversation_id, req.user.id]
    )

    return res.status(200).json({ success: true, message: 'Conversation disabled.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// ── GET unread count ───────────────────────────────────────
const getUnreadCount = async (req, res) => {
  try {
    const [[{ count }]] = await pool.query(
      `SELECT COUNT(*) as count FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE m.sender_id != ? AND m.is_read = 0
       AND (c.recruiter_id = ? OR c.seeker_id = ?)`,
      [req.user.id, req.user.id, req.user.id]
    )
    return res.status(200).json({ success: true, count })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

module.exports = {
  getConversations,
  getMessages,
  startConversation,
  sendMessage,
  uploadChatFile,
  disableConversation,
  getUnreadCount,
}