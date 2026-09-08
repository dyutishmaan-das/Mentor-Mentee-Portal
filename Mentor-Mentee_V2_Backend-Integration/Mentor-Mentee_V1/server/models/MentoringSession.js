import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
    date: { type: Date, required: true },
    time: String,
    mode: { type: String, enum: ['In person', 'Online', 'Phone'], default: 'In person' },
    agenda: { type: String, required: true },
    discussion: String,
    studentConcerns: String,
    mentorObservations: String,
    actionItems: String,
    nextFollowUpDate: Date,
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
schema.index({ student: 1, date: -1 });
export default mongoose.model('MentoringSession', schema);
