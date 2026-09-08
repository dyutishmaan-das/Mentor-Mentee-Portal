/**
 * Complete Registration Flow Test Script
 * Tests the entire student self-registration system end-to-end
 * 
 * Flow:
 * 1. Admin generates registration link
 * 2. Student registers using the link
 * 3. Student receives email with temp password
 * 4. Student logs in with temp password
 * 5. Student changes password
 */

import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:5000/api';

// Test credentials
const ADMIN_EMAIL = 'admin@mentormentee.local';
const ADMIN_PASSWORD = 'Admin@12345';
const TEST_STUDENT_EMAIL = 'dyutishwork@gmail.com'; // Your Resend verified email

let adminToken = '';
let registrationToken = '';
let studentToken = '';
let tempPassword = '';

console.log('='.repeat(80));
console.log('🧪 STUDENT SELF-REGISTRATION SYSTEM - COMPLETE FLOW TEST');
console.log('='.repeat(80));
console.log('');

/**
 * Step 1: Admin Login
 */
async function step1_adminLogin() {
    console.log('📝 STEP 1: Admin Login');
    console.log('-'.repeat(80));
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
            }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        adminToken = data.data.accessToken;
        
        console.log('✅ Admin logged in successfully');
        console.log('   Admin:', ADMIN_EMAIL);
        console.log('   Token:', adminToken.substring(0, 20) + '...');
        console.log('');
        return true;
        
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        console.log('');
        return false;
    }
}

/**
 * Step 2: Generate Registration Link
 */
async function step2_generateLink() {
    console.log('📝 STEP 2: Generate Registration Link (Admin)');
    console.log('-'.repeat(80));
    
    try {
        const response = await fetch(`${API_BASE}/registration/generate-link`, {
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
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to generate link');
        }
        
        registrationToken = data.data.token;
        const registrationUrl = data.data.registrationUrl;
        
        console.log('✅ Registration link generated successfully');
        console.log('   Token:', registrationToken.substring(0, 30) + '...');
        console.log('   URL:', registrationUrl);
        console.log('   Type: Single-use');
        console.log('   Expires: 7 days');
        console.log('');
        return true;
        
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        console.log('');
        return false;
    }
}

/**
 * Step 3: Student Registration
 */
async function step3_registerStudent() {
    console.log('📝 STEP 3: Student Registration');
    console.log('-'.repeat(80));
    
    try {
        const response = await fetch(`${API_BASE}/registration/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: registrationToken,
                studentData: {
                    rollNo: '260101888',
                    name: 'Test Student 2',
                    email: TEST_STUDENT_EMAIL,
                    mobile1: '9876543210',
                    course: 'B.Tech',
                    branch: 'Computer Science',
                    semester: 1,
                    admissionYear: 2026,
                    dateOfBirth: '2005-01-15',
                    gender: 'Male',
                    category: 'General',
                    bloodGroup: 'O+',
                    addressPresent: '123 Test Street, Test City',
                    addressPermanent: '123 Test Street, Test City',
                    parentFatherName: 'Test Father',
                    parentFatherMobile1: '9876543211',
                    parentMotherName: 'Test Mother',
                    parentMotherMobile1: '9876543212',
                },
            }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        console.log('✅ Student registered successfully');
        console.log('   Name:', data.data.name);
        console.log('   Roll No:', data.data.rollNo);
        console.log('   Email:', data.data.email);
        console.log('   Password sent:', data.data.tempPasswordSent ? 'Yes' : 'No');
        console.log('   Password expires:', data.data.passwordExpiresAt);
        console.log('');
        console.log('📧 CHECK YOUR EMAIL:');
        console.log('   Email sent to:', TEST_STUDENT_EMAIL);
        console.log('   Subject: 🎓 Welcome to Haridwar University - Your Login Credentials');
        console.log('   Check: Inbox or Spam folder');
        console.log('');
        console.log('⚠️  COPY THE TEMPORARY PASSWORD FROM YOUR EMAIL');
        console.log('   It will look like: K7@m2pR! or P3#nT8x@');
        console.log('');
        return true;
        
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        console.log('');
        return false;
    }
}

/**
 * Step 4: Student Login
 */
async function step4_studentLogin(password) {
    console.log('📝 STEP 4: Student Login with Temporary Password');
    console.log('-'.repeat(80));
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_STUDENT_EMAIL,
                password: password,
            }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        studentToken = data.data.accessToken;
        const requirePasswordChange = data.data.requirePasswordChange;
        
        console.log('✅ Student logged in successfully');
        console.log('   Email:', TEST_STUDENT_EMAIL);
        console.log('   Token:', studentToken.substring(0, 20) + '...');
        console.log('   Password change required:', requirePasswordChange ? 'YES' : 'NO');
        console.log('');
        
        if (!requirePasswordChange) {
            console.log('⚠️  WARNING: System should require password change!');
            console.log('');
        }
        
        return true;
        
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        console.log('');
        return false;
    }
}

/**
 * Step 5: Change Password
 */
async function step5_changePassword(currentPassword, newPassword) {
    console.log('📝 STEP 5: Change Password (First Login)');
    console.log('-'.repeat(80));
    
    try {
        const response = await fetch(`${API_BASE}/registration/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${studentToken}`,
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword,
            }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Password change failed');
        }
        
        console.log('✅ Password changed successfully');
        console.log('   Old password:', currentPassword);
        console.log('   New password:', newPassword);
        console.log('');
        return true;
        
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        console.log('');
        return false;
    }
}

/**
 * Step 6: Login with New Password
 */
async function step6_loginWithNewPassword(newPassword) {
    console.log('📝 STEP 6: Login with New Password');
    console.log('-'.repeat(80));
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_STUDENT_EMAIL,
                password: newPassword,
            }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        const requirePasswordChange = data.data.requirePasswordChange;
        
        console.log('✅ Student logged in with new password');
        console.log('   Password change required:', requirePasswordChange ? 'YES' : 'NO');
        console.log('');
        
        if (requirePasswordChange) {
            console.log('⚠️  WARNING: System should NOT require password change after changing!');
            console.log('');
        }
        
        return true;
        
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        console.log('');
        return false;
    }
}

/**
 * Main Test Runner
 */
async function runCompleteTest() {
    console.log('🚀 Starting complete registration flow test...');
    console.log('   Test student email:', TEST_STUDENT_EMAIL);
    console.log('   Server:', API_BASE);
    console.log('');
    console.log('='.repeat(80));
    console.log('');
    
    // Step 1: Admin Login
    const step1 = await step1_adminLogin();
    if (!step1) {
        console.log('');
        console.log('🛑 TEST STOPPED: Admin login failed');
        console.log('   Make sure server is running: npm start');
        console.log('   Admin credentials: admin@mentormentee.local / Admin@12345');
        return;
    }
    
    // Step 2: Generate Link
    const step2 = await step2_generateLink();
    if (!step2) {
        console.log('');
        console.log('🛑 TEST STOPPED: Failed to generate registration link');
        return;
    }
    
    // Step 3: Register Student
    const step3 = await step3_registerStudent();
    if (!step3) {
        console.log('');
        console.log('🛑 TEST STOPPED: Student registration failed');
        return;
    }
    
    // Wait for user to check email and enter password
    console.log('='.repeat(80));
    console.log('⏸️  PAUSED - MANUAL STEP REQUIRED');
    console.log('='.repeat(80));
    console.log('');
    console.log('📧 Go to your email: ' + TEST_STUDENT_EMAIL);
    console.log('   1. Check inbox or spam folder');
    console.log('   2. Open email: "🎓 Welcome to Haridwar University"');
    console.log('   3. Copy the temporary password (8 characters like K7@m2pR!)');
    console.log('');
    console.log('🔄 TO CONTINUE THE TEST:');
    console.log('   Run this command in a new terminal:');
    console.log('');
    console.log('   node test-continue.js YOUR_TEMP_PASSWORD');
    console.log('');
    console.log('   Example:');
    console.log('   node test-continue.js K7@m2pR!');
    console.log('');
    console.log('='.repeat(80));
}

// Run the test
runCompleteTest();
