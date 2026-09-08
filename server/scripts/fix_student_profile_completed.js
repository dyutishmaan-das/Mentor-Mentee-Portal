import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

import Student from '../models/Student.js';

async function migrateProfileCompletion() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find students who have essential profile details filled
        const query = {
            parentFatherName: { $exists: true, $ne: '' },
            parentMotherName: { $exists: true, $ne: '' },
            $or: [
                { addressPresent: { $exists: true, $ne: '' } },
                { addressPermanent: { $exists: true, $ne: '' } },
            ],
        };

        const students = await Student.find(query);
        console.log(`Found ${students.length} students matching completed profile criteria.`);

        let updatedCount = 0;
        for (const student of students) {
            if (!student.profileCompleted) {
                student.profileCompleted = true;
                if (!student.profileCompletedAt) {
                    student.profileCompletedAt = student.updatedAt || new Date();
                }
                await student.save();
                updatedCount++;
                console.log(`✅ Updated profile completion for: ${student.rollNo} - ${student.name}`);
            } else {
                console.log(`ℹ️ Already completed: ${student.rollNo} - ${student.name}`);
            }
        }

        console.log(`\nMigration completed! Successfully updated ${updatedCount} students.`);
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

migrateProfileCompletion();
