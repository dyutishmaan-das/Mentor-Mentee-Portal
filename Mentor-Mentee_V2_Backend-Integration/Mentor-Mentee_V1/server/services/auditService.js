import AuditLog from '../models/AuditLog.js';
export async function audit(req, { action, module, recordId, oldValue, newValue }) {
  if (!req.user) return;
  await AuditLog.create({
    userId: req.user._id,
    userRole: req.user.role,
    action,
    module,
    recordId,
    oldValue,
    newValue,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
}
