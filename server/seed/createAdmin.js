import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';

import { connectDB } from '../config/db.js';
import User from '../models/User.js';

async function createAdmin() {
    await connectDB();

    const email = 'admin@mentormentee.local';
    const password = 'Admin@12345';

    const existing = await User.findOne({ email });

    if (existing) {
        console.log('Admin already exists');
        process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
        name: 'System Administrator',
        email,
        password: hashedPassword,
        role: 'ADMIN',
    });

    console.log('Admin created');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    process.exit(0);
}

createAdmin().catch((error) => {
    console.error(error);
    process.exit(1);
});