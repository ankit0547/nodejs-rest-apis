import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['DM', 'GROUP'], required: true }, // 'DM' for direct message, 'GROUP' for group message
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Sender's User ID
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Recipient's User ID (for DMs)
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // Group ID (for group messages)
    content: { type: String, required: true }, // Text or URL (if it's a media file)
    attachments: [{ type: String }], // URLs for any attached files
    isRead: { type: Boolean, default: false }, // Tracks if the message has been read
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

messageSchema.index({ from: 1, to: 1, createdAt: -1 });
messageSchema.index({ groupId: 1, createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);
