import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { cleanUser } from "../utils/user.js";

export const setupStatus = async (_req, res) => res.json({ required: await User.countDocuments() === 0 });
export const setup = async (req, res) => {
  if (await User.countDocuments()) return res.status(409).json({ message: "Initial setup is already complete" });
  const { name, email, password, department } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ message: "Name, email and an 8+ character password are required" });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role: "admin", department });
  res.status(201).json({ message: "Administrator created", user: cleanUser(user) });
};
export const login = async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || "").toLowerCase() }).select("+password");
  if (!user || !user.active || !(await bcrypt.compare(req.body.password || "", user.password))) return res.status(401).json({ message: "Invalid email or password" });
  res.json({ user: cleanUser(user), token: jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" }) });
};
export const me = (req, res) => res.json(cleanUser(req.user));
export const updateMe = async (req, res) => {
  const updates = {};
  for (const key of ["name", "phone", "department"]) if (req.body[key] !== undefined) updates[key] = req.body[key];
  if (req.body.password) {
    if (req.body.password.length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters" });
    updates.password = await bcrypt.hash(req.body.password, 12);
  }
  res.json(cleanUser(await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })));
};
