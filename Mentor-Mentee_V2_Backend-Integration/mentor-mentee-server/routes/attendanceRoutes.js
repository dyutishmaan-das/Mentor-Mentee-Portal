import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { getAttendance, saveAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAttendance);

// ACADEMIC_FACULTY has NO write access to attendance
// Only ADMIN, HOD, and MENTOR can save attendance
router.post('/', authorize('ADMIN', 'HOD', 'MENTOR'), saveAttendance);

export default router;
