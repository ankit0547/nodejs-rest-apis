import mongoose from 'mongoose';

const userStatusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    socketId: { type: String },
    status: { type: String, enum: ['online', 'offline'], default: 'offline' },
    lastLogin: { type: Date },
  },
  { timestamps: true },
);

export const UserStatus = mongoose.model('UserStatus', userStatusSchema);
