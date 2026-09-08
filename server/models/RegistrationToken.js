import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * RegistrationToken Model
 * Stores secure tokens for student self-registration links
 */

const registrationTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        
        // Token metadata
        tokenType: {
            type: String,
            enum: ['single', 'batch', 'unlimited'],
            default: 'single',
        },
        
        // Usage limits
        maxUses: {
            type: Number,
            default: 1, // Single use by default
        },
        
        usedCount: {
            type: Number,
            default: 0,
        },
        
        // Expiration
        expiresAt: {
            type: Date,
            required: true,
        },
        
        isActive: {
            type: Boolean,
            default: true,
        },
        
        // Assigned Student Email (for email-specific unique links)
        assignedEmail: {
            type: String,
            lowercase: true,
            trim: true,
            index: true,
        },
        
        studentName: {
            type: String,
            trim: true,
            default: '',
        },
        
        emailSent: {
            type: Boolean,
            default: false,
        },
        
        emailSentAt: {
            type: Date,
        },
        
        // Pre-filled information (optional)
        prefilledData: {
            course: String,
            branch: String,
            semester: String,
            academicYear: String,
            admissionYear: String,
        },
        
        // Who created this token
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        
        // Track registrations made using this token
        registrations: [{
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student',
            },
            registeredAt: {
                type: Date,
                default: Date.now,
            },
            rollNo: String,
            email: String,
        }],
        
        // Metadata
        description: {
            type: String,
            default: '',
        },
        
        notes: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Generate a secure random token
registrationTokenSchema.statics.generateToken = function() {
    return crypto.randomBytes(32).toString('hex');
};

// Check if token is valid
registrationTokenSchema.methods.isValid = function() {
    if (!this.isActive) return false;
    if (new Date() > this.expiresAt) return false;
    if (this.tokenType !== 'unlimited' && this.usedCount >= this.maxUses) return false;
    return true;
};

// Increment usage count
registrationTokenSchema.methods.incrementUsage = async function(studentData) {
    this.usedCount += 1;
    this.registrations.push({
        studentId: studentData._id,
        rollNo: studentData.rollNo,
        email: studentData.email,
    });
    
    // Auto-deactivate if max uses reached
    if (this.tokenType !== 'unlimited' && this.usedCount >= this.maxUses) {
        this.isActive = false;
    }
    
    await this.save();
};

// Auto-expire old tokens
registrationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RegistrationToken = mongoose.model('RegistrationToken', registrationTokenSchema);

export default RegistrationToken;
