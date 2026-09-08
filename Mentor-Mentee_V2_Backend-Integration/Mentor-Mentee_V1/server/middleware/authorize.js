// server/middleware/authorize.js

import {
  hasPermission,
  canManageRole,
} from '../config/permissions.js';

import { ApiError } from '../utils/ApiError.js';

/*
|--------------------------------------------------------------------------
| ROLE AUTHORIZATION
|--------------------------------------------------------------------------
*/

export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) {
      return next(
        new ApiError(
          401,
          'Authentication required',
          'UNAUTHORIZED',
        ),
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          'You do not have permission to perform this action',
          'FORBIDDEN',
        ),
      );
    }

    next();
  };

/*
|--------------------------------------------------------------------------
| PERMISSION AUTHORIZATION
|--------------------------------------------------------------------------
*/

export const requirePermission =
  (...requiredPermissions) =>
  (req, _res, next) => {
    if (!req.user) {
      return next(
        new ApiError(
          401,
          'Authentication required',
          'UNAUTHORIZED',
        ),
      );
    }

    const allowed = requiredPermissions.every(
      (permission) =>
        hasPermission(req.user.role, permission),
    );

    if (!allowed) {
      return next(
        new ApiError(
          403,
          'You do not have permission to perform this action',
          'FORBIDDEN',
        ),
      );
    }

    next();
  };

/*
|--------------------------------------------------------------------------
| ROLE CREATION AUTHORIZATION
|--------------------------------------------------------------------------
*/

export const authorizeRoleCreation =
  (targetRole) =>
  (req, _res, next) => {
    if (!req.user) {
      return next(
        new ApiError(
          401,
          'Authentication required',
          'UNAUTHORIZED',
        ),
      );
    }

    if (
      !canManageRole(
        req.user.role,
        targetRole,
      )
    ) {
      return next(
        new ApiError(
          403,
          `${req.user.role} cannot create ${targetRole} accounts`,
          'FORBIDDEN',
        ),
      );
    }

    next();
  };