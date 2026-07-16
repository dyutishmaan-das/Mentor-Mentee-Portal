import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import { cleanUser } from "../utils/user.js";
export const listUsers = async (req, res) => res.json(await User.find(req.query.role ? { role: req.query.role } : {}).sort({ name: 1 }));
export const createUser = async (req, res) => {
  const { name, email, password, role, department, phone } = req.body;
  if (!name || !email || !password || password.length < 8 || !role) return res.status(400).json({ message: "Complete all required user fields" });
  res.status(201).json(cleanUser(await User.create({ name, email, password: await bcrypt.hash(password, 12), role, department, phone })));
};
export const updateUser = async (req, res) => {
  const allowed = Object.fromEntries(Object.entries(req.body).filter(([key]) => ["name", "role", "department", "phone", "active"].includes(key)));
  res.json(cleanUser(await User.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true })));
};
