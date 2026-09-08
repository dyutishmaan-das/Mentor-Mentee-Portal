import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
    name: { type: String, required: true },
    phone: String,
    address: String,
    relationship: String,
  },
  { timestamps: true },
);
export default mongoose.model('Guardian', schema);
