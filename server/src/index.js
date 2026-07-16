import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import { User, Student, Academic, Record, Session, Assessment } from "./models.js";

const app = express();
const port = Number(process.env.PORT) || 5000;
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET must be configured");

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const auth = wrap(async (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Authentication required" });
  const decoded = jwt.verify(token, secret);
  const user = await User.findById(decoded.id).lean();
  if (!user?.active) return res.status(401).json({ message: "Account is inactive" });
  req.user = user;
  next();
});
const allow = (...roles) => (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ message: "You do not have permission" });
const studentScope = req => req.user.role === "mentor" ? { mentor: req.user._id } : req.user.role === "student" ? { user: req.user._id } : {};
const cleanUser = user => ({ id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, phone: user.phone });

app.get("/api/health", (_req, res) => res.json({ status: mongoose.connection.readyState === 1 ? "ok" : "unavailable", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" }));
app.get("/api/setup/status", wrap(async (_req, res) => res.json({ required: await User.countDocuments() === 0 })));
app.post("/api/setup", wrap(async (req, res) => {
  if (await User.countDocuments()) return res.status(409).json({ message: "Initial setup is already complete" });
  const { name, email, password, department } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ message: "Name, email and an 8+ character password are required" });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role: "admin", department });
  res.status(201).json({ message: "Administrator created", user: cleanUser(user) });
}));
app.post("/api/auth/login", wrap(async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || "").toLowerCase() }).select("+password");
  if (!user || !user.active || !(await bcrypt.compare(req.body.password || "", user.password))) return res.status(401).json({ message: "Invalid email or password" });
  const payload = cleanUser(user);
  res.json({ user: payload, token: jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: "8h" }) });
}));
app.get("/api/auth/me", auth, (req, res) => res.json(cleanUser(req.user)));
app.patch("/api/auth/me", auth, wrap(async (req, res) => {
  const updates = {};
  for (const key of ["name", "phone", "department"]) if (req.body[key] !== undefined) updates[key] = req.body[key];
  if (req.body.password) {
    if (req.body.password.length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters" });
    updates.password = await bcrypt.hash(req.body.password, 12);
  }
  res.json(cleanUser(await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })));
}));

app.get("/api/users", auth, allow("admin", "hod"), wrap(async (req, res) => res.json(await User.find(req.query.role ? { role: req.query.role } : {}).sort({ name: 1 }))));
app.post("/api/users", auth, allow("admin"), wrap(async (req, res) => {
  const { name, email, password, role, department, phone } = req.body;
  if (!name || !email || !password || password.length < 8 || !role) return res.status(400).json({ message: "Complete all required user fields" });
  res.status(201).json(cleanUser(await User.create({ name, email, password: await bcrypt.hash(password, 12), role, department, phone })));
}));
app.patch("/api/users/:id", auth, allow("admin"), wrap(async (req, res) => {
  const allowed = Object.fromEntries(Object.entries(req.body).filter(([k]) => ["name", "role", "department", "phone", "active"].includes(k)));
  res.json(cleanUser(await User.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true })));
}));

app.get("/api/students", auth, wrap(async (req, res) => {
  const list = await Student.find(studentScope(req)).populate("user", "name email phone").populate("mentor", "name email").sort({ updatedAt: -1 });
  res.json(list);
}));
app.post("/api/students", auth, allow("admin", "hod"), wrap(async (req, res) => {
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
}));
app.get("/api/students/:id", auth, wrap(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, ...studentScope(req) }).populate("user", "name email phone").populate("mentor", "name email");
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
}));
app.patch("/api/students/:id", auth, wrap(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, ...studentScope(req) });
  if (!student) return res.status(404).json({ message: "Student not found" });
  const userUpdates = {};
  for (const key of ["name", "email", "phone"]) if (req.body[key] !== undefined) {
    userUpdates[key] = req.body[key];
    delete req.body[key];
  }
  if (Object.keys(userUpdates).length) await User.findByIdAndUpdate(student.user, userUpdates, { runValidators: true });
  const forbidden = ["_id", "user", "createdAt", "updatedAt"];
  forbidden.forEach(k => delete req.body[k]);
  Object.assign(student, req.body);
  await student.save();
  res.json(await student.populate(["user", "mentor"]));
}));
app.delete("/api/students/:id", auth, allow("admin"), wrap(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });
  await Promise.all([User.findByIdAndDelete(student.user), Academic.deleteMany({ student: student._id }), Record.deleteMany({ student: student._id }), Session.deleteMany({ student: student._id }), Assessment.deleteMany({ student: student._id })]);
  res.status(204).end();
}));

const crud = (pathName, Model, roles = ["admin", "hod", "mentor", "student"]) => {
  app.get(`/api/${pathName}`, auth, wrap(async (req, res) => {
    const filter = {};
    if (req.query.student) filter.student = req.query.student;
    if (req.query.category) filter.category = req.query.category;
    res.json(await Model.find(filter).populate("student", "enrollmentNo user").populate("mentor", "name").sort({ createdAt: -1 }));
  }));
  app.post(`/api/${pathName}`, auth, allow(...roles), wrap(async (req, res) => res.status(201).json(await Model.create({ ...req.body, ...(pathName === "assessments" ? { submittedBy: req.user._id } : {}) }))));
  app.patch(`/api/${pathName}/:id`, auth, allow(...roles), wrap(async (req, res) => res.json(await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }))));
  app.delete(`/api/${pathName}/:id`, auth, allow("admin", "hod", "mentor"), wrap(async (req, res) => { await Model.findByIdAndDelete(req.params.id); res.status(204).end(); }));
};
crud("academics", Academic, ["admin", "hod", "mentor"]);
crud("records", Record);
crud("assessments", Assessment);

app.get("/api/sessions", auth, wrap(async (req, res) => {
  const filter = req.user.role === "mentor" ? { mentor: req.user._id } : {};
  if (req.query.student) filter.student = req.query.student;
  res.json(await Session.find(filter).populate({ path: "student", populate: { path: "user", select: "name email" } }).populate("mentor", "name").sort({ scheduledAt: -1 }));
}));
app.post("/api/sessions", auth, allow("admin", "hod", "mentor"), wrap(async (req, res) => res.status(201).json(await Session.create({ ...req.body, mentor: req.user.role === "mentor" ? req.user._id : req.body.mentor }))));
app.patch("/api/sessions/:id", auth, allow("admin", "hod", "mentor"), wrap(async (req, res) => res.json(await Session.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }))));
app.delete("/api/sessions/:id", auth, allow("admin", "hod", "mentor"), wrap(async (req, res) => { await Session.findByIdAndDelete(req.params.id); res.status(204).end(); }));

app.get("/api/dashboard", auth, wrap(async (req, res) => {
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
}));

app.get("/api/reports/student/:id", auth, wrap(async (req, res) => {
  const [student, academics, records, sessions, assessments] = await Promise.all([
    Student.findById(req.params.id).populate("user", "name email phone").populate("mentor", "name email"),
    Academic.find({ student: req.params.id }).sort({ semester: 1 }),
    Record.find({ student: req.params.id }).sort({ date: -1 }),
    Session.find({ student: req.params.id }).populate("mentor", "name").sort({ scheduledAt: -1 }),
    Assessment.find({ student: req.params.id }).sort({ createdAt: -1 })
  ]);
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json({ student, academics, records, sessions, assessments, generatedAt: new Date() });
}));

if (process.env.NODE_ENV === "production") {
  const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client/dist");
  app.use(express.static(dist));
  app.get("*", (req, res, next) => req.path.startsWith("/api") ? next() : res.sendFile(path.join(dist, "index.html")));
}
app.use((req, res) => res.status(404).json({ message: "Endpoint not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === 11000) return res.status(409).json({ message: "A record with this email or enrollment number already exists" });
  res.status(err.name === "ValidationError" || err.name === "CastError" ? 400 : 500).json({ message: err.message || "Internal server error" });
});

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI must be configured; demo mode has been removed");
await mongoose.connect(process.env.MONGODB_URI);
app.listen(port, () => console.log(`MentorConnect running on port ${port}`));
