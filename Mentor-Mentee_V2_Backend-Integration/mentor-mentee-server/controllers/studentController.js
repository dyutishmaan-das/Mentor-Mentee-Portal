import mongoose from 'mongoose';
import Student from '../models/Student.js';
import User from '../models/User.js';
import PendingRegistration from '../models/PendingRegistration.js';
import RegistrationToken from '../models/RegistrationToken.js';
import Session from '../models/Session.js';
import Feedback from '../models/Feedback.js';

/**
 * Helpers for HOD Department Scoping
 */
export function getHodDepartment(user) {
    if (!user) return '';
    return (user.department || user.specialization || '').trim();
}

export function applyDepartmentScope(user, filter = {}) {
    if (user && user.role === 'HOD') {
        const dept = getHodDepartment(user);
        if (dept) {
            const escaped = dept.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const deptRegex = new RegExp(`^${escaped}$`, 'i');
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { branch: deptRegex },
                    { department: deptRegex },
                    { branch: dept },
                    { department: dept },
                ],
            });
        }
    }
    return filter;
}

export function isStudentInUserDepartment(student, user) {
    if (!user || user.role !== 'HOD') return true;
    const dept = getHodDepartment(user);
    if (!dept) return true;
    const sDept = (student.department || '').trim().toLowerCase();
    const sBranch = (student.branch || '').trim().toLowerCase();
    const uDept = dept.trim().toLowerCase();
    return sDept === uDept || sBranch === uDept;
}

/**
 * GET /api/students
 * List all students. Supports query params: section, batch, semester, mentorId, status, branch, course, search
 * HODs are strictly scoped to students belonging to their department.
 */
export async function getStudents(req, res, next) {
    try {
        const filter = {};
        if (req.query.section) filter.section = req.query.section;
        if (req.query.batch) filter.batch = req.query.batch;
        if (req.query.semester) filter.semester = req.query.semester;
        if (req.query.mentorId) filter.mentorId = req.query.mentorId;
        if (req.query.status) filter.status = req.query.status;
        if (req.query.course) filter.course = req.query.course;

        // If specific branch is requested in query
        if (req.query.branch) {
            filter.branch = req.query.branch;
        }

        // Apply HOD department scoping
        applyDepartmentScope(req.user, filter);

        if (req.query.search && req.query.search.trim()) {
            const regex = new RegExp(req.query.search.trim(), 'i');
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { name: regex },
                    { rollNo: regex },
                    { email: regex },
                ],
            });
        }

        const students = await Student.find(filter).sort({ rollNo: 1 });

        return res.json({
            success: true,
            data: students,
            departmentScoped: req.user?.role === 'HOD' ? getHodDepartment(req.user) : null,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/students/me
 * Return the student profile linked to the currently authenticated user.
 */
export async function getStudentMe(req, res, next) {
    try {
        let student = await Student.findOne({ userId: req.user._id });

        if (!student && req.user.email) {
            student = await Student.findOne({ email: req.user.email.toLowerCase() });
            if (student && !student.userId) {
                student.userId = req.user._id;
                await student.save();
            }
        }

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found for this user',
            });
        }

        return res.json({
            success: true,
            data: student,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/students/:id
 * Return a single student by rollNo or ObjectId.
 */
export async function getStudentById(req, res, next) {
    try {
        let student = await Student.findOne({ rollNo: req.params.id });

        if (!student && mongoose.isValidObjectId(req.params.id)) {
            student = await Student.findById(req.params.id);
        }

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        // Enforce HOD department restriction
        if (req.user && req.user.role === 'HOD' && !isStudentInUserDepartment(student, req.user)) {
            return res.status(403).json({
                success: false,
                message: `Access denied: Student belongs to ${student.branch || 'another department'}, not your department (${getHodDepartment(req.user)}).`,
            });
        }

        return res.json({
            success: true,
            data: student,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/students/:id
 * Update a student record. The request body is a partial student object.
 */
export async function updateStudent(req, res, next) {
    try {
        let student = await Student.findOne({ rollNo: req.params.id });

        if (!student && mongoose.isValidObjectId(req.params.id)) {
            student = await Student.findById(req.params.id);
        }

        if (!student && req.user && req.user.role === 'MENTEE') {
            student = await Student.findOne({ userId: req.user._id });
        }

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        // Enforce HOD department restriction
        if (req.user && req.user.role === 'HOD' && !isStudentInUserDepartment(student, req.user)) {
            return res.status(403).json({
                success: false,
                message: `Access denied: You cannot modify students outside your department (${getHodDepartment(req.user)}).`,
            });
        }

        // Merge the update data
        const updateData = req.body;

        // Handle academics separately since it's a Map
        if (updateData.academics) {
            for (const [sem, data] of Object.entries(updateData.academics)) {
                student.academics.set(sem, {
                    ...student.academics.get(sem)?.toObject?.() || { gpa: 0, attendance: 0, marks: [] },
                    ...data,
                });
            }
            delete updateData.academics;
        }

        // Apply remaining fields
        Object.assign(student, updateData);
        await student.save();

        return res.json({
            success: true,
            message: 'Student updated',
            data: student,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/students/section-allotment/list
 * Retrieve student lists for HOD Section Allotment
 * Query params: status (pending | allotted | uncompleted | all), course, branch, semester, search
 * Scoped to HOD's department when requested by HOD.
 */
export async function getSectionAllotmentList(req, res, next) {
    try {
        const { status = 'pending', course, branch, semester, search } = req.query;

        const filter = {};

        if (course) filter.course = course;
        if (branch) filter.branch = branch;
        if (semester) filter.semester = semester;

        // Apply HOD department scoping
        applyDepartmentScope(req.user, filter);

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { name: regex },
                    { rollNo: regex },
                    { email: regex },
                ],
            });
        }

        // Apply status filtering
        if (status === 'pending') {
            filter.profileCompleted = true;
            // Unallotted section
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { section: { $exists: false } },
                    { section: null },
                    { section: '' },
                ],
            });
        } else if (status === 'allotted') {
            filter.section = { $exists: true, $nin: ['', null] };
        } else if (status === 'uncompleted') {
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { profileCompleted: false },
                    { profileCompleted: { $exists: false } },
                    { profileCompleted: null },
                ],
            });
        }

        const students = await Student.find(filter)
            .populate('sectionAllottedBy', 'name email role')
            .sort({ profileCompletedAt: -1, createdAt: -1 })
            .lean();

        // Calculate dynamic summary stats scoped to HOD department if applicable
        const baseDeptFilter = applyDepartmentScope(req.user, {});

        const pendingCountFilter = {
            ...baseDeptFilter,
            profileCompleted: true,
            $or: [{ section: { $exists: false } }, { section: null }, { section: '' }],
        };

        const allottedCountFilter = {
            ...baseDeptFilter,
            section: { $exists: true, $nin: ['', null] },
        };

        const uncompletedCountFilter = {
            ...baseDeptFilter,
            $or: [
                { profileCompleted: false },
                { profileCompleted: { $exists: false } },
                { profileCompleted: null },
            ],
        };

        const pendingCount = await Student.countDocuments(pendingCountFilter);
        const allottedCount = await Student.countDocuments(allottedCountFilter);
        const uncompletedCount = await Student.countDocuments(uncompletedCountFilter);
        const totalCount = await Student.countDocuments(baseDeptFilter);

        return res.json({
            success: true,
            counts: {
                pending: pendingCount,
                allotted: allottedCount,
                uncompleted: uncompletedCount,
                total: totalCount,
            },
            department: req.user?.role === 'HOD' ? getHodDepartment(req.user) : null,
            data: students.map(s => ({
                id: s.rollNo || s._id?.toString(),
                _id: s._id?.toString(),
                rollNo: s.rollNo,
                name: s.name,
                email: s.email,
                mobile1: s.mobile1 || '',
                course: s.course || 'B.Tech',
                branch: s.branch || '',
                semester: s.semester || 'Sem 1',
                batch: s.batch || '',
                section: s.section || '',
                profileCompleted: !!s.profileCompleted,
                profileCompletedAt: s.profileCompletedAt,
                sectionAllottedBy: s.sectionAllottedBy,
                sectionAllottedAt: s.sectionAllottedAt,
                photoUrl: s.photoUrl || '',
                createdAt: s.createdAt,
            })),
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/students/section-allotment/bulk
 * Bulk allot or update sections for selected students
 * Body: { studentIds: string[], section: string }
 */
export async function bulkAllotSection(req, res, next) {
    try {
        const { studentIds, section } = req.body;

        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please select at least one student to allot a section.',
            });
        }

        if (!section || typeof section !== 'string' || !section.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Target section name/letter is required (e.g. A, B, C, D).',
            });
        }

        const targetSection = section.trim().toUpperCase();

        const objectIds = studentIds.filter(id => mongoose.isValidObjectId(id)).map(id => new mongoose.Types.ObjectId(id));
        const rollNos = studentIds.filter(id => typeof id === 'string' && id.trim().length > 0);

        // Enforce HOD department restriction
        if (req.user?.role === 'HOD') {
            const targetStudents = await Student.find({
                $or: [
                    { _id: { $in: objectIds } },
                    { rollNo: { $in: rollNos } },
                ],
            });
            const invalidStudent = targetStudents.find(s => !isStudentInUserDepartment(s, req.user));
            if (invalidStudent) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied: Student (${invalidStudent.rollNo || invalidStudent.name}) is outside your department.`,
                });
            }
        }

        const query = {
            $or: [
                { _id: { $in: objectIds } },
                { rollNo: { $in: rollNos } },
            ],
        };

        applyDepartmentScope(req.user, query);

        const result = await Student.updateMany(query, {
            $set: {
                section: targetSection,
                sectionAllottedBy: req.user._id,
                sectionAllottedAt: new Date(),
            },
        });

        return res.json({
            success: true,
            message: `Successfully allotted ${result.modifiedCount} student(s) to Section ${targetSection}`,
            modifiedCount: result.modifiedCount,
            section: targetSection,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /api/students/:id/status
 * Toggle or set student active/inactive status (Admin & HOD authorized)
 * Body: { status: 'Active' | 'Inactive' }
 */
export async function toggleStudentStatus(req, res, next) {
    try {
        const { id } = req.params;
        let { status } = req.body || {};

        let student = await Student.findOne({ rollNo: id });
        if (!student && mongoose.isValidObjectId(id)) {
            student = await Student.findById(id);
        }

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student record not found',
            });
        }

        // Enforce HOD department restriction
        if (req.user && req.user.role === 'HOD' && !isStudentInUserDepartment(student, req.user)) {
            return res.status(403).json({
                success: false,
                message: `Access denied: You cannot change the status of students outside your department (${getHodDepartment(req.user)}).`,
            });
        }

        if (!status) {
            status = student.status === 'Inactive' ? 'Active' : 'Inactive';
        } else {
            status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
            if (status !== 'Active' && status !== 'Inactive') {
                return res.status(400).json({
                    success: false,
                    message: "Status must be either 'Active' or 'Inactive'",
                });
            }
        }

        student.status = status;
        await student.save();

        // Update corresponding User account active state
        const isUserActive = status === 'Active';
        if (student.userId) {
            await User.findByIdAndUpdate(student.userId, { isActive: isUserActive });
        } else if (student.email) {
            await User.findOneAndUpdate({ email: student.email.toLowerCase() }, { isActive: isUserActive });
        }

        return res.json({
            success: true,
            message: `Student ${student.name} (${student.rollNo}) is now marked as ${status}`,
            data: student,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/students/:id
 * Permanently remove student and associated user account / data (Admin authorized)
 */
export async function deleteStudent(req, res, next) {
    try {
        const { id } = req.params;

        let student = await Student.findOne({ rollNo: id });
        if (!student && mongoose.isValidObjectId(id)) {
            student = await Student.findById(id);
        }

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student record not found',
            });
        }

        const studentEmail = student.email ? student.email.toLowerCase() : null;
        const studentRollNo = student.rollNo;
        const studentUserId = student.userId;
        const studentObjId = student._id;

        // 1. Delete associated User account
        if (studentUserId) {
            await User.findByIdAndDelete(studentUserId);
        } else if (studentEmail) {
            await User.deleteMany({ email: studentEmail });
        }

        // 2. Clean up any pending registration or tokens
        if (studentEmail) {
            await PendingRegistration.deleteMany({ email: studentEmail });
            await RegistrationToken.deleteMany({ assignedEmail: studentEmail });
        }

        // 3. Clean up associated Sessions and Feedback
        await Session.deleteMany({
            $or: [
                { studentId: studentRollNo },
                { studentId: studentObjId.toString() }
            ]
        });

        await Feedback.deleteMany({
            $or: [
                { studentId: studentRollNo },
                { studentId: studentObjId.toString() }
            ]
        });

        // 4. Delete Student record
        await Student.findByIdAndDelete(studentObjId);

        return res.json({
            success: true,
            message: `Student ${student.name} (${studentRollNo}) and associated credentials have been removed successfully.`,
            data: {
                rollNo: studentRollNo,
                name: student.name,
                email: student.email,
            },
        });
    } catch (error) {
        next(error);
    }
}
