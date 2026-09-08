# Mentor-Mentee Management & Academic Portal

An institutional-grade pair programming and academic mentoring management system designed for universities and higher education institutions. The platform supports granular role-based access control (RBAC), multi-role portals (System Admin, Head of Department (HOD), Academic Faculty, Mentors, and Mentees), single-use invite-based student onboarding with OTP verification, section allotment pipelines, session logs, continuous assessments, and complete audit logging.

---

## 🏛️ Key Roles & Portals

1. **System Administrator (ADMIN)**
   - Global university overview and cross-department analytics.
   - Student self-registration invite generator (batch and single links).
   - Pending registration approval & roll number assignment pipeline.
   - Institution-wide section allotment and distribution.
   - Comprehensive student directory, account activation/deactivation, and permanent deletion with cascading cleanup.
   - Full academic and mentor-mentee mapping oversight.

2. **Head of Department (HOD)**
   - **Isolated Department Scope:** Access is strictly scoped to students in their own department (e.g., Computer Science & Engineering).
   - Department-specific student directories and analytics.
   - Department section allotment management (allotting verified students with completed profiles).
   - Department student self-registration approvals.
   - Department student active/inactive status toggles.

3. **Academic Faculty**
   - Marks entry, continuous evaluation, and academic performance tracking.
   - Read-only attendance inspection.

4. **Mentor**
   - Mentee profiles, regular mentoring session tracking, action items, meeting logs, and student feedback.

5. **Mentee (Student)**
   - Self-registration via secure invite token + email OTP verification.
   - Initial onboarding modal for profile details (father name, mother name, 10th/12th percentages, quota, etc.).
   - Profile photo upload (max 500KB with preview & camera capture).
   - View allotted section, semester timetable, academic marks, attendance records, and mentoring interactions.

---

## 🚀 Quick Start

### 1. Backend Server Setup
```bash
cd Mentor-Mentee_V2_Backend-Integration/mentor-mentee-server
npm install
cp .env.example .env
# Configure MONGO_URI, JWT secrets, and SMTP credentials in .env
npm run dev
```

### 2. Frontend Client Setup
The frontend runs as a modern, decoupled Single Page Application (SPA).
Serve the frontend directory via static server or live server:
```bash
cd Mentor-Mentee_V2_Backend-Integration/Mentor-Mentee_V1/client
# Open index.html in your browser or run a static file server:
npx serve .
```

---

## 🧪 Verification & Automated Test Suites

The backend includes comprehensive end-to-end integration and isolation test suites:
```bash
# 1. Test HOD Department Isolation & Admin Global Access
node Mentor-Mentee_V2_Backend-Integration/mentor-mentee-server/scripts/test_hod_department_isolation.js

# 2. Test Deactivation & Permanent Cascading Deletion
node Mentor-Mentee_V2_Backend-Integration/mentor-mentee-server/scripts/test_deactivate_and_remove_student.js

# 3. Test Full Section Allotment Pipeline
node Mentor-Mentee_V2_Backend-Integration/mentor-mentee-server/scripts/test_section_allotment_full_cycle.js

# 4. Test Complete Student Invite & Registration Flow
node Mentor-Mentee_V2_Backend-Integration/mentor-mentee-server/scripts/testFullRegistrationFlow.js
```

---

## 🔒 Security & RBAC Highlights
- **JWT Authentication:** Dual-token mechanism (short-lived access tokens + refresh tokens in secure cookies/headers).
- **Password Policies:** Temporary password generation upon approval, forced password update on first login.
- **Department Scoping:** Server-level enforcement preventing cross-department data leaks or unauthorized updates for HODs.
- **Cascading Deletion:** Complete removal of associated user credentials, pending tokens, and session history upon student deletion.
