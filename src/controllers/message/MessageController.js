import { MessageModel } from '../../models/index.js';

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { type, from, to, groupId, content } = req.body;
    const message = await MessageModel.create({
      type,
      from,
      to,
      groupId,
      content,
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages for a conversation or group
export const getMessages = async (req, res) => {
  try {
    const { conversationId, type } = req.query;
    const filter =
      type === 'DM'
        ? {
            type: 'DM',
            $or: [{ from: conversationId }, { to: conversationId }],
          }
        : { type: 'GROUP', groupId: conversationId };
    const messages = await MessageModel.find(filter).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
