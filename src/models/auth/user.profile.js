import mongoose, { Schema } from "mongoose";

const userProfileSchema = new mongoose.Schema({
  profileId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Users collection
    ref: "User",
    required: true,
  },
  avatar: {
    type: {
      url: String,
      localPath: String,
    },
    default: {
      url: `https://via.placeholder.com/200x200.png`,
      localPath: "",
    },
  },
  firstName: { type: String },
  lastName: { type: String },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const UserProfile = mongoose.model("UserProfile", userProfileSchema);
