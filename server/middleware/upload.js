/**
 * File Upload Configuration using Multer
 * Handles photo uploads for students, parents, and guardians
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ApiError } from './errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base upload directory
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure upload directories exist
const createUploadDirs = () => {
    const dirs = [
        path.join(uploadDir, 'students'),
        path.join(uploadDir, 'parents'),
        path.join(uploadDir, 'guardians'),
        path.join(uploadDir, 'faculty'),
        path.join(uploadDir, 'documents'),
        path.join(uploadDir, 'certificates'),
    ];

    dirs.forEach((dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'documents';

        // Determine folder based on fieldname
        if (file.fieldname === 'studentPhoto') {
            folder = 'students';
        } else if (file.fieldname === 'fatherPhoto' || file.fieldname === 'motherPhoto') {
            folder = 'parents';
        } else if (file.fieldname === 'guardianPhoto') {
            folder = 'guardians';
        } else if (file.fieldname === 'facultyPhoto') {
            folder = 'faculty';
        } else if (file.fieldname.includes('certificate') || file.fieldname.includes('document')) {
            folder = 'certificates';
        }

        cb(null, path.join(uploadDir, folder));
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        const name = file.fieldname;
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    },
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Only image files (JPEG, PNG, GIF, WEBP) are allowed'), false);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024, // 500KB max file size
    },
    fileFilter: fileFilter,
});

// Middleware for handling photo uploads
export const uploadPhotos = {
    // Single photo upload
    single: (fieldName) => upload.single(fieldName),

    // Multiple photos with specific fields
    fields: (fields) => upload.fields(fields),

    // Student complete profile photos (4 photos)
    studentProfile: upload.fields([
        { name: 'studentPhoto', maxCount: 1 },
        { name: 'fatherPhoto', maxCount: 1 },
        { name: 'motherPhoto', maxCount: 1 },
        { name: 'guardianPhoto', maxCount: 1 },
    ]),

    // Faculty photo
    facultyPhoto: upload.single('facultyPhoto'),

    // Document upload
    document: upload.single('document'),

    // Multiple documents
    documents: upload.array('documents', 10),
};

// Utility function to delete old file
export const deleteFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

// Middleware to handle multer errors
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ApiError(400, 'File size cannot exceed 500KB'));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new ApiError(400, 'Too many files uploaded'));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(new ApiError(400, 'Unexpected file field'));
        }
        return next(new ApiError(400, err.message));
    }
    next(err);
};

export default upload;
