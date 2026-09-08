import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    semester: { type: Number, required: true, min: 1, max: 12 },
    cgpa: { type: Number, min: 0, max: 10 },
    aggregate: { type: Number, min: 0, max: 100 },
    resultStatus: { type: String, enum: ['Pass', 'Fail', 'Pending'], default: 'Pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
schema.index({ student: 1, semester: 1 }, { unique: true });
export default mongoose.model('AcademicRecord', schema);
