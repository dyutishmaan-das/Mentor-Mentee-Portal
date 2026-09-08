// server/config/permissions.js

export const ROLES = [
  'ADMIN',
  'HOD',
  'ACADEMIC_FACULTY',
  'MENTOR',
  'OTHER_FACULTY',
  'MENTEE',
];

/*
|--------------------------------------------------------------------------
| ROLE PERMISSIONS
|--------------------------------------------------------------------------
|
| ADMIN
|   Full system access.
|
| HOD
|   Department-level supervision.
|   Can view everything relevant to the department.
|   Can override/correct attendance.
|
| ACADEMIC_FACULTY
|   Academic marks only.
|   Attendance is VIEW ONLY.
|
| MENTOR
|   Mentoring + attendance for assigned mentees.
|   Academic information is VIEW ONLY.
|
| OTHER_FACULTY
|   Limited read access.
|
| MENTEE
|   Own profile/portfolio write access.
|   Official academic/attendance/mentoring data is READ ONLY.
|
|--------------------------------------------------------------------------
*/

export const permissions = {
  /*
  |--------------------------------------------------------------------------
  | ADMIN
  |--------------------------------------------------------------------------
  */

  ADMIN: [
    '*',
  ],

  /*
  |--------------------------------------------------------------------------
  | HOD
  |--------------------------------------------------------------------------
  */

  HOD: [
    'STUDENT_READ',

    'ACADEMIC_READ',

    'ATTENDANCE_READ',
    'ATTENDANCE_OVERRIDE',

    'MENTORING_READ',

    'REPORT_READ',
    'DEPARTMENT_REPORT_READ',

    'AUDIT_LOG_READ',
  ],

  /*
  |--------------------------------------------------------------------------
  | ACADEMIC FACULTY
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | ATTENDANCE_WRITE IS INTENTIONALLY NOT PRESENT.
  |
  */

  ACADEMIC_FACULTY: [
    'STUDENT_READ',

    'ACADEMIC_READ',
    'ACADEMIC_WRITE',

    'ATTENDANCE_READ',

    'REPORT_READ',
  ],

  /*
  |--------------------------------------------------------------------------
  | MENTOR
  |--------------------------------------------------------------------------
  |
  | Mentor can modify attendance ONLY for assigned mentees.
  |
  */

  MENTOR: [
    'STUDENT_ASSIGNED_READ',

    'MENTEE_READ',

    'MENTORING_READ',
    'MENTORING_WRITE',
    'MENTOR_DATA_WRITE',

    'ACADEMIC_ASSIGNED_READ',

    'ATTENDANCE_ASSIGNED_READ',
    'ATTENDANCE_WRITE',

    'REPORT_ASSIGNED_READ',
  ],

  /*
  |--------------------------------------------------------------------------
  | OTHER FACULTY
  |--------------------------------------------------------------------------
  */

  OTHER_FACULTY: [
    'STUDENT_READ',
    'REPORT_READ',
  ],

  /*
  |--------------------------------------------------------------------------
  | MENTEE
  |--------------------------------------------------------------------------
  */

  MENTEE: [
    'SELF_READ',

    'SELF_PROFILE_WRITE',
    'SELF_PORTFOLIO_WRITE',

    'ACADEMIC_SELF_READ',
    'ATTENDANCE_SELF_READ',
    'MENTORING_SELF_READ',

    'RESOURCE_READ',
  ],
};

/*
|--------------------------------------------------------------------------
| ROLE MANAGEMENT
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| HOD, Academic Faculty and Mentor are NOT parent/child roles.
|
| They are parallel institutional roles under ADMIN.
|
| Mentee accounts are created/managed by ADMIN.
|
|--------------------------------------------------------------------------
*/

const roleManagement = {
  ADMIN: [
    'HOD',
    'ACADEMIC_FACULTY',
    'MENTOR',
    'OTHER_FACULTY',
    'MENTEE',
  ],

  HOD: [],

  ACADEMIC_FACULTY: [],

  MENTOR: [],

  OTHER_FACULTY: [],

  MENTEE: [],
};

export const canManageRole = (managerRole, targetRole) => {
  if (!managerRole || !targetRole) {
    return false;
  }

  return roleManagement[managerRole]?.includes(targetRole) ?? false;
};

export const hasPermission = (role, permission) => {
  if (!role || !permission) {
    return false;
  }

  if (!permissions[role]) {
    return false;
  }

  return (
    permissions[role].includes('*') ||
    permissions[role].includes(permission)
  );
};