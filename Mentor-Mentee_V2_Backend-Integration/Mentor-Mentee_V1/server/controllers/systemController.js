import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import Student from '../models/Student.js';
import Mentor from '../models/Mentor.js';
import Marks from '../models/Marks.js';
import Attendance from '../models/Attendance.js';
import { ApiError } from '../utils/ApiError.js';

export async function notifications(req, res, next) {
  try {
    const data = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, message: 'Notifications retrieved successfully', data });
  } catch (error) {
    next(error);
  }
}
export async function markNotificationRead(req, res, next) {
  try {
    const item = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { readAt: new Date() },
      { new: true },
    );
    if (!item) throw new ApiError(404, 'Notification not found', 'NOT_FOUND');
    res.json({ success: true, message: 'Notification marked as read', data: item });
  } catch (error) {
    next(error);
  }
}
export async function auditLogs(_req, res, next) {
  try {
    const data = await AuditLog.find()
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(200);
    res.json({ success: true, message: 'Audit logs retrieved successfully', data });
  } catch (error) {
    next(error);
  }
}
export async function analytics(_req, res, next) {
  try {
    const [students, mentors, marks, attendance] = await Promise.all([
      Student.countDocuments({ isDeleted: false }),
      Mentor.countDocuments(),
      Marks.aggregate([{ $group: { _id: null, average: { $avg: '$total' } } }]),
      Attendance.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
          },
        },
      ]),
    ]);
    res.json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: {
        students,
        mentors,
        averageMarks: marks[0]?.average || 0,
        attendancePercentage: attendance[0]
          ? (attendance[0].present / attendance[0].total) * 100
          : 0,
      },
    });
  } catch (error) {
    next(error);
  }
}
