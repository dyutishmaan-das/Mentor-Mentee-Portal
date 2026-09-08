import 'dotenv/config';
import mongoose from 'mongoose';

import { connectDB } from '../config/db.js';

import User from '../models/User.js';
import Department from '../models/Department.js';
import Mentor from '../models/Mentor.js';
import Student from '../models/Student.js';

import {
  DEFAULT_DEMO_PASSWORD,
  getDefaultDemoAccounts,
} from './defaultAccounts.js';


await connectDB();

const users = {};


/*
|--------------------------------------------------------------------------
| CREATE / UPDATE DEMO USERS
|--------------------------------------------------------------------------
*/

for (const account of getDefaultDemoAccounts()) {
  let user = await User.findOne({
    email: account.email,
  });

  if (!user) {
    user = await User.create({
      name: account.name,
      email: account.email,
      password: DEFAULT_DEMO_PASSWORD,
      role: account.role,
      isActive: true,
    });

    console.log(`Created ${account.role}: ${account.email}`);
  } else {
    user.name = account.name;
    user.role = account.role;
    user.isActive = true;

    await user.save();

    console.log(`Updated ${account.role}: ${account.email}`);
  }

  users[account.role] = user;
}


/*
|--------------------------------------------------------------------------
| CREATE / UPDATE CSE DEPARTMENT
|--------------------------------------------------------------------------
*/

const department = await Department.findOneAndUpdate(
  {
    code: 'CSE',
  },
  {
    name: 'Computer Science and Engineering',
    code: 'CSE',
    createdBy: users.ADMIN._id,
    updatedBy: users.ADMIN._id,
  },
  {
    upsert: true,
    new: true,
  },
);


/*
|--------------------------------------------------------------------------
| CREATE / UPDATE MENTOR PROFILE
|--------------------------------------------------------------------------
*/

const mentor = await Mentor.findOneAndUpdate(
  {
    userId: users.MENTOR._id,
  },
  {
    userId: users.MENTOR._id,
    employeeId: 'HU-M-001',
    department: department._id,
  },
  {
    upsert: true,
    new: true,
  },
);


/*
|--------------------------------------------------------------------------
| CREATE / UPDATE MENTEE / STUDENT PROFILE
|--------------------------------------------------------------------------
*/

await Student.findOneAndUpdate(
  {
    userId: users.MENTEE._id,
  },
  {
    userId: users.MENTEE._id,
    studentId: 'HU2026001',
    rollNumber: 'CSE-26-001',
    name: 'Student User',
    email: 'student@demo.edu',
    department: department._id,
    semester: 1,
    section: 'A',
    mentorId: mentor._id,
    createdBy: users.ADMIN._id,
    updatedBy: users.ADMIN._id,
  },
  {
    upsert: true,
    new: true,
  },
);


/*
|--------------------------------------------------------------------------
| SEED COMPLETE
|--------------------------------------------------------------------------
*/

console.log('');
console.log('==========================================');
console.log('       MENTOR CONNECT SEED COMPLETE       ');
console.log('==========================================');
console.log('');

console.log('Demo password for all accounts:');
console.log(DEFAULT_DEMO_PASSWORD);

console.log('');

console.log('Demo accounts:');
console.log('------------------------------------------');

for (const account of getDefaultDemoAccounts()) {
  console.log(
    `${account.role.padEnd(20)} ${account.email}`,
  );
}

console.log('------------------------------------------');
console.log('');

await mongoose.disconnect();

console.log('MongoDB connection closed.');
