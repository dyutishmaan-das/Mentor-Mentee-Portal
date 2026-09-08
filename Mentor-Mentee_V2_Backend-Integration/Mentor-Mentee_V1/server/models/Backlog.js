import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    semester: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Cleared'], default: 'Active' },
    clearedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
schema.index({ student: 1, subject: 1 }, { unique: true });
export default mongoose.model('Backlog', schema);
