import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, signRefreshToken, refreshCookieOptions } from '../utils/tokens.js';
import { audit } from '../services/auditService.js';

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  lastLogin: user.lastLogin,
});
async function issueTokens(user, res) {
  const refreshToken = signRefreshToken(user);
  user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await user.save();
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  return { accessToken: signAccessToken(user), user: safeUser(user) };
}
export async function register(req, res, next) {
  try {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'HOD')
      throw new ApiError(403, 'Only administrators can register users', 'FORBIDDEN');
    const exists = await User.exists({ email: req.body.email });
    if (exists) throw new ApiError(409, 'Email is already registered', 'DUPLICATE_EMAIL');
    const user = await User.create(req.body);
    await audit(req, {
      action: 'CREATE',
      module: 'USER',
      recordId: user.id,
      newValue: safeUser(user),
    });
    res
      .status(201)
      .json({ success: true, message: 'User created successfully', data: safeUser(user) });
  } catch (e) {
    next(e);
  }
}
export async function login(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+password +refreshToken');
    if (!user || !user.isActive || !(await user.comparePassword(req.body.password)))
      throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    user.lastLogin = new Date();
    const data = await issueTokens(user, res);
    req.user = user;
    await audit(req, { action: 'LOGIN', module: 'AUTH', recordId: user.id });
    res.json({ success: true, message: 'Login successful', data });
  } catch (e) {
    next(e);
  }
}
export async function me(req, res) {
  res.json({ success: true, message: 'Current user retrieved', data: safeUser(req.user) });
}
export async function refresh(req, res, next) {
  try {
    const raw = req.cookies.refreshToken;
    if (!raw) throw new ApiError(401, 'Refresh token is required', 'UNAUTHORIZED');
    const payload = jwt.verify(raw, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.sub).select('+refreshToken');
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');
    if (!user || !user.isActive || user.refreshToken !== hashed)
      throw new ApiError(401, 'Refresh token is invalid', 'UNAUTHORIZED');
    const data = await issueTokens(user, res);
    res.json({ success: true, message: 'Token refreshed', data });
  } catch (e) {
    next(new ApiError(401, 'Refresh token is invalid or expired', 'UNAUTHORIZED'));
  }
}
export async function logout(req, res, next) {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
      await audit(req, { action: 'LOGOUT', module: 'AUTH', recordId: req.user.id });
    }
    res.clearCookie('refreshToken', refreshCookieOptions);
    res.json({ success: true, message: 'Logged out successfully', data: null });
  } catch (e) {
    next(e);
  }
}
export async function changePassword(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(req.body.currentPassword)))
      throw new ApiError(400, 'Current password is incorrect', 'INVALID_PASSWORD');
    user.password = req.body.newPassword;
    await user.save();
    await audit(req, { action: 'PASSWORD_CHANGE', module: 'AUTH', recordId: user.id });
    res.json({ success: true, message: 'Password changed successfully', data: null });
  } catch (e) {
    next(e);
  }
}
export async function forgotPassword(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
      user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
      await user.save();
      if (process.env.NODE_ENV !== 'production')
        console.info(`Password reset token for ${user.email}: ${token}`);
    }
    res.json({
      success: true,
      message: 'If the account exists, reset instructions have been generated',
      data: null,
    });
  } catch (e) {
    next(e);
  }
}
export async function resetPassword(req, res, next) {
  try {
    const hash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hash,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');
    if (!user) throw new ApiError(400, 'Reset token is invalid or expired', 'INVALID_RESET_TOKEN');
    user.password = req.body.newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully', data: null });
  } catch (e) {
    next(e);
  }
}
