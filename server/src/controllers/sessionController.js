import { Session } from "../models/index.js";
export const listSessions = async (req, res) => {
  const filter = req.user.role === "mentor" ? { mentor: req.user._id } : {};
  if (req.query.student) filter.student = req.query.student;
  res.json(await Session.find(filter).populate({ path: "student", populate: { path: "user", select: "name email" } }).populate("mentor", "name").sort({ scheduledAt: -1 }));
};
export const createSession = async (req, res) => res.status(201).json(await Session.create({ ...req.body, mentor: req.user.role === "mentor" ? req.user._id : req.body.mentor }));
export const updateSession = async (req, res) => res.json(await Session.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }));
export const deleteSession = async (req, res) => { await Session.findByIdAndDelete(req.params.id); res.status(204).end(); };
