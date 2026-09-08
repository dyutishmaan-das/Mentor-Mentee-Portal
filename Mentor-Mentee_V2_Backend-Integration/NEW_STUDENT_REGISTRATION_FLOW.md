# 🎓 NEW STUDENT SELF-REGISTRATION SYSTEM (OTP + ADMIN/AI APPROVAL)

## 📌 Executive Overview
This document outlines the complete architecture and workflow for the **Haridwar University Student Self-Registration and Progression System**.

The workflow replaces old manual data entry and SMS methods with a secure, multistage pipeline featuring:
1. **Admin/Link Generation** (Single/Batch links)
2. **Student Quick Registration** (Name, Email, Mobile only)
3. **Email OTP Verification** (Automated 6-digit OTP delivery via Resend)
4. **Admin / AI Review & Approval Queue** (Modular design ready for algorithmic/AI auto-approval)
5. **Temporary Password Email Delivery** (Secure 8-character password + 24-hour expiration)
6. **First Login & Mandatory Password Change**
7. **Full Student Profile Completion & Self-Service Save**

---

## 🔄 End-to-End Workflow Diagram

```
+-----------------------------------------------------------------------------------+
| 1. ADMIN ACTION                                                                   |
|    Admin generates a secure link with expiry and usage limits                     |
|    POST /api/registration/generate-link                                           |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
| 2. STUDENT INITIATION                                                             |
|    Student visits link, enters: Full Name, Email Address, Mobile Number           |
|    POST /api/registration/initiate                                                |
|    -> System sends 6-digit OTP to student's email via Resend                      |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
| 3. EMAIL OTP VERIFICATION                                                         |
|    Student inputs 6-digit OTP received in email                                   |
|    POST /api/registration/verify-otp                                              |
|    -> Status changes from OTP_PENDING to PENDING_APPROVAL                         |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
| 4. ADMIN REVIEW & APPROVAL (Future: AI / Algorithmic Verification)                |
|    Admin reviews applicant queue via GET /api/registration/pending                |
|    Admin approves via POST /api/registration/approve/:id                          |
|      - Assigns Roll Number, Course, Branch, Semester, Admission Year              |
|      - Automatically creates MENTEE User account with hashed temp password        |
|      - Automatically generates initial Student record                             |
|      - Triggers branded email with temporary password & login URL                 |
|    (Or Admin rejects via POST /api/registration/reject/:id with reason)           |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
| 5. STUDENT FIRST LOGIN                                                            |
|    Student logs in using Email/Roll No and Temporary Password                     |
|    POST /api/auth/login                                                           |
|    -> Response returns requirePasswordChange: true                                |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
| 6. MANDATORY PASSWORD CHANGE                                                      |
|    Student sets a new secure permanent password                                   |
|    POST /api/registration/change-password                                         |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
| 7. FULL PROFILE SELF-SERVICE COMPLETION                                           |
|    Student fills all detailed personal, academic, parental & guardian records     |
|    PUT /api/students/profile/complete                                             |
|    -> Sets profileCompleted: true, profileCompletedAt: Date                       |
+-----------------------------------------------------------------------------------+
```

---

## 📡 API Endpoints Reference

### 1. Registration & Verification Routes (`/api/registration`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/registration/generate-link` | Admin / HOD | Generates secure token (`single`, `batch`, or `unlimited`) |
| `GET` | `/api/registration/tokens` | Admin / HOD | Retrieves all generated registration tokens |
| `POST` | `/api/registration/deactivate/:token` | Admin / HOD | Deactivates an active token |
| `GET` | `/api/registration/validate/:token` | Public | Validates link before rendering registration page |
| `POST` | `/api/registration/initiate` | Public | Submits Name, Email, Mobile; sends email OTP |
| `POST` | `/api/registration/verify-otp` | Public | Verifies email OTP and places request in approval queue |
| `POST` | `/api/registration/resend-otp` | Public | Resends a fresh OTP if expired |
| `GET` | `/api/registration/pending` | Admin / HOD | Lists all registrations awaiting approval |
| `POST` | `/api/registration/approve/:id` | Admin / HOD | Approves applicant, assigns Roll No/Course, sends temp password |
| `POST` | `/api/registration/reject/:id` | Admin / HOD | Rejects applicant with specified reason |
| `POST` | `/api/registration/change-password` | Authenticated Mentee | Changes temporary password to permanent password |

### 2. Student Profile Self-Service Routes (`/api/students`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/students/profile/status` | Authenticated Mentee | Returns `{ profileCompleted: boolean, profileCompletedAt: Date }` |
| `GET` | `/api/students/profile/me` | Authenticated Mentee | Returns full student profile |
| `PUT` | `/api/students/profile/complete` | Authenticated Mentee | Submits complete initial profile data and marks profile complete |
| `PUT` | `/api/students/profile/update` | Authenticated Mentee | Updates editable profile fields post-completion |

---

## 🤖 Future AI & Algorithmic Auto-Approval Architecture

The approval pipeline is intentionally modular. In `controllers/registrationController.js`, `approveRegistration` is structured so an AI agent, webhook, or background rule engine can inspect pending requests:

```javascript
// AI / Algorithm Approval Interface Example:
export async function evaluateRegistrationWithAI(pendingRegistration) {
    // 1. Verify university email domain regex
    // 2. Cross-reference admission database / merit list
    // 3. Scan submitted identity documents via OCR / Vision AI
    // 4. If confidence >= 95%, automatically call approveRegistration
}
```

---

## 🔒 Security & Data Integrity Features

1. **OTP Rate Limiting & Max Attempts:**
   - 10-minute expiry per OTP code.
   - Max 5 failed attempts before registration must be restarted.
2. **Encrypted Temporary Passwords:**
   - Strong 8-character alphanumeric + symbol password generator.
   - 24-hour expiration window.
   - Forced password change on first login.
3. **3-Attempt Photo Limit Protection:**
   - Integrated with existing `models/Student.js` photo upload counter.
4. **Duplicate Prevention:**
   - Prevents duplicate registration on active email or roll number.
