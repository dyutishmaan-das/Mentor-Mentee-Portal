/**
 * System Routes
 * Handles system-level operations, announcements, settings, and reports
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { systemValidators } from '../validators/validators.js';
import {
    getSystemStats,
    getAnalytics,
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
    generateAttendanceReport,
    generateAcademicReport,
    generateMentoringReport,
    systemHealth,
} from '../controllers/systemController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// System statistics (Admin/HOD only)
router.get(
    '/stats',
    authorize(['ADMIN', 'HOD']),
    getSystemStats
);

// Analytics dashboard (Admin/HOD only)
router.get(
    '/analytics',
    authorize(['ADMIN', 'HOD']),
    systemValidators.getReports,
    getAnalytics
);

// Announcements
router.post(
    '/announcements',
    authorize(['ADMIN', 'HOD']),
    systemValidators.createAnnouncement,
    createAnnouncement
);

router.get('/announcements', getAnnouncements);

router.put(
    '/announcements/:id',
    authorize(['ADMIN', 'HOD']),
    updateAnnouncement
);

router.delete(
    '/announcements/:id',
    authorize(['ADMIN', 'HOD']),
    deleteAnnouncement
);

// Reports
router.get(
    '/reports/attendance',
    authorize(['ADMIN', 'HOD', 'ACADEMIC_FACULTY', 'MENTOR']),
    systemValidators.getReports,
    generateAttendanceReport
);

router.get(
    '/reports/academic',
    authorize(['ADMIN', 'HOD', 'ACADEMIC_FACULTY']),
    systemValidators.getReports,
    generateAcademicReport
);

router.get(
    '/reports/mentoring',
    authorize(['ADMIN', 'HOD', 'MENTOR']),
    systemValidators.getReports,
    generateMentoringReport
);

// System health check (Admin only)
router.get(
    '/health',
    authorize(['ADMIN']),
    systemHealth
);

export default router;
