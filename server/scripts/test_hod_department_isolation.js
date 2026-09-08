import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import app from '../app.js';
import User from '../models/User.js';
import Student from '../models/Student.js';

async function runHodDepartmentIsolationTest() {
    console.log('===============================================================');
    console.log('🚀 TESTING HOD DEPARTMENT ISOLATION VS ADMIN GLOBAL ACCESS');
    console.log('===============================================================\n');

    await connectDB();

    const server = app.listen(0);
    const port = server.address().port;
    const API_BASE = `http://localhost:${port}/api`;
    console.log(`📡 Test server listening on ephemeral port ${port}`);

    try {
        const cseEmail = 'hod.test.cse.student@university.edu';
        const eceEmail = 'hod.test.ece.student@university.edu';
        const cseRoll = 'HOD_CSE_001';
        const eceRoll = 'HOD_ECE_001';

        // 1. Cleanup old test data
        console.log('\n🧹 1. Cleaning up test accounts...');
        await User.deleteMany({ email: { $in: [cseEmail, eceEmail] } });
        await Student.deleteMany({ email: { $in: [cseEmail, eceEmail] } });
        await Student.deleteMany({ rollNo: { $in: [cseRoll, eceRoll] } });

        // Ensure HOD user exists with CSE department
        let hodUser = await User.findOne({ email: 'hod@demo.edu' });
        if (!hodUser) {
            hodUser = await User.create({
                name: 'Dr. Robert Head (HOD CSE)',
                email: 'hod@demo.edu',
                password: await bcrypt.hash('Faculty@12345', 12),
                role: 'HOD',
                department: 'Computer Science & Engineering',
                designation: 'Professor & Head of Department',
                isActive: true
            });
        } else {
            hodUser.department = 'Computer Science & Engineering';
            hodUser.designation = 'Professor & Head of Department';
            hodUser.role = 'HOD';
            hodUser.isActive = true;
            hodUser.password = await bcrypt.hash('Faculty@12345', 12);
            await hodUser.save();
        }

        // 2. Log in as Admin and HOD
        console.log('\n🔑 2. Authenticating Admin and HOD...');
        
        // Admin login
        const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@mentormentee.local',
                password: 'Admin@12345',
            }),
        });
        const adminLoginData = await adminLoginRes.json();
        if (!adminLoginRes.ok || !adminLoginData.success) {
            throw new Error(`Admin login failed: ${adminLoginData.message}`);
        }
        const adminToken = adminLoginData.data.accessToken;
        console.log('   ✅ Admin authenticated (role: ADMIN)');

        // HOD login
        const hodLoginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'hod@demo.edu',
                password: 'Faculty@12345',
            }),
        });
        const hodLoginData = await hodLoginRes.json();
        if (!hodLoginRes.ok || !hodLoginData.success) {
            throw new Error(`HOD login failed: ${hodLoginData.message}`);
        }
        const hodToken = hodLoginData.data.accessToken;
        console.log(`   ✅ HOD authenticated (role: ${hodLoginData.data.user.role}, department: ${hodLoginData.data.user.department})`);

        // 3. Create two test students: one in CSE, one in ECE
        console.log('\n👥 3. Seeding CSE mentee and ECE mentee...');
        const cseUser = await User.create({
            name: 'CSE Mentee Test',
            email: cseEmail,
            password: await bcrypt.hash('Student@12345', 10),
            role: 'MENTEE',
            department: 'Computer Science & Engineering',
            isActive: true
        });
        const cseStudent = await Student.create({
            rollNo: cseRoll,
            name: 'CSE Mentee Test',
            email: cseEmail,
            course: 'B.Tech',
            branch: 'Computer Science & Engineering',
            department: 'Computer Science & Engineering',
            semester: 'Sem 1',
            section: '',
            status: 'Active',
            userId: cseUser._id,
            profileCompleted: true
        });

        const eceUser = await User.create({
            name: 'ECE Mentee Test',
            email: eceEmail,
            password: await bcrypt.hash('Student@12345', 10),
            role: 'MENTEE',
            department: 'Electronics & Communication Engineering',
            isActive: true
        });
        const eceStudent = await Student.create({
            rollNo: eceRoll,
            name: 'ECE Mentee Test',
            email: eceEmail,
            course: 'B.Tech',
            branch: 'Electronics & Communication Engineering',
            department: 'Electronics & Communication Engineering',
            semester: 'Sem 1',
            section: '',
            status: 'Active',
            userId: eceUser._id,
            profileCompleted: true
        });
        console.log('   ✅ CSE Student created:', cseRoll, cseStudent._id.toString());
        console.log('   ✅ ECE Student created:', eceRoll, eceStudent._id.toString());

        // 4. Test GET /api/students scoping
        console.log('\n📋 4. Testing GET /api/students scoping...');
        
        // Admin gets all students
        const adminStudentsRes = await fetch(`${API_BASE}/students`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const adminStudentsData = await adminStudentsRes.json();
        const adminStudents = adminStudentsData.data || [];
        const hasCseInAdmin = adminStudents.some(s => s.rollNo === cseRoll);
        const hasEceInAdmin = adminStudents.some(s => s.rollNo === eceRoll);
        console.log(`   Admin student count: ${adminStudents.length}`);
        console.log(`   Admin sees CSE student: ${hasCseInAdmin}, sees ECE student: ${hasEceInAdmin}`);
        if (!hasCseInAdmin || !hasEceInAdmin) {
            throw new Error('Admin failed to see all students across departments');
        }
        console.log('   ✅ Admin has global access to all departments');

        // HOD gets scoped students
        const hodStudentsRes = await fetch(`${API_BASE}/students`, {
            headers: { Authorization: `Bearer ${hodToken}` }
        });
        const hodStudentsData = await hodStudentsRes.json();
        const hodStudents = hodStudentsData.data || [];
        const hasCseInHod = hodStudents.some(s => s.rollNo === cseRoll);
        const hasEceInHod = hodStudents.some(s => s.rollNo === eceRoll);
        console.log(`   HOD student count: ${hodStudents.length}`);
        console.log(`   HOD sees CSE student: ${hasCseInHod}, sees ECE student: ${hasEceInHod}`);
        if (!hasCseInHod) {
            throw new Error('HOD failed to see CSE student in own department');
        }
        if (hasEceInHod) {
            throw new Error('HOD improperly received ECE student from outside department');
        }
        console.log('   ✅ HOD is strictly isolated to CSE department');

        // 5. Test Section Allotment List Scoping
        console.log('\n🏫 5. Testing Section Allotment Queue scoping...');
        const hodAllotRes = await fetch(`${API_BASE}/students/section-allotment/list?status=pending`, {
            headers: { Authorization: `Bearer ${hodToken}` }
        });
        const hodAllotData = await hodAllotRes.json();
        const hodAllotList = hodAllotData.data || [];
        const allotHasCse = hodAllotList.some(s => s.rollNo === cseRoll);
        const allotHasEce = hodAllotList.some(s => s.rollNo === eceRoll);
        console.log(`   HOD allotment queue: ${hodAllotList.length} students`);
        console.log(`   Queue contains CSE student: ${allotHasCse}, contains ECE student: ${allotHasEce}`);
        if (!allotHasCse || allotHasEce) {
            throw new Error('HOD section allotment queue is not properly scoped to department');
        }
        console.log('   ✅ Section allotment queue strictly department-scoped for HOD');

        // 6. Test Single Student Detail (GET /api/students/:id)
        console.log('\n🔍 6. Testing single student access by ID...');
        
        // HOD accesses own department student
        const hodGetCseRes = await fetch(`${API_BASE}/students/${cseStudent._id}`, {
            headers: { Authorization: `Bearer ${hodToken}` }
        });
        if (hodGetCseRes.status !== 200) {
            throw new Error(`HOD failed to fetch CSE student: HTTP ${hodGetCseRes.status}`);
        }
        console.log('   ✅ HOD successfully retrieved own department student (200 OK)');

        // HOD attempts to access other department student
        const hodGetEceRes = await fetch(`${API_BASE}/students/${eceStudent._id}`, {
            headers: { Authorization: `Bearer ${hodToken}` }
        });
        if (hodGetEceRes.status !== 403) {
            throw new Error(`HOD was NOT forbidden from fetching ECE student! Status: HTTP ${hodGetEceRes.status}`);
        }
        console.log('   ✅ HOD blocked from fetching other department student (403 Forbidden)');

        // 7. Test Student Update (PUT /api/students/:id)
        console.log('\n✏️ 7. Testing student update permissions...');
        
        // HOD attempts to update ECE student -> 403
        const hodUpdateEceRes = await fetch(`${API_BASE}/students/${eceStudent._id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${hodToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: 'Tampered ECE Student' })
        });
        if (hodUpdateEceRes.status !== 403) {
            throw new Error(`HOD was NOT blocked from updating ECE student! Status: HTTP ${hodUpdateEceRes.status}`);
        }
        console.log('   ✅ HOD blocked from modifying other department student (403 Forbidden)');

        // HOD updates own CSE student -> 200
        const hodUpdateCseRes = await fetch(`${API_BASE}/students/${cseStudent._id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${hodToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ section: 'A' })
        });
        if (hodUpdateCseRes.status !== 200) {
            throw new Error(`HOD failed to update CSE student: HTTP ${hodUpdateCseRes.status}`);
        }
        console.log('   ✅ HOD successfully updated own department student (200 OK)');

        // 8. Test Toggle Status (PATCH /api/students/:id/status)
        console.log('\n🔘 8. Testing status toggle permissions...');
        
        // HOD toggles ECE student status -> 403
        const hodToggleEceRes = await fetch(`${API_BASE}/students/${eceStudent._id}/status`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${hodToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'Inactive' })
        });
        if (hodToggleEceRes.status !== 403) {
            throw new Error(`HOD was NOT blocked from toggling ECE student! Status: HTTP ${hodToggleEceRes.status}`);
        }
        console.log('   ✅ HOD blocked from toggling other department student status (403 Forbidden)');

        // HOD toggles CSE student status -> 200
        const hodToggleCseRes = await fetch(`${API_BASE}/students/${cseStudent._id}/status`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${hodToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'Inactive' })
        });
        if (hodToggleCseRes.status !== 200) {
            throw new Error(`HOD failed to toggle CSE student status: HTTP ${hodToggleCseRes.status}`);
        }
        console.log('   ✅ HOD successfully toggled own department student status (200 OK)');

        // 9. Test Bulk Section Allotment (POST /api/students/section-allotment/bulk)
        console.log('\n📦 9. Testing bulk section allotment scoping...');
        
        // HOD tries to allot ECE student -> 403
        const hodBulkEceRes = await fetch(`${API_BASE}/students/section-allotment/bulk`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${hodToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentIds: [eceStudent._id.toString()],
                section: 'B'
            })
        });
        if (hodBulkEceRes.status !== 403) {
            throw new Error(`HOD was NOT blocked from allotting ECE student! Status: HTTP ${hodBulkEceRes.status}`);
        }
        console.log('   ✅ HOD blocked from allotting section to other department student (403 Forbidden)');

        // HOD allots CSE student -> 200
        const hodBulkCseRes = await fetch(`${API_BASE}/students/section-allotment/bulk`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${hodToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentIds: [cseStudent._id.toString()],
                section: 'A'
            })
        });
        if (hodBulkCseRes.status !== 200) {
            throw new Error(`HOD failed to allot section to CSE student: HTTP ${hodBulkCseRes.status}`);
        }
        console.log('   ✅ HOD successfully allotted section to CSE student (200 OK)');

        // 10. Test Deletion Permissions (DELETE /api/students/:id)
        console.log('\n🗑️ 10. Testing student deletion permissions...');
        
        // HOD attempts deletion -> 403 Forbidden (Only ADMIN allowed)
        const hodDeleteRes = await fetch(`${API_BASE}/students/${cseStudent._id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${hodToken}` }
        });
        if (hodDeleteRes.status !== 403) {
            throw new Error(`HOD was NOT forbidden from deleting student! Status: HTTP ${hodDeleteRes.status}`);
        }
        console.log('   ✅ HOD forbidden from permanently deleting student records (403 Forbidden)');

        // Admin deletes CSE student -> 200 OK
        const adminDeleteCseRes = await fetch(`${API_BASE}/students/${cseStudent._id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        if (adminDeleteCseRes.status !== 200) {
            throw new Error(`Admin failed to delete CSE student: HTTP ${adminDeleteCseRes.status}`);
        }
        console.log('   ✅ Admin successfully deleted CSE student (200 OK)');

        // Admin deletes ECE student -> 200 OK
        const adminDeleteEceRes = await fetch(`${API_BASE}/students/${eceStudent._id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        if (adminDeleteEceRes.status !== 200) {
            throw new Error(`Admin failed to delete ECE student: HTTP ${adminDeleteEceRes.status}`);
        }
        console.log('   ✅ Admin successfully deleted ECE student (200 OK)');

        console.log('\n===============================================================');
        console.log('🎉 ALL HOD DEPARTMENT ISOLATION & ADMIN TESTS PASSED PERFECTLY!');
        console.log('===============================================================');
    } finally {
        server.close();
        await mongoose.disconnect();
    }
}

runHodDepartmentIsolationTest().catch((err) => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
});
