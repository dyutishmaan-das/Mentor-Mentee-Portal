/**
 * Centralized Error Handling Middleware
 * Provides consistent error responses across the application
 */

class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    if (!statusCode) {
        statusCode = 500;
    }

    const response = {
        success: false,
        statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };

    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            statusCode,
            message,
            stack: err.stack,
            path: req.path,
            method: req.method,
        });
    }

    res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFound = (req, res, next) => {
    const error = new ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validation error handler
 */
export const handleValidationError = (errors) => {
    const errorMessages = errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
    }));

    return new ApiError(400, 'Validation Error', true, JSON.stringify(errorMessages));
};

/**
 * MongoDB error handler
 */
export const handleMongoError = (err) => {
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return new ApiError(409, `${field} already exists`);
    }

    if (err.name === 'CastError') {
        return new ApiError(400, `Invalid ${err.path}: ${err.value}`);
    }

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => e.message);
        return new ApiError(400, `Validation Error: ${errors.join(', ')}`);
    }

    return new ApiError(500, 'Database error occurred');
};

/**
 * JWT error handler
 */
export const handleJWTError = (err) => {
    if (err.name === 'JsonWebTokenError') {
        return new ApiError(401, 'Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        return new ApiError(401, 'Token expired');
    }

    return new ApiError(401, 'Authentication error');
};

export { ApiError };
