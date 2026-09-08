import Student from '../models/Student.js';
import Mentor from '../models/Mentor.js';
import { ApiError } from '../utils/ApiError.js';

const ELEVATED_ROLES = new Set(['ADMIN', 'HOD']);

const STAFF_ROLES = new Set([
  'ACADEMIC_FACULTY',
  'MENTOR',
  'OTHER_FACULTY',
]);

export async function canAccessStudent(
  user,
  studentId,
  { write = false, domain = 'read' } = {},
) {
  if (!user?._id) {
    throw new ApiError(
      401,
      'Authentication required',
      'UNAUTHORIZED',
    );
  }

  if (!studentId) {
    throw new ApiError(
      400,
      'Student ID is required',
      'INVALID_STUDENT_ID',
    );
  }

  const student = await Student.findOne({
    _id: studentId,
    isDeleted: false,
  });

  if (!student) {
    throw new ApiError(
      404,
      'Student not found',
      'NOT_FOUND',
    );
  }

  // =========================================================
  // ADMIN / HOD
  // =========================================================
  //
  // Full student management access.
  //

  if (ELEVATED_ROLES.has(user.role)) {
    return student;
  }

  // =========================================================
  // MENTEE
  // =========================================================
  //
  // A mentee can ONLY access their own student record.
  //

  if (user.role === 'MENTEE') {
    const isOwnProfile =
      student.userId &&
      student.userId.equals(user._id);

    if (!isOwnProfile) {
      throw new ApiError(
        403,
        'You can only access your own student profile',
        'FORBIDDEN',
      );
    }

    if (write) {
      const allowedDomains = [
        'profile',
        'portfolio',
        'selfAssessment',
        'feedback',
      ];

      if (!allowedDomains.includes(domain)) {
        throw new ApiError(
          403,
          'Mentees cannot modify official records',
          'FORBIDDEN',
        );
      }
    }

    return student;
  }

  // =========================================================
  // MENTOR
  // =========================================================
  //
  // Mentor can:
  // - view assigned mentees
  // - access mentoring information
  // - access academic/attendance information of assigned mentees
  // - update mentoring-related information
  //

  if (user.role === 'MENTOR') {
    const mentor = await Mentor.findOne({
      userId: user._id,
    });

    if (!mentor) {
      throw new ApiError(
        403,
        'Mentor profile not found',
        'FORBIDDEN',
      );
    }

    const isAssigned =
      student.mentorId &&
      student.mentorId.equals(mentor._id);

    if (!isAssigned) {
      throw new ApiError(
        403,
        'You can only access students assigned to you',
        'FORBIDDEN',
      );
    }

    const allowedDomains = [
      'read',
      'mentoring',
      'mentorData',
      'academic',
      'attendance',
      'report',
    ];

    if (!allowedDomains.includes(domain)) {
      throw new ApiError(
        403,
        'You do not have access to this student information',
        'FORBIDDEN',
      );
    }

    return student;
  }

  // =========================================================
  // ACADEMIC FACULTY
  // =========================================================
  //
  // Academic Faculty can access academic/student/attendance
  // information.
  //

  if (user.role === 'ACADEMIC_FACULTY') {
    const allowedDomains = [
      'read',
      'academic',
      'attendance',
      'report',
    ];

    if (!allowedDomains.includes(domain)) {
      throw new ApiError(
        403,
        'You do not have access to this student information',
        'FORBIDDEN',
      );
    }

    return student;
  }

  // =========================================================
  // OTHER FACULTY
  // =========================================================
  //
  // Other Faculty has read-only student/report access.
  //

  if (user.role === 'OTHER_FACULTY') {
    if (
      write ||
      !['read', 'report'].includes(domain)
    ) {
      throw new ApiError(
        403,
        'Other Faculty has read-only access',
        'FORBIDDEN',
      );
    }

    return student;
  }

  // =========================================================
  // UNKNOWN ROLE
  // =========================================================

  if (!STAFF_ROLES.has(user.role)) {
    throw new ApiError(
      403,
      'You do not have access to this student',
      'FORBIDDEN',
    );
  }

  throw new ApiError(
    403,
    'You do not have access to this student',
    'FORBIDDEN',
  );
}

// =============================================================
// MIDDLEWARE
// =============================================================

export const studentAccess =
  ({
    write = false,
    domain = 'read',
    param = 'studentId',
  } = {}) =>
  async (req, _res, next) => {
    try {
      const studentId =
        req.params[param] ||
        req.body.student ||
        req.body.studentId;

      req.student = await canAccessStudent(
        req.user,
        studentId,
        {
          write,
          domain,
        },
      );

      next();
    } catch (error) {
      next(error);
    }
  };
