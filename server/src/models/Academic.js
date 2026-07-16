import mongoose from "mongoose";
const schema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  subjects: [{ name: { type: String, required: true }, code: String, sessional1: Number, sessional2: Number, put: Number, internal: Number, external: Number, total: Number }],
  totalObtained: Number, aggregate: Number, sgpa: Number,
  actionTaken: [{ type: String, enum: ["Student counselled", "Parent contacted", "Letter dispatched", "Parent meeting"] }],
  backlogs: [{ subjectCode: String, clearedOn: Date }]
}, { timestamps: true });
schema.index({ student: 1, semester: 1 }, { unique: true });
export const Academic = mongoose.models.Academic || mongoose.model("Academic", schema);
