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
    const student = await Student.findOne({ userId: req.user._id }).lean();
    
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
 * 
 * This endpoint allows students to fill in all remaining details
 * after logging in with their temporary password
 */
export const completeProfile = asyncHandler(async (req, res) => {
    const {
        // Personal details
        dateOfBirth,
        dob,
        gender = 'Not Specified',
        category,
        religion,
        nationality,
        bloodGroup,
        aadharNumber,
        identificationMark,
        type,
        
        // Contact
        mobile2,
        addressPresent,
        addressPermanent,
        city,
        state,
        pincode,
        
        // Parent/Guardian details
        parentFatherName,
        parentFatherOccupation,
        parentFatherIncome,
        parentFatherMobile1,
        parentFatherMobile2,
        parentFatherEmail,
        
        parentMotherName,
        parentMotherOccupation,
        parentMotherIncome,
        parentMotherMobile1,
        parentMotherMobile2,
        parentMotherEmail,
        
        guardianName,
        guardianRelationship,
        guardianOccupation,
        guardianAddress,
        guardianMobile1,
        guardianMobile2,
        
        // Academic history
        academics10thSchool,
        academics10thYear,
        academics10thBoard,
        academics10thDivision,
        academics10thMarks,
        
        academics12thSchool,
        academics12thYear,
        academics12thBoard,
        academics12thDivision,
        academics12thMarks,
        
        diplomaMarks,
        
        // Transport/Hostel
        transportRoute,
        hostelName,
        hostelRoomNumber,
        
    } = req.body;

    const actualDob = dateOfBirth || dob;

    // Find student by user ID
    const student = await Student.findOne({ userId: req.user._id });
    
    if (!student) {
        throw new ApiError(404, 'Student profile not found');
    }

    // Update student profile
    student.dateOfBirth = actualDob || student.dateOfBirth;
    student.dob = actualDob || student.dob;
    if (gender) student.gender = gender;
    if (category) student.category = category;
    student.religion = religion || '';
    student.nationality = nationality || 'Indian';
    student.bloodGroup = bloodGroup;
    student.identificationMark = identificationMark || '';
    student.type = type || student.type || 'Day Scholar';
    student.aadharNumber = aadharNumber || '';
    
    // Contact
    if (mobile2) student.mobile2 = mobile2;
    student.addressPresent = addressPresent;
    student.addressPermanent = addressPermanent;
    student.city = city || '';
    student.state = state || '';
    student.pincode = pincode || '';
    
    // Parents
    student.parentFatherName = parentFatherName;
    student.parentFatherOccupation = parentFatherOccupation || '';
    student.parentFatherIncome = parentFatherIncome || '';
    student.parentFatherMobile1 = parentFatherMobile1;
    student.parentFatherMobile2 = parentFatherMobile2 || '';
    student.parentFatherEmail = parentFatherEmail || '';
    
    student.parentMotherName = parentMotherName;
    student.parentMotherOccupation = parentMotherOccupation || '';
    student.parentMotherIncome = parentMotherIncome || '';
    student.parentMotherMobile1 = parentMotherMobile1;
    student.parentMotherMobile2 = parentMotherMobile2 || '';
    student.parentMotherEmail = parentMotherEmail || '';
    
    // Guardian (optional)
    if (guardianName) {
        student.guardianName = guardianName;
        student.guardianRelationship = guardianRelationship || '';
        student.guardianOccupation = guardianOccupation || '';
        student.guardianAddress = guardianAddress || '';
        student.guardianMobile1 = guardianMobile1 || '';
        student.guardianMobile2 = guardianMobile2 || '';
    }
    
    // Academic history
    if (academics10thSchool) {
        student.academics10thSchool = academics10thSchool;
        student.academics10thYear = academics10thYear || '';
        student.academics10thBoard = academics10thBoard || '';
        student.academics10thDivision = academics10thDivision || '';
        student.academics10thMarks = academics10thMarks || '';
    }
    
    if (academics12thSchool) {
        student.academics12thSchool = academics12thSchool;
        student.academics12thYear = academics12thYear || '';
        student.academics12thBoard = academics12thBoard || '';
        student.academics12thDivision = academics12thDivision || '';
        student.academics12thMarks = academics12thMarks || '';
    }
    
    if (diplomaMarks) {
        student.diplomaMarks = diplomaMarks;
    }
    
    // Transport/Hostel
    if (transportRoute) student.transportRoute = transportRoute;
    if (hostelName) student.hostelName = hostelName;
    if (hostelRoomNumber) student.hostelRoomNumber = hostelRoomNumber;
    
    // Mark profile as completed
    student.profileCompleted = true;
    student.profileCompletedAt = new Date();
    
    await student.save();

    res.json({
        success: true,
        message: 'Profile completed successfully',
        data: {
            rollNo: student.rollNo,
            name: student.name,
            email: student.email,
            profileCompleted: true,
            profileCompletedAt: student.profileCompletedAt,
        },
    });
});

/**
 * Update student profile (after completion)
 * PUT /api/students/profile/update
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ userId: req.user._id });
    
    if (!student) {
        throw new ApiError(404, 'Student profile not found');
    }

    // Allow updating most fields except core identity fields
    const allowedUpdates = [
        'mobile2', 'addressPresent', 'addressPermanent', 'city', 'state', 'pincode',
        'parentFatherOccupation', 'parentFatherIncome', 'parentFatherMobile2', 'parentFatherEmail',
        'parentMotherOccupation', 'parentMotherIncome', 'parentMotherMobile2', 'parentMotherEmail',
        'guardianName', 'guardianRelationship', 'guardianOccupation', 'guardianAddress', 
        'guardianMobile1', 'guardianMobile2',
        'transportRoute', 'hostelName', 'hostelRoomNumber',
    ];

    // Update allowed fields
    Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
            student[key] = req.body[key];
        }
    });

    await student.save();

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: student,
    });
});

/**
 * Check if profile is completed
 * GET /api/students/profile/status
 */
export const getProfileStatus = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ userId: req.user._id })
        .select('rollNo name email profileCompleted profileCompletedAt')
        .lean();
    
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
