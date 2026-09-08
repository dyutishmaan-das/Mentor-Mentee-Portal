import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import {
  authorize,
  requirePermission,
} from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import * as controller from '../controllers/academicController.js';

const router = Router();
router.use(authenticate);
router.get('/departments', controller.listDepartments);
router.post(
  '/departments',
  authorize('ADMIN', 'HOD'),
  body('name').trim().notEmpty(),
  body('code').trim().notEmpty(),
  validate,
  controller.createDepartment,
);
router.get('/subjects', controller.listSubjects);
router.post(
  '/subjects',
  authorize('ADMIN', 'HOD'),
  body('name').trim().notEmpty(),
  body('code').trim().notEmpty(),
  body('credits').isFloat({ min: 0 }),
  body('semester').isInt({ min: 1, max: 12 }),
  validate,
  controller.createSubject,
);
router.get('/marks', controller.listMarks);
router.put(
  '/marks',
  requirePermission('ACADEMIC_WRITE'),
  body('student').isMongoId(),
  body('subject').isMongoId(),
  body('semester').isInt({ min: 1, max: 12 }),
  body(['internal', 'external', 'sessional', 'put']).optional().isFloat({ min: 0, max: 100 }),
  validate,
  controller.upsertMarks,
);
export default router;
