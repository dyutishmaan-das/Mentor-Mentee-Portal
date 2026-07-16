import mongoose from "mongoose";
const schema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["mentorFeedback", "selfAssessment", "mentorAssessment"], required: true },
  semester: { type: Number, min: 1, max: 8 },
  ratings: [{ criterion: String, score: { type: Number, min: 0, max: 10 } }],
  comments: String, suggestions: String,
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
export const Assessment = mongoose.models.Assessment || mongoose.model("Assessment", schema);
