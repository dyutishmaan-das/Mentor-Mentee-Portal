import Student from '../models/Student.js';
import User from '../models/User.js';
import Mentor from '../models/Mentor.js';
import MentorAssignment from '../models/MentorAssignment.js';

import { ApiError } from '../utils/ApiError.js';
import { listQuery } from '../utils/query.js';
import { canAccessStudent } from '../services/accessService.js';
import { audit } from '../services/auditService.js';

const view = 'userId department mentorId';

/*
|--------------------------------------------------------------------------
| List Students
|--------------------------------------------------------------------------
| ADMIN / HOD / FACULTY / MENTOR
| can retrieve students according to their access.
|
| Filters supported:
| - search
| - program
| - gender
| - yearSection
| - yearOfPassing
| - semester
| - activeBacklogs
| - mentorId
|--------------------------------------------------------------------------
*/

export async function list(req, res, next) {
  try {
    const q = listQuery(req.query, {
      allowedSort: [
        'name',
        'studentId',
        'semester',
        'program',
        'yearOfPassing',
        'activeBacklogs',
        'createdAt',
      ],

      searchFields: [
        'name',
        'studentId',
        'rollNumber',
        'email',
        'fatherName',
      ],
    });

    /*
    |--------------------------------------------------------------------------
    | Additional Excel-based filters
    |--------------------------------------------------------------------------
    */

    if (req.query.program) {
      q.filter.program = req.query.program;
    }

    if (req.query.gender) {
      q.filter.gender = req.query.gender;
    }

    if (req.query.yearSection) {
      q.filter.yearSection = req.query.yearSection;
    }

    if (req.query.yearOfPassing) {
      q.filter.yearOfPassing = Number(req.query.yearOfPassing);
    }

    if (req.query.activeBacklogs !== undefined) {
      q.filter.activeBacklogs = Number(req.query.activeBacklogs);
    }

    /*
    |--------------------------------------------------------------------------
    | MENTOR
    |--------------------------------------------------------------------------
    */

    if (req.user.role === 'MENTOR') {
      const mentor = await Mentor.findOne({
        userId: req.user._id,
      });

      q.filter.mentorId = mentor?._id || null;
    }

    /*
    |--------------------------------------------------------------------------
    | MENTEE
    |--------------------------------------------------------------------------
    */

    if (req.user.role === 'MENTEE') {
      q.filter.userId = req.user._id;
    }

    /*
    |--------------------------------------------------------------------------
    | Get Students
    |--------------------------------------------------------------------------
    */

    const [items, total] = await Promise.all([
      Student.find(q.filter)
        .populate(view)
        .sort(q.sort)
        .skip(q.skip)
        .limit(q.limit),

      Student.countDocuments(q.filter),
    ]);

    res.json({
      success: true,
      message: 'Students retrieved successfully',

      data: items,

      pagination: {
        total,
        page: q.page,
        limit: q.limit,
        totalPages: Math.ceil(total / q.limit),
      },
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| Get Single Student
|--------------------------------------------------------------------------
*/

export async function get(req, res, next) {
  try {
    const student = await canAccessStudent(
      req.user,
      req.params.id,
      {
        domain: 'read',
      },
    );

    await student.populate(view);

    res.json({
      success: true,
      message: 'Student retrieved successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| Get Logged-in Student Profile
|--------------------------------------------------------------------------
*/

export async function getMyProfile(req, res, next) {
  try {
    if (req.user.role !== 'MENTEE') {
      throw new ApiError(
        403,
        'This profile endpoint is for mentees only',
        'FORBIDDEN',
      );
    }

    const student = await Student.findOne({
      userId: req.user._id,
      isDeleted: false,
    }).populate(view);

    if (!student) {
      throw new ApiError(
        404,
        'Student profile not found',
        'NOT_FOUND',
      );
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| Create Student
|--------------------------------------------------------------------------
| Normally used by ADMIN/HOD.
|
| Excel-imported students can also use the same Student model.
|--------------------------------------------------------------------------
*/

export async function create(req, res, next) {
  try {
    if (req.user.role !== 'ADMIN') {
      throw new ApiError(
        403,
        'Only Admin can create students',
        'FORBIDDEN',
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check duplicate email
    |--------------------------------------------------------------------------
    */

    const existingUser = await User.findOne({
      email: req.body.email.toLowerCase(),
    });

    if (existingUser) {
      throw new ApiError(
        409,
        'Email is already registered',
        'DUPLICATE_EMAIL',
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Create Login Account
    |--------------------------------------------------------------------------
    */

    const user = await User.create({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      password: req.body.password,
      role: 'MENTEE',
    });

    /*
    |--------------------------------------------------------------------------
    | Student ID and Roll Number
    |--------------------------------------------------------------------------
    | They come from the same Excel value.
    |--------------------------------------------------------------------------
    */

    const student = await Student.create({
      ...req.body,

      studentId: req.body.studentId,
      rollNumber: req.body.studentId,

      userId: user._id,

      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    await audit(req, {
      action: 'CREATE',
      module: 'STUDENT',
      recordId: student.id,
      newValue: student.toObject(),
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| Update Student
|--------------------------------------------------------------------------
|
| STUDENT:
| Can edit personal/profile information only.
|
| ADMIN/HOD:
| Can update official student information.
|--------------------------------------------------------------------------
*/

export async function update(req, res, next) {
  try {
    const domain =
      req.user.role === 'MENTEE'
        ? 'profile'
        : 'read';

    const current = await canAccessStudent(
      req.user,
      req.params.id,
      {
        write: true,
        domain,
      },
    );

    /*
    |--------------------------------------------------------------------------
    | Fields that a student is allowed to edit
    |--------------------------------------------------------------------------
    */

    const menteeAllowed = [
      'dateOfBirth',
      'gender',
      'address',

      'parents',
      'guardian',

      'hobbies',

      'hostelDetails',
      'transportDetails',

      'profilePhoto',

      'skillExpertise',
      'softSkills',
      'certificationsDone',
      'internships',
      'projects',
      'communicationLevel',
      'placementInterest',
      'higherStudiesPlan',
      'portfolioLinks',
      'achievementsAwards',
      'extracurricularLeadership',
      'remarks',
    ];

    /*
    |--------------------------------------------------------------------------
    | ADMIN/HOD can update official information.
    |--------------------------------------------------------------------------
    */

    const allowed =
      req.user.role === 'MENTEE'
        ? menteeAllowed
        : Object.keys(req.body);

    const changes = Object.fromEntries(
      Object.entries(req.body).filter(([key]) =>
        allowed.includes(key),
      ),
    );

    /*
    |--------------------------------------------------------------------------
    | Never allow student to change official identity fields
    |--------------------------------------------------------------------------
    */

    if (req.user.role === 'MENTEE') {
      delete changes.studentId;
      delete changes.rollNumber;
      delete changes.name;
      delete changes.email;
      delete changes.phone;
      delete changes.program;
      delete changes.yearSection;
      delete changes.yearOfPassing;
      delete changes.semester;
      delete changes.semesterPerformance;
      delete changes.aggregatePerformance;
      delete changes.activeBacklogs;
      delete changes.department;
      delete changes.mentorId;
}

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    const student = await Student.findByIdAndUpdate(
      current._id,

      {
        $set: {
          ...changes,
          updatedBy: req.user._id,
        },
      },

      {
        new: true,
        runValidators: true,
      },
    );

    /*
    |--------------------------------------------------------------------------
    | Audit
    |--------------------------------------------------------------------------
    */

    await audit(req, {
      action: 'STUDENT_UPDATE',
      module: 'STUDENT',
      recordId: student.id,

      oldValue: current.toObject(),

      newValue: student.toObject(),
    });

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
}


/*
|--------------------------------------------------------------------------
| Assign Mentor
|--------------------------------------------------------------------------
*/

export async function assignMentor(req, res, next) {
  try {
    if (!['ADMIN', 'HOD'].includes(req.user.role)) {
      throw new ApiError(
        403,
        'Only administrators can assign mentors',
        'FORBIDDEN',
      );
    }

    const student = await Student.findById(
      req.params.id,
    );

    const mentor = await Mentor.findById(
      req.body.mentorId,
    );

    if (!student || !mentor) {
      throw new ApiError(
        404,
        'Student or mentor not found',
        'NOT_FOUND',
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Deactivate previous mentor assignment
    |--------------------------------------------------------------------------
    */

    await MentorAssignment.updateMany(
      {
        student: student._id,
        isActive: true,
      },

      {
        $set: {
          isActive: false,
          unassignedAt: new Date(),
        },
      },
    );

    /*
    |--------------------------------------------------------------------------
    | Create new assignment
    |--------------------------------------------------------------------------
    */

    await MentorAssignment.create({
      student: student._id,
      mentor: mentor._id,
      assignedBy: req.user._id,
    });

    /*
    |--------------------------------------------------------------------------
    | Update Student
    |--------------------------------------------------------------------------
    */

    student.mentorId = mentor._id;
    student.updatedBy = req.user._id;

    await student.save();

    /*
    |--------------------------------------------------------------------------
    | Audit
    |--------------------------------------------------------------------------
    */

    await audit(req, {
      action: 'MENTOR_ASSIGNMENT',
      module: 'STUDENT',
      recordId: student.id,

      newValue: {
        mentorId: mentor.id,
      },
    });

    res.json({
      success: true,
      message: 'Mentor assigned successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
}