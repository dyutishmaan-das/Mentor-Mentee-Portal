import Student from '../models/Student.js';
import Mentor from '../models/Mentor.js';
import { resourceRegistry } from '../config/resourceRegistry.js';
import { ApiError } from '../utils/ApiError.js';
import { canAccessStudent } from '../services/accessService.js';
import { audit } from '../services/auditService.js';

function resource(name) {
  const definition = resourceRegistry[name];
  if (!definition) throw new ApiError(404, 'Module not found', 'NOT_FOUND');
  return definition;
}

async function ownedStudent(req, definition, studentId, write) {
  if (!studentId && req.user.role !== 'MENTEE') return null;
  if (req.user.role === 'MENTEE' && !studentId) {
    const student = await Student.findOne({ userId: req.user._id, isDeleted: false });
    if (!student) throw new ApiError(404, 'Student profile not found', 'NOT_FOUND');
    return student;
  }
  return canAccessStudent(req.user, studentId, {
    write,
    domain: write ? definition.domain : 'read',
  });
}

export function list(name) {
  return async (req, res, next) => {
    try {
      const definition = resource(name);
      const student = await ownedStudent(req, definition, req.query.student, false);
      const filter = student ? { [definition.studentField]: student._id } : {};
      if (req.user.role === 'MENTOR' && !student) {
        const mentor = await Mentor.findOne({ userId: req.user._id });
        const students = mentor
          ? await Student.find({ mentorId: mentor._id, isDeleted: false })
          : [];
        filter[definition.studentField] = { $in: students.map((item) => item._id) };
      }
      if (req.user.role === 'MENTEE' && name === 'remarks') filter.visibleToStudent = true;
      const data = await definition.model.find(filter).sort({ createdAt: -1 }).limit(100);
      res.json({ success: true, message: `${name} retrieved successfully`, data });
    } catch (error) {
      next(error);
    }
  };
}

export function create(name) {
  return async (req, res, next) => {
    try {
      const definition = resource(name);
      if (!definition.roles.includes(req.user.role))
        throw new ApiError(403, 'You do not have permission to create this record', 'FORBIDDEN');
      const student = await ownedStudent(req, definition, req.body.student, true);
      const data = {
        ...req.body,
        [definition.studentField]: student._id,
        createdBy: req.user._id,
        updatedBy: req.user._id,
      };
      if (
        [
          'mentoring',
          'remarks',
          'assessments',
          'counseling',
          'parent-meetings',
          'progress-reviews',
        ].includes(name) &&
        !data.mentor
      ) {
        data.mentor = student.mentorId;
      }
      if (name === 'mentor-actions' && !data.mentor) data.mentor = student.mentorId;
      const record = await definition.model.create(data);
      await audit(req, {
        action: 'CREATE',
        module: name.toUpperCase(),
        recordId: record.id,
        newValue: record.toObject(),
      });
      res
        .status(201)
        .json({ success: true, message: `${name} created successfully`, data: record });
    } catch (error) {
      next(error);
    }
  };
}

export function update(name) {
  return async (req, res, next) => {
    try {
      const definition = resource(name);
      const record = await definition.model.findById(req.params.id);
      if (!record) throw new ApiError(404, 'Record not found', 'NOT_FOUND');
      if (!definition.roles.includes(req.user.role)) {
        throw new ApiError(403, 'You do not have permission to update this record', 'FORBIDDEN');
      }
      await ownedStudent(req, definition, record[definition.studentField], true);
      const updated = await definition.model.findByIdAndUpdate(
        record._id,
        { $set: { ...req.body, updatedBy: req.user._id } },
        { new: true, runValidators: true },
      );
      await audit(req, {
        action: 'UPDATE',
        module: name.toUpperCase(),
        recordId: updated.id,
        oldValue: record.toObject(),
        newValue: updated.toObject(),
      });
      res.json({ success: true, message: `${name} updated successfully`, data: updated });
    } catch (error) {
      next(error);
    }
  };
}
