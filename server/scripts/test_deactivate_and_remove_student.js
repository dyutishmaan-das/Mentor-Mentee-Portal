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
import Session from '../models/Session.js';

async function runDeactivateAndRemoveTest() {
    console.log('===============================================================');
    console.log('🚀 TESTING ADMIN DEACTIVATE AND REMOVE STUDENT FEATURES');
    console.log('===============================================================\n');

    await connectDB();

    const server = app.listen(0);
    const port = server.address().port;
    const API_BASE = `http://localhost:${port}/api`;
    console.log(`📡 In-process test server active on port ${port}`);

    try {
        const testEmail = 'deact.remove.test@university.edu';
        const testRollNo = `TEST_DEL_${Date.now().toString().slice(-4)}`;

        // 1. Cleanup
        console.log(`🧹 1. Cleaning up prior test state for: ${testEmail}...`);
        await User.deleteMany({ email: testEmail });
        await Student.deleteMany({ email: testEmail });
        await Student.deleteMany({ rollNo: testRollNo });

        // 2. Admin Login
        console.log('\n🔑 2. Admin login...');
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
        console.log('   ✅ Admin login successful');

        // 3. Create test student & user account
        console.log('\n👤 3. Creating test student and user account...');
        const studentUser = await User.create({
            name: 'Deactivate Test Student',
            email: testEmail,
            password: await bcrypt.hash('Student@12345', 10),
            role: 'MENTEE',
            isActive: true,
        });

        const student = await Student.create({
            rollNo: testRollNo,
            name: 'Deactivate Test Student',
            email: testEmail,
            course: 'B.Tech',
            branch: 'Computer Science & Engineering',
            semester: 'Sem 1',
            status: 'Active',
            userId: studentUser._id,
            profileCompleted: true,
        });

        // Add a mock session for the student
        await Session.create({
            studentId: testRollNo,
            mentorId: 'MENTOR01',
            date: '2026-09-08',
            agenda: 'Initial test mentoring discussion',
            status: 'Completed',
        });

        console.log(`   ✅ Test student created: Roll No ${testRollNo}, Status: Active`);

        // 4. Test Student Login (Should Succeed)
        console.log('\n🔑 4. Verifying active student can log in...');
        const stdLoginRes1 = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'Student@12345',
            }),
        });
        const stdLoginData1 = await stdLoginRes1.json();
        if (!stdLoginRes1.ok || !stdLoginData1.success) {
            throw new Error(`Active student login failed: ${stdLoginData1.message}`);
        }
        console.log('   ✅ Active student logged in successfully.');

        // 5. Admin Deactivates Student
        console.log('\n🛑 5. Admin deactivating student (status -> Inactive)...');
        const deactRes = await fetch(`${API_BASE}/students/${testRollNo}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ status: 'Inactive' }),
        });
        const deactData = await deactRes.json();
        if (!deactRes.ok || !deactData.success) {
            throw new Error(`Deactivate failed: ${deactData.message}`);
        }
        console.log(`   ✅ Deactivate API response: ${deactData.message}`);

        // Verify in DB
        const updatedStudent = await Student.findOne({ rollNo: testRollNo });
        const updatedUser = await User.findById(studentUser._id);
        console.log(`   Student status in DB: ${updatedStudent.status} (Expected: Inactive)`);
        console.log(`   User isActive in DB: ${updatedUser.isActive} (Expected: false)`);
        if (updatedStudent.status !== 'Inactive' || updatedUser.isActive !== false) {
            throw new Error('Student or User status not correctly updated to Inactive!');
        }

        // 6. Student Login Attempt while Inactive (Should Fail with 403)
        console.log('\n🔒 6. Verifying deactivated student is blocked from login...');
        const stdLoginRes2 = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'Student@12345',
            }),
        });
        const stdLoginData2 = await stdLoginRes2.json();
        console.log(`   Login HTTP Status: ${stdLoginRes2.status}, Message: "${stdLoginData2.message}"`);
        if (stdLoginRes2.status !== 403) {
            throw new Error(`Expected 403 Forbidden, but received ${stdLoginRes2.status}`);
        }
        console.log('   ✅ Deactivated student successfully blocked from logging in!');

        // 7. Admin Re-activates Student
        console.log('\n🟢 7. Admin re-activating student (status -> Active)...');
        const reactRes = await fetch(`${API_BASE}/students/${testRollNo}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ status: 'Active' }),
        });
        const reactData = await reactRes.json();
        if (!reactRes.ok || !reactData.success) {
            throw new Error(`Re-activate failed: ${reactData.message}`);
        }
        console.log(`   ✅ Re-activate response: ${reactData.message}`);

        // Verify student can log in again
        const stdLoginRes3 = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'Student@12345',
            }),
        });
        if (!stdLoginRes3.ok) throw new Error('Reactivated student should be able to log in');
        console.log('   ✅ Reactivated student can log in again.');

        // 8. Admin Permanently Removes Student
        console.log('\n🗑️ 8. Admin permanently removing student...');
        const delRes = await fetch(`${API_BASE}/students/${testRollNo}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
            },
        });
        const delData = await delRes.json();
        if (!delRes.ok || !delData.success) {
            throw new Error(`Delete student failed: ${delData.message}`);
        }
        console.log(`   ✅ Delete API response: ${delData.message}`);

        // Verify Student, User, and Sessions are purged
        const checkStudent = await Student.findOne({ rollNo: testRollNo });
        const checkUser = await User.findById(studentUser._id);
        const checkSessions = await Session.find({ studentId: testRollNo });

        console.log(`   Student exists in DB? ${Boolean(checkStudent)} (Expected: false)`);
        console.log(`   User exists in DB? ${Boolean(checkUser)} (Expected: false)`);
        console.log(`   Sessions remaining in DB? ${checkSessions.length} (Expected: 0)`);

        if (checkStudent || checkUser || checkSessions.length > 0) {
            throw new Error('Cleanup after student deletion was incomplete!');
        }

        console.log('\n===============================================================');
        console.log('🎉 ALL DEACTIVATE & REMOVE STUDENT TESTS PASSED PERFECTLY!');
        console.log('===============================================================\n');

    } finally {
        server.close();
        await mongoose.disconnect();
    }
}

runDeactivateAndRemoveTest().catch(err => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
});
