import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number, required: true },
  },
  { timestamps: true },
);
schema.index({ name: 1, program: 1 }, { unique: true });
export default mongoose.model('Batch', schema);
