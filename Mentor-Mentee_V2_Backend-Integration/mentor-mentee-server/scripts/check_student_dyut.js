import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

import Student from '../models/Student.js';
import User from '../models/User.js';

async function checkStudent() {
    await mongoose.connect(process.env.MONGO_URI);
    const students = await Student.find({
        $or: [
            { rollNo: '24301020001' },
            { name: /Dyutishmaan/i }
        ]
    }).lean();

    console.log('Students:', JSON.stringify(students.map(s => ({
        _id: s._id,
        name: s.name,
        rollNo: s.rollNo,
        email: s.email,
        branch: s.branch,
        semester: s.semester,
        section: s.section,
        profileCompleted: s.profileCompleted,
        profileCompletedAt: s.profileCompletedAt,
        phone1: s.phone1,
        parentFatherName: s.parentFatherName,
        parentMotherName: s.parentMotherName,
        pre10School: s.pre10School
    })), null, 2));

    const users = await User.find({
        $or: [
            { rollNo: '24301020001' },
            { name: /Dyutishmaan/i }
        ]
    }).lean();

    console.log('Users:', JSON.stringify(users.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        rollNo: u.rollNo,
        role: u.role,
        studentProfile: u.studentProfile
    })), null, 2));

    await mongoose.disconnect();
}

checkStudent();
