import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    semester: { type: Number, required: true, min: 1, max: 12 },
    internal: { type: Number, min: 0, max: 100, default: 0 },
    external: { type: Number, min: 0, max: 100, default: 0 },
    sessional: { type: Number, min: 0, max: 100, default: 0 },
    put: { type: Number, min: 0, max: 100, default: 0 },
    total: { type: Number, default: 0 },
    grade: String,
    gradePoint: { type: Number, min: 0, max: 10 },
    credits: { type: Number, min: 0 },
    resultStatus: { type: String, enum: ['Pass', 'Fail', 'Pending'], default: 'Pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
schema.index({ student: 1, subject: 1, semester: 1 }, { unique: true });
export default mongoose.model('Marks', schema);
