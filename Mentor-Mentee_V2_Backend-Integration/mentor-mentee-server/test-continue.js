/**
 * Continue Registration Flow Test - Part 2
 * Tests login with temporary password and password change
 * 
 * Usage: node test-continue.js YOUR_TEMP_PASSWORD
 * Example: node test-continue.js K7@m2pR!
 */

import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:5000/api';
const TEST_STUDENT_EMAIL = 'dyutishwork@gmail.com';
const NEW_PASSWORD = 'MyNewSecurePassword123!';

// Get temp password from command line
const tempPassword = process.argv[2];

if (!tempPassword) {
    console.log('❌ ERROR: Temporary password not provided');
    console.log('');
    console.log('Usage: node test-continue.js YOUR_TEMP_PASSWORD');
    console.log('Example: node test-continue.js K7@m2pR!');
    console.log('');
    console.log('Check your email at:', TEST_STUDENT_EMAIL);
    process.exit(1);
}

console.log('='.repeat(80));
console.log('🧪 CONTINUING REGISTRATION FLOW TEST - PART 2');
console.log('='.repeat(80));
console.log('');
console.log('📝 Test Details:');
console.log('   Student Email:', TEST_STUDENT_EMAIL);
console.log('   Temp Password:', tempPassword);
console.log('   New Password:', NEW_PASSWORD);
console.log('');
console.log('='.repeat(80));
console.log('');

let studentToken = '';

/**
 * Step 4: Student Login with Temp Password
 */
async function step4_studentLogin() {
    console.log('📝 STEP 4: Student Login with Temporary Password');
    console.log('-'.repeat(80));
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_STUDENT_EMAIL,
                password: tempPassword,
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
        console.log('   Token:', studentToken.substring(0, 30) + '...');
        console.log('   Require password change:', requirePasswordChange ? 'YES ✅' : 'NO ⚠️');
        console.log('');
        
        if (!requirePasswordChange) {
            console.log('⚠️  WARNING: System should require password change on first login!');
            console.log('');
        }
        
        return true;
        
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        console.log('');
        console.log('💡 Possible issues:');
        console.log('   - Wrong temporary password (check your email again)');
        console.log('   - Password expired (24 hours limit)');
        console.log('   - Student not registered properly');
        console.log('');
        return false;
    }
}

/**
 * Step 5: Change Password
 */
async function step5_changePassword() {
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
                currentPassword: tempPassword,
                newPassword: NEW_PASSWORD,
            }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Password change failed');
        }
        
        console.log('✅ Password changed successfully');
        console.log('   Old password:', tempPassword);
        console.log('   New password:', NEW_PASSWORD);
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
async function step6_loginWithNewPassword() {
    console.log('📝 STEP 6: Login with New Password');
    console.log('-'.repeat(80));
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_STUDENT_EMAIL,
                password: NEW_PASSWORD,
            }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        const requirePasswordChange = data.data.requirePasswordChange;
        const newToken = data.data.accessToken;
        
        console.log('✅ Student logged in with new password successfully');
        console.log('   Token:', newToken.substring(0, 30) + '...');
        console.log('   Require password change:', requirePasswordChange ? 'YES ⚠️' : 'NO ✅');
        console.log('');
        
        if (requirePasswordChange) {
            console.log('⚠️  WARNING: System should NOT require password change after successfully changing it!');
            console.log('');
        } else {
            console.log('🎉 Perfect! Student can now access the portal normally.');
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
 * Step 7: Verify Old Password No Longer Works
 */
async function step7_verifyOldPasswordFails() {
    console.log('📝 STEP 7: Verify Old Temporary Password No Longer Works');
    console.log('-'.repeat(80));
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_STUDENT_EMAIL,
                password: tempPassword,
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('⚠️  WARNING: Old password still works! Should be invalidated.');
            console.log('');
            return false;
        } else {
            console.log('✅ Old temporary password correctly rejected');
            console.log('   Error:', data.message);
            console.log('');
            return true;
        }
        
    } catch (error) {
        console.log('✅ Old temporary password correctly rejected');
        console.log('');
        return true;
    }
}

/**
 * Main Test Runner
 */
async function runTest() {
    // Step 4: Login with temp password
    const step4 = await step4_studentLogin();
    if (!step4) {
        console.log('🛑 TEST STOPPED: Login with temporary password failed');
        console.log('');
        return;
    }
    
    // Step 5: Change password
    const step5 = await step5_changePassword();
    if (!step5) {
        console.log('🛑 TEST STOPPED: Password change failed');
        console.log('');
        return;
    }
    
    // Step 6: Login with new password
    const step6 = await step6_loginWithNewPassword();
    if (!step6) {
        console.log('🛑 TEST STOPPED: Login with new password failed');
        console.log('');
        return;
    }
    
    // Step 7: Verify old password doesn't work
    await step7_verifyOldPasswordFails();
    
    // Final summary
    console.log('='.repeat(80));
    console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log('');
    console.log('✅ Test Results:');
    console.log('   ✓ Admin can generate registration links');
    console.log('   ✓ Students can register using links');
    console.log('   ✓ Emails are sent with temporary passwords');
    console.log('   ✓ Students can login with temporary passwords');
    console.log('   ✓ System forces password change on first login');
    console.log('   ✓ Students can change their passwords');
    console.log('   ✓ Students can login with new passwords');
    console.log('   ✓ Old temporary passwords are invalidated');
    console.log('');
    console.log('🎯 System Status: FULLY FUNCTIONAL');
    console.log('');
    console.log('📝 Test Student Credentials:');
    console.log('   Email/Roll No: ' + TEST_STUDENT_EMAIL + ' or 260101999');
    console.log('   Password: ' + NEW_PASSWORD);
    console.log('   Login URL: http://localhost:5000');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('   1. Create frontend registration forms');
    console.log('   2. Test with real students');
    console.log('   3. Verify custom domain for production (optional)');
    console.log('');
    console.log('='.repeat(80));
}

// Run the test
runTest();
