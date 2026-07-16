import { Student, Academic, Record, Session, Assessment } from "../models/index.js";
export const studentReport = async (req, res) => {
  const [student, academics, records, sessions, assessments] = await Promise.all([
    Student.findById(req.params.id).populate("user", "name email phone").populate("mentor", "name email"),
    Academic.find({ student: req.params.id }).sort({ semester: 1 }),
    Record.find({ student: req.params.id }).sort({ date: -1 }),
    Session.find({ student: req.params.id }).populate("mentor", "name").sort({ scheduledAt: -1 }),
    Assessment.find({ student: req.params.id }).sort({ createdAt: -1 })
  ]);
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json({ student, academics, records, sessions, assessments, generatedAt: new Date() });
};
