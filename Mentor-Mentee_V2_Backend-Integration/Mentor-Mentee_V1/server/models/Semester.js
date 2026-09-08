import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    number: { type: Number, required: true, min: 1, max: 12 },
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
    academicYear: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
schema.index({ number: 1, program: 1, academicYear: 1 }, { unique: true });
export default mongoose.model('Semester', schema);
