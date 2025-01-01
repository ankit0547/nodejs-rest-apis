import { Router } from 'express';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import {
  addMember,
  createGroup,
  getGroups,
  removeMember,
} from '../../controllers/group/GroupController.js';
// const {
//   createGroup,
//   getGroups,
//   addMember,
//   removeMember,
//   sendMessageToGroup,
// } = require('../controllers/groupController');
const router = Router();

// POST /api/groups - Create a new group
router.post('/', verifyJWT, createGroup);

// GET /api/groups - Get all groups for the user
router.get('/', verifyJWT, getGroups);

// PUT /api/groups/:id/add-member - Add a member to the group
router.put('/:id/add-member', verifyJWT, addMember);

// PUT /api/groups/:id/remove-member - Remove a member from the group
router.put('/:id/remove-member', verifyJWT, removeMember);

// POST /api/groups/:id/messages - Send a message to the group
// router.post('/:id/messages', verifyJWT, sendMessageToGroup);

export default router;
