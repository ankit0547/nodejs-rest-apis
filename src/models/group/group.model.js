import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of User IDs
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of User IDs with admin privileges
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }, // User ID of the creator
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

groupSchema.index({ name: 1 });

export const Group = mongoose.model('Group', groupSchema);
