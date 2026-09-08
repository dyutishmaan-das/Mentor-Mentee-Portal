import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
    getSessions,
    createSession,
    getFeedback,
    createFeedback,
} from '../controllers/sessionController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getSessions);
router.post('/', createSession);

// Feedback sub-routes
router.get('/feedback', getFeedback);
router.post('/feedback', createFeedback);

export default router;
