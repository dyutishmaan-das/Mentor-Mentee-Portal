import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Student from '../models/Student.js';

async function seedFaculty() {
    await connectDB();

    const facultyUsers = [
        {
            name: 'Dr. Ramesh Sharma (HOD)',
            email: 'hod@demo.edu',
            password: 'demo123',
            role: 'HOD',
            department: 'Computer Science & Engineering',
            designation: 'Head of Department',
        },
        {
            name: 'Prof. Sunita Rao (Academic Faculty)',
            email: 'academic@demo.edu',
            password: 'demo123',
            role: 'ACADEMIC_FACULTY',
            department: 'Computer Science & Engineering',
            designation: 'Associate Professor',
        },
        {
            name: 'Prof. Amit Verma (Mentor)',
            email: 'mentor@demo.edu',
            password: 'demo123',
            role: 'MENTOR',
            department: 'Computer Science & Engineering',
            designation: 'Assistant Professor',
        },
        {
            name: 'Dr. Priya Nair (Faculty)',
            email: 'faculty@demo.edu',
            password: 'demo123',
            role: 'OTHER_FACULTY',
            department: 'Computer Science & Engineering',
            designation: 'Assistant Professor',
        },
    ];

    for (const f of facultyUsers) {
        let existing = await User.findOne({ email: f.email });
        if (!existing) {
            const hashedPassword = await bcrypt.hash(f.password, 12);
            const user = await User.create({
                name: f.name,
                email: f.email,
                password: hashedPassword,
                role: f.role,
                department: f.department,
                designation: f.designation,
            });
            console.log(`Created ${f.role}: ${f.email} / ${f.password} (id: ${user._id})`);

            // If mentor, assign the first 10 students to this mentor
            if (f.role === 'MENTOR') {
                const students = await Student.find({}).limit(15);
                for (const st of students) {
                    st.mentorId = user._id.toString();
                    await st.save();
                }
                console.log(`Assigned ${students.length} mentees to mentor ${f.name}`);
            }
        } else {
            console.log(`User ${f.email} already exists - updating department & designation`);
            existing.department = f.department;
            existing.designation = f.designation;
            await existing.save();

            if (f.role === 'MENTOR') {
                // Ensure some students are assigned
                const count = await Student.countDocuments({ mentorId: existing._id.toString() });
                if (count === 0) {
                    const students = await Student.find({}).limit(15);
                    for (const st of students) {
                        st.mentorId = existing._id.toString();
                        await st.save();
                    }
                    console.log(`Assigned ${students.length} mentees to mentor ${f.name}`);
                }
            }
        }
    }

    console.log('Faculty & Mentor seeding complete!');
    process.exit(0);
}

seedFaculty().catch((error) => {
    console.error(error);
    process.exit(1);
});
