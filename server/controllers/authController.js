import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

function createAccessToken(user) {
    return jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role,
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn:
                process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        }
    );
}

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Email/Roll Number and password are required');
    }

    const identifier = String(email).trim();
    let user = null;
    let loginType = '';

    // 1. Try finding by email first
    user = await User.findOne({
        email: identifier.toLowerCase(),
    }).select('+password');

    if (user) {
        loginType = 'email';
    }

    // 2. If not found by email, check if identifier is a student rollNo
    if (!user) {
        const student = await Student.findOne({ rollNo: identifier });
        if (student) {
            loginType = 'rollNo';
            
            // Try to find user by userId reference first
            if (student.userId) {
                user = await User.findById(student.userId).select('+password');
            }
            
            // Fallback: find by student's email
            if (!user && student.email) {
                user = await User.findOne({
                    email: student.email.toLowerCase(),
                }).select('+password');
            }
        }
    }

    if (!user) {
        throw new ApiError(401, 'Invalid email/roll number or password');
    }

    if (!user.isActive) {
        throw new ApiError(403, 'User account is inactive');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
        throw new ApiError(401, 'Invalid email/roll number or password');
    }

    // Check if temporary password has expired
    if (user.tempPasswordExpiresAt && new Date() > user.tempPasswordExpiresAt) {
        throw new ApiError(403, 'Temporary password has expired. Please contact admin for a new password.');
    }

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = createAccessToken(user);

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000,
    });

    return res.json({
        success: true,
        message: `Login successful via ${loginType}`,
        data: {
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department || '',
                designation: user.designation || '',
                specialization: user.specialization || '',
                phone: user.phone || '',
                officeRoom: user.officeRoom || '',
            },
            requirePasswordChange: user.requirePasswordChange || false,
        },
    });
});

export const me = asyncHandler(async (req, res) => {
    return res.json({
        success: true,
        data: {
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                department: req.user.department || '',
                designation: req.user.designation || '',
                specialization: req.user.specialization || '',
                phone: req.user.phone || '',
                officeRoom: req.user.officeRoom || '',
            },
        },
    });
});

export const refresh = asyncHandler(async (req, res) => {
    const token =
        req.cookies?.accessToken ||
        (req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.slice(7)
            : null);

    if (!token) {
        throw new ApiError(401, 'No token provided');
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
            ignoreExpiration: true,
        });
    } catch {
        throw new ApiError(401, 'Invalid token');
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
        throw new ApiError(401, 'User not found or inactive');
    }

    const newAccessToken = createAccessToken(user);

    res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000,
    });

    return res.json({
        success: true,
        message: 'Token refreshed',
        data: {
            accessToken: newAccessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department || '',
                designation: user.designation || '',
                specialization: user.specialization || '',
                phone: user.phone || '',
                officeRoom: user.officeRoom || '',
            },
        },
    });
});

export const logout = asyncHandler(async (req, res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.json({
        success: true,
        message: 'Logout successful',
    });
});