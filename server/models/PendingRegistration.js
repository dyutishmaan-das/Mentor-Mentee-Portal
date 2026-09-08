import mongoose from 'mongoose';

/**
 * PendingRegistration Schema
 * Stores student registration requests awaiting admin approval
 * 
 * Status Flow:
 * 1. OTP_PENDING - Initial state, waiting for email OTP verification
 * 2. PENDING_APPROVAL - OTP verified, waiting for admin approval
 * 3. APPROVED - Admin approved, account created, temp password sent
 * 4. REJECTED - Admin rejected, registration denied
 * 5. EXPIRED - Registration token expired or too old
 */

const pendingRegistrationSchema = new mongoose.Schema({
    // Registration Token (from admin-generated link)
    registrationToken: {
        type: String,
        required: true,
        index: true,
    },
    
    // Basic Info (Step 1: Student fills)
    name: {
        type: String,
        required: true,
        trim: true,
    },
    
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    
    mobile: {
        type: String,
        required: true,
        trim: true,
    },
    
    // OTP Verification
    emailOtp: {
        type: String,
    },
    
    otpExpiresAt: {
        type: Date,
    },
    
    otpVerifiedAt: {
        type: Date,
    },
    
    otpAttempts: {
        type: Number,
        default: 0,
    },
    
    // Status Management
    status: {
        type: String,
        enum: ['OTP_PENDING', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXPIRED'],
        default: 'OTP_PENDING',
        index: true,
    },
    
    // Admin Approval
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    
    reviewedAt: {
        type: Date,
    },
    
    rejectionReason: {
        type: String,
    },
    
    // Roll Number Assignment (by admin during approval)
    assignedRollNo: {
        type: String,
        sparse: true,
        unique: true,
    },
    
    // Course Details (assigned by admin)
    course: {
        type: String,
    },
    
    branch: {
        type: String,
    },
    
    semester: {
        type: Number,
    },
    
    admissionYear: {
        type: Number,
    },
    
    // Created User ID (after approval)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    
    // Metadata
    ipAddress: {
        type: String,
    },
    
    userAgent: {
        type: String,
    },
    
    // Notes (for admin review)
    adminNotes: {
        type: String,
    },
    
}, {
    timestamps: true,
});

// Indexes for efficient queries
pendingRegistrationSchema.index({ status: 1, createdAt: -1 });
pendingRegistrationSchema.index({ email: 1, status: 1 });

// Methods
pendingRegistrationSchema.methods = {
    /**
     * Check if OTP is valid
     */
    isOtpValid(otp) {
        if (!this.emailOtp || !this.otpExpiresAt) {
            return false;
        }
        
        if (this.otpExpiresAt < new Date()) {
            return false;
        }
        
        if (this.otpAttempts >= 5) {
            return false;
        }
        
        return this.emailOtp === otp;
    },
    
    /**
     * Mark OTP as verified
     */
    async verifyOtp() {
        this.status = 'PENDING_APPROVAL';
        this.otpVerifiedAt = new Date();
        this.emailOtp = undefined;
        this.otpExpiresAt = undefined;
        await this.save();
    },
    
    /**
     * Approve registration
     */
    async approve(adminId, rollNo, courseDetails) {
        this.status = 'APPROVED';
        this.reviewedBy = adminId;
        this.reviewedAt = new Date();
        this.assignedRollNo = rollNo;
        
        if (courseDetails) {
            this.course = courseDetails.course;
            this.branch = courseDetails.branch;
            this.semester = courseDetails.semester;
            this.admissionYear = courseDetails.admissionYear;
        }
        
        await this.save();
    },
    
    /**
     * Reject registration
     */
    async reject(adminId, reason) {
        this.status = 'REJECTED';
        this.reviewedBy = adminId;
        this.reviewedAt = new Date();
        this.rejectionReason = reason;
        await this.save();
    },
    
    /**
     * Generate new OTP
     */
    generateOtp() {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        this.emailOtp = otp;
        this.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        return otp;
    },
};

// Statics
pendingRegistrationSchema.statics = {
    /**
     * Get all pending registrations for admin review
     */
    async getPendingForReview(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        
        const registrations = await this.find({ status: 'PENDING_APPROVAL' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        
        const total = await this.countDocuments({ status: 'PENDING_APPROVAL' });
        
        return {
            registrations,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    },
    
    /**
     * Check if email already has pending or approved registration
     */
    async checkExisting(email) {
        return await this.findOne({
            email: email.toLowerCase(),
            status: { $in: ['OTP_PENDING', 'PENDING_APPROVAL', 'APPROVED'] },
        });
    },
    
    /**
     * Clean up expired OTP pending registrations (older than 1 hour)
     */
    async cleanupExpired() {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        await this.updateMany(
            {
                status: 'OTP_PENDING',
                createdAt: { $lt: oneHourAgo },
            },
            {
                $set: { status: 'EXPIRED' },
            }
        );
    },
};

const PendingRegistration = mongoose.model('PendingRegistration', pendingRegistrationSchema);

export default PendingRegistration;
