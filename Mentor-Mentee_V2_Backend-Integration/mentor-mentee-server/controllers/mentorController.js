import User from '../models/User.js';
import Student from '../models/Student.js';

/**
 * GET /api/mentors
 * Returns all users with role 'MENTOR'
 */
export async function getMentors(req, res, next) {
    try {
        const mentors = await User.find({ role: 'MENTOR', isActive: true })
            .select('name email role')
            .sort({ name: 1 });

        return res.json({
            success: true,
            data: mentors.map((m) => ({
                id: m._id.toString(),
                name: m.name,
                email: m.email,
                role: m.role,
            })),
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/mentors/:mentorId/mentees
 * Returns all students assigned to the given mentorId
 */
export async function getMentorMentees(req, res, next) {
    try {
        const { mentorId } = req.params;

        const mentees = await Student.find({ mentorId }).sort({ rollNo: 1 });

        return res.json({
            success: true,
            data: mentees,
        });
    } catch (error) {
        next(error);
    }
}
