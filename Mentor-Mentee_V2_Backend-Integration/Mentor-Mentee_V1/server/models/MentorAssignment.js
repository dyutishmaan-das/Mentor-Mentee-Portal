import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedAt: { type: Date, default: Date.now },
    unassignedAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
schema.index(
  { student: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);
export default mongoose.model('MentorAssignment', schema);
