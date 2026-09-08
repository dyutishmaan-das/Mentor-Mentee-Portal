import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'MENTORING',
        'ASSESSMENT',
        'ATTENDANCE',
        'INTERVENTION',
        'ACADEMIC',
        'PLACEMENT',
        'PROFILE',
        'SYSTEM',
      ],
      default: 'SYSTEM',
    },
    link: String,
    readAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
export default mongoose.model('Notification', schema);
