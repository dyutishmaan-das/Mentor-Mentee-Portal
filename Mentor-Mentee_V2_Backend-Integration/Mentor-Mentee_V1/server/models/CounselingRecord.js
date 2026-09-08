import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
    date: { type: Date, required: true },
    reason: { type: String, required: true },
    observations: String,
    recommendations: String,
    followUpRequired: { type: Boolean, default: false },
    followUpDate: Date,
    status: { type: String, enum: ['Open', 'Completed', 'Closed'], default: 'Open' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
export default mongoose.model('CounselingRecord', schema);
