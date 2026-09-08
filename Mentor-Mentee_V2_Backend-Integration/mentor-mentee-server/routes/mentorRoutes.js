import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getMentors, getMentorMentees } from '../controllers/mentorController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getMentors);
router.get('/:mentorId/mentees', getMentorMentees);

export default router;
