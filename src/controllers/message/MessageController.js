import { ChatMessageModel } from '../../models/index.js';

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { type, from, to, groupId, content } = req.body;
    const message = await ChatMessageModel.create({
      type,
      from,
      to,
      groupId,
      content,
    });

    // Emit the message to the recipient (or group)
    if (to) {
      // Send message to a specific user
      io.to(socketConnections[to]).emit('receive_message', message);
    } else if (groupId) {
      // Send message to all users in a group (you need to handle group logic)
      io.to(groupId).emit('receive_message', message);
    }
    // res.status(201).json(message);
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
