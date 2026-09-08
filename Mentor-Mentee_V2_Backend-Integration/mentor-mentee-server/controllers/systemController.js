/**
 * System Controller
 * Handles system-level operations, announcements, settings, and reports
 */

import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Feedback from '../models/Feedback.js';

/**
 * Get system statistics
 * GET /api/system/stats
 */
export const getSystemStats = asyncHandler(async (req, res) => {
    const [
        totalStudents,
        totalFaculty,
        totalMentors,
        totalSessions,
        totalFeedbacks,
        activeStudents,
    ] = await Promise.all([
        Student.countDocuments(),
        User.countDocuments({ role: { $ne: 'MENTEE' } }),
        User.countDocuments({ role: 'MENTOR' }),
        Session.countDocuments(),
        Feedback.countDocuments(),
        Student.countDocuments({ status: 'Active' }),
    ]);

    res.json({
        success: true,
        data: {
            students: {
                total: totalStudents,
                active: activeStudents,
            },
            faculty: {
                total: totalFaculty,
                mentors: totalMentors,
            },
            sessions: totalSessions,
            feedbacks: totalFeedbacks,
        },
    });
});

/**
 * Get dashboard analytics
 * GET /api/system/analytics
 */
export const getAnalytics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const sessionsFilter = Object.keys(dateFilter).length ? { date: dateFilter } : {};

    // Get analytics data
    const [
        studentsByBranch,
        studentsBySemester,
        sessionsByStatus,
        recentSessions,
    ] = await Promise.all([
        Student.aggregate([
            { $group: { _id: '$branch', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
        Student.aggregate([
            { $group: { _id: '$semester', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]),
        Session.aggregate([
            { $match: sessionsFilter },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Session.find(sessionsFilter)
            .sort({ date: -1 })
            .limit(10)
            .select('studentId mentorId date type topic status'),
    ]);

    res.json({
        success: true,
        data: {
            studentsByBranch,
            studentsBySemester,
            sessionsByStatus,
            recentSessions,
        },
    });
});

/**
 * System announcements storage (in-memory for now, should use DB)
 */
let announcements = [];
let announcementIdCounter = 1;

/**
 * Create announcement
 * POST /api/system/announcements
 */
export const createAnnouncement = asyncHandler(async (req, res) => {
    const { title, message, priority, targetRoles } = req.body;

    const announcement = {
        id: announcementIdCounter++,
        title,
        message,
        priority: priority || 'normal',
        targetRoles: targetRoles || ['ALL'],
        createdBy: req.user._id,
        createdAt: new Date(),
        isActive: true,
    };

    announcements.push(announcement);

    res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        data: announcement,
    });
});

/**
 * Get all announcements
 * GET /api/system/announcements
 */
export const getAnnouncements = asyncHandler(async (req, res) => {
    const userRole = req.user.role;

    const filtered = announcements.filter(
        (a) => a.isActive && (a.targetRoles.includes('ALL') || a.targetRoles.includes(userRole))
    );

    res.json({
        success: true,
        data: filtered,
    });
});

/**
 * Update announcement
 * PUT /api/system/announcements/:id
 */
export const updateAnnouncement = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const announcement = announcements.find((a) => a.id === parseInt(id));
    if (!announcement) {
        throw new ApiError(404, 'Announcement not found');
    }

    Object.assign(announcement, updates);

    res.json({
        success: true,
        message: 'Announcement updated successfully',
        data: announcement,
    });
});

/**
 * Delete announcement
 * DELETE /api/system/announcements/:id
 */
export const deleteAnnouncement = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const index = announcements.findIndex((a) => a.id === parseInt(id));
    if (index === -1) {
        throw new ApiError(404, 'Announcement not found');
    }

    announcements.splice(index, 1);

    res.json({
        success: true,
        message: 'Announcement deleted successfully',
    });
});

/**
 * Generate attendance report
 * GET /api/system/reports/attendance
 */
export const generateAttendanceReport = asyncHandler(async (req, res) => {
    const { semester, branch, startDate, endDate } = req.query;

    const filter = {};
    if (semester) filter.semester = semester;
    if (branch) filter.branch = branch;

    const students = await Student.find(filter).select(
        'rollNo name semester branch email'
    );

    const report = students.map((student) => ({
        rollNo: student.rollNo,
        name: student.name,
        semester: student.semester,
        branch: student.branch,
        email: student.email,
        // Add attendance calculation logic here
    }));

    res.json({
        success: true,
        data: {
            generatedAt: new Date(),
            filters: { semester, branch, startDate, endDate },
            totalStudents: report.length,
            report,
        },
    });
});

/**
 * Generate academic performance report
 * GET /api/system/reports/academic
 */
export const generateAcademicReport = asyncHandler(async (req, res) => {
    const { semester, branch } = req.query;

    const filter = {};
    if (semester) filter.semester = semester;
    if (branch) filter.branch = branch;

    const students = await Student.find(filter).select(
        'rollNo name semester branch academics backlogs'
    );

    const report = students.map((student) => {
        const semesterData = student.academics?.get(semester || '1');
        return {
            rollNo: student.rollNo,
            name: student.name,
            semester: student.semester,
            branch: student.branch,
            gpa: semesterData?.gpa || 'N/A',
            attendance: semesterData?.attendance || 'N/A',
            backlogCount: student.backlogs?.length || 0,
        };
    });

    res.json({
        success: true,
        data: {
            generatedAt: new Date(),
            filters: { semester, branch },
            totalStudents: report.length,
            averageGPA:
                report.reduce((sum, s) => sum + (parseFloat(s.gpa) || 0), 0) / report.length,
            report,
        },
    });
});

/**
 * Generate mentor-mentee interaction report
 * GET /api/system/reports/mentoring
 */
export const generateMentoringReport = asyncHandler(async (req, res) => {
    const { mentorId, startDate, endDate } = req.query;

    const filter = {};
    if (mentorId) filter.mentorId = mentorId;
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
    }

    const sessions = await Session.find(filter).sort({ date: -1 });

    const report = {
        totalSessions: sessions.length,
        byStatus: {},
        byType: {},
        sessions: sessions.slice(0, 100), // Limit to 100 recent
    };

    sessions.forEach((session) => {
        report.byStatus[session.status] = (report.byStatus[session.status] || 0) + 1;
        report.byType[session.type] = (report.byType[session.type] || 0) + 1;
    });

    res.json({
        success: true,
        data: {
            generatedAt: new Date(),
            filters: { mentorId, startDate, endDate },
            ...report,
        },
    });
});

/**
 * System health check
 * GET /api/system/health
 */
export const systemHealth = asyncHandler(async (req, res) => {
    const dbStatus = await checkDatabaseConnection();

    res.json({
        success: true,
        data: {
            status: 'operational',
            timestamp: new Date(),
            database: dbStatus,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        },
    });
});

async function checkDatabaseConnection() {
    try {
        await Student.findOne().limit(1);
        return { status: 'connected', message: 'Database connection healthy' };
    } catch (error) {
        return { status: 'error', message: error.message };
    }
}
