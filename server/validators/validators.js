/**
 * Validation Schemas using express-validator
 * Comprehensive validation for all API endpoints
 */

import { body, param, query, validationResult } from 'express-validator';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * Validation result handler
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => ({
            field: error.path,
            message: error.msg,
        }));
        throw new ApiError(400, 'Validation Error', true, JSON.stringify(errorMessages));
    }
    next();
};

/**
 * Auth Validators
 */
export const authValidators = {
    login: [
        body('email')
            .notEmpty().withMessage('Email or Roll Number is required')
            .trim(),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        validate,
    ],

    register: [
        body('name')
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
            .trim(),
        body('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
        body('role')
            .notEmpty().withMessage('Role is required')
            .isIn(['ADMIN', 'HOD', 'ACADEMIC_FACULTY', 'MENTOR', 'OTHER_FACULTY', 'MENTEE'])
            .withMessage('Invalid role'),
        validate,
    ],

    changePassword: [
        body('currentPassword')
            .notEmpty().withMessage('Current password is required'),
        body('newPassword')
            .notEmpty().withMessage('New password is required')
            .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
        validate,
    ],
};

/**
 * Student Validators
 */
export const studentValidators = {
    create: [
        body('rollNo')
            .notEmpty().withMessage('Roll number is required')
            .trim(),
        body('name')
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
            .trim(),
        body('email')
            .optional()
            .isEmail().withMessage('Invalid email format')
            .normalizeEmail(),
        body('mobile1')
            .optional()
            .matches(/^[0-9]{10}$/).withMessage('Mobile number must be 10 digits'),
        body('semester')
            .optional()
            .isIn(['1', '2', '3', '4', '5', '6', '7', '8']).withMessage('Semester must be 1-8'),
        validate,
    ],

    update: [
        param('id').notEmpty().withMessage('Student ID is required'),
        body('name')
            .optional()
            .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
            .trim(),
        body('email')
            .optional()
            .isEmail().withMessage('Invalid email format')
            .normalizeEmail(),
        body('mobile1')
            .optional()
            .matches(/^[0-9]{10}$/).withMessage('Mobile number must be 10 digits'),
        body('bloodGroup')
            .optional()
            .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
        validate,
    ],

    getId: [
        param('id').notEmpty().withMessage('Student ID is required'),
        validate,
    ],
};

/**
 * Faculty Validators
 */
export const facultyValidators = {
    create: [
        body('name')
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
            .trim(),
        body('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format')
            .normalizeEmail(),
        body('role')
            .notEmpty().withMessage('Role is required')
            .isIn(['HOD', 'ACADEMIC_FACULTY', 'MENTOR', 'OTHER_FACULTY'])
            .withMessage('Invalid faculty role'),
        body('department')
            .optional()
            .isLength({ min: 2, max: 100 }).withMessage('Department must be 2-100 characters')
            .trim(),
        body('phone')
            .optional()
            .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
        validate,
    ],

    update: [
        param('id').notEmpty().withMessage('Faculty ID is required'),
        body('name')
            .optional()
            .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
            .trim(),
        body('phone')
            .optional()
            .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
        validate,
    ],
};

/**
 * Session Validators
 */
export const sessionValidators = {
    create: [
        body('studentId')
            .notEmpty().withMessage('Student ID is required')
            .trim(),
        body('mentorId')
            .notEmpty().withMessage('Mentor ID is required')
            .trim(),
        body('date')
            .notEmpty().withMessage('Date is required')
            .isISO8601().withMessage('Invalid date format'),
        body('type')
            .optional()
            .isLength({ max: 50 }).withMessage('Type must not exceed 50 characters')
            .trim(),
        body('status')
            .optional()
            .isIn(['Scheduled', 'Completed', 'Cancelled']).withMessage('Invalid status'),
        validate,
    ],

    update: [
        param('id').notEmpty().withMessage('Session ID is required'),
        body('status')
            .optional()
            .isIn(['Scheduled', 'Completed', 'Cancelled']).withMessage('Invalid status'),
        body('notes')
            .optional()
            .isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
        validate,
    ],
};

/**
 * Marks Validators
 */
export const marksValidators = {
    update: [
        body('studentId')
            .notEmpty().withMessage('Student ID is required')
            .trim(),
        body('semester')
            .notEmpty().withMessage('Semester is required')
            .isIn(['1', '2', '3', '4', '5', '6', '7', '8']).withMessage('Semester must be 1-8'),
        body('marks')
            .isArray().withMessage('Marks must be an array')
            .notEmpty().withMessage('Marks array cannot be empty'),
        body('marks.*.code')
            .notEmpty().withMessage('Subject code is required'),
        body('marks.*.name')
            .notEmpty().withMessage('Subject name is required'),
        body('marks.*.sessional1')
            .optional()
            .isFloat({ min: 0, max: 100 }).withMessage('Sessional 1 marks must be 0-100'),
        body('marks.*.sessional2')
            .optional()
            .isFloat({ min: 0, max: 100 }).withMessage('Sessional 2 marks must be 0-100'),
        body('marks.*.internal')
            .optional()
            .isFloat({ min: 0, max: 100 }).withMessage('Internal marks must be 0-100'),
        body('marks.*.external')
            .optional()
            .isFloat({ min: 0, max: 100 }).withMessage('External marks must be 0-100'),
        validate,
    ],
};

/**
 * Attendance Validators
 */
export const attendanceValidators = {
    save: [
        body('studentId')
            .notEmpty().withMessage('Student ID is required')
            .trim(),
        body('semester')
            .notEmpty().withMessage('Semester is required')
            .isIn(['1', '2', '3', '4', '5', '6', '7', '8']).withMessage('Semester must be 1-8'),
        body('totalClassesHeld')
            .notEmpty().withMessage('Total classes held is required')
            .isInt({ min: 0 }).withMessage('Total classes held must be a positive number'),
        body('totalClassesAttended')
            .notEmpty().withMessage('Total classes attended is required')
            .isInt({ min: 0 }).withMessage('Total classes attended must be a positive number'),
        body('percentage')
            .optional()
            .isFloat({ min: 0, max: 100 }).withMessage('Percentage must be 0-100'),
        validate,
    ],
};

/**
 * System Validators
 */
export const systemValidators = {
    createAnnouncement: [
        body('title')
            .notEmpty().withMessage('Title is required')
            .isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters')
            .trim(),
        body('message')
            .notEmpty().withMessage('Message is required')
            .isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 characters')
            .trim(),
        body('priority')
            .optional()
            .isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority'),
        body('targetRoles')
            .optional()
            .isArray().withMessage('Target roles must be an array'),
        validate,
    ],

    getReports: [
        query('semester')
            .optional()
            .isIn(['1', '2', '3', '4', '5', '6', '7', '8']).withMessage('Semester must be 1-8'),
        query('branch')
            .optional()
            .trim(),
        query('startDate')
            .optional()
            .isISO8601().withMessage('Invalid start date format'),
        query('endDate')
            .optional()
            .isISO8601().withMessage('Invalid end date format'),
        validate,
    ],
};

/**
 * Resource Validators
 */
export const resourceValidators = {
    uploadPhoto: [
        param('id').notEmpty().withMessage('ID is required'),
        validate,
    ],

    getFile: [
        param('folder')
            .notEmpty().withMessage('Folder is required')
            .isIn(['students', 'parents', 'guardians', 'faculty', 'documents', 'certificates'])
            .withMessage('Invalid folder'),
        param('filename').notEmpty().withMessage('Filename is required'),
        validate,
    ],
};

/**
 * Import Validators
 */
export const importValidators = {
    importData: [
        param('type')
            .notEmpty().withMessage('Type is required')
            .isIn(['students', 'faculty']).withMessage('Type must be students or faculty'),
        validate,
    ],

    getTemplate: [
        param('type')
            .notEmpty().withMessage('Type is required')
            .isIn(['students', 'faculty']).withMessage('Type must be students or faculty'),
        validate,
    ],
};
