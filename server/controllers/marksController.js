import Student from '../models/Student.js';

/**
 * GET /api/marks
 * Query params: studentId, semester
 */
export async function getMarks(req, res, next) {
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
                data: semData ? semData.marks : [],
            });
        }

        // Return all marks across semesters
        const allMarks = {};
        for (let i = 1; i <= 8; i++) {
            const key = `Sem ${i}`;
            allMarks[key] = student.academics.get(key)?.marks || [];
        }

        return res.json({
            success: true,
            data: allMarks,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/marks
 * Body: { studentId, semester, marks: [ { code, name, sessional1, sessional2, put, internal, external, total, obtained } ] }
 */
export async function saveMarks(req, res, next) {
    try {
        const { studentId, semester, marks, gpa } = req.body;

        if (!studentId || !semester) {
            return res.status(400).json({
                success: false,
                message: 'studentId and semester are required',
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

        if (marks !== undefined) currentSemData.marks = marks;
        if (gpa !== undefined) currentSemData.gpa = Number(gpa);

        student.academics.set(semester, currentSemData);
        await student.save();

        return res.json({
            success: true,
            message: 'Marks updated successfully',
            data: student.academics.get(semester),
        });
    } catch (error) {
        next(error);
    }
}
