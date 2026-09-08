/**
 * Resource Routes
 * Handles file uploads, downloads, and resource management
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { uploadPhotos, handleMulterError } from '../middleware/upload.js';
import { resourceValidators } from '../validators/validators.js';
import {
    uploadStudentPhotos,
    uploadFacultyPhoto,
    uploadDocument,
    getFile,
    deleteFile,
    listFiles,
} from '../controllers/resourceController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Upload student photos (4 photos: student, father, mother, guardian)
router.post(
    '/upload/student/:id',
    authorize(['ADMIN', 'HOD', 'MENTOR', 'MENTEE']),
    uploadPhotos.studentProfile,
    handleMulterError,
    resourceValidators.uploadPhoto,
    uploadStudentPhotos
);

// Upload faculty photo
router.post(
    '/upload/faculty/:id',
    authorize(['ADMIN', 'HOD']),
    uploadPhotos.facultyPhoto,
    handleMulterError,
    resourceValidators.uploadPhoto,
    uploadFacultyPhoto
);

// Upload document/certificate
router.post(
    '/upload/document',
    uploadPhotos.document,
    handleMulterError,
    uploadDocument
);

// Get file/photo
router.get(
    '/file/:folder/:filename',
    resourceValidators.getFile,
    getFile
);

// Delete file
router.delete(
    '/file/:folder/:filename',
    authorize(['ADMIN', 'HOD']),
    resourceValidators.getFile,
    deleteFile
);

// List files in folder
router.get(
    '/list/:folder',
    authorize(['ADMIN', 'HOD']),
    listFiles
);

export default router;
