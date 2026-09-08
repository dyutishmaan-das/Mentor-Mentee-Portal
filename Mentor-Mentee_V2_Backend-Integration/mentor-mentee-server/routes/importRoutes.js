/**
 * Import Routes
 * Handles bulk data imports for students and faculty
 */

import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { importValidators } from '../validators/validators.js';
import {
    importStudents,
    importFaculty,
    getImportTemplate,
    validateImportFile,
} from '../controllers/importController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/temp');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'), false);
        }
    },
});

// All routes require authentication
router.use(authenticate);

// Import students from Excel
router.post(
    '/students',
    authorize(['ADMIN', 'HOD']),
    upload.single('file'),
    importStudents
);

// Import faculty from Excel
router.post(
    '/faculty',
    authorize(['ADMIN', 'HOD']),
    upload.single('file'),
    importFaculty
);

// Get import template
router.get(
    '/template/:type',
    authorize(['ADMIN', 'HOD']),
    importValidators.getTemplate,
    getImportTemplate
);

// Validate import file before actual import
router.post(
    '/validate/:type',
    authorize(['ADMIN', 'HOD']),
    upload.single('file'),
    importValidators.importData,
    validateImportFile
);

export default router;
