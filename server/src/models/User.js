import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["admin", "hod", "mentor", "student"], required: true },
  department: { type: String, trim: true },
  phone: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });
export const User = mongoose.models.User || mongoose.model("User", schema);
