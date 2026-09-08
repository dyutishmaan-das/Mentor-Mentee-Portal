/**
 * Registration Routes
 * Handles student self-registration with OTP verification and admin approval
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
    generateRegistrationLink,
    generateBatchEmailLinks,
    getRegistrationTokens,
    deactivateToken,
    validateToken,
    initiateRegistration,
    verifyOtp,
    resendOtp,
    getPendingRegistrations,
    approveRegistration,
    rejectRegistration,
    changePassword,
} from '../controllers/registrationController.js';

const router = express.Router();

// ========================================
// ADMIN ROUTES (Protected)
// ========================================

// Generate unique registration links for fed student emails (max 20 at a time) & send invites
router.post(
    '/generate-email-links',
    authenticate,
    authorize(['ADMIN', 'HOD']),
    generateBatchEmailLinks
);

// Generate registration link (generic / batch / unlimited)
router.post(
    '/generate-link',
    authenticate,
    authorize(['ADMIN', 'HOD']),
    generateRegistrationLink
);

// Get all registration tokens
router.get(
    '/tokens',
    authenticate,
    authorize(['ADMIN', 'HOD']),
    getRegistrationTokens
);

// Deactivate token
router.post(
    '/deactivate/:token',
    authenticate,
    authorize(['ADMIN', 'HOD']),
    deactivateToken
);

// Get pending registrations for review
router.get(
    '/pending',
    authenticate,
    authorize(['ADMIN', 'HOD']),
    getPendingRegistrations
);

// Approve registration
router.post(
    '/approve/:id',
    authenticate,
    authorize(['ADMIN', 'HOD']),
    approveRegistration
);

// Reject registration
router.post(
    '/reject/:id',
    authenticate,
    authorize(['ADMIN', 'HOD']),
    rejectRegistration
);

// ========================================
// PUBLIC ROUTES (No authentication needed)
// ========================================

// Validate registration token
router.get('/validate/:token', validateToken);

// NEW FLOW: Initiate registration (submit basic info, get OTP)
router.post('/initiate', initiateRegistration);

// NEW FLOW: Verify OTP
router.post('/verify-otp', verifyOtp);

// NEW FLOW: Resend OTP
router.post('/resend-otp', resendOtp);

// ========================================
// AUTHENTICATED ROUTES (Student)
// ========================================

// Change password after first login
router.post('/change-password', authenticate, changePassword);

export default router;
