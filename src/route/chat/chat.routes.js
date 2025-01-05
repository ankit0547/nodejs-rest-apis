import { Router } from 'express';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import { ChatController } from '../../controllers/index.js';

const router = Router();

router.use(verifyJWT);

router.route('/').get(ChatController.getAllChats);
router.route('/c/:receiverId').post(ChatController.createOrGetAOneOnOneChat);

export default router;
