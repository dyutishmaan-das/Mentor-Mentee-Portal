import User from '../models/User.js';

/**
 * GET /api/faculty
 * List all faculty members with optional filters
 * Supports: role, department, designation filters
 */
export async function getFaculty(req, res, next) {
    try {
        const filter = { role: { $in: ['HOD', 'ACADEMIC_FACULTY', 'MENTOR', 'OTHER_FACULTY'] } };
        
        if (req.query.role) {
            filter.role = req.query.role;
        }
        if (req.query.department) {
            filter.department = req.query.department;
        }
        if (req.query.designation) {
            filter.designation = req.query.designation;
        }

        const faculty = await User.find(filter)
            .select('-password')
            .sort({ name: 1 });

        return res.json({
            success: true,
            data: faculty,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/faculty/:id
 * Get a single faculty member by ID
 */
export async function getFacultyById(req, res, next) {
    try {
        const faculty = await User.findById(req.params.id).select('-password');

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: 'Faculty member not found',
            });
        }

        return res.json({
            success: true,
            data: faculty,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/faculty/:id
 * Update faculty profile
 */
export async function updateFaculty(req, res, next) {
    try {
        const faculty = await User.findById(req.params.id);

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: 'Faculty member not found',
            });
        }

        // Only allow certain fields to be updated
        const allowedUpdates = [
            'name',
            'phone',
            'officeRoom',
            'specialization',
            'qualifications',
            'experience',
            'researchInterests',
        ];

        const updateData = {};
        for (const field of allowedUpdates) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        Object.assign(faculty, updateData);
        await faculty.save();

        const updatedFaculty = await User.findById(req.params.id).select('-password');

        return res.json({
            success: true,
            message: 'Faculty profile updated',
            data: updatedFaculty,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/faculty/me
 * Get current faculty member's profile
 */
export async function getFacultyMe(req, res, next) {
    try {
        const faculty = await User.findById(req.user._id).select('-password');

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: 'Faculty profile not found',
            });
        }

        return res.json({
            success: true,
            data: faculty,
        });
    } catch (error) {
        next(error);
    }
}
