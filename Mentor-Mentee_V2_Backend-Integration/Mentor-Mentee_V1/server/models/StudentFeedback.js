import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    category: {
      type: String,
      enum: ['Mentoring', 'Academic', 'Wellbeing', 'Other'],
      default: 'Mentoring',
    },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ['Open', 'Reviewed', 'Closed'], default: 'Open' },
    mentorResponse: { type: String, maxlength: 2000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export default mongoose.model('StudentFeedback', schema);
