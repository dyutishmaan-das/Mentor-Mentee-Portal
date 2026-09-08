import { Resend } from 'resend';
import nodemailer from 'nodemailer';

/**
 * Email Service with Dual Support (Resend API + SMTP / Nodemailer Fallback)
 * 
 * Capabilities:
 * - Resend API (Direct HTTP API)
 * - Nodemailer SMTP (e.g. Gmail App Password, Outlook, or University Mail Server)
 * - Robust error classification (detects free Resend sandbox destination restrictions)
 */

// Initialize Resend lazily to ensure environment variables are loaded
let resend = null;

function getResendClient() {
    if (!resend) {
        if (!process.env.RESEND_API_KEY) {
            return null;
        }
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
}

/**
 * Unified email dispatcher with automatic fallback
 */
async function dispatchEmail({ to, subject, html, text, category = 'notification' }) {
    let resendError = null;
    const preferSmtp = process.env.EMAIL_PROVIDER === 'smtp' || (!process.env.RESEND_API_KEY && process.env.SMTP_USER);

    // 1. If SMTP is explicitly preferred, try SMTP first
    if (preferSmtp && process.env.SMTP_USER && (process.env.SMTP_PASS || process.env.SMTP_PASSWORD)) {
        return await sendViaSmtp({ to, subject, html, text });
    }

    // 2. Try Resend if configured
    const resendClient = getResendClient();
    if (resendClient) {
        try {
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'Haridwar University <onboarding@resend.dev>';
            const resendResponse = await resendClient.emails.send({
                from: fromEmail,
                to,
                subject,
                html,
                text,
                tags: [{ name: 'category', value: category }],
            });

            if (resendResponse && resendResponse.error) {
                resendError = resendResponse.error.message || JSON.stringify(resendResponse.error);
                console.warn(`[EmailService] Resend API returned error for ${to}:`, resendError);
            } else if (resendResponse && resendResponse.data && resendResponse.data.id) {
                console.log(`[EmailService] ✅ Email delivered via Resend to ${to} (ID: ${resendResponse.data.id})`);
                return {
                    success: true,
                    provider: 'resend',
                    emailId: resendResponse.data.id,
                    message: 'Email delivered successfully via Resend',
                };
            } else {
                resendError = 'Resend did not return a message ID.';
            }
        } catch (err) {
            resendError = err.message;
            console.warn(`[EmailService] Resend dispatch exception for ${to}:`, resendError);
        }
    }

    // 3. Fallback to Nodemailer SMTP
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

    if (smtpUser && smtpPass) {
        return await sendViaSmtp({ to, subject, html, text });
    }

    // Formulate a helpful error message for sandbox restrictions
    let friendlyError = resendError || 'No email delivery provider configured.';
    if (resendError && (
        resendError.includes('testing email address') || 
        resendError.includes('validation_error') || 
        resendError.includes('domains like') || 
        resendError.includes('verify a domain') ||
        resendError.includes('only send testing emails')
    )) {
        friendlyError = `Resend Free Sandbox Restriction: Unverified sender 'onboarding@resend.dev' can only send emails to the account owner. To send emails to all student addresses, configure SMTP in .env (e.g. Gmail App Password) or verify a domain in Resend.`;
    }

    console.error(`[EmailService] ❌ Dispatch failed for ${to}: ${friendlyError}`);
    return {
        success: false,
        provider: 'none',
        error: friendlyError,
        message: 'Failed to send email',
    };
}

async function sendViaSmtp({ to, subject, html, text }) {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 465,
            secure: process.env.SMTP_PORT === '465' || process.env.SMTP_SECURE === 'true',
            auth: {
                user: smtpUser,
                pass: smtpPass.replace(/\s+/g, ''), // Strip any accidental spaces in app password
            },
        });

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || `"Haridwar University" <${smtpUser}>`,
            to,
            subject,
            html,
            text,
        });

        console.log(`[EmailService] ✅ Email delivered via Gmail SMTP to ${to} (MessageID: ${info.messageId})`);
        return {
            success: true,
            provider: 'smtp',
            emailId: info.messageId,
            message: 'Email delivered successfully via SMTP',
        };
    } catch (smtpErr) {
        console.error(`[EmailService] SMTP error for ${to}:`, smtpErr.message);
        return {
            success: false,
            provider: 'smtp',
            error: `SMTP Error: ${smtpErr.message}`,
            message: 'Failed to deliver email via SMTP',
        };
    }
}

/**
 * Send OTP verification email to student during registration
 * 
 * @param {string} email - Student's email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} studentName - Student's name
 * @returns {Promise<object>} Result of email sending
 */
export async function sendOtpEmail(email, otp, studentName) {
    try {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Haridwar University</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f3a7a 0%, #1e5a9e 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                Verify Your Email
                            </h1>
                            <p style="color: #e3f2fd; margin: 12px 0 0 0; font-size: 18px; font-weight: 500;">
                                Haridwar University Registration
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="font-size: 18px; color: #333333; margin: 0 0 24px 0; line-height: 1.6;">
                                Dear <strong style="color: #0f3a7a;">${studentName}</strong>,
                            </p>
                            
                            <p style="font-size: 16px; color: #555555; margin: 0 0 24px 0; line-height: 1.7;">
                                Thank you for starting your registration with Haridwar University. To verify your email address, please use the One-Time Password (OTP) below:
                            </p>
                            
                            <!-- OTP Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                                <tr>
                                    <td align="center">
                                        <table cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%); border: 3px solid #ffc107; border-radius: 12px; padding: 24px;">
                                            <tr>
                                                <td align="center">
                                                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #856404; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                                        Your OTP Code
                                                    </p>
                                                    <p style="margin: 0; font-size: 42px; font-weight: 900; color: #0f3a7a; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                                        ${otp}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Info Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e3f2fd; border-left: 4px solid #0f3a7a; border-radius: 8px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0; font-size: 15px; color: #0d47a1; line-height: 1.7;">
                                            <strong>⏱️ Valid for 10 minutes</strong><br>
                                            • Enter this OTP in the registration form<br>
                                            • Do not share this OTP with anyone<br>
                                            • If you didn't request this, please ignore
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="font-size: 16px; color: #555555; margin: 32px 0 0 0; line-height: 1.7;">
                                After verifying your email, your registration will be sent to the admin for approval. You'll receive another email with your login credentials once approved.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 28px 30px; border-top: 1px solid #e9ecef;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <p style="font-size: 14px; color: #666666; margin: 0; line-height: 1.6;">
                                            <strong>Need Help?</strong><br>
                                            If you didn't register for an account or have any questions, please contact your academic administrator.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="border-top: 1px solid #dee2e6; padding-top: 16px;">
                                        <p style="font-size: 13px; color: #999999; margin: 0; text-align: center;">
                                            © 2026 Haridwar University. All rights reserved.<br>
                                            <span style="font-size: 11px;">This is an automated email. Please do not reply.</span>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
        
        const textContent = `
Verify Your Email - Haridwar University Registration

Dear ${studentName},

Thank you for starting your registration with Haridwar University.

YOUR OTP CODE: ${otp}

This OTP is valid for 10 minutes.

Please enter this code in the registration form to verify your email address.

IMPORTANT:
- Do not share this OTP with anyone
- If you didn't request this, please ignore this email

After verification, your registration will be reviewed by the admin.

© 2026 Haridwar University. All rights reserved.
        `;
        
        return await dispatchEmail({
            to: email,
            subject: '🔐 Verify Your Email - Haridwar University Registration',
            html: htmlContent,
            text: textContent,
            category: 'otp_verification',
        });
        
    } catch (error) {
        console.error('Failed to send OTP email:', error);
        return {
            success: false,
            message: 'Failed to send OTP email',
            error: error.message,
        };
    }
}

/**
 * Send temporary password email to newly registered student
 * 
 * @param {string} email - Student's email address
 * @param {string} password - Temporary password
 * @param {string} studentName - Student's full name
 * @param {string} rollNo - Student's roll number
 * @returns {Promise<object>} Result of email sending
 */
export async function sendPasswordEmail(email, password, studentName, rollNo) {
    try {
        const loginUrl = process.env.CLIENT_URL || 'http://localhost:5000';
        
        // HTML email template
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Haridwar University</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f3a7a 0%, #1e5a9e 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                Welcome to Haridwar University
                            </h1>
                            <p style="color: #e3f2fd; margin: 12px 0 0 0; font-size: 18px; font-weight: 500;">
                                Student Progression Portal
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="font-size: 18px; color: #333333; margin: 0 0 24px 0; line-height: 1.6;">
                                Dear <strong style="color: #0f3a7a;">${studentName}</strong>,
                            </p>
                            
                            <p style="font-size: 16px; color: #555555; margin: 0 0 24px 0; line-height: 1.7;">
                                Congratulations! Your registration has been completed successfully. Welcome to the Haridwar University Mentor-Mentee Portal.
                            </p>
                            
                            <!-- Credentials Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-left: 5px solid #0f3a7a; border-radius: 8px; margin: 32px 0;">
                                <tr>
                                    <td style="padding: 28px 24px;">
                                        <p style="margin: 0 0 20px 0; font-size: 14px; color: #666666; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                            🔐 Your Login Credentials
                                        </p>
                                        
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 10px 0; font-size: 15px; color: #666666; width: 45%;">
                                                    <strong>Roll Number:</strong>
                                                </td>
                                                <td style="padding: 10px 0; font-size: 17px; color: #0f3a7a; font-weight: 700;">
                                                    ${rollNo}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 0; font-size: 15px; color: #666666;">
                                                    <strong>Email Address:</strong>
                                                </td>
                                                <td style="padding: 10px 0; font-size: 17px; color: #0f3a7a; font-weight: 700;">
                                                    ${email}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 0; font-size: 15px; color: #666666;">
                                                    <strong>Temporary Password:</strong>
                                                </td>
                                                <td style="padding: 10px 0;">
                                                    <span style="background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%); color: #856404; padding: 12px 20px; border-radius: 6px; font-size: 22px; font-weight: 900; letter-spacing: 2px; display: inline-block; font-family: 'Courier New', monospace; border: 2px solid #ffc107;">
                                                        ${password}
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Warning Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0; font-size: 15px; color: #856404; line-height: 1.7;">
                                            <strong>⚠️ Important Security Notice:</strong><br>
                                            • This is a <strong>temporary password</strong> that expires in <strong>24 hours</strong><br>
                                            • You <strong>must change it</strong> immediately upon first login<br>
                                            • Do not share this password with anyone
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Instructions -->
                            <p style="font-size: 17px; color: #333333; margin: 32px 0 16px 0; font-weight: 600;">
                                📋 Next Steps to Get Started:
                            </p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                                <tr>
                                    <td style="padding: 10px 0; font-size: 15px; color: #555555; line-height: 1.7;">
                                        <strong style="color: #0f3a7a; font-size: 18px;">1.</strong> Click the login button below<br>
                                        <strong style="color: #0f3a7a; font-size: 18px;">2.</strong> Enter your email or roll number<br>
                                        <strong style="color: #0f3a7a; font-size: 18px;">3.</strong> Use your temporary password to log in<br>
                                        <strong style="color: #0f3a7a; font-size: 18px;">4.</strong> Create a new secure password (minimum 8 characters)<br>
                                        <strong style="color: #0f3a7a; font-size: 18px;">5.</strong> Complete your profile and explore the portal
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Login Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #0f3a7a 0%, #1e5a9e 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 12px rgba(15, 58, 122, 0.4); transition: transform 0.2s;">
                                            🎓 Login to Portal
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="font-size: 14px; color: #999999; margin: 24px 0 0 0; line-height: 1.6; text-align: center;">
                                Or copy and paste this link in your browser:<br>
                                <a href="${loginUrl}" style="color: #0f3a7a; text-decoration: none; word-break: break-all;">${loginUrl}</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 28px 30px; border-top: 1px solid #e9ecef;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding-bottom: 16px;">
                                        <p style="font-size: 14px; color: #666666; margin: 0; line-height: 1.6;">
                                            <strong>Need Help?</strong><br>
                                            If you didn't register for this account or have any questions, please contact your academic administrator immediately.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="border-top: 1px solid #dee2e6; padding-top: 16px;">
                                        <p style="font-size: 13px; color: #999999; margin: 0; text-align: center;">
                                            © 2026 Haridwar University. All rights reserved.<br>
                                            <span style="font-size: 11px;">This is an automated email. Please do not reply.</span>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
        
        // Plain text fallback
        const textContent = `
Welcome to Haridwar University - Student Progression Portal

Dear ${studentName},

Congratulations! Your registration has been completed successfully.

YOUR LOGIN CREDENTIALS:
========================
Roll Number:        ${rollNo}
Email Address:      ${email}
Temporary Password: ${password}

IMPORTANT SECURITY NOTICE:
- This is a temporary password that expires in 24 hours
- You must change it immediately upon first login
- Do not share this password with anyone

NEXT STEPS:
1. Visit: ${loginUrl}
2. Log in with your email or roll number
3. Enter your temporary password
4. Create a new secure password (minimum 8 characters)
5. Complete your profile and explore the portal

Need Help?
If you didn't register for this account or have any questions, please contact your academic administrator.

© 2026 Haridwar University. All rights reserved.
This is an automated email. Please do not reply.
        `;
        
        return await dispatchEmail({
            to: email,
            subject: '🎓 Welcome to Haridwar University - Your Login Credentials',
            html: htmlContent,
            text: textContent,
            category: 'student_registration',
        });
        
    } catch (error) {
        console.error('Failed to send email via Resend:', error);
        
        return {
            success: false,
            message: 'Failed to send email',
            error: error.message,
            email: email,
            timestamp: new Date().toISOString(),
        };
    }
}

/**
 * Send password reset email
 * 
 * @param {string} email - User's email address
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name
 * @returns {Promise<object>} Result of email sending
 */
export async function sendPasswordResetEmail(email, resetToken, userName) {
    try {
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f3a7a 0%, #1e5a9e 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Password Reset Request</h1>
                            <p style="color: #e3f2fd; margin: 8px 0 0 0;">Haridwar University</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="font-size: 16px; color: #333333; margin: 0 0 20px 0; line-height: 1.6;">
                                Dear <strong>${userName}</strong>,
                            </p>
                            <p style="font-size: 16px; color: #555555; margin: 0 0 24px 0; line-height: 1.7;">
                                We received a request to reset your password. Click the button below to create a new password:
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0f3a7a 0%, #1e5a9e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(15, 58, 122, 0.4);">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 16px;">
                                        <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.6;">
                                            ⚠️ <strong>Important:</strong> This link will expire in <strong>1 hour</strong>. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e9ecef;">
                            <p style="font-size: 13px; color: #999999; margin: 0; text-align: center;">
                                © 2026 Haridwar University. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
        
        return await dispatchEmail({
            to: email,
            subject: '🔐 Password Reset Request - Haridwar University',
            html: htmlContent,
            category: 'password_reset',
        });
        
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw error;
    }
}

/**
 * Send personalized registration invitation email with secure link
 * 
 * @param {string} email - Student's email address
 * @param {string} registrationUrl - Unique registration URL with token
 * @param {string} studentName - Student's name (optional)
 * @returns {Promise<object>} Result of email sending
 */
export async function sendRegistrationInviteEmail(email, registrationUrl, studentName = '') {
    try {
        const greeting = studentName ? `Dear <strong>${studentName}</strong>,` : 'Dear Student,';
        
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Invitation - Haridwar University</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f3a7a 0%, #1e5a9e 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 30px; font-weight: 700; letter-spacing: -0.5px;">
                                Haridwar University
                            </h1>
                            <p style="color: #e3f2fd; margin: 10px 0 0 0; font-size: 17px; font-weight: 500;">
                                Student Progression & Mentorship Portal
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="font-size: 18px; color: #333333; margin: 0 0 20px 0; line-height: 1.6;">
                                ${greeting}
                            </p>
                            
                            <p style="font-size: 16px; color: #555555; margin: 0 0 24px 0; line-height: 1.7;">
                                You have been invited to register on the <strong>Haridwar University Student Progression Portal</strong>. This portal will allow you to track your academic progress, attend mentoring sessions, log activities, and interact with your mentors.
                            </p>
                            
                            <!-- Action Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-left: 5px solid #0f3a7a; border-radius: 8px; margin: 28px 0; padding: 24px;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #666666; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                            🔗 Your Personal Registration Link
                                        </p>
                                        <p style="margin: 0 0 20px 0; font-size: 14px; color: #555555;">
                                            This link is unique to your email address (<strong>${email}</strong>) and can only be used once.
                                        </p>
                                        <div style="text-align: center; margin: 20px 0;">
                                            <a href="${registrationUrl}" style="display: inline-block; background: linear-gradient(135deg, #0f3a7a 0%, #1e5a9e 100%); color: #ffffff; text-decoration: none; padding: 15px 36px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(15, 58, 122, 0.35);">
                                                👉 Complete Your Registration
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Steps Box -->
                            <p style="font-size: 16px; color: #333333; margin: 28px 0 12px 0; font-weight: 600;">
                                📋 How it works:
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 6px 0; font-size: 14px; color: #555555; line-height: 1.6;">
                                        <strong>1.</strong> Click the link above to open the registration form.
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 14px; color: #555555; line-height: 1.6;">
                                        <strong>2.</strong> Confirm your name & mobile number, then verify via Email OTP.
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 14px; color: #555555; line-height: 1.6;">
                                        <strong>3.</strong> Admin approves your application and generates your temporary password.
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; font-size: 14px; color: #555555; line-height: 1.6;">
                                        <strong>4.</strong> Log in, change password, and complete your student profile.
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Notice -->
                            <p style="font-size: 13px; color: #888888; margin: 30px 0 0 0; line-height: 1.5; border-top: 1px dashed #dddddd; padding-top: 15px;">
                                If the button above doesn't work, copy and paste this link into your browser:<br>
                                <a href="${registrationUrl}" style="color: #0f3a7a; word-break: break-all;">${registrationUrl}</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 24px 30px; border-top: 1px solid #e9ecef;">
                            <p style="font-size: 13px; color: #999999; margin: 0; text-align: center;">
                                © 2026 Haridwar University. All rights reserved.<br>
                                <span style="font-size: 11px;">This is an automated invitation. Please do not reply directly to this email.</span>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
        
        const textContent = `
Haridwar University - Student Registration Invitation

${greeting.replace(/<[^>]*>?/gm, '')}

You have been invited to register on the Haridwar University Student Progression Portal.

To complete your registration, visit your unique link:
${registrationUrl}

Steps to register:
1. Open the link and confirm your name & phone.
2. Verify your email using OTP.
3. Once approved by the administrator, you will receive login credentials.

Note: This link is unique to ${email} and valid for 7 days.

© 2026 Haridwar University. All rights reserved.
        `;
        
        return await dispatchEmail({
            to: email,
            subject: '🎓 Invitation: Register for Haridwar University Student Portal',
            html: htmlContent,
            text: textContent,
            category: 'registration_invite',
        });
    } catch (error) {
        console.error('Failed to send registration invite email:', error);
        return {
            success: false,
            message: 'Failed to send invite email',
            error: error.message,
        };
    }
}

export default {
    sendPasswordEmail,
    sendPasswordResetEmail,
    sendOtpEmail,
    sendRegistrationInviteEmail,
};
