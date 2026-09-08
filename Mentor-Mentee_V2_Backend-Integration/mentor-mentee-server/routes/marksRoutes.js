import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { getMarks, saveMarks } from '../controllers/marksController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getMarks);

// Admin, HOD, Academic Faculty, Mentor can update marks
router.put('/', authorize('ADMIN', 'HOD', 'ACADEMIC_FACULTY', 'MENTOR'), saveMarks);

export default router;
