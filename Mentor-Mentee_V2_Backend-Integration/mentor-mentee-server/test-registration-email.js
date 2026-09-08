import dotenv from 'dotenv';
dotenv.config();

import { sendPasswordEmail } from './utils/emailService.js';

/**
 * Test the email service with a sample student registration
 * This simulates what happens when a student registers
 */

async function testRegistrationEmail() {
    console.log('='.repeat(60));
    console.log('📧 TESTING STUDENT REGISTRATION EMAIL');
    console.log('='.repeat(60));
    console.log('');
    
    // Sample student data
    const testStudent = {
        name: 'Rahul Kumar',
        rollNo: '260101999',
        email: 'dyutishwork@gmail.com', // Your Resend account email
        tempPassword: 'K7@m2pR!',
    };
    
    console.log('📝 Test Student Data:');
    console.log('   Name:', testStudent.name);
    console.log('   Roll No:', testStudent.rollNo);
    console.log('   Email:', testStudent.email);
    console.log('   Temp Password:', testStudent.tempPassword);
    console.log('');
    
    console.log('📤 Sending email via Resend...');
    console.log('');
    
    try {
        const result = await sendPasswordEmail(
            testStudent.email,
            testStudent.tempPassword,
            testStudent.name,
            testStudent.rollNo
        );
        
        if (result.success) {
            console.log('✅ SUCCESS! Email sent successfully!');
            console.log('');
            console.log('📊 Email Details:');
            console.log('   Email ID:', result.emailId);
            console.log('   Sent to:', result.email);
            console.log('   Timestamp:', result.timestamp);
            console.log('');
            console.log('📬 NEXT STEPS:');
            console.log('   1. Check your inbox at:', testStudent.email);
            console.log('   2. Look for subject: "🎓 Welcome to Haridwar University"');
            console.log('   3. Check spam folder if not in inbox');
            console.log('   4. View email details at: https://resend.com/emails');
            console.log('');
            console.log('🎨 The email includes:');
            console.log('   ✓ Beautiful HTML design with university branding');
            console.log('   ✓ Student name and roll number');
            console.log('   ✓ Highlighted temporary password');
            console.log('   ✓ Login button with direct link');
            console.log('   ✓ Security warnings and instructions');
            console.log('');
        } else {
            console.log('❌ FAILED! Email sending failed.');
            console.log('');
            console.log('Error:', result.error);
            console.log('');
            console.log('🔧 Troubleshooting:');
            console.log('   1. Check your RESEND_API_KEY in .env file');
            console.log('   2. Verify API key is valid at https://resend.com/api-keys');
            console.log('   3. Check Resend dashboard for error logs');
            console.log('');
        }
        
    } catch (error) {
        console.log('❌ ERROR! Exception occurred.');
        console.log('');
        console.log('Error Message:', error.message);
        console.log('');
        console.log('🔧 Troubleshooting:');
        console.log('   1. Make sure server is not running (stop it first)');
        console.log('   2. Check .env file has RESEND_API_KEY set');
        console.log('   3. Verify internet connection');
        console.log('');
    }
    
    console.log('='.repeat(60));
}

// Run the test
testRegistrationEmail();
