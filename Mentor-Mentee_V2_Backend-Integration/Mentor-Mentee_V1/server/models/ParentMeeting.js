import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    parent: { name: String, phone: String },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
    date: { type: Date, required: true },
    meetingType: { type: String, enum: ['In person', 'Online', 'Phone'], default: 'In person' },
    reason: { type: String, required: true },
    discussion: String,
    concerns: String,
    actionTaken: String,
    followUpDate: Date,
    remarks: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
export default mongoose.model('ParentMeeting', schema);
