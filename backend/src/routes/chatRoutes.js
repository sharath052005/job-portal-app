const express = require('express')
const router = express.Router()
const { protect, restrictTo } = require('../middleware/authMiddleware')
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const { cloudinary } = require('../config/cloudinary')
const {
  getConversations,
  getMessages,
  startConversation,
  sendMessage,
  uploadChatFile,
  disableConversation,
  getUnreadCount,
} = require('../controllers/chatController')

// Cloudinary storage for chat files
const chatStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isImage = file.mimetype.startsWith('image/')
    return {
      folder: 'hiresphere/chat',
      resource_type: isImage ? 'image' : 'raw',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    }
  },
})

const chatUpload = multer({
  storage: chatStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

router.get('/', protect, getConversations)
router.get('/unread', protect, getUnreadCount)

// ─── IMPORTANT: static routes MUST come before /:conversationId ───────────────
// POST /upload and POST /disable must be above POST /:conversationId/messages
// otherwise Express matches "upload" and "disable" as the conversationId param
router.post('/', protect, restrictTo('recruiter'), startConversation)
router.post('/upload', protect, chatUpload.single('file'), uploadChatFile)
router.post('/disable', protect, restrictTo('recruiter'), disableConversation)

// Parameterized routes come last
router.get('/:conversationId', protect, getMessages)
router.post('/:conversationId/messages', protect, sendMessage)

module.exports = router