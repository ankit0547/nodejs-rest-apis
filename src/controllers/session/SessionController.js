import { SessionModel } from '../../models/index.js';

class SessionController {
  async createSession(sessionId, socketId) {
    const session = await SessionModel.findOneAndUpdate(
      { userId },
      { socketId, lastActive: new Date() },
      { upsert: true, new: true },
    );
    return session;
  }

  async deleteSession(socketId) {
    await SessionModel.findOneAndDelete({ socketId });
  }

  async getSessionByUserId(userId) {
    return SessionModel.findOne({ userId });
  }
}

export default new SessionController();
