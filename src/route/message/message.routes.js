import { Router } from 'express';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import {
  getMessages,
  sendMessage,
} from '../../controllers/message/MessageController.js';
// const {
//   sendMessage,
//   getMessages,
// } = require('../controllers/messageController');
// const authenticate = require('../middleware/authMiddleware');
const router = Router();

// POST /api/messages - Send a new message (DM or Group)
router.post('/', verifyJWT, sendMessage);

// GET /api/messages - Get messages for a conversation or group
router.get('/', verifyJWT, getMessages);

export default router;
