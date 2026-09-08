// server/controllers/attendanceController.js

import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Mentor from '../models/Mentor.js';

import { ApiError } from '../utils/ApiError.js';

import {
  canAccessStudent,
} from '../services/accessService.js';

import {
  getAttendanceSummary,
} from '../services/attendanceService.js';

import { audit } from '../services/auditService.js';

/*
|--------------------------------------------------------------------------
| GET STUDENTS ACCESSIBLE TO USER
|--------------------------------------------------------------------------
*/

async function permittedStudents(user) {

  /*
  |--------------------------------------------------------------------------
  | MENTEE
  |--------------------------------------------------------------------------
  */

  if (user.role === 'MENTEE') {

    const student =
      await Student.findOne({
        userId: user._id,
        isDeleted: false,
      });

    return student
      ? [student._id]
      : [];
  }

  /*
  |--------------------------------------------------------------------------
  | MENTOR
  |--------------------------------------------------------------------------
  */

  if (user.role === 'MENTOR') {

    const mentor =
      await Mentor.findOne({
        userId: user._id,
      });

    return mentor
      ? Student.find({
          mentorId: mentor._id,
          isDeleted: false,
        }).distinct('_id')
      : [];
  }

  /*
  |--------------------------------------------------------------------------
  | ADMIN / HOD / FACULTY
  |--------------------------------------------------------------------------
  |
  | null means all students allowed by their permission.
  |
  */

  return null;
}

/*
|--------------------------------------------------------------------------
| LIST ATTENDANCE
|--------------------------------------------------------------------------
*/

export async function listAttendance(
  req,
  res,
  next,
) {

  try {

    const studentIds =
      await permittedStudents(
        req.user,
      );

    const filter = {

      ...(studentIds && {
        student: {
          $in: studentIds,
        },
      }),

      ...(req.query.student && {
        student:
          req.query.student,
      }),

      ...(req.query.subject && {
        subject:
          req.query.subject,
      }),

      ...(req.query.semester && {
        semester:
          Number(
            req.query.semester,
          ),
      }),
    };

    /*
    |--------------------------------------------------------------------------
    | Prevent mentor/mentee from accessing another student
    |--------------------------------------------------------------------------
    */

    if (
      studentIds &&
      req.query.student &&
      !studentIds.some(
        (id) =>
          id.equals(
            req.query.student,
          ),
      )
    ) {

      throw new ApiError(
        403,
        'You do not have access to this student',
        'FORBIDDEN',
      );
    }

    const data =
      await Attendance.find(
        filter,
      )
        .populate(
          'student subject faculty',
          'name studentId code email',
        )
        .sort({
          date: -1,
        })
        .limit(200);

    res.json({
      success: true,

      message:
        'Attendance retrieved successfully',

      data,
    });

  } catch (error) {

    next(error);

  }
}

/*
|--------------------------------------------------------------------------
| RECORD ATTENDANCE
|--------------------------------------------------------------------------
|
| ONLY users with ATTENDANCE_WRITE.
|
| Currently:
|
| ADMIN
| MENTOR
|
*/

export async function recordAttendance(
  req,
  res,
  next,
) {

  try {

    /*
    |--------------------------------------------------------------------------
    | Mentor must only record attendance
    | for assigned mentees.
    |--------------------------------------------------------------------------
    */

    await canAccessStudent(
      req.user,
      req.body.student,
      {
        write: true,
        domain: 'attendance',
      },
    );

    /*
    |--------------------------------------------------------------------------
    | Additional protection
    |--------------------------------------------------------------------------
    */

    if (
      ![
        'ADMIN',
        'MENTOR',
      ].includes(
        req.user.role,
      )
    ) {

      throw new ApiError(
        403,
        'Only Admin or Mentor can record attendance',
        'FORBIDDEN',
      );

    }

    const attendance =
      await Attendance.create({

        ...req.body,

        faculty:
          req.user._id,

        createdBy:
          req.user._id,

        updatedBy:
          req.user._id,

      });

    await audit(req, {

      action:
        'ATTENDANCE_CREATE',

      module:
        'ATTENDANCE',

      recordId:
        attendance.id,

      newValue:
        attendance.toObject(),

    });

    res
      .status(201)
      .json({

        success: true,

        message:
          'Attendance recorded successfully',

        data:
          attendance,

      });

  } catch (error) {

    next(error);

  }
}

/*
|--------------------------------------------------------------------------
| HOD / ADMIN ATTENDANCE OVERRIDE
|--------------------------------------------------------------------------
*/

export async function overrideAttendance(
  req,
  res,
  next,
) {

  try {

    const attendance =
      await Attendance.findById(
        req.params.id,
      );

    if (!attendance) {

      throw new ApiError(
        404,
        'Attendance record not found',
        'NOT_FOUND',
      );

    }

    const oldValue =
      attendance.toObject();

    /*
    |--------------------------------------------------------------------------
    | HOD / ADMIN can correct attendance.
    |--------------------------------------------------------------------------
    */

    await canAccessStudent(
      req.user,
      attendance.student,
      {
        write: false,
        domain: 'attendance',
      },
    );

    const allowedFields = [
      'status',
      'date',
      'semester',
    ];

    for (
      const field of allowedFields
    ) {

      if (
        req.body[field] !== undefined
      ) {

        attendance[field] =
          req.body[field];

      }

    }

    attendance.updatedBy =
      req.user._id;

    await attendance.save();

    await audit(req, {

      action:
        'ATTENDANCE_OVERRIDE',

      module:
        'ATTENDANCE',

      recordId:
        attendance.id,

      oldValue,

      newValue:
        attendance.toObject(),

    });

    res.json({

      success: true,

      message:
        'Attendance corrected successfully',

      data:
        attendance,

    });

  } catch (error) {

    next(error);

  }
}

/*
|--------------------------------------------------------------------------
| ATTENDANCE SUMMARY
|--------------------------------------------------------------------------
*/

export async function attendanceSummary(
  req,
  res,
  next,
) {

  try {

    const studentIds =
      await permittedStudents(
        req.user,
      );

    const requested =
      req.query.student
        ? [req.query.student]
        : studentIds;

    if (
      studentIds &&
      requested &&
      requested.some(
        (id) =>
          !studentIds.some(
            (allowed) =>
              allowed.equals(id),
          ),
      )
    ) {

      throw new ApiError(
        403,
        'You do not have access to this student',
        'FORBIDDEN',
      );

    }

    const data =
      await getAttendanceSummary(
        requested,
        req.query.semester,
      );

    res.json({

      success: true,

      message:
        'Attendance summary retrieved successfully',

      data,

    });

  } catch (error) {

    next(error);

  }
}

/*
|--------------------------------------------------------------------------
| LOW ATTENDANCE
|--------------------------------------------------------------------------
*/

export async function lowAttendance(
  req,
  res,
  next,
) {

  try {

    if (
      ![
        'ADMIN',
        'HOD',
        'ACADEMIC_FACULTY',
        'MENTOR',
      ].includes(
        req.user.role,
      )
    ) {

      throw new ApiError(
        403,
        'You do not have permission to view this report',
        'FORBIDDEN',
      );

    }

    const studentIds =
      await permittedStudents(
        req.user,
      );

    const summaries =
      await getAttendanceSummary(
        studentIds,
        req.query.semester,
      );

    const threshold =
      Math.min(
        Math.max(
          Number(
            req.query.threshold,
          ) || 75,
          0,
        ),
        100,
      );

    const low =
      summaries.filter(
        (summary) =>
          summary.percentage <
          threshold,
      );

    const students =
      await Student.find({
        _id: {
          $in:
            low.map(
              (summary) =>
                summary._id,
            ),
        },
      }).select(
        'name studentId semester section',
      );

    const data =
      low.map(
        (summary) => ({

          ...summary,

          student:
            students.find(
              (student) =>
                student._id.equals(
                  summary._id,
                ),
            ),

        }),
      );

    res.json({

      success: true,

      message:
        'Low attendance report retrieved successfully',

      data,

    });

  } catch (error) {

    next(error);

  }
}