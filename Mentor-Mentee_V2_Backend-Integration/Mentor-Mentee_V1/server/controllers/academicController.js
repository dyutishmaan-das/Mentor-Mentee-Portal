import Department from '../models/Department.js';
import Subject from '../models/Subject.js';
import Marks from '../models/Marks.js';
import Backlog from '../models/Backlog.js';
import Student from '../models/Student.js';
import Mentor from '../models/Mentor.js';
import { ApiError } from '../utils/ApiError.js';
import { listQuery } from '../utils/query.js';
import { calculateMarkResult } from '../services/academicService.js';
import { canAccessStudent } from '../services/accessService.js';
import { audit } from '../services/auditService.js';

export async function listDepartments(_req, res, next) {
  try {
    const data = await Department.find({ isDeleted: false }).sort({ name: 1 });
    res.json({ success: true, message: 'Departments retrieved successfully', data });
  } catch (error) {
    next(error);
  }
}

export async function createDepartment(req, res, next) {
  try {
    const department = await Department.create({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    await audit(req, {
      action: 'CREATE',
      module: 'DEPARTMENT',
      recordId: department.id,
      newValue: department.toObject(),
    });
    res
      .status(201)
      .json({ success: true, message: 'Department created successfully', data: department });
  } catch (error) {
    next(error);
  }
}

export async function listSubjects(req, res, next) {
  try {
    const filter = {
      ...(req.query.department && { department: req.query.department }),
      ...(req.query.semester && { semester: req.query.semester }),
    };
    const data = await Subject.find(filter).populate('department faculty').sort({ code: 1 });
    res.json({ success: true, message: 'Subjects retrieved successfully', data });
  } catch (error) {
    next(error);
  }
}

export async function createSubject(req, res, next) {
  try {
    const subject = await Subject.create({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    await audit(req, {
      action: 'CREATE',
      module: 'SUBJECT',
      recordId: subject.id,
      newValue: subject.toObject(),
    });
    res.status(201).json({ success: true, message: 'Subject created successfully', data: subject });
  } catch (error) {
    next(error);
  }
}

export async function listMarks(req, res, next) {
  try {
    const query = listQuery(req.query, { allowedSort: ['semester', 'total', 'createdAt'] });
    if (req.query.student)
      await canAccessStudent(req.user, req.query.student, { domain: 'academic' });
    if (req.user.role === 'MENTEE') {
      const student = await Student.findOne({ userId: req.user._id, isDeleted: false });
      if (!student) throw new ApiError(404, 'Student profile not found', 'NOT_FOUND');
      query.filter.student = student._id;
    } else if (req.user.role === 'MENTOR') {
      const mentor = await Mentor.findOne({ userId: req.user._id });
      const studentIds = mentor
        ? await Student.find({ mentorId: mentor._id, isDeleted: false }).distinct('_id')
        : [];
      query.filter.student = { $in: studentIds };
    } else if (req.query.student) query.filter.student = req.query.student;
    const [data, total] = await Promise.all([
      Marks.find(query.filter)
        .populate('student subject')
        .sort(query.sort)
        .skip(query.skip)
        .limit(query.limit),
      Marks.countDocuments(query.filter),
    ]);
    res.json({
      success: true,
      message: 'Marks retrieved successfully',
      data,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function upsertMarks(req, res, next) {
  try {
    if (!['ADMIN', 'ACADEMIC_FACULTY'].includes(req.user.role))
      throw new ApiError(403, 'Only academic staff can update marks', 'FORBIDDEN');
    await canAccessStudent(req.user, req.body.student, { write: true, domain: 'academic' });
    const derived = calculateMarkResult(req.body);
    const filter = {
      student: req.body.student,
      subject: req.body.subject,
      semester: req.body.semester,
    };
    const previous = await Marks.findOne(filter);
    const marks = await Marks.findOneAndUpdate(
      filter,
      {
        $set: { ...req.body, ...derived, updatedBy: req.user._id },
        $setOnInsert: { createdBy: req.user._id },
      },
      { upsert: true, new: true, runValidators: true },
    );
    if (marks.resultStatus === 'Fail')
      await Backlog.findOneAndUpdate(
        { student: marks.student, subject: marks.subject },
        {
          $set: { semester: marks.semester, status: 'Active', updatedBy: req.user._id },
          $setOnInsert: { createdBy: req.user._id },
        },
        { upsert: true },
      );
    await audit(req, {
      action: 'MARKS_UPDATE',
      module: 'MARKS',
      recordId: marks.id,
      oldValue: previous?.toObject(),
      newValue: marks.toObject(),
    });
    res.json({ success: true, message: 'Marks calculated and saved successfully', data: marks });
  } catch (error) {
    next(error);
  }
}
