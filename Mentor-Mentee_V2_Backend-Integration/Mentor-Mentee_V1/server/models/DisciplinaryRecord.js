import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    actionTaken: String,
    status: { type: String, enum: ['Open', 'Resolved', 'Closed'], default: 'Open' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
export default mongoose.model('DisciplinaryRecord', schema);
