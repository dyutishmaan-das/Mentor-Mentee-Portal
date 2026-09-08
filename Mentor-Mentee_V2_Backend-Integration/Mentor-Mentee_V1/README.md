# Mentor-Mentee + College Management Backend

This version uses the Mentor-Mentee frontend with the College Management System backend.

## Architecture

Browser -> Express -> REST API -> MongoDB

The frontend is served by Express at `http://localhost:5000`.

## Setup

1. Install Node.js 18+.
2. Make sure MongoDB is running locally.
3. Open a terminal in `server/`.
4. Install dependencies:

```powershell
npm install
```

5. Seed demo users and the demo student/mentor:

```powershell
npm run seed
```

6. Start the server:

```powershell
npm run dev
```

Open:

`http://localhost:5000`

## Demo accounts

Password for all accounts:

`DemoPass123!`

- ADMIN: admin@demo.edu
- HOD: hod@demo.edu
- ACADEMIC_FACULTY: academic@demo.edu
- MENTOR: mentor@demo.edu
- OTHER_FACULTY: faculty@demo.edu
- MENTEE: student@demo.edu

## Current integration

- Mentor-Mentee frontend is served by the backend.
- Login uses `/api/auth/login`.
- JWT access token is stored in the browser for API calls.
- Refresh-token cookie is used for session refresh.
- Logout calls `/api/auth/logout`.
- Mentee profile is loaded from `/api/students/me`.
- Academic marks write endpoint is restricted to ADMIN and ACADEMIC_FACULTY.
- Attendance write endpoint is restricted to ADMIN and ACADEMIC_FACULTY.
- Academic Faculty cannot create/update student profiles.
- HOD is not allowed to write marks or attendance.
- Role management is controlled by ADMIN.

## Important next migration

The old Mentor-Mentee UI still contains a local `DataStore` because its many screens were originally built around local demo data. The Google Sheets script has been disconnected. The next step is to migrate each UI module from `DataStore` to the REST API:

1. student profile
2. marks
3. attendance
4. mentoring sessions
5. mentor assessment/remarks
6. parent meetings
7. interventions/counseling
8. portfolio/activities
9. feedback
10. admin reports/audit logs

Do not use localStorage as the production source of truth.
