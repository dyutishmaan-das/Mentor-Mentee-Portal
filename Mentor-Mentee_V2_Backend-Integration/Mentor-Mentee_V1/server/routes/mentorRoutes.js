import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authorize } from '../middleware/authorize.js';
import * as c from '../controllers/mentorController.js';
const router = Router();
router.use(authenticate);
router.get('/', authorize('ADMIN', 'HOD', 'ACADEMIC_FACULTY'), c.list);
router.patch('/me', authorize('MENTOR'), c.updateMyProfile);
router.post(
  '/',
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 4 }),
  validate,
  c.create,
);
router.get('/:id/mentees', c.mentees);
export default router;
