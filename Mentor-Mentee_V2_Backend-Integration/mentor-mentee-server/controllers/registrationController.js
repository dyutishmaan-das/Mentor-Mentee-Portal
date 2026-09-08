import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import RegistrationToken from '../models/RegistrationToken.js';
import PendingRegistration from '../models/PendingRegistration.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import { generateTempPassword } from '../utils/registrationUtils.js';
import { sendPasswordEmail, sendOtpEmail, sendRegistrationInviteEmail } from '../utils/emailService.js';

/**
 * ============================================
 * NEW REGISTRATION FLOW WITH OTP & ADMIN APPROVAL
 * ============================================
 * 
 * Flow:
 * 1. Admin feeds up to 20 emails -> Generates unique links & sends invites -> POST /generate-email-links
 * 2. Student opens unique link -> Submits basic info (name, email, mobile) -> POST /initiate
 * 3. System sends OTP to email -> Email with 6-digit code
 * 4. Student verifies OTP -> POST /verify-otp
 * 5. Registration saved as PENDING_APPROVAL
 * 6. Admin reviews -> GET /pending
 * 7. Admin approves/rejects -> POST /approve or /reject
 * 8. If approved: Email sent with temp password
 * 9. Student logs in -> Standard auth flow
 * 10. Student completes profile -> PUT /profile/complete
 */

/**
 * Admin: Generate Unique Registration Links by Feeding Student Emails (Max 20 at a time)
 * POST /api/registration/generate-email-links
 */
export const generateBatchEmailLinks = asyncHandler(async (req, res) => {
    const { emails, expiresInDays = 7, sendInviteEmail = true } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
        throw new ApiError(400, 'Please provide an array of student email addresses');
    }

    if (emails.length > 20) {
        throw new ApiError(400, 'Maximum 20 registration links can be generated in a single batch');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanedEmails = [];
    const invalidEmails = [];

    for (const item of emails) {
        const rawEmail = typeof item === 'string' ? item : (item && item.email);
        const rawName = typeof item === 'object' && item ? (item.name || '') : '';

        if (!rawEmail || typeof rawEmail !== 'string') {
            continue;
        }

        const email = rawEmail.trim().toLowerCase();
        if (!emailRegex.test(email)) {
            invalidEmails.push(rawEmail);
            continue;
        }

        // Avoid duplicates within the same batch
        if (!cleanedEmails.some(e => e.email === email)) {
            cleanedEmails.push({ email, name: rawName.trim() });
        }
    }

    if (invalidEmails.length > 0) {
        throw new ApiError(400, `Invalid email formats found: ${invalidEmails.join(', ')}`);
    }

    if (cleanedEmails.length === 0) {
        throw new ApiError(400, 'No valid email addresses provided');
    }

    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    const results = [];

    for (const entry of cleanedEmails) {
        const tokenString = crypto.randomBytes(32).toString('hex');
        
        // Create token document
        const tokenDoc = await RegistrationToken.create({
            token: tokenString,
            tokenType: 'single',
            maxUses: 1,
            assignedEmail: entry.email,
            studentName: entry.name,
            expiresAt,
            createdBy: req.user._id,
            isActive: true,
        });

        const registrationUrl = `${process.env.CLIENT_URL}/register.html?token=${tokenDoc.token}&email=${encodeURIComponent(entry.email)}`;

        let emailSentStatus = false;
        let emailError = null;

        if (sendInviteEmail) {
            try {
                const inviteResult = await sendRegistrationInviteEmail(
                    entry.email,
                    registrationUrl,
                    entry.name
                );
                emailSentStatus = inviteResult.success;
                if (emailSentStatus) {
                    tokenDoc.emailSent = true;
                    tokenDoc.emailSentAt = new Date();
                    await tokenDoc.save();
                } else {
                    emailError = inviteResult.error;
                }
            } catch (err) {
                emailError = err.message;
            }
        }

        results.push({
            token: tokenDoc.token,
            email: entry.email,
            name: entry.name,
            registrationUrl,
            emailSent: emailSentStatus,
            emailError,
            expiresAt: tokenDoc.expiresAt,
        });
    }

    res.status(201).json({
        success: true,
        message: `Successfully generated ${results.length} unique registration link(s)`,
        data: {
            totalGenerated: results.length,
            links: results,
        },
    });
});

/**
 * Admin: Generate registration link (Generic / Batch / Unlimited)
 * POST /api/registration/generate-link
 */
export const generateRegistrationLink = asyncHandler(async (req, res) => {
    const { tokenType, maxUses, expiresInDays = 7, assignedEmail, studentName } = req.body;

    // Validate input
    if (!tokenType || !['single', 'batch', 'unlimited'].includes(tokenType)) {
        throw new ApiError(400, 'Invalid token type. Must be: single, batch, or unlimited');
    }

    if (tokenType === 'batch' && (!maxUses || maxUses < 1)) {
        throw new ApiError(400, 'maxUses is required for batch tokens');
    }

    const tokenString = crypto.randomBytes(32).toString('hex');

    // Create token
    const token = await RegistrationToken.create({
        token: tokenString,
        tokenType,
        maxUses: tokenType === 'batch' ? maxUses : (tokenType === 'single' ? 1 : null),
        assignedEmail: assignedEmail ? assignedEmail.toLowerCase().trim() : undefined,
        studentName: studentName ? studentName.trim() : '',
        expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null,
        createdBy: req.user._id,
    });

    const registrationUrl = `${process.env.CLIENT_URL}/register.html?token=${token.token}${assignedEmail ? `&email=${encodeURIComponent(assignedEmail)}` : ''}`;

    res.status(201).json({
        success: true,
        message: 'Registration link generated successfully',
        data: {
            token: token.token,
            tokenType: token.tokenType,
            assignedEmail: token.assignedEmail,
            maxUses: token.maxUses,
            expiresAt: token.expiresAt,
            registrationUrl,
        },
    });
});

/**
 * Admin / HOD: Get registration tokens
 * GET /api/registration/tokens
 */
export const getRegistrationTokens = asyncHandler(async (req, res) => {
    const query = req.user.role === 'ADMIN' ? {} : { createdBy: req.user._id };
    const tokens = await RegistrationToken.find(query)
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name email role department');

    res.json({
        success: true,
        data: tokens,
    });
});

/**
 * Admin: Deactivate a registration token
 * POST /api/registration/deactivate/:token
 */
export const deactivateToken = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const registrationToken = await RegistrationToken.findOne({ token });
    if (!registrationToken) {
        throw new ApiError(404, 'Token not found');
    }

    registrationToken.isActive = false;
    await registrationToken.save();

    res.json({
        success: true,
        message: 'Registration token deactivated successfully',
    });
});

/**
 * Public: Validate registration token
 * GET /api/registration/validate/:token
 */
export const validateToken = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const registrationToken = await RegistrationToken.findOne({ token });
    if (!registrationToken) {
        throw new ApiError(404, 'Invalid registration link');
    }

    if (!registrationToken.isValid()) {
        throw new ApiError(400, 'Registration link has expired or reached maximum uses');
    }

    res.json({
        success: true,
        message: 'Registration link is valid',
        data: {
            tokenType: registrationToken.tokenType,
            assignedEmail: registrationToken.assignedEmail || null,
            studentName: registrationToken.studentName || null,
            expiresAt: registrationToken.expiresAt,
            remainingUses: registrationToken.maxUses ? registrationToken.maxUses - registrationToken.usedCount : null,
        },
    });
});

/**
 * ============================================
 * NEW FLOW: STEP 1 - INITIATE REGISTRATION
 * ============================================
 * Public: Student submits basic info and gets OTP
 * POST /api/registration/initiate
 */
export const initiateRegistration = asyncHandler(async (req, res) => {
    const { token, name, email, mobile } = req.body;

    // Validate required fields
    if (!token || !name || !email || !mobile) {
        throw new ApiError(400, 'Token, name, email, and mobile are required');
    }

    // Validate registration token
    const registrationToken = await RegistrationToken.findOne({ token });
    if (!registrationToken) {
        throw new ApiError(404, 'Invalid registration link');
    }

    if (!registrationToken.isValid()) {
        throw new ApiError(400, 'Registration link has expired or reached maximum uses');
    }

    const cleanEmail = email.trim().toLowerCase();

    // If token is assigned to a specific email, verify match
    if (registrationToken.assignedEmail && registrationToken.assignedEmail !== cleanEmail) {
        throw new ApiError(403, `This registration link is exclusively generated for ${registrationToken.assignedEmail}`);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
        throw new ApiError(400, 'Invalid email format');
    }

    // Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile.replace(/\D/g, ''))) {
        throw new ApiError(400, 'Invalid mobile number. Must be 10 digits starting with 6-9');
    }

    // Check if email already exists in pending registrations
    const existingPending = await PendingRegistration.checkExisting(cleanEmail);
    if (existingPending) {
        if (existingPending.status === 'OTP_PENDING') {
            // Update token and name, allow re-requesting OTP
            existingPending.registrationToken = token;
            existingPending.name = name;
            existingPending.mobile = mobile;
        } else if (existingPending.status === 'PENDING_APPROVAL') {
            throw new ApiError(400, 'Your registration is already verified and awaiting admin approval.');
        } else if (existingPending.status === 'APPROVED') {
            throw new ApiError(400, 'This email is already registered and approved. Please log in.');
        }
    }

    // Check if email already exists in users
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
        throw new ApiError(400, 'An account with this email already exists. Please log in.');
    }

    // Create or update pending registration
    let pendingReg = await PendingRegistration.findOne({
        email: cleanEmail,
        status: { $in: ['OTP_PENDING', 'EXPIRED'] },
    });

    if (pendingReg) {
        pendingReg.registrationToken = token;
        pendingReg.name = name;
        pendingReg.mobile = mobile;
        pendingReg.status = 'OTP_PENDING';
        pendingReg.otpAttempts = 0;
        pendingReg.ipAddress = req.ip;
        pendingReg.userAgent = req.get('user-agent');
    } else {
        pendingReg = new PendingRegistration({
            registrationToken: token,
            name,
            email: cleanEmail,
            mobile,
            status: 'OTP_PENDING',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
    }

    // Generate OTP
    const otp = pendingReg.generateOtp();
    await pendingReg.save();

    // Send OTP email
    const emailResult = await sendOtpEmail(cleanEmail, otp, name);

    if (!emailResult.success) {
        throw new ApiError(500, `Failed to send OTP email: ${emailResult.error || 'Check Resend credentials'}`);
    }

    res.status(201).json({
        success: true,
        message: 'OTP sent to your email. Please enter the 6-digit code to verify.',
        data: {
            email: cleanEmail,
            otpExpiresIn: 600, // 10 minutes in seconds
            registrationId: pendingReg._id,
        },
    });
});

/**
 * ============================================
 * NEW FLOW: STEP 2 - VERIFY OTP
 * ============================================
 * Public: Student verifies OTP
 * POST /api/registration/verify-otp
 */
export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, 'Email and OTP are required');
    }

    // Find pending registration
    const pendingReg = await PendingRegistration.findOne({
        email: email.toLowerCase(),
        status: 'OTP_PENDING',
    });

    if (!pendingReg) {
        throw new ApiError(404, 'Registration not found or already verified');
    }

    // Increment OTP attempts
    pendingReg.otpAttempts += 1;
    await pendingReg.save();

    // Check if max attempts exceeded
    if (pendingReg.otpAttempts > 5) {
        throw new ApiError(429, 'Too many OTP attempts. Please restart registration.');
    }

    // Validate OTP
    if (!pendingReg.isOtpValid(otp)) {
        throw new ApiError(400, 'Invalid or expired OTP. Please try again.');
    }

    // Mark as verified and move to pending approval
    await pendingReg.verifyOtp();

    res.json({
        success: true,
        message: 'Email verified successfully! Your registration is now pending admin approval.',
        data: {
            registrationId: pendingReg._id,
            status: 'PENDING_APPROVAL',
            name: pendingReg.name,
            email: pendingReg.email,
        },
    });
});

/**
 * ============================================
 * NEW FLOW: STEP 3 - RESEND OTP
 * ============================================
 * Public: Resend OTP if expired
 * POST /api/registration/resend-otp
 */
export const resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, 'Email is required');
    }

    // Find pending registration
    const pendingReg = await PendingRegistration.findOne({
        email: email.toLowerCase(),
        status: 'OTP_PENDING',
    });

    if (!pendingReg) {
        throw new ApiError(404, 'Registration not found');
    }

    // Reset attempts if more than 5 minutes passed
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (pendingReg.updatedAt < fiveMinutesAgo) {
        pendingReg.otpAttempts = 0;
    }

    // Check rate limit
    if (pendingReg.otpAttempts >= 3) {
        throw new ApiError(429, 'Too many OTP requests. Please wait 5 minutes.');
    }

    // Generate new OTP
    const otp = pendingReg.generateOtp();
    await pendingReg.save();

    // Send OTP email
    const emailResult = await sendOtpEmail(email, otp, pendingReg.name);

    if (!emailResult.success) {
        throw new ApiError(500, 'Failed to send OTP email. Please try again.');
    }

    res.json({
        success: true,
        message: 'New OTP sent to your email',
        data: {
            otpExpiresIn: 600, // 10 minutes
        },
    });
});

/**
 * ============================================
 * ADMIN: GET PENDING REGISTRATIONS
 * ============================================
 * Admin: Get all pending registrations for review
 * GET /api/registration/pending
 */
export const getPendingRegistrations = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status = 'PENDING_APPROVAL' } = req.query;

    const skip = (page - 1) * limit;

    const query = {};
    if (status) {
        query.status = status;
    }

    const registrations = await PendingRegistration.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    const total = await PendingRegistration.countDocuments(query);

    res.json({
        success: true,
        data: {
            registrations,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit),
            },
        },
    });
});

/**
 * ============================================
 * ADMIN: APPROVE REGISTRATION
 * ============================================
 * Admin: Approve pending registration and create account
 * POST /api/registration/approve/:id
 */
export const approveRegistration = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rollNo, course, branch, semester, admissionYear, adminNotes } = req.body;

    // Validate required fields
    if (!rollNo || !course || !branch) {
        throw new ApiError(400, 'Roll number, course, and branch are required');
    }

    // Enforce HOD department approval constraint
    if (req.user && req.user.role === 'HOD') {
        const hodDept = (req.user.department || '').trim().toLowerCase();
        if (hodDept && branch.trim().toLowerCase() !== hodDept) {
            throw new ApiError(403, `As HOD of ${req.user.department}, you can only approve students into your own department.`);
        }
    }

    // Find pending registration
    const pendingReg = await PendingRegistration.findById(id);
    if (!pendingReg) {
        throw new ApiError(404, 'Registration not found');
    }

    if (pendingReg.status !== 'PENDING_APPROVAL') {
        throw new ApiError(400, `Registration is ${pendingReg.status}. Can only approve PENDING_APPROVAL registrations.`);
    }

    // Check if roll number already exists
    const existingStudent = await Student.findOne({ rollNo });
    if (existingStudent) {
        throw new ApiError(400, 'Roll number already exists. Please use a different roll number.');
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create User account
    const tempPasswordExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
        name: pendingReg.name,
        email: pendingReg.email,
        password: hashedPassword,
        role: 'MENTEE',
        requirePasswordChange: true,
        tempPasswordExpiresAt,
    });

    // Create Student record (minimal - to be completed by student)
    const student = await Student.create({
        rollNo,
        name: pendingReg.name,
        email: pendingReg.email,
        mobile1: pendingReg.mobile,
        course,
        branch,
        department: branch,
        semester: semester || 1,
        admissionYear: admissionYear || new Date().getFullYear(),
        userId: user._id,
        // Profile completion status
        profileCompleted: false,
    });

    // Update pending registration
    await pendingReg.approve(req.user._id, rollNo, {
        course,
        branch,
        semester,
        admissionYear,
    });

    if (adminNotes) {
        pendingReg.adminNotes = adminNotes;
        await pendingReg.save();
    }

    pendingReg.userId = user._id;
    await pendingReg.save();

    // Send email with temporary password
    const emailResult = await sendPasswordEmail(
        pendingReg.email,
        tempPassword,
        pendingReg.name,
        rollNo
    );

    res.json({
        success: true,
        message: emailResult.success 
            ? 'Registration approved! Temporary password sent to student email.'
            : 'Registration approved! However, email sending failed. Please share credentials manually.',
        data: {
            student: {
                rollNo: student.rollNo,
                name: student.name,
                email: student.email,
            },
            tempPasswordSent: emailResult.success,
            passwordExpiresAt: tempPasswordExpiresAt,
        },
    });
});

/**
 * ============================================
 * ADMIN: REJECT REGISTRATION
 * ============================================
 * Admin: Reject pending registration
 * POST /api/registration/reject/:id
 */
export const rejectRegistration = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
        throw new ApiError(400, 'Rejection reason is required');
    }

    // Find pending registration
    const pendingReg = await PendingRegistration.findById(id);
    if (!pendingReg) {
        throw new ApiError(404, 'Registration not found');
    }

    if (pendingReg.status !== 'PENDING_APPROVAL') {
        throw new ApiError(400, `Registration is ${pendingReg.status}. Can only reject PENDING_APPROVAL registrations.`);
    }

    // Reject registration
    await pendingReg.reject(req.user._id, reason);

    res.json({
        success: true,
        message: 'Registration rejected',
        data: {
            registrationId: pendingReg._id,
            email: pendingReg.email,
            reason,
        },
    });
});

/**
 * ============================================
 * STUDENT: CHANGE PASSWORD
 * ============================================
 * Student: Change password on first login
 * POST /api/registration/change-password
 */
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, 'Current password and new password are required');
    }

    if (newPassword.length < 8) {
        throw new ApiError(400, 'New password must be at least 8 characters long');
    }

    // Get user with password field
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new ApiError(401, 'Current password is incorrect');
    }

    // Check if new password is different from current
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
        throw new ApiError(400, 'New password must be different from current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    user.password = hashedPassword;
    user.requirePasswordChange = false;
    user.passwordChangedAt = new Date();
    user.tempPasswordExpiresAt = null;
    await user.save();

    res.json({
        success: true,
        message: 'Password changed successfully',
    });
});

export default {
    generateBatchEmailLinks,
    generateRegistrationLink,
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
};
