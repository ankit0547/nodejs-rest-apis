import mongoose from "mongoose";

const stateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // ISO code
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    }, // Reference to country
  },
  { timestamps: true }
);

export const State = mongoose.model("State", stateSchema);
