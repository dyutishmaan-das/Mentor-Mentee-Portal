import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    credits: { type: Number, required: true, min: 0, max: 20 },
    semester: { type: Number, required: true, min: 1, max: 12 },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
export default mongoose.model('Subject', schema);
