import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    reason: {
      type: String,
      enum: [
        'Low Attendance',
        'Poor Academic Performance',
        'Backlog',
        'Disciplinary Issue',
        'Financial Issue',
        'Career Guidance',
        'Other',
      ],
      required: true,
    },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    action: String,
    responsiblePerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startDate: { type: Date, required: true },
    targetDate: Date,
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
    outcome: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
schema.index({ student: 1, status: 1 });
export default mongoose.model('Intervention', schema);
