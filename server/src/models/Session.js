import mongoose from "mongoose";
const schema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  scheduledAt: { type: Date, required: true }, agenda: { type: String, required: true, trim: true },
  discussion: String, studentConcerns: String, mentorAdvice: String,
  actionItems: [{ text: { type: String, required: true }, dueDate: Date, completed: { type: Boolean, default: false } }],
  status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
  confidential: { type: Boolean, default: true }
}, { timestamps: true });
export const Session = mongoose.models.Session || mongoose.model("Session", schema);
