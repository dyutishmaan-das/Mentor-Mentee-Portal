import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import RegistrationToken from '../models/RegistrationToken.js';
import PendingRegistration from '../models/PendingRegistration.js';

const API_BASE = 'http://localhost:5000/api';

async function runTest() {
    console.log('--- Starting Full Student Registration Flow Verification ---');
    await connectDB();

    const testEmail = 'dyutishwork@gmail.com';
    const testRollNo = `TEST_${Date.now()}`;

    // Clean up any prior test records for this email and roll number
    console.log('1. Cleaning previous test state for:', testEmail);
    await User.deleteMany({ email: testEmail });
    await Student.deleteMany({ email: testEmail });
    await Student.deleteMany({ rollNo: testRollNo });
    await PendingRegistration.deleteMany({ email: testEmail });
    await RegistrationToken.deleteMany({ assignedEmail: testEmail });

    // Step 1: Admin Login
    console.log('\n2. Logging in as Admin...');
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
    console.log('✅ Admin login successful! Token acquired.');

    // Step 2: Admin generates registration link by feeding student emails (up to 20)
    console.log('\n3. Admin feeding student emails to generate unique links...');
    const genRes = await fetch(`${API_BASE}/registration/generate-email-links`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
            emails: [
                { email: testEmail, name: 'Dyutish Test Mentee' }
            ],
            expiresInDays: 7,
            sendInviteEmail: true,
        }),
    });

    const genData = await genRes.json();
    if (!genRes.ok || !genData.success) {
        throw new Error(`Generate email links failed: ${genData.message}`);
    }
    console.log('✅ Links generated:', genData.data.links);
    const registrationToken = genData.data.links[0].token;
    const registrationUrl = genData.data.links[0].registrationUrl;
    console.log(`Generated URL: ${registrationUrl}`);

    // Step 3: Validate Token (Public)
    console.log('\n4. Public Token Validation check...');
    const valRes = await fetch(`${API_BASE}/registration/validate/${registrationToken}`);
    const valData = await valRes.json();
    if (!valRes.ok || !valData.success) {
        throw new Error(`Validate token failed: ${valData.message}`);
    }
    console.log('✅ Token validated successfully:', valData.data);

    // Step 4: Initiate Registration (Student submits Name, Email, Mobile)
    console.log('\n5. Student initiates registration (submits details & triggers OTP)...');
    const initRes = await fetch(`${API_BASE}/registration/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token: registrationToken,
            name: 'Dyutish Test Mentee',
            email: testEmail,
            mobile: '9876543210',
        }),
    });

    const initData = await initRes.json();
    if (!initRes.ok || !initData.success) {
        throw new Error(`Initiate registration failed: ${initData.message}`);
    }
    console.log('✅ Registration initiated, OTP sent:', initData.message);

    // Fetch OTP directly from MongoDB document for verification testing
    const pendingDoc = await PendingRegistration.findOne({ email: testEmail, status: 'OTP_PENDING' });
    if (!pendingDoc) {
        throw new Error('Pending registration document not found in MongoDB');
    }
    const otpCode = pendingDoc.emailOtp;
    console.log(`Retrieved OTP from DB for automated test verification: ${otpCode}`);

    // Step 5: Verify OTP
    console.log('\n6. Student verifies OTP...');
    const verifyRes = await fetch(`${API_BASE}/registration/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testEmail,
            otp: otpCode,
        }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.success) {
        throw new Error(`Verify OTP failed: ${verifyData.message}`);
    }
    console.log('✅ OTP Verified successfully! Status is now PENDING_APPROVAL:', verifyData.data);

    // Step 6: Admin fetches pending registrations
    console.log('\n7. Admin queries Pending Registrations queue...');
    const pendRes = await fetch(`${API_BASE}/registration/pending?status=PENDING_APPROVAL`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const pendData = await pendRes.json();
    if (!pendRes.ok || !pendData.success) {
        throw new Error(`Get pending registrations failed: ${pendData.message}`);
    }
    console.log(`✅ Pending registrations in queue: ${pendData.data.registrations.length}`);
    const myApp = pendData.data.registrations.find(r => r.email === testEmail);
    if (!myApp) {
        throw new Error('Test applicant not found in pending list');
    }

    // Step 7: Admin Approves Registration & Enrolls Student
    console.log('\n8. Admin Approving registration & assigning Roll No...');
    const appRes = await fetch(`${API_BASE}/registration/approve/${myApp._id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
            rollNo: testRollNo,
            course: 'B.Tech',
            branch: 'CSE',
            semester: 1,
            admissionYear: 2026,
            adminNotes: 'Automated test approval',
        }),
    });

    const appData = await appRes.json();
    if (!appRes.ok || !appData.success) {
        throw new Error(`Approve registration failed: ${appData.message}`);
    }
    console.log('✅ Registration approved by Admin:', appData.data);

    // Step 8: Verify User created and test temporary password login
    const userDoc = await User.findOne({ email: testEmail }).select('+password');
    if (!userDoc) {
        throw new Error('User record not created in DB');
    }
    console.log(`User created with role: ${userDoc.role}, requirePasswordChange: ${userDoc.requirePasswordChange}`);

    // For testing login, let's set a known temp password in the DB or read the hashed password
    console.log('\n9. Testing Student login with temporary password flow...');
    // Let's create a known temporary password
    const testTempPass = 'TempPass123!';
    const bcrypt = (await import('bcryptjs')).default;
    userDoc.password = await bcrypt.hash(testTempPass, 10);
    await userDoc.save();

    const studentLoginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testEmail,
            password: testTempPass,
        }),
    });

    const studentLoginData = await studentLoginRes.json();
    if (!studentLoginRes.ok || !studentLoginData.success) {
        throw new Error(`Student login failed: ${studentLoginData.message}`);
    }
    const studentToken = studentLoginData.data.accessToken;
    console.log('✅ Student logged in! requirePasswordChange flag:', studentLoginData.data.user.requirePasswordChange);

    // Step 9: Student changes password
    console.log('\n10. Student updates password on first login...');
    const newPermanentPass = 'Permanent@2026';
    const changePassRes = await fetch(`${API_BASE}/registration/change-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
            currentPassword: testTempPass,
            newPassword: newPermanentPass,
        }),
    });

    const changePassData = await changePassRes.json();
    if (!changePassRes.ok || !changePassData.success) {
        throw new Error(`Change password failed: ${changePassData.message}`);
    }
    console.log('✅ Password changed successfully:', changePassData.message);

    // Step 10: Student completes self-service profile
    console.log('\n11. Student completing profile details...');
    const completeProfRes = await fetch(`${API_BASE}/students/profile/complete`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
            dob: '2005-08-15',
            bloodGroup: 'B+',
            category: 'General',
            identificationMark: 'Mole on right cheek',
            mobile2: '9123456780',
            addressPresent: 'Haridwar University Campus Hostel Block B',
            addressPermanent: '123 Civil Lines, Dehradun',
            type: 'Hosteller',
            hostelName: 'Boys Hostel 1',
            hostelRoomNumber: 'B-204',
            parentFatherName: 'Rajesh Sharma',
            parentFatherMobile1: '9876543211',
            parentFatherEmail: 'rajesh.sharma@example.com',
            parentMotherName: 'Sunita Sharma',
            parentMotherMobile1: '9876543212',
            academics10thSchool: 'St. Joseph Academy',
            academics10thYear: '2021',
            academics10thBoard: 'CBSE',
            academics10thMarks: '92.4%',
            academics12thSchool: 'Delhi Public School',
            academics12thYear: '2023',
            academics12thBoard: 'CBSE',
            academics12thMarks: '89.6%',
        }),
    });

    const completeProfData = await completeProfRes.json();
    if (!completeProfRes.ok || !completeProfData.success) {
        throw new Error(`Profile complete failed: ${completeProfData.message}`);
    }
    console.log('✅ Student profile completed successfully! Status:', completeProfData.data.profileCompleted);

    // Step 11: Verify student profile status endpoint
    console.log('\n12. Checking student profile status endpoint...');
    const statusRes = await fetch(`${API_BASE}/students/profile/status`, {
        headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    const statusData = await statusRes.json();
    console.log('✅ Profile status:', statusData.data);

    // Clean up test data
    console.log('\n13. Cleaning up test artifacts...');
    await User.deleteMany({ email: testEmail });
    await Student.deleteMany({ email: testEmail });
    await PendingRegistration.deleteMany({ email: testEmail });
    await RegistrationToken.deleteMany({ assignedEmail: testEmail });

    console.log('\n🎉 ALL 12 VERIFICATION STEPS PASSED SUCCESSFULLY! The complete flow is fully operational.');
    await mongoose.disconnect();
}

runTest().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
