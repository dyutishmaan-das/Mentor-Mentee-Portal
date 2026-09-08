/**
 * Import Controller
 * Handles bulk data imports for students and faculty
 */

import xlsx from 'xlsx';
import bcrypt from 'bcryptjs';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

/**
 * Import students from Excel file
 * POST /api/import/students
 */
export const importStudents = asyncHandler(async (req, res) => {
    const file = req.file;

    if (!file) {
        throw new ApiError(400, 'No file uploaded');
    }

    try {
        // Read Excel file
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (!data || data.length === 0) {
            throw new ApiError(400, 'Excel file is empty or invalid format');
        }

        const results = {
            total: data.length,
            success: 0,
            failed: 0,
            errors: [],
        };

        // Process each student record
        for (let i = 0; i < data.length; i++) {
            try {
                const row = data[i];
                
                // Validate required fields
                if (!row['Roll No'] || !row['Name']) {
                    results.errors.push({
                        row: i + 2,
                        error: 'Missing required fields: Roll No or Name',
                    });
                    results.failed++;
                    continue;
                }

                const rollNo = String(row['Roll No']).trim();
                const email = row['Email'] ? String(row['Email']).trim().toLowerCase() : `${rollNo}@student.edu`;

                // Create user account for student
                let user = await User.findOne({ email });
                
                if (!user) {
                    const hashedPassword = await bcrypt.hash('student123', 10);
                    user = await User.create({
                        name: row['Name'],
                        email: email,
                        password: hashedPassword,
                        role: 'MENTEE',
                        isActive: true,
                    });
                }

                // Check if student already exists
                const existingStudent = await Student.findOne({ rollNo });
                if (existingStudent) {
                    results.errors.push({
                        row: i + 2,
                        rollNo: rollNo,
                        error: 'Student already exists',
                    });
                    results.failed++;
                    continue;
                }

                // Create student record
                await Student.create({
                    rollNo: rollNo,
                    userId: user._id,
                    name: row['Name'],
                    email: email,
                    course: row['Course'] || '',
                    branch: row['Branch'] || '',
                    specialization: row['Specialization'] || '',
                    semester: row['Semester'] || '',
                    batch: row['Batch'] || '',
                    section: row['Section'] || '',
                    status: row['Status'] || 'Active',
                    yearOfPassing: row['Year of Passing'] || '',
                    gender: row['Gender'] || '',
                    category: row['Category'] || '',
                    dob: row['DOB'] || '',
                    bloodGroup: row['Blood Group'] || '',
                    mobile1: row['Mobile'] || '',
                    mobile2: row['Mobile 2'] || '',
                    addressPresent: row['Present Address'] || '',
                    addressPermanent: row['Permanent Address'] || '',
                    parentFatherName: row['Father Name'] || '',
                    parentFatherMobile1: row['Father Mobile'] || '',
                    parentFatherEmail: row['Father Email'] || '',
                    parentMotherName: row['Mother Name'] || '',
                    parentMotherMobile1: row['Mother Mobile'] || '',
                    parentMotherEmail: row['Mother Email'] || '',
                    academics10thSchool: row['10th School'] || '',
                    academics10thYear: row['10th Year'] || '',
                    academics10thBoard: row['10th Board'] || '',
                    academics10thMarks: row['10th Marks'] || '',
                    academics12thSchool: row['12th School'] || '',
                    academics12thYear: row['12th Year'] || '',
                    academics12thBoard: row['12th Board'] || '',
                    academics12thMarks: row['12th Marks'] || '',
                });

                results.success++;
            } catch (error) {
                results.errors.push({
                    row: i + 2,
                    error: error.message,
                });
                results.failed++;
            }
        }

        res.json({
            success: true,
            message: `Import completed: ${results.success} successful, ${results.failed} failed`,
            data: results,
        });
    } catch (error) {
        throw new ApiError(500, `Import failed: ${error.message}`);
    }
});

/**
 * Import faculty from Excel file
 * POST /api/import/faculty
 */
export const importFaculty = asyncHandler(async (req, res) => {
    const file = req.file;

    if (!file) {
        throw new ApiError(400, 'No file uploaded');
    }

    try {
        // Read Excel file
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (!data || data.length === 0) {
            throw new ApiError(400, 'Excel file is empty or invalid format');
        }

        const results = {
            total: data.length,
            success: 0,
            failed: 0,
            errors: [],
        };

        // Process each faculty record
        for (let i = 0; i < data.length; i++) {
            try {
                const row = data[i];

                // Validate required fields
                if (!row['Name'] || !row['Email']) {
                    results.errors.push({
                        row: i + 2,
                        error: 'Missing required fields: Name or Email',
                    });
                    results.failed++;
                    continue;
                }

                const email = String(row['Email']).trim().toLowerCase();

                // Check if faculty already exists
                const existingFaculty = await User.findOne({ email });
                if (existingFaculty) {
                    results.errors.push({
                        row: i + 2,
                        email: email,
                        error: 'Faculty already exists',
                    });
                    results.failed++;
                    continue;
                }

                // Validate role
                const role = row['Role'] || 'OTHER_FACULTY';
                const validRoles = ['HOD', 'ACADEMIC_FACULTY', 'MENTOR', 'OTHER_FACULTY'];
                if (!validRoles.includes(role)) {
                    results.errors.push({
                        row: i + 2,
                        error: `Invalid role: ${role}`,
                    });
                    results.failed++;
                    continue;
                }

                // Hash default password
                const hashedPassword = await bcrypt.hash('Faculty@123', 10);

                // Create faculty account
                await User.create({
                    name: row['Name'],
                    email: email,
                    password: hashedPassword,
                    role: role,
                    isActive: true,
                    department: row['Department'] || '',
                    designation: row['Designation'] || '',
                    specialization: row['Specialization'] || '',
                    phone: row['Phone'] || '',
                    officeRoom: row['Office Room'] || '',
                    qualifications: row['Qualifications'] || '',
                    experience: row['Experience'] || '',
                    researchInterests: row['Research Interests'] || '',
                });

                results.success++;
            } catch (error) {
                results.errors.push({
                    row: i + 2,
                    error: error.message,
                });
                results.failed++;
            }
        }

        res.json({
            success: true,
            message: `Import completed: ${results.success} successful, ${results.failed} failed`,
            data: results,
        });
    } catch (error) {
        throw new ApiError(500, `Import failed: ${error.message}`);
    }
});

/**
 * Get import template (Excel format specification)
 * GET /api/import/template/:type
 */
export const getImportTemplate = asyncHandler(async (req, res) => {
    const { type } = req.params;

    let headers = [];

    if (type === 'students') {
        headers = [
            'Roll No',
            'Name',
            'Email',
            'Course',
            'Branch',
            'Specialization',
            'Semester',
            'Batch',
            'Section',
            'Status',
            'Year of Passing',
            'Gender',
            'Category',
            'DOB',
            'Blood Group',
            'Mobile',
            'Mobile 2',
            'Present Address',
            'Permanent Address',
            'Father Name',
            'Father Mobile',
            'Father Email',
            'Mother Name',
            'Mother Mobile',
            'Mother Email',
            '10th School',
            '10th Year',
            '10th Board',
            '10th Marks',
            '12th School',
            '12th Year',
            '12th Board',
            '12th Marks',
        ];
    } else if (type === 'faculty') {
        headers = [
            'Name',
            'Email',
            'Role',
            'Department',
            'Designation',
            'Specialization',
            'Phone',
            'Office Room',
            'Qualifications',
            'Experience',
            'Research Interests',
        ];
    } else {
        throw new ApiError(400, 'Invalid template type');
    }

    // Create Excel workbook
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet([headers]);
    xlsx.utils.book_append_sheet(workbook, worksheet, type);

    // Write to buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_import_template.xlsx`);
    res.send(buffer);
});

/**
 * Validate import file before actual import
 * POST /api/import/validate/:type
 */
export const validateImportFile = asyncHandler(async (req, res) => {
    const { type } = req.params;
    const file = req.file;

    if (!file) {
        throw new ApiError(400, 'No file uploaded');
    }

    try {
        // Read Excel file
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const validation = {
            totalRows: data.length,
            validRows: 0,
            invalidRows: 0,
            errors: [],
        };

        // Validate each row
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowErrors = [];

            if (type === 'students') {
                if (!row['Roll No']) rowErrors.push('Missing Roll No');
                if (!row['Name']) rowErrors.push('Missing Name');
            } else if (type === 'faculty') {
                if (!row['Name']) rowErrors.push('Missing Name');
                if (!row['Email']) rowErrors.push('Missing Email');
                if (row['Role'] && !['HOD', 'ACADEMIC_FACULTY', 'MENTOR', 'OTHER_FACULTY'].includes(row['Role'])) {
                    rowErrors.push('Invalid Role');
                }
            }

            if (rowErrors.length > 0) {
                validation.invalidRows++;
                validation.errors.push({
                    row: i + 2,
                    errors: rowErrors,
                });
            } else {
                validation.validRows++;
            }
        }

        res.json({
            success: true,
            data: validation,
        });
    } catch (error) {
        throw new ApiError(500, `Validation failed: ${error.message}`);
    }
});
