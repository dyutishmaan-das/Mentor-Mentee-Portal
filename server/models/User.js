import mongoose from 'mongoose';

const USER_ROLES = [
    'ADMIN',
    'HOD',
    'ACADEMIC_FACULTY',
    'MENTOR',
    'OTHER_FACULTY',
    'MENTEE',
];

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false,
        },

        role: {
            type: String,
            enum: USER_ROLES,
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        lastLoginAt: {
            type: Date,
            default: null,
        },

        // Password management
        requirePasswordChange: {
            type: Boolean,
            default: false,
        },

        passwordChangedAt: {
            type: Date,
            default: null,
        },

        tempPasswordExpiresAt: {
            type: Date,
            default: null,
        },

        // Faculty-specific fields
        department: {
            type: String,
            default: '',
            trim: true,
        },

        designation: {
            type: String,
            default: '',
            trim: true,
        },

        specialization: {
            type: String,
            default: '',
            trim: true,
        },

        phone: {
            type: String,
            default: '',
            trim: true,
        },

        officeRoom: {
            type: String,
            default: '',
            trim: true,
        },

        qualifications: {
            type: String,
            default: '',
            trim: true,
        },

        experience: {
            type: String,
            default: '',
            trim: true,
        },

        researchInterests: {
            type: String,
            default: '',
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);


const User = mongoose.model('User', userSchema);

export { USER_ROLES };

export default User;