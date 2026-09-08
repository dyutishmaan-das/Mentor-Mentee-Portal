// server/routes/attendanceRoutes.js

import { Router } from 'express';
import { body } from 'express-validator';

import { authenticate } from '../middleware/auth.js';

import {
  authorize,
  requirePermission,
} from '../middleware/authorize.js';

import { validate } from '../middleware/validate.js';

import * as controller from '../controllers/attendanceController.js';

const router = Router();

router.use(authenticate);

/*
|--------------------------------------------------------------------------
| VIEW ATTENDANCE
|--------------------------------------------------------------------------
|
| ADMIN
| HOD
| Academic Faculty
| Mentor
| Other Faculty
| Mentee
|
*/

router.get(
  '/',
  requirePermission('ATTENDANCE_READ'),
  controller.listAttendance,
);

/*
|--------------------------------------------------------------------------
| ATTENDANCE SUMMARY
|--------------------------------------------------------------------------
*/

router.get(
  '/summary',
  requirePermission('ATTENDANCE_READ'),
  controller.attendanceSummary,
);

/*
|--------------------------------------------------------------------------
| LOW ATTENDANCE REPORT
|--------------------------------------------------------------------------
*/

router.get(
  '/low-attendance',
  requirePermission('ATTENDANCE_READ'),
  controller.lowAttendance,
);

/*
|--------------------------------------------------------------------------
| RECORD ATTENDANCE
|--------------------------------------------------------------------------
|
| ONLY:
|
| ADMIN
| MENTOR
|
| Academic Faculty CANNOT do this.
|
*/

router.post(
  '/',
  requirePermission('ATTENDANCE_WRITE'),

  body('student').isMongoId(),

  body('subject').isMongoId(),

  body('date').isISO8601(),

  body('semester').isInt({
    min: 1,
    max: 12,
  }),

  body('status').isIn([
    'Present',
    'Absent',
  ]),

  validate,

  controller.recordAttendance,
);

/*
|--------------------------------------------------------------------------
| HOD / ADMIN ATTENDANCE OVERRIDE
|--------------------------------------------------------------------------
|
| Used when an attendance record needs correction.
|
*/

router.patch(
  '/:id/override',

  requirePermission(
    'ATTENDANCE_OVERRIDE',
  ),

  body('status')
    .optional()
    .isIn([
      'Present',
      'Absent',
    ]),

  body('date')
    .optional()
    .isISO8601(),

  body('semester')
    .optional()
    .isInt({
      min: 1,
      max: 12,
    }),

  validate,

  controller.overrideAttendance,
);

export default router;