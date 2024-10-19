import mongoose from "mongoose";

const countrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true }, // ISO code
    states: [{ type: mongoose.Schema.Types.ObjectId, ref: "State" }], // Reference to states
  },
  { timestamps: true }
);

export const Country = mongoose.model("Country", countrySchema);
