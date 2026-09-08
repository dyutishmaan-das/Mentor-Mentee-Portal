import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userRole: String,
    action: { type: String, required: true },
    module: { type: String, required: true },
    recordId: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    ip: String,
    userAgent: String,
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } },
);
schema.index({ timestamp: -1, module: 1 });
export default mongoose.model('AuditLog', schema);
