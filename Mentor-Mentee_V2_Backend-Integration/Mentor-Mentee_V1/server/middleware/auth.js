import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { hasPermission, canManageRole } from '../config/permissions.js';

export async function authenticate(req, _res, next) {
  try {
    const authHeader = req.get('authorization') || '';
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new ApiError(401, 'Authentication is required', 'UNAUTHORIZED');
    }

    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new ApiError(500, 'JWT secret is not configured', 'SERVER_ERROR');
    }

    const payload = jwt.verify(token, secret);
    const userId = payload.sub || payload.id;
    const user = await User.findById(userId).select('-password');

    if (!user || !user.isActive) {
      throw new ApiError(401, 'Account is unavailable or deactivated', 'UNAUTHORIZED');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(new ApiError(401, 'Token is invalid or expired', 'UNAUTHORIZED'));
  }
}

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action', 'FORBIDDEN'));
  }
  next();
};

export const requirePermission = (permission) => (req, _res, next) => {
  if (!req.user || !hasPermission(req.user.role, permission)) {
    return next(new ApiError(403, 'You do not have permission to perform this action', 'FORBIDDEN'));
  }
  next();
};

export const authorizeRoleCreation = (staticTargetRole) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required', 'UNAUTHORIZED'));
  }

  const targetRole = staticTargetRole || req.body?.role;
  if (!targetRole) {
    return next(new ApiError(400, 'Target role must be specified', 'BAD_REQUEST'));
  }

  if (!canManageRole(req.user.role, targetRole)) {
    return next(new ApiError(403, `${req.user.role} cannot create ${targetRole} accounts`, 'FORBIDDEN'));
  }

  next();
};
