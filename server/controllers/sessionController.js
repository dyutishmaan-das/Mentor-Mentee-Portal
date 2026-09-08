import Session from '../models/Session.js';
import Feedback from '../models/Feedback.js';

/**
 * GET /api/sessions
 * List sessions. Supports query: studentId, mentorId
 */
export async function getSessions(req, res, next) {
    try {
        const filter = {};
        if (req.query.studentId) filter.studentId = req.query.studentId;
        if (req.query.mentorId) filter.mentorId = req.query.mentorId;

        const sessions = await Session.find(filter).sort({ date: -1 });

        return res.json({
            success: true,
            data: sessions,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/sessions
 * Create a new mentoring session record.
 */
export async function createSession(req, res, next) {
    try {
        const session = await Session.create(req.body);

        return res.status(201).json({
            success: true,
            message: 'Session created',
            data: session,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/feedback
 * List all feedback entries.
 */
export async function getFeedback(req, res, next) {
    try {
        const filter = {};
        if (req.query.mentorId) filter.mentorId = req.query.mentorId;

        const feedback = await Feedback.find(filter).sort({ createdAt: -1 });

        return res.json({
            success: true,
            data: feedback,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/feedback
 * Submit anonymous mentor feedback.
 */
export async function createFeedback(req, res, next) {
    try {
        const fb = await Feedback.create(req.body);

        return res.status(201).json({
            success: true,
            message: 'Feedback submitted',
            data: fb,
        });
    } catch (error) {
        next(error);
    }
}
