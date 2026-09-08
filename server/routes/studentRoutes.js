import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
    getStudents,
    getStudentMe,
    getStudentById,
    updateStudent,
    getSectionAllotmentList,
    bulkAllotSection,
    toggleStudentStatus,
    deleteStudent,
} from '../controllers/studentController.js';
import {
    getMyProfile,
    completeProfile,
    updateProfile,
    getProfileStatus,
} from '../controllers/studentProfileController.js';

const router = express.Router();

// All student routes require authentication
router.use(authenticate);

// ========================================
// STUDENT PROFILE COMPLETION ROUTES
// ========================================

// Get profile completion status
router.get('/profile/status', getProfileStatus);

// Get own profile
router.get('/profile/me', getMyProfile);

// Complete profile (first time after registration approval)
router.put('/profile/complete', completeProfile);

// Update profile (after completion)
router.put('/profile/update', updateProfile);

// ========================================
// HOD / ADMIN SECTION ALLOTMENT ROUTES
// ========================================
router.get('/section-allotment/list', authorize(['HOD', 'ADMIN']), getSectionAllotmentList);
router.post('/section-allotment/bulk', authorize(['HOD', 'ADMIN']), bulkAllotSection);

// ========================================
// EXISTING STUDENT ROUTES
// ========================================

// /api/students/me must come BEFORE /api/students/:id
// otherwise Express treats "me" as an :id parameter
router.get('/me', getStudentMe);

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.patch('/:id/status', authorize(['ADMIN', 'HOD']), toggleStudentStatus);
router.delete('/:id', authorize(['ADMIN']), deleteStudent);

export default router;
