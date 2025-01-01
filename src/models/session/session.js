import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }, // User ID
    socketId: { type: String, unique: true }, // Socket.IO connection ID
    lastActive: { type: Date, default: Date.now }, // Tracks when the user was last active
  },
  { timestamps: true },
);
sessionSchema.index({ userId: 1 });

export const Session = mongoose.model('Session', sessionSchema);
