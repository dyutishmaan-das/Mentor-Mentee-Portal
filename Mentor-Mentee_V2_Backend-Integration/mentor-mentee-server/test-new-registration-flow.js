/**
 * Comprehensive Test for New Registration Flow with OTP & Admin Approval
 */

import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@mentormentee.local';
const ADMIN_PASSWORD = 'Admin@12345';
const TEST_EMAIL = 'dyutishwork@gmail.com';
const TEST_ROLL_NO = '260101' + Math.floor(100 + Math.random() * 900);

console.log('='.repeat(80));
console.log('🧪 TESTING NEW REGISTRATION FLOW (OTP + ADMIN APPROVAL + PROFILE)');
console.log('='.repeat(80));
console.log('');
console.log('Target API:', API_BASE);
console.log('Test Student Email:', TEST_EMAIL);
console.log('Test Roll No (for approval):', TEST_ROLL_NO);
console.log('');

async function runTest() {
    let adminToken = '';
    let regToken = '';
    let pendingRegId = '';
    let studentToken = '';
    let tempPassword = '';
    const newStudentPassword = 'StudentSecure@2026';

    // 1. Admin Login
    console.log('--- Step 1: Admin Login ---');
    try {
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.message || 'Admin login failed');
        adminToken = loginData.data.accessToken;
        console.log('✅ Admin login successful');
    } catch (e) {
        console.error('❌ Admin login error:', e.message);
        return;
    }

    // 2. Generate Registration Link
    console.log('\n--- Step 2: Generate Registration Link ---');
    try {
        const genRes = await fetch(`${API_BASE}/registration/generate-link`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ tokenType: 'single', maxUses: 1, expiresInDays: 7 }),
        });
        const genData = await genRes.json();
        if (!genRes.ok) throw new Error(genData.message || 'Link generation failed');
        regToken = genData.data.token;
        console.log('✅ Registration link generated:', genData.data.registrationUrl);
    } catch (e) {
        console.error('❌ Generate link error:', e.message);
        return;
    }

    // 3. Initiate Registration (Student submits Name, Email, Phone -> gets OTP)
    console.log('\n--- Step 3: Initiate Registration (Request OTP) ---');
    try {
        const initRes = await fetch(`${API_BASE}/registration/initiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: regToken,
                name: 'Dyutish Test Student',
                email: TEST_EMAIL,
                mobile: '9876543210',
            }),
        });
        const initData = await initRes.json();
        if (!initRes.ok) throw new Error(initData.message || 'Initiate registration failed');
        pendingRegId = initData.data.registrationId;
        console.log('✅ OTP sent to email:', TEST_EMAIL);
        console.log('   Registration ID:', pendingRegId);
    } catch (e) {
        console.error('❌ Initiate error:', e.message);
        return;
    }

    console.log('\n================================================================================');
    console.log('📬 OTP has been sent to:', TEST_EMAIL);
    console.log('Please check your email/spam folder for the 6-digit OTP.');
    console.log('================================================================================');
}

runTest();
