import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) =>
  next(new ApiError(404, `Route ${req.method} ${req.path} not found`, 'NOT_FOUND'));
export const errorHandler = (err, _req, res, _next) => {
  const status = err.status || (err.name === 'ValidationError' ? 422 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    message: status >= 500 ? 'An unexpected server error occurred' : err.message,
    errorCode: err.code || 'INTERNAL_ERROR',
  });
};
