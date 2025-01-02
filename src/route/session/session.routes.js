import { Router } from 'express';
import { SessionController } from '../../controllers/index.js';

const router = Router();

// Create or Update Session
router.post('/', async (req, res) => {
  const { userId, socketId } = req.body;

  if (!userId || !socketId) {
    return res.status(400).json({ error: 'userId and socketId are required' });
  }

  try {
    const session = await SessionController.createSession(userId, socketId);
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create/update session', error });
  }
});

// Delete Session by Socket ID
router.delete('/:socketId', async (req, res) => {
  const { socketId } = req.params;

  try {
    await SessionController.deleteSession(socketId);
    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session', error });
  }
});

// Get Session by User ID
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const session = await SessionController.getSessionByUserId(userId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve session', error });
  }
});

export default router;
