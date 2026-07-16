import bcrypt from "bcryptjs";
import { User, Student, Academic, Record, Session, Assessment } from "../models/index.js";
import { studentScope } from "../utils/user.js";
export const listStudents = async (req, res) => res.json(await Student.find(studentScope(req)).populate("user", "name email phone").populate("mentor", "name email").sort({ updatedAt: -1 }));
export const createStudent = async (req, res) => {
  const { name, email, password, ...profile } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ message: "Student name, email and an 8+ character password are required" });
  let user;
  try {
    user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role: "student", department: profile.branch, phone: profile.phone });
    const student = await Student.create({ ...profile, user: user._id });
    res.status(201).json(await student.populate(["user", "mentor"]));
  } catch (error) {
    if (user?._id) await User.findByIdAndDelete(user._id);
    throw error;
  }
};
export const getStudent = async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, ...studentScope(req) }).populate("user", "name email phone").populate("mentor", "name email");
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
};
export const updateStudent = async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, ...studentScope(req) });
  if (!student) return res.status(404).json({ message: "Student not found" });
  const userUpdates = {};
  for (const key of ["name", "email", "phone"]) if (req.body[key] !== undefined) { userUpdates[key] = req.body[key]; delete req.body[key]; }
  if (Object.keys(userUpdates).length) await User.findByIdAndUpdate(student.user, userUpdates, { runValidators: true });
  for (const key of ["_id", "user", "createdAt", "updatedAt"]) delete req.body[key];
  Object.assign(student, req.body);
  await student.save();
  res.json(await student.populate(["user", "mentor"]));
};
export const deleteStudent = async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });
  await Promise.all([User.findByIdAndDelete(student.user), Academic.deleteMany({ student: student._id }), Record.deleteMany({ student: student._id }), Session.deleteMany({ student: student._id }), Assessment.deleteMany({ student: student._id })]);
  res.status(204).end();
};
