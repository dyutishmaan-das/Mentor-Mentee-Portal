import { Student, Session } from "../models/index.js";
import { studentScope } from "../utils/user.js";
export const dashboard = async (req, res) => {
  const scope = studentScope(req);
  const studentIds = await Student.find(scope).distinct("_id");
  const month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [totalMentees, attendance, monthlySessions, attentionNeeded, upcoming] = await Promise.all([
    Student.countDocuments(scope),
    Student.aggregate([{ $match: { _id: { $in: studentIds } } }, { $group: { _id: null, value: { $avg: "$attendance" } } }]),
    Session.countDocuments({ student: { $in: studentIds }, scheduledAt: { $gte: month } }),
    Student.countDocuments({ ...scope, risk: "Needs attention" }),
    Session.find({ student: { $in: studentIds }, scheduledAt: { $gte: new Date() }, status: "scheduled" }).populate({ path: "student", populate: { path: "user", select: "name" } }).sort({ scheduledAt: 1 }).limit(5)
  ]);
  res.json({ totalMentees, averageAttendance: Number((attendance[0]?.value || 0).toFixed(1)), monthlySessions, attentionNeeded, upcoming });
};
