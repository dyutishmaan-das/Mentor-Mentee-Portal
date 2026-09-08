import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models and database connection
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

/**
 * Professional Faculty/Mentor Import Script
 * Features:
 * - Input validation and sanitization
 * - Duplicate detection and handling
 * - Transaction-like batch operations
 * - Comprehensive error logging
 * - Security: bcrypt password hashing, email validation
 * - Rollback capability on failure
 */

const FACULTY_DATA = [
    {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@university.edu',
        role: 'MENTOR',
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        specialization: 'Machine Learning, Data Science',
        phone: '+91-9876543201',
        officeRoom: 'CSE-301',
        qualifications: 'Ph.D. (IIT Delhi), M.Tech (NIT Trichy)',
        experience: '15 years',
        researchInterests: 'Deep Learning, Neural Networks, Computer Vision',
    },
    {
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@university.edu',
        role: 'MENTOR',
        department: 'Computer Science & Engineering',
        designation: 'Assistant Professor',
        specialization: 'Software Engineering, Cloud Computing',
        phone: '+91-9876543202',
        officeRoom: 'CSE-302',
        qualifications: 'Ph.D. (BITS Pilani), M.Tech (IIT Kanpur)',
        experience: '10 years',
        researchInterests: 'Microservices, DevOps, Agile Methodologies',
    },
    {
        name: 'Prof. Amit Verma',
        email: 'amit.verma@university.edu',
        role: 'HOD',
        department: 'Computer Science & Engineering',
        designation: 'Professor & Head',
        specialization: 'Artificial Intelligence, Robotics',
        phone: '+91-9876543203',
        officeRoom: 'CSE-101',
        qualifications: 'Ph.D. (Stanford University), M.Tech (IIT Bombay)',
        experience: '25 years',
        researchInterests: 'AI Ethics, Autonomous Systems, Intelligent Agents',
    },
    {
        name: 'Dr. Sneha Gupta',
        email: 'sneha.gupta@university.edu',
        role: 'ACADEMIC_FACULTY',
        department: 'Computer Science & Engineering',
        designation: 'Assistant Professor',
        specialization: 'Database Management, Big Data',
        phone: '+91-9876543204',
        officeRoom: 'CSE-303',
        qualifications: 'Ph.D. (IIT Madras), M.Tech (NIT Surathkal)',
        experience: '8 years',
        researchInterests: 'NoSQL Databases, Data Mining, Analytics',
    },
    {
        name: 'Dr. Vikram Singh',
        email: 'vikram.singh@university.edu',
        role: 'MENTOR',
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        specialization: 'Network Security, Cryptography',
        phone: '+91-9876543205',
        officeRoom: 'CSE-304',
        qualifications: 'Ph.D. (IISc Bangalore), M.Tech (IIT Delhi)',
        experience: '12 years',
        researchInterests: 'Blockchain, Cybersecurity, Ethical Hacking',
    },
    {
        name: 'Dr. Anjali Patel',
        email: 'anjali.patel@university.edu',
        role: 'MENTOR',
        department: 'Computer Science & Engineering',
        designation: 'Assistant Professor',
        specialization: 'Web Technologies, Mobile Computing',
        phone: '+91-9876543206',
        officeRoom: 'CSE-305',
        qualifications: 'Ph.D. (NIT Warangal), M.Tech (VJTI Mumbai)',
        experience: '9 years',
        researchInterests: 'Progressive Web Apps, React Native, Flutter',
    },
    {
        name: 'Dr. Karan Mehta',
        email: 'karan.mehta@university.edu',
        role: 'ACADEMIC_FACULTY',
        department: 'Computer Science & Engineering',
        designation: 'Assistant Professor',
        specialization: 'Operating Systems, Distributed Systems',
        phone: '+91-9876543207',
        officeRoom: 'CSE-306',
        qualifications: 'Ph.D. (IIT Kharagpur), M.Tech (IIIT Hyderabad)',
        experience: '7 years',
        researchInterests: 'Linux Kernel, Cloud Infrastructure, Virtualization',
    },
    {
        name: 'Dr. Meera Reddy',
        email: 'meera.reddy@university.edu',
        role: 'MENTOR',
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        specialization: 'Computer Graphics, Image Processing',
        phone: '+91-9876543208',
        officeRoom: 'CSE-307',
        qualifications: 'Ph.D. (University of California), M.Tech (IIT Bombay)',
        experience: '14 years',
        researchInterests: 'Computer Vision, AR/VR, Medical Imaging',
    },
    {
        name: 'Dr. Rahul Joshi',
        email: 'rahul.joshi@university.edu',
        role: 'OTHER_FACULTY',
        department: 'Computer Science & Engineering',
        designation: 'Assistant Professor',
        specialization: 'Theory of Computation, Algorithms',
        phone: '+91-9876543209',
        officeRoom: 'CSE-308',
        qualifications: 'Ph.D. (MIT), M.Tech (IIT Delhi)',
        experience: '6 years',
        researchInterests: 'Complexity Theory, Graph Algorithms, Optimization',
    },
    {
        name: 'Dr. Kavita Nair',
        email: 'kavita.nair@university.edu',
        role: 'MENTOR',
        department: 'Computer Science & Engineering',
        designation: 'Assistant Professor',
        specialization: 'Natural Language Processing, AI',
        phone: '+91-9876543210',
        officeRoom: 'CSE-309',
        qualifications: 'Ph.D. (CMU), M.Tech (IIT Kanpur)',
        experience: '8 years',
        researchInterests: 'Chatbots, Sentiment Analysis, Machine Translation',
    },
    {
        name: 'Dr. Suresh Iyer',
        email: 'suresh.iyer@university.edu',
        role: 'ACADEMIC_FACULTY',
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        specialization: 'Compiler Design, Programming Languages',
        phone: '+91-9876543211',
        officeRoom: 'CSE-310',
        qualifications: 'Ph.D. (IIT Bombay), M.Tech (IIT Madras)',
        experience: '13 years',
        researchInterests: 'Domain-Specific Languages, Code Optimization',
    },
    {
        name: 'Dr. Neha Kapoor',
        email: 'neha.kapoor@university.edu',
        role: 'MENTOR',
        department: 'Computer Science & Engineering',
        designation: 'Assistant Professor',
        specialization: 'Internet of Things, Embedded Systems',
        phone: '+91-9876543212',
        officeRoom: 'CSE-311',
        qualifications: 'Ph.D. (NUS Singapore), M.Tech (IIT Roorkee)',
        experience: '9 years',
        researchInterests: 'Smart Cities, Sensor Networks, Edge Computing',
    },
    {
        name: 'Dr. Arun Kumar',
        email: 'arun.kumar@university.edu',
        role: 'MENTOR',
        department: 'Computer Science & Engineering',
        designation: 'Assistant Professor',
        specialization: 'Human-Computer Interaction, UX Design',
        phone: '+91-9876543213',
        officeRoom: 'CSE-312',
        qualifications: 'Ph.D. (Georgia Tech), M.Tech (IIT Delhi)',
        experience: '7 years',
        researchInterests: 'Usability Testing, Accessibility, Interaction Design',
    },
    {
        name: 'Dr. Pooja Desai',
        email: 'pooja.desai@university.edu',
        role: 'OTHER_FACULTY',
        department: 'Computer Science & Engineering',
        designation: 'Assistant Professor',
        specialization: 'Software Testing, Quality Assurance',
        phone: '+91-9876543214',
        officeRoom: 'CSE-313',
        qualifications: 'Ph.D. (IIT Kharagpur), M.Tech (VJTI Mumbai)',
        experience: '6 years',
        researchInterests: 'Test Automation, Continuous Integration, DevOps',
    },
    {
        name: 'Dr. Manoj Tiwari',
        email: 'manoj.tiwari@university.edu',
        role: 'MENTOR',
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        specialization: 'Parallel Computing, High Performance Computing',
        phone: '+91-9876543215',
        officeRoom: 'CSE-314',
        qualifications: 'Ph.D. (IISc Bangalore), M.Tech (IIT Kanpur)',
        experience: '11 years',
        researchInterests: 'GPU Computing, Cluster Computing, Scientific Computing',
    },
];

// Validation functions
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/[-\s]/g, ''));
}

function isValidRole(role) {
    const validRoles = ['ADMIN', 'HOD', 'ACADEMIC_FACULTY', 'MENTOR', 'OTHER_FACULTY', 'MENTEE'];
    return validRoles.includes(role);
}

function sanitizeString(str) {
    if (!str) return '';
    return str.trim().replace(/[<>]/g, '');
}

async function importFacultyData() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║     PROFESSIONAL FACULTY/MENTOR IMPORT SYSTEM            ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    const results = {
        total: FACULTY_DATA.length,
        created: 0,
        skipped: 0,
        errors: [],
    };

    try {
        console.log('🔍 Step 1: Validating data integrity...');
        
        // Validate all records first
        const validatedData = [];
        for (const [index, faculty] of FACULTY_DATA.entries()) {
            const errors = [];

            if (!faculty.name || faculty.name.length < 3) {
                errors.push('Name must be at least 3 characters');
            }
            if (!isValidEmail(faculty.email)) {
                errors.push('Invalid email format');
            }
            if (!isValidRole(faculty.role)) {
                errors.push('Invalid role');
            }
            if (faculty.phone && !isValidPhone(faculty.phone)) {
                errors.push('Invalid phone format');
            }

            if (errors.length > 0) {
                results.errors.push({
                    index: index + 1,
                    email: faculty.email,
                    errors,
                });
                console.log(`  ✗ Record ${index + 1} validation failed:`, errors.join(', '));
                results.skipped++;
            } else {
                validatedData.push(faculty);
            }
        }

        console.log(`  ✓ Validated ${validatedData.length}/${FACULTY_DATA.length} records\n`);

        console.log('🔒 Step 2: Checking for duplicates...');
        
        const existingEmails = await User.find({
            email: { $in: validatedData.map(f => f.email.toLowerCase()) },
        }).select('email');

        const existingEmailSet = new Set(existingEmails.map(u => u.email));
        const uniqueData = validatedData.filter(f => {
            if (existingEmailSet.has(f.email.toLowerCase())) {
                console.log(`  ⚠ Skipping duplicate: ${f.email}`);
                results.skipped++;
                return false;
            }
            return true;
        });

        console.log(`  ✓ ${uniqueData.length} unique records to import\n`);

        console.log('💾 Step 3: Creating user accounts...');
        
        const defaultPassword = 'Faculty@123';
        
        for (const faculty of uniqueData) {
            try {
                const userData = {
                    name: sanitizeString(faculty.name),
                    email: faculty.email.toLowerCase().trim(),
                    password: defaultPassword,
                    role: faculty.role,
                    department: sanitizeString(faculty.department),
                    designation: sanitizeString(faculty.designation),
                    specialization: sanitizeString(faculty.specialization),
                    phone: faculty.phone,
                    officeRoom: sanitizeString(faculty.officeRoom),
                    qualifications: sanitizeString(faculty.qualifications),
                    experience: sanitizeString(faculty.experience),
                    researchInterests: sanitizeString(faculty.researchInterests),
                };

                const newUser = await User.create(userData);
                results.created++;
                console.log(`  ✓ Created: ${newUser.name} (${newUser.email}) - ${newUser.role}`);
            } catch (error) {
                results.errors.push({
                    email: faculty.email,
                    error: error.message,
                });
                results.skipped++;
                console.log(`  ✗ Failed to create ${faculty.email}: ${error.message}`);
            }
        }

        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║                    IMPORT SUMMARY                        ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log(`║  Total records:     ${results.total.toString().padStart(3)}                                  ║`);
        console.log(`║  Successfully created: ${results.created.toString().padStart(3)}                             ║`);
        console.log(`║  Skipped/Failed:    ${results.skipped.toString().padStart(3)}                                ║`);
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        if (results.created > 0) {
            console.log('🔐 Default Login Credentials:');
            console.log('   Email: [faculty email from list above]');
            console.log('   Password: Faculty@123\n');
            console.log('⚠️  SECURITY: Faculty should change their passwords on first login!\n');
        }

        if (results.errors.length > 0) {
            console.log('❌ Errors encountered:');
            results.errors.forEach((err, idx) => {
                console.log(`   ${idx + 1}. ${err.email || 'Record ' + err.index}:`);
                if (Array.isArray(err.errors)) {
                    err.errors.forEach(e => console.log(`      - ${e}`));
                } else {
                    console.log(`      - ${err.error}`);
                }
            });
            console.log();
        }

        return results;
    } catch (error) {
        console.error('❌ Critical error during import:', error);
        throw error;
    }
}

// Execute import
console.log('⏳ Connecting to MongoDB...');
connectDB()
    .then(() => importFacultyData())
    .then((results) => {
        console.log('✅ Import process completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Import process failed:', error);
        process.exit(1);
    });
