import Student from '../models/Student.js';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Student Profile Completion Controller
 * Handles completing student profile after first login
 */

/**
 * Get current student's profile
 * GET /api/students/profile/me
 */
export const getMyProfile = asyncHandler(async (req, res) => {
    let student = await Student.findOne({ userId: req.user._id }).lean();
    
    if (!student && req.user.email) {
        student = await Student.findOne({ email: req.user.email.toLowerCase() }).lean();
    }

    if (!student) {
        throw new ApiError(404, 'Student profile not found');
    }

    res.json({
        success: true,
        data: student,
    });
});

/**
 * Complete student profile (after first login)
 * PUT /api/students/profile/complete
 */
export const completeProfile = asyncHandler(async (req, res) => {
    let student = await Student.findOne({ userId: req.user._id });
    
    if (!student && req.user.email) {
        student = await Student.findOne({ email: req.user.email.toLowerCase() });
        if (student && !student.userId) {
            student.userId = req.user._id;
        }
    }

    if (!student) {
        throw new ApiError(404, 'Student profile not found');
    }

    const payload = { ...req.body };
    delete payload._id;
    delete payload.userId;
    delete payload.rollNo;
    delete payload.section;

    if (payload.dob && !payload.dateOfBirth) {
        payload.dateOfBirth = payload.dob;
    }
    if (payload.dateOfBirth && !payload.dob) {
        payload.dob = payload.dateOfBirth;
    }

    // Merge all student profile updates
    Object.assign(student, payload);

    // Mark profile as completed
    student.profileCompleted = true;
    if (!student.profileCompletedAt) {
        student.profileCompletedAt = new Date();
    }

    await student.save();

    res.json({
        success: true,
        message: 'Profile completed successfully',
        data: student.toObject(),
    });
});

/**
 * Update student profile (after completion)
 * PUT /api/students/profile/update
 */
export const updateProfile = asyncHandler(async (req, res) => {
    let student = await Student.findOne({ userId: req.user._id });
    
    if (!student && req.user.email) {
        student = await Student.findOne({ email: req.user.email.toLowerCase() });
    }

    if (!student) {
        throw new ApiError(404, 'Student profile not found');
    }

    const payload = { ...req.body };
    delete payload._id;
    delete payload.userId;
    delete payload.rollNo;
    delete payload.section;

    if (payload.dob && !payload.dateOfBirth) {
        payload.dateOfBirth = payload.dob;
    }
    if (payload.dateOfBirth && !payload.dob) {
        payload.dob = payload.dateOfBirth;
    }

    Object.assign(student, payload);

    await student.save();

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: student.toObject(),
    });
});

/**
 * Check if profile is completed
 * GET /api/students/profile/status
 */
export const getProfileStatus = asyncHandler(async (req, res) => {
    let student = await Student.findOne({ userId: req.user._id })
        .select('rollNo name email profileCompleted profileCompletedAt')
        .lean();
    
    if (!student && req.user.email) {
        student = await Student.findOne({ email: req.user.email.toLowerCase() })
            .select('rollNo name email profileCompleted profileCompletedAt')
            .lean();
    }

    if (!student) {
        throw new ApiError(404, 'Student profile not found');
    }

    res.json({
        success: true,
        data: {
            rollNo: student.rollNo,
            name: student.name,
            email: student.email,
            profileCompleted: student.profileCompleted || false,
            profileCompletedAt: student.profileCompletedAt || null,
        },
    });
});

export default {
    getMyProfile,
    completeProfile,
    updateProfile,
    getProfileStatus,
};
