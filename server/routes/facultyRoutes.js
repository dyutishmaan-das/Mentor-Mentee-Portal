import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
    getFaculty,
    getFacultyById,
    updateFaculty,
    getFacultyMe,
} from '../controllers/facultyController.js';

const router = express.Router();

// All faculty routes require authentication
router.use(authenticate);

// Get current faculty member's profile
router.get('/me', getFacultyMe);

// Get all faculty (accessible by ADMIN, HOD)
router.get('/', authorize(['ADMIN', 'HOD']), getFaculty);

// Get faculty by ID (accessible by ADMIN, HOD)
router.get('/:id', authorize(['ADMIN', 'HOD']), getFacultyById);

// Update faculty profile (faculty can update their own, ADMIN/HOD can update any)
router.put('/:id', updateFaculty);

export default router;
