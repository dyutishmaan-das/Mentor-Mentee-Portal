/**
 * Import students from the Excel file into MongoDB.
 *
 * Usage:
 *   node seed/importExcel.js
 *
 * The Excel path is relative to the project root:
 *   ../Mentor-Mentee_V1/for mentor mentee Data.xlsx
 */

import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCEL_PATH = path.join(
    __dirname,
    '..',
    '..',
    'Mentor-Mentee_V1',
    'for mentor mentee Data.xlsx'
);

/**
 * Parse a semester GPA value from the Excel cell.
 * Returns a number or 0 if the value is not numeric.
 */
function parseGpa(val) {
    if (val === null || val === undefined) return 0;
    const s = String(val).trim();
    if (s === '' || s === '.' || s === '-' || s === 'NA' || s === 'No' || s === 'Pending') return 0;
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
}

/**
 * Parse the backlog count from the Excel cell.
 */
function parseBacklogCount(val) {
    if (val === null || val === undefined) return 0;
    const s = String(val).trim();
    if (s === '' || s === 'NA' || s === 'No' || s === 'NIL' || s === 'Nil' || s === '0' || s === 'None') return 0;
    const n = parseInt(s, 10);
    return isNaN(n) ? 0 : n;
}

/**
 * Extract section letter from Year/Section column (e.g. "4th-A" -> "A")
 */
function parseSection(val) {
    if (!val) return '';
    const s = String(val).trim();
    const match = s.match(/(\d+)(?:th|st|nd|rd)?-([A-Za-z])/i);
    if (match) return match[2].toUpperCase();
    return '';
}

/**
 * Derive batch from yearOfPassing (e.g. 2027 -> "2023-2027" for 4-year B.Tech)
 */
function deriveBatch(yearOfPassing) {
    const y = parseInt(String(yearOfPassing).trim(), 10);
    if (isNaN(y)) return '';
    return `${y - 4}-${y}`;
}

/**
 * Determine the current semester string based on how many semesters have GPA data.
 */
function deriveSemester(gpaValues) {
    let lastSem = 0;
    for (let i = 0; i < gpaValues.length; i++) {
        if (gpaValues[i] > 0) lastSem = i + 1;
    }
    return lastSem > 0 ? `Sem ${lastSem}` : 'Sem 1';
}

async function importExcel() {
    await connectDB();

    console.log(`Reading Excel file: ${EXCEL_PATH}`);
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0]; // "CSE-4th Yr_ALL"
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    console.log(`Found ${rows.length} rows in sheet "${sheetName}"`);

    let imported = 0;
    let skipped = 0;
    let userCreated = 0;
    const defaultPassword = await bcrypt.hash('student123', 12);

    for (const row of rows) {
        // Skip header rows, section markers, and empty rows
        const srNo = String(row['Sr.No.'] || '').trim();
        const name = String(row['Student Name'] || '').trim();
        const rollNo = String(row['Roll No.'] || '').trim();

        if (!name || !rollNo || name === 'Section-C') {
            skipped++;
            continue;
        }

        // Parse semester GPAs
        const gpaValues = [];
        for (let i = 1; i <= 8; i++) {
            gpaValues.push(parseGpa(row[`Sem ${i}`]));
        }

        // Build academics map
        const academics = new Map();
        for (let i = 1; i <= 8; i++) {
            academics.set(`Sem ${i}`, {
                gpa: gpaValues[i - 1],
                attendance: 0, // Not in this Excel
                marks: [],     // Not in this Excel
            });
        }

        // Parse other fields
        const section = parseSection(row['Year \n Section'] || row['Year \r\n Section'] || '');
        const yearOfPassing = String(row['Year of\n  Passing'] || row['Year of\r\n  Passing'] || '').trim();
        const email = String(row['Email ID'] || '').trim().toLowerCase();
        const gender = String(row['Gender'] || '').trim();
        const mobile = String(row['Mobile No.'] || '').trim();
        const tenthMarks = String(row['10th %'] || '').trim();
        const twelfthMarks = String(row['12th %'] || '').trim();
        const diplomaMarks = String(row['Diploma % \n (if lateral entry)'] || row['Diploma % \r\n (if lateral entry)'] || '').trim();
        const backlogCount = parseBacklogCount(row['Active Backlogs']);

        // Build backlogs array if count > 0
        const backlogs = [];
        if (backlogCount > 0) {
            // We don't have per-subject backlogs from the Excel.
            // Create placeholder entries so the frontend count works.
            for (let b = 0; b < backlogCount; b++) {
                backlogs.push({
                    semester: '',
                    subjectCode: `Backlog ${b + 1}`,
                    clearDate: null, // null means active
                });
            }
        }

        // Parse courseBranch (e.g. "B.Tech.-CSE")
        const courseBranch = String(row['Course /\n  Branch'] || row['Course /\r\n  Branch'] || '').trim();
        let course = 'B.Tech';
        let branch = 'Computer Science & Engineering';
        if (courseBranch.includes('CSE')) {
            course = 'B.Tech';
            branch = 'Computer Science & Engineering';
        }

        // Free-text fields from Excel
        const skillExpertise = String(row['Skill Expertise (Technical+AI) {Ex: Python, SQL, React, AWS basics}'] || '').trim();
        const softSkills = String(row['Soft Skills (Ex: Teamwork, Presentation)'] || '').trim();
        const certsText = String(row['Certifications Done (Ex: AWS Cloud Practitioner - Amazon, 2025; NPTEL _ all from 1st Sem to 6th Sem)'] || '').trim();
        const internshipsText = String(row['Internships (Company, Duration, Role) {Ex: ABC Tech, 8 weeks, Web Dev Intern}'] || '').trim();
        const projects = String(row['Projects (Title & Tech Used) {Ex: Attendance System (Python, OpenCV)}'] || '').trim();
        const communicationLevel = String(row['Communication Level \n (Ex: Good)'] || row['Communication Level \r\n (Ex: Good)'] || '').trim();
        const placementInterest = String(row['Placement Interest \n (Ex: Placement)'] || row['Placement Interest \r\n (Ex: Placement)'] || '').trim();
        const higherStudiesPlan = String(row['Higher Studies Plan \n (if any) {Ex: Gate, CAT, GRE)'] || row['Higher Studies Plan \r\n (if any) {Ex: Gate, CAT, GRE)'] || '').trim();
        const linkedinUrl = String(row['LinkedIn / GitHub / Portfolio Link (Ex: linkedin.com/in/rahulsharma)'] || '').trim();
        const achievementsText = String(row['Achievements / Awards (Ex: Hackathon Winner 2025)'] || '').trim();
        const extraCurricularText = String(row['Extra-Curricular / Leadership Roles \n (Ex: Coding Club Coordinator)'] || row['Extra-Curricular / Leadership Roles \r\n (Ex: Coding Club Coordinator)'] || '').trim();
        const remarks = String(row['Remarks'] || '').trim();
        const fatherName = String(row["Father's Name"] || '').trim();

        // Parse certifications text into array
        const certifications = [];
        if (certsText && certsText !== '.' && certsText !== 'NA' && certsText !== 'No' && certsText !== 'None') {
            // Split by semicolons or commas where appropriate
            const parts = certsText.split(/[;]/);
            for (const part of parts) {
                const p = part.trim();
                if (p) {
                    certifications.push({
                        semester: '',
                        duration: '',
                        program: p,
                        onlineOffline: 'Online',
                        grade: '',
                        certificateAwarded: 'Yes',
                    });
                }
            }
        }

        // Parse achievements text
        const achievements = [];
        if (achievementsText && achievementsText !== '.' && achievementsText !== 'NA' && achievementsText !== 'No' && achievementsText !== 'None') {
            achievements.push({
                title: achievementsText,
                details: '',
                category: '',
            });
        }

        // Parse club activities / extra-curricular
        const clubActivities = [];
        if (extraCurricularText && extraCurricularText !== '.' && extraCurricularText !== 'NA' && extraCurricularText !== 'No' && extraCurricularText !== 'None') {
            clubActivities.push({
                year: '',
                club: extraCurricularText,
                responsibilities: '',
            });
        }

        // Parse internships text into array
        const internships = [];
        if (internshipsText && internshipsText !== '.' && internshipsText !== 'NA' && internshipsText !== 'No' && internshipsText !== 'None') {
            // Try to split by ), which separates entries like "(Company, duration, role), (Company2, ...)"
            const parts = internshipsText.split(/\),?\s*/);
            for (const part of parts) {
                const p = part.replace(/^\(/, '').trim();
                if (p) {
                    internships.push({
                        driveDate: '',
                        companyName: p,
                        onOffCampus: 'Off Campus',
                        appeared: 'Yes',
                        outcome: '',
                        designation: '',
                        projectTitle: '',
                        externalGuide: '',
                        internalGuide: '',
                    });
                }
            }
        }

        // Upsert student document
        const studentData = {
            rollNo,
            name,
            email,
            gender,
            course,
            branch,
            specialization: 'None',
            semester: deriveSemester(gpaValues),
            batch: deriveBatch(yearOfPassing),
            section,
            status: 'Active',
            yearOfPassing,
            mobile1: mobile,
            academics10thMarks: tenthMarks,
            academics12thMarks: twelfthMarks,
            diplomaMarks,
            parentFatherName: fatherName,
            academics,
            backlogs,
            skillExpertise,
            softSkills,
            projects,
            communicationLevel,
            placementInterest,
            higherStudiesPlan,
            linkedinUrl,
            remarks,
            certifications,
            achievements,
            clubActivities,
            internships,
        };

        try {
            await Student.findOneAndUpdate(
                { rollNo },
                { $set: studentData },
                { upsert: true, new: true }
            );
            imported++;

            // Also create a User account for each student (MENTEE role)
            // so they can log in. Use email as login, default password "student123".
            if (email) {
                const existingUser = await User.findOne({ email });
                if (!existingUser) {
                    const newUser = await User.create({
                        name,
                        email,
                        password: defaultPassword,
                        role: 'MENTEE',
                    });
                    // Link the user to the student record
                    await Student.findOneAndUpdate(
                        { rollNo },
                        { $set: { userId: newUser._id } }
                    );
                    userCreated++;
                }
            }
        } catch (err) {
            console.error(`Error importing ${rollNo} (${name}):`, err.message);
        }
    }

    console.log(`\nImport complete!`);
    console.log(`  Students imported: ${imported}`);
    console.log(`  User accounts created: ${userCreated}`);
    console.log(`  Rows skipped: ${skipped}`);
    console.log(`\nDefault student password: student123`);

    process.exit(0);
}

importExcel().catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
});
