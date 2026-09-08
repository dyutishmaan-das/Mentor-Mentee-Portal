import Mentor from '../models/Mentor.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import { ApiError } from '../utils/ApiError.js';
import { audit } from '../services/auditService.js';
export async function list(req, res, next) {
  try {
    const data = await Mentor.find().populate('userId department');
    res.json({ success: true, message: 'Mentors retrieved successfully', data });
  } catch (e) {
    next(e);
  }
}
export async function create(req, res, next) {
  try {
    if (!['ADMIN', 'HOD'].includes(req.user.role))
      throw new ApiError(403, 'Only administrators can create mentors', 'FORBIDDEN');
    const existing = await User.findOne({ email: req.body.email.toLowerCase() });
    if (existing) throw new ApiError(409, 'Email is already registered', 'DUPLICATE_EMAIL');
    const user = await User.create({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      password: req.body.password,
      role: 'MENTOR',
    });
    const mentor = await Mentor.create({
      ...req.body,
      userId: user._id,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    await audit(req, {
      action: 'CREATE',
      module: 'MENTOR',
      recordId: mentor.id,
      newValue: mentor.toObject(),
    });
    res.status(201).json({ success: true, message: 'Mentor created successfully', data: mentor });
  } catch (e) {
    next(e);
  }
}
export async function mentees(req, res, next) {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) throw new ApiError(404, 'Mentor not found', 'NOT_FOUND');
    if (!['ADMIN', 'HOD'].includes(req.user.role) && !mentor.userId.equals(req.user._id))
      throw new ApiError(403, 'You can only view your own mentees', 'FORBIDDEN');
    const data = await Student.find({ mentorId: mentor._id, isDeleted: false });
    res.json({ success: true, message: 'Assigned mentees retrieved successfully', data });
  } catch (e) {
    next(e);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const mentor = await Mentor.findOne({ userId: req.user._id });
    if (!mentor) throw new ApiError(404, 'Mentor profile not found', 'NOT_FOUND');
    const allowed = ['phone', 'specialization'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowed.includes(key)),
    );
    Object.assign(mentor, updates, { updatedBy: req.user._id });
    await mentor.save();
    await audit(req, {
      action: 'UPDATE',
      module: 'MENTOR_PROFILE',
      recordId: mentor.id,
      newValue: mentor.toObject(),
    });
    res.json({ success: true, message: 'Mentor profile updated successfully', data: mentor });
  } catch (error) {
    next(error);
  }
}
