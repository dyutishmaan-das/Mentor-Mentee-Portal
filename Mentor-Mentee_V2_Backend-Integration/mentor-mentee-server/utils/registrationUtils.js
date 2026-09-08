import crypto from 'crypto';

/**
 * Utility functions for student registration
 */

/**
 * Generate a secure 8-character temporary password
 * Contains: uppercase, lowercase, numbers, and symbols
 * 
 * @returns {string} 8-character password
 */
export function generateTempPassword() {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%&*';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    
    // Ensure at least one of each type
    password += uppercase[crypto.randomInt(0, uppercase.length)];
    password += lowercase[crypto.randomInt(0, lowercase.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += symbols[crypto.randomInt(0, symbols.length)];
    
    // Fill remaining 4 characters randomly
    for (let i = 0; i < 4; i++) {
        password += allChars[crypto.randomInt(0, allChars.length)];
    }
    
    // Shuffle the password to randomize position of required characters
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Send SMS with temporary password
 * 
 * @param {string} mobile - Mobile number
 * @param {string} password - Temporary password
 * @param {string} studentName - Student's name
 * @returns {Promise<object>} Result of SMS sending
 */
export async function sendPasswordSMS(mobile, password, studentName) {
    // For now, we'll simulate SMS sending
    // In production, integrate with SMS gateway like Twilio, MSG91, etc.
    
    const message = `Hello ${studentName}, Welcome to Mentor-Mentee Portal! Your temporary password is: ${password}. Please login at ${process.env.CLIENT_URL} and change your password immediately. This password will expire in 24 hours.`;
    
    console.log('=== SMS SENT ===');
    console.log('To:', mobile);
    console.log('Message:', message);
    console.log('================');
    
    // TODO: Integrate actual SMS gateway
    // Example for Twilio:
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    // await client.messages.create({
    //     body: message,
    //     from: process.env.TWILIO_PHONE,
    //     to: mobile
    // });
    
    // Example for MSG91 (popular in India):
    // const response = await fetch('https://api.msg91.com/api/v5/flow/', {
    //     method: 'POST',
    //     headers: { 'authkey': process.env.MSG91_AUTH_KEY },
    //     body: JSON.stringify({
    //         flow_id: process.env.MSG91_FLOW_ID,
    //         sender: process.env.MSG91_SENDER_ID,
    //         mobiles: mobile,
    //         VAR1: studentName,
    //         VAR2: password
    //     })
    // });
    
    return {
        success: true,
        message: 'SMS sent successfully (simulated)',
        mobile: mobile,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Validate Indian mobile number
 * 
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} Valid or not
 */
export function isValidIndianMobile(mobile) {
    // Indian mobile: 10 digits starting with 6-9
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
}

/**
 * Format mobile number for SMS
 * Adds +91 prefix if not present
 * 
 * @param {string} mobile - Mobile number
 * @returns {string} Formatted mobile with country code
 */
export function formatMobileForSMS(mobile) {
    // Remove any spaces, dashes, or special characters
    mobile = mobile.replace(/\D/g, '');
    
    // If starts with 91, just add +
    if (mobile.startsWith('91') && mobile.length === 12) {
        return '+' + mobile;
    }
    
    // If 10 digits, add +91
    if (mobile.length === 10) {
        return '+91' + mobile;
    }
    
    return mobile;
}

/**
 * Generate roll number (if needed)
 * Format: YY + BB + NNN (e.g., 230101001)
 * 
 * @param {string} admissionYear - Year of admission (e.g., "2023")
 * @param {string} branch - Branch code (e.g., "01" for CSE)
 * @param {number} serialNumber - Serial number
 * @returns {string} Generated roll number
 */
export function generateRollNumber(admissionYear, branch, serialNumber) {
    const year = admissionYear.slice(-2); // Last 2 digits of year
    const branchCode = branch.padStart(2, '0');
    const serial = serialNumber.toString().padStart(3, '0');
    
    return `${year}${branchCode}${serial}`;
}

export default {
    generateTempPassword,
    sendPasswordSMS,
    isValidIndianMobile,
    formatMobileForSMS,
    generateRollNumber,
};
