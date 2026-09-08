import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
    actionType: {
      type: String,
      enum: ['Attendance', 'Academic', 'Performance', 'Follow-up'],
      required: true,
    },
    reason: { type: String, required: true },
    action: { type: String, required: true },
    visibleToStudent: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export default mongoose.model('MentorAction', schema);
