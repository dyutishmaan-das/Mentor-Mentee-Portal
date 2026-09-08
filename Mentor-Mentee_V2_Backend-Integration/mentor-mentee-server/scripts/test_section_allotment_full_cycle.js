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
import RegistrationToken from '../models/RegistrationToken.js';
import PendingRegistration from '../models/PendingRegistration.js';

async function runAllotmentFlowTest() {
    console.log('===============================================================');
    console.log('🚀 STARTING IN-PROCESS END-TO-END SECTION ALLOTMENT TEST');
    console.log('===============================================================\n');

    await connectDB();

    const server = app.listen(0);
    const port = server.address().port;
    const API_BASE = `http://localhost:${port}/api`;
    console.log(`📡 In-process test server active on port ${port}`);

    try {
        const testEmail = 'student.allotment.test@university.edu';
        const testRollNo = `26CS${Date.now().toString().slice(-4)}`;

        // 1. Cleanup
        console.log(`🧹 1. Cleaning up prior test data for: ${testEmail}...`);
        await User.deleteMany({ email: testEmail });
        await Student.deleteMany({ email: testEmail });
        await PendingRegistration.deleteMany({ email: testEmail });
        await RegistrationToken.deleteMany({ assignedEmail: testEmail });

        // 2. Admin Login
        console.log('🔑 2. Authenticating as Admin...');
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
        console.log('   ✅ Admin authenticated successfully.');

        // 3. Admin generates registration link
        console.log('\n🔗 3. Admin generating invite registration link...');
        const linkRes = await fetch(`${API_BASE}/registration/generate-link`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
                tokenType: 'single',
                maxUses: 1,
                expiresInDays: 7,
            }),
        });
        const linkData = await linkRes.json();
        if (!linkRes.ok || !linkData.success) {
            throw new Error(`Link generation failed: ${linkData.message}`);
        }
        const token = linkData.data.token;
        console.log(`   ✅ Invite link token generated: ${token}`);

        // 4. Pending Registration record
        console.log('\n📝 4. Creating pending registration for applicant...');
        const pendingReg = new PendingRegistration({
            registrationToken: token,
            name: 'Alex Johnson',
            email: testEmail,
            mobile: '9876543210',
            status: 'PENDING_APPROVAL',
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
        });
        await pendingReg.save();
        const pendingId = pendingReg._id.toString();
        console.log(`   ✅ Pending Registration created with status PENDING_APPROVAL. ID: ${pendingId}`);

        // 5. Admin Approves the Applicant
        console.log('\n🏛️ 5. Admin approving applicant & issuing student credentials...');
        const approveRes = await fetch(`${API_BASE}/registration/approve/${pendingId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
                rollNo: testRollNo,
                course: 'B.Tech',
                branch: 'Computer Science & Engineering',
                semester: 1,
                admissionYear: 2026,
                adminNotes: 'Approved for Fall 2026 semester.',
            }),
        });
        const approveData = await approveRes.json();
        if (!approveRes.ok || !approveData.success) {
            throw new Error(`Approval failed: ${approveData.message}`);
        }
        console.log(`   ✅ Student approved! Roll No: ${testRollNo}`);

        // Set known password on the created User account so student can log in
        const studentUser = await User.findOne({ email: testEmail });
        if (!studentUser) throw new Error('Student User account was not created upon approval!');
        studentUser.password = await bcrypt.hash('Student@12345', 10);
        await studentUser.save();

        // 6. Verify student record created in DB
        const studentDbRecord = await Student.findOne({ rollNo: testRollNo });
        if (!studentDbRecord) throw new Error('Student record not found in MongoDB!');
        console.log(`   DB Student profileCompleted = ${studentDbRecord.profileCompleted} (Expected: false)`);
        console.log(`   DB Student section = '${studentDbRecord.section}' (Expected: empty)`);
        if (studentDbRecord.profileCompleted !== false) throw new Error('Student profileCompleted should initially be false');

        // 7. Verify student is NOT in HOD Pending Allotment queue yet
        console.log('\n🔎 7. Checking HOD Section Allotment Queue before profile completion...');
        const hodQueue1Res = await fetch(`${API_BASE}/students/section-allotment/list?status=pending`, {
            headers: { 'Authorization': `Bearer ${adminToken}` },
        });
        const hodQueue1Data = await hodQueue1Res.json();
        if (!hodQueue1Data.success) throw new Error(`HOD queue fetch failed: ${hodQueue1Data.message}`);
        const isInPendingQueue1 = hodQueue1Data.data.some(s => s.rollNo === testRollNo);
        console.log(`   Is in Pending Queue before profile completion? ${isInPendingQueue1} (Expected: false)`);
        if (isInPendingQueue1) throw new Error('Student should not appear in HOD allotment queue before profile completion!');

        // 8. Student logs in
        console.log('\n🔑 8. Student logging into portal with issued credentials...');
        const studentLoginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'Student@12345',
            }),
        });
        const studentLoginData = await studentLoginRes.json();
        if (!studentLoginRes.ok || !studentLoginData.success) {
            throw new Error(`Student login failed: ${studentLoginData.message}`);
        }
        const studentToken = studentLoginData.data.accessToken;
        console.log('   ✅ Student authenticated successfully.');

        // 9. Student completes full profile form
        console.log('\n📋 9. Student submitting completed profile details...');
        const completeProfileRes = await fetch(`${API_BASE}/students/profile/complete`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${studentToken}`,
            },
            body: JSON.stringify({
                dateOfBirth: '2005-04-12',
                dob: '2005-04-12',
                gender: 'Male',
                category: 'General',
                bloodGroup: 'B+',
                addressPresent: '123 Campus Avenue, Block 4',
                addressPermanent: '456 Heritage Road, Kolkata',
                mobile1: '9876543210',
                mobile2: '9876543211',
                parentFatherName: 'Robert Johnson',
                parentFatherMobile1: '9876543222',
                parentFatherEmail: 'robert.j@example.com',
                parentMotherName: 'Mary Johnson',
                parentMotherMobile1: '9876543233',
                type: 'Hosteller',
                hostelName: 'Tagore Hall',
                hostelRoomNumber: 'B-302',
            }),
        });
        const completeProfileData = await completeProfileRes.json();
        if (!completeProfileRes.ok || !completeProfileData.success) {
            throw new Error(`Profile completion failed: ${completeProfileData.message}`);
        }
        console.log('   ✅ Student profile submitted and marked completed!');

        // 10. Check that student now appears in HOD Section Allotment Queue (status=pending)
        console.log('\n🔎 10. Checking HOD Section Allotment Queue after profile completion...');
        const hodQueue2Res = await fetch(`${API_BASE}/students/section-allotment/list?status=pending`, {
            headers: { 'Authorization': `Bearer ${adminToken}` },
        });
        const hodQueue2Data = await hodQueue2Res.json();
        if (!hodQueue2Data.success) throw new Error(`HOD queue fetch failed: ${hodQueue2Data.message}`);
        const queuedStudent = hodQueue2Data.data.find(s => s.rollNo === testRollNo);
        console.log(`   Is in Pending Queue? ${Boolean(queuedStudent)} (Expected: true)`);
        if (!queuedStudent) throw new Error('Student missing from HOD Pending Allotment Queue!');
        console.log(`   Queue item verified: Name="${queuedStudent.name}", Roll="${queuedStudent.rollNo}", ProfileCompleted=${queuedStudent.profileCompleted}`);

        // 11. HOD / Admin performs bulk section allotment (Assigning to Section 'B')
        console.log('\n🏷️ 11. HOD assigning Section "B" via Bulk Allotment...');
        const bulkAllotRes = await fetch(`${API_BASE}/students/section-allotment/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
                studentIds: [queuedStudent.id || queuedStudent.rollNo],
                section: 'B',
            }),
        });
        const bulkAllotData = await bulkAllotRes.json();
        if (!bulkAllotRes.ok || !bulkAllotData.success) {
            throw new Error(`Bulk allotment failed: ${bulkAllotData.message}`);
        }
        console.log(`   ✅ Bulk allotment API response: ${bulkAllotData.message}`);

        // 12. Verify student is moved from pending to allotted queue
        console.log('\n📊 12. Verifying Allotted queue status...');
        const hodQueueAllottedRes = await fetch(`${API_BASE}/students/section-allotment/list?status=allotted`, {
            headers: { 'Authorization': `Bearer ${adminToken}` },
        });
        const hodQueueAllottedData = await hodQueueAllottedRes.json();
        const allottedStudent = hodQueueAllottedData.data.find(s => s.rollNo === testRollNo);
        if (!allottedStudent) throw new Error('Student not found in Allotted Queue!');
        console.log(`   ✅ Student found in Allotted queue with Section: "${allottedStudent.section}"`);

        // 13. Student checks their own portal profile
        console.log('\n👤 13. Verifying section reflection in Student Portal (/api/students/me)...');
        const studentProfileRes = await fetch(`${API_BASE}/students/me`, {
            headers: { 'Authorization': `Bearer ${studentToken}` },
        });
        const studentProfileData = await studentProfileRes.json();
        if (!studentProfileRes.ok || !studentProfileData.success) {
            throw new Error(`Student profile fetch failed: ${studentProfileData.message}`);
        }
        console.log(`   Student Portal Profile -> Roll No: ${studentProfileData.data.rollNo}, Section: "${studentProfileData.data.section}"`);
        if (studentProfileData.data.section !== 'B') {
            throw new Error(`Expected section 'B', but found '${studentProfileData.data.section}'`);
        }

        console.log('\n===============================================================');
        console.log('🎉 ALL INTEGRATION TESTS PASSED PERFECTLY!');
        console.log('===============================================================\n');

    } finally {
        server.close();
        await mongoose.disconnect();
    }
}

runAllotmentFlowTest().catch(err => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
});
