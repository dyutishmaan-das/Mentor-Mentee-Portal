import Student from '../models/Student.js';

/**
 * GET /api/attendance
 * Query params: studentId, semester
 */
export async function getAttendance(req, res, next) {
    try {
        const { studentId, semester } = req.query;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'studentId is required',
            });
        }

        const student = await Student.findOne({ rollNo: studentId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        if (semester) {
            const semData = student.academics.get(semester);
            return res.json({
                success: true,
                data: {
                    semester,
                    attendance: semData ? semData.attendance : 0,
                },
            });
        }

        const allAttendance = {};
        for (let i = 1; i <= 8; i++) {
            const key = `Sem ${i}`;
            allAttendance[key] = student.academics.get(key)?.attendance || 0;
        }

        return res.json({
            success: true,
            data: allAttendance,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/attendance
 * Body: { studentId, semester, attendance }
 * Note: Role authorization will reject ACADEMIC_FACULTY from modifying attendance.
 */
export async function saveAttendance(req, res, next) {
    try {
        const { studentId, semester, attendance } = req.body;

        if (!studentId || !semester || attendance === undefined) {
            return res.status(400).json({
                success: false,
                message: 'studentId, semester, and attendance are required',
            });
        }

        const student = await Student.findOne({ rollNo: studentId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        const currentSemData = student.academics.get(semester)?.toObject?.() || {
            gpa: 0,
            attendance: 0,
            marks: [],
        };

        currentSemData.attendance = Number(attendance);
        student.academics.set(semester, currentSemData);
        await student.save();

        return res.json({
            success: true,
            message: 'Attendance updated successfully',
            data: student.academics.get(semester),
        });
    } catch (error) {
        next(error);
    }
}
