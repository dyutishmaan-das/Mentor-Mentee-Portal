import mongoose from "mongoose";
const schema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  category: { type: String, required: true, enum: ["certification", "activity", "internship", "placement", "club", "achievement", "competitiveExam", "discipline", "attendance", "parentMeeting"] },
  semester: { type: Number, min: 1, max: 8 }, title: { type: String, required: true },
  organization: String, date: Date, endDate: Date, score: String, result: String,
  actionTaken: String, details: String, attachmentUrl: String
}, { timestamps: true });
export const Record = mongoose.models.Record || mongoose.model("Record", schema);
