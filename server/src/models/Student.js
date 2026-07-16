import mongoose from "mongoose";
const schema = new mongoose.Schema({
  enrollmentNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  course: { type: String, required: true }, branch: { type: String, required: true }, specialization: String,
  semester: { type: Number, required: true, min: 1, max: 8 }, batch: String, category: String,
  dateOfBirth: Date, bloodGroup: String, identificationMark: String, presentAddress: String,
  permanentAddress: String, siblings: Number,
  father: { name: String, phone: String, email: String, occupation: String },
  mother: { name: String, phone: String, email: String, occupation: String },
  localGuardian: { name: String, relation: String, occupation: String, address: String, phone: String },
  priorAcademics: [{ exam: String, institution: String, year: Number, board: String, division: String, percentage: Number }],
  hobbies: [{ name: String, participation: String, award: String }],
  accommodation: [{ semester: Number, hostel: String, room: String, transportRoute: String }],
  attendance: { type: Number, min: 0, max: 100, default: 0 },
  cgpa: { type: Number, min: 0, max: 10, default: 0 },
  risk: { type: String, enum: ["On track", "Watch", "Needs attention"], default: "On track" },
  notes: String
}, { timestamps: true });
export const Student = mongoose.models.Student || mongoose.model("Student", schema);
