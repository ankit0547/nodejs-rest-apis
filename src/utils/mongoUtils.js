import mongoose from "mongoose";

export const validateObjectId = (ObjectId) => {
  // Check if the ObjectId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(ObjectId)) {
    return res.status(400).json({ message: "Invalid ObjectId" });
  }
  const objectId = new mongoose.Types.ObjectId(ObjectId);
  if (!objectId) {
    return res.status(400).json({ message: "Invalid ObjectId format" });
  }
  return objectId;
};
