/**
 * Resource Controller
 * Handles file uploads, downloads, and resource management
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Upload student profile photos
 * POST /api/resources/upload/student/:id
 */
export const uploadStudentPhotos = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const files = req.files;

    if (!files || Object.keys(files).length === 0) {
        throw new ApiError(400, 'No files uploaded');
    }

    const student = await Student.findOne({ rollNo: id });
    if (!student) {
        throw new ApiError(404, 'Student not found');
    }

    // Check if user is a student (MENTEE) trying to upload
    const isStudent = req.user.role === 'MENTEE';
    
    if (isStudent) {
        // Check if student is uploading to their own profile
        if (student.userId && student.userId.toString() !== req.user._id.toString()) {
            throw new ApiError(403, 'You can only upload photos to your own profile');
        }

        // Check 3-attempt limit for students only
        if (student.photoUploadAttempts >= 3) {
            throw new ApiError(403, 'Photo upload limit reached. You have used all 3 attempts. Please contact your mentor or admin for assistance.');
        }
    }

    // Update photo URLs
    const photoUpdates = {};
    const uploadedPhotos = [];
    
    if (files.studentPhoto) {
        photoUpdates.photoUrl = `/uploads/students/${files.studentPhoto[0].filename}`;
        uploadedPhotos.push('studentPhoto');
    }
    if (files.fatherPhoto) {
        photoUpdates.parentFatherPhotoUrl = `/uploads/parents/${files.fatherPhoto[0].filename}`;
        uploadedPhotos.push('fatherPhoto');
    }
    if (files.motherPhoto) {
        photoUpdates.parentMotherPhotoUrl = `/uploads/parents/${files.motherPhoto[0].filename}`;
        uploadedPhotos.push('motherPhoto');
    }
    if (files.guardianPhoto) {
        photoUpdates.guardianPhotoUrl = `/uploads/guardians/${files.guardianPhoto[0].filename}`;
        uploadedPhotos.push('guardianPhoto');
    }

    Object.assign(student, photoUpdates);
    
    // Increment upload attempts only for students
    if (isStudent) {
        student.photoUploadAttempts += 1;
        
        // Add to upload history
        student.photoUploadHistory.push({
            uploadedAt: new Date(),
            uploadedBy: req.user._id,
            photosUploaded: uploadedPhotos,
        });
    }
    
    await student.save();

    // Calculate remaining attempts for students
    const remainingAttempts = isStudent ? 3 - student.photoUploadAttempts : null;
    
    const responseMessage = isStudent 
        ? `Photos uploaded successfully. ${remainingAttempts} attempt(s) remaining.`
        : 'Photos uploaded successfully';

    res.json({
        success: true,
        message: responseMessage,
        data: {
            ...photoUpdates,
            uploadAttempts: isStudent ? student.photoUploadAttempts : undefined,
            remainingAttempts: remainingAttempts,
        },
    });
});

/**
 * Upload faculty photo
 * POST /api/resources/upload/faculty/:id
 */
export const uploadFacultyPhoto = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
        throw new ApiError(400, 'No file uploaded');
    }

    const faculty = await User.findById(id);
    if (!faculty) {
        throw new ApiError(404, 'Faculty not found');
    }

    faculty.photoUrl = `/uploads/faculty/${file.filename}`;
    await faculty.save();

    res.json({
        success: true,
        message: 'Photo uploaded successfully',
        data: { photoUrl: faculty.photoUrl },
    });
});

/**
 * Upload document/certificate
 * POST /api/resources/upload/document
 */
export const uploadDocument = asyncHandler(async (req, res) => {
    const file = req.file;

    if (!file) {
        throw new ApiError(400, 'No file uploaded');
    }

    res.json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
            filename: file.filename,
            url: `/uploads/documents/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype,
        },
    });
});

/**
 * Get file/photo
 * GET /api/resources/file/:folder/:filename
 */
export const getFile = asyncHandler(async (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', folder, filename);

    if (!fs.existsSync(filePath)) {
        throw new ApiError(404, 'File not found');
    }

    res.sendFile(filePath);
});

/**
 * Delete file
 * DELETE /api/resources/file/:folder/:filename
 */
export const deleteFile = asyncHandler(async (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', folder, filename);

    if (!fs.existsSync(filePath)) {
        throw new ApiError(404, 'File not found');
    }

    fs.unlinkSync(filePath);

    res.json({
        success: true,
        message: 'File deleted successfully',
    });
});

/**
 * List files in folder
 * GET /api/resources/list/:folder
 */
export const listFiles = asyncHandler(async (req, res) => {
    const { folder } = req.params;
    const folderPath = path.join(__dirname, '..', 'uploads', folder);

    if (!fs.existsSync(folderPath)) {
        throw new ApiError(404, 'Folder not found');
    }

    const files = fs.readdirSync(folderPath).map((filename) => {
        const stats = fs.statSync(path.join(folderPath, filename));
        return {
            filename,
            url: `/uploads/${folder}/${filename}`,
            size: stats.size,
            createdAt: stats.birthtime,
        };
    });

    res.json({
        success: true,
        data: files,
    });
});
