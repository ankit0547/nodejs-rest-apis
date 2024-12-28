import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [
    {
      aclKey: { type: String, required: true }, // E.g., "posts:read"
      resource: { type: String, required: true }, // E.g., "posts"
      actions: { type: [String], required: true }, // E.g., ["read", "write"]
    },
  ],
});

export const Role = mongoose.model('Role', roleSchema);
