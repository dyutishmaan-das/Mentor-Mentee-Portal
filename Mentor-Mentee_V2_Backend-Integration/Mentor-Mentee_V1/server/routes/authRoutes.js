import { Router } from 'express';
import { body } from 'express-validator';
import * as controller from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  loginValidation,
  passwordValidation,
  registerValidation,
} from '../validators/authValidators.js';
const router = Router();
router.post('/register', authenticate, registerValidation, validate, controller.register);
router.post('/login', loginValidation, validate, controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.me);
router.patch(
  '/change-password',
  authenticate,
  passwordValidation,
  validate,
  controller.changePassword,
);
router.post(
  '/forgot-password',
  body('email').isEmail().normalizeEmail(),
  validate,
  controller.forgotPassword,
);
router.post(
  '/reset-password/:token',
  body('newPassword').isStrongPassword({ minLength: 8 }),
  validate,
  controller.resetPassword,
);
export default router;
