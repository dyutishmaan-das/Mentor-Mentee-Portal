import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    durationSemesters: { type: Number, min: 1, max: 12, default: 8 },
  },
  { timestamps: true },
);
export default mongoose.model('Program', schema);
