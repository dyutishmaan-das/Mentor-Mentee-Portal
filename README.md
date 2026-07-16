# MentorConnect

A MERN application that digitizes Haridwar University's Student Progression and Mentor–Mentee Diary.

## Features

- Role-ready dashboard for administrators, mentors, and students
- Student profiles, mentor assignment, attendance and academic progress
- Mentoring session records, action items and follow-up status
- Risk alerts for attendance, performance and unresolved actions
- Achievements, certifications, internships and extracurricular records
- Mentor feedback and mentee self-assessment
- Responsive, accessible Tailwind interface
- First-run administrator setup and real JWT authentication
- Admin, HoD, mentor and student permissions
- Complete CRUD for students, users, sessions, academics, diary records and assessments
- Printable student progression report

## Quick start

1. Ensure MongoDB is running.
2. Review `server/.env` and change `JWT_SECRET` before deployment.
3. Run `npm run install:all`.
4. Run `npm run dev`.
5. Open the website and create the first administrator account.

The client runs at `http://localhost:5173` and the API at `http://localhost:5000`. MongoDB is required; there is no demo or in-memory fallback.

## Production

Run `npm run build`, set `NODE_ENV=production`, and then `npm start`. The Express server serves the generated frontend from `client/dist`.

On an empty database, the application displays a one-time setup form. After the first administrator is created, all other accounts are managed from the Users and Students modules.

# Mentor-Mentee
