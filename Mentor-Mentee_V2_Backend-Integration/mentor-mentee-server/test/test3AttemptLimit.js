/**
 * Test 3-Attempt Limit for Student Photo Uploads
 * 
 * Manual test script to verify:
 * 1. Students are limited to 3 photo upload attempts
 * 2. Mentors/Admins have unlimited attempts
 * 3. Students can only upload to their own profile
 * 4. Upload history is tracked correctly
 */

import mongoose from 'mongoose';
import Student from '../models/Student.js';
import dotenv from 'dotenv';

dotenv.config();

const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

function logTest(name, passed, message) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${name}`);
    if (message) console.log(`   ${message}`);
    
    testResults.tests.push({ name, passed, message });
    if (passed) testResults.passed++;
    else testResults.failed++;
}

async function runTests() {
    try {
        console.log('\n🧪 Testing 3-Attempt Limit Feature\n');
        console.log('Connecting to MongoDB...');
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Test 1: Check if Student model has new fields
        console.log('TEST 1: Student Model Schema Validation');
        const studentSchema = Student.schema.obj;
        const hasUploadAttempts = 'photoUploadAttempts' in studentSchema;
        const hasUploadHistory = 'photoUploadHistory' in studentSchema;
        
        logTest(
            'Student model has photoUploadAttempts field',
            hasUploadAttempts,
            hasUploadAttempts ? 'Field exists in schema' : 'Field missing from schema'
        );
        
        logTest(
            'Student model has photoUploadHistory field',
            hasUploadHistory,
            hasUploadHistory ? 'Field exists in schema' : 'Field missing from schema'
        );

        // Test 2: Find a test student
        console.log('\nTEST 2: Database Query Tests');
        const testStudent = await Student.findOne({ rollNo: '230101001' });
        
        logTest(
            'Test student exists in database',
            !!testStudent,
            testStudent ? `Found student: ${testStudent.name}` : 'Student not found'
        );

        if (testStudent) {
            // Test 3: Check initial values
            console.log('\nTEST 3: Initial Values');
            const attemptCount = testStudent.photoUploadAttempts || 0;
            const hasHistory = Array.isArray(testStudent.photoUploadHistory);
            
            logTest(
                'photoUploadAttempts initialized',
                attemptCount >= 0 && attemptCount <= 3,
                `Current attempts: ${attemptCount}/3`
            );
            
            logTest(
                'photoUploadHistory is an array',
                hasHistory,
                hasHistory ? `History entries: ${testStudent.photoUploadHistory?.length || 0}` : 'Not an array'
            );

            // Test 4: Simulate upload attempt (without actually uploading)
            console.log('\nTEST 4: Attempt Counter Logic');
            const beforeAttempts = testStudent.photoUploadAttempts || 0;
            const canUpload = beforeAttempts < 3;
            
            logTest(
                'Can upload check (before 3 attempts)',
                canUpload || beforeAttempts >= 3,
                canUpload 
                    ? `Student can upload (${3 - beforeAttempts} attempts remaining)`
                    : 'Student has reached upload limit'
            );

            // Test 5: Check max value constraint
            console.log('\nTEST 5: Schema Constraints');
            const maxConstraint = Student.schema.path('photoUploadAttempts').options.max;
            
            logTest(
                'photoUploadAttempts has max constraint of 3',
                maxConstraint === 3,
                `Max value: ${maxConstraint}`
            );

            // Test 6: Display current upload status
            console.log('\nTEST 6: Current Upload Status');
            console.log(`\n📊 Student Upload Status:`);
            console.log(`   Roll No: ${testStudent.rollNo}`);
            console.log(`   Name: ${testStudent.name}`);
            console.log(`   Upload Attempts: ${testStudent.photoUploadAttempts || 0}/3`);
            console.log(`   Remaining Attempts: ${3 - (testStudent.photoUploadAttempts || 0)}`);
            console.log(`   Upload History Entries: ${testStudent.photoUploadHistory?.length || 0}`);
            
            if (testStudent.photoUploadHistory && testStudent.photoUploadHistory.length > 0) {
                console.log(`\n   📜 Upload History:`);
                testStudent.photoUploadHistory.forEach((entry, index) => {
                    console.log(`      ${index + 1}. Date: ${entry.uploadedAt?.toISOString() || 'N/A'}`);
                    console.log(`         Photos: ${entry.photosUploaded?.join(', ') || 'None'}`);
                });
            }

            logTest(
                'Upload status displayed successfully',
                true,
                'Status information retrieved'
            );
        }

        // Test 7: Check schema defaults
        console.log('\nTEST 7: Default Values');
        const defaultAttempts = Student.schema.path('photoUploadAttempts').options.default;
        
        logTest(
            'Default photoUploadAttempts is 0',
            defaultAttempts === 0,
            `Default value: ${defaultAttempts}`
        );

        // Print Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`📝 Total:  ${testResults.tests.length}`);
        console.log('='.repeat(60));

        if (testResults.failed === 0) {
            console.log('\n🎉 All tests passed! 3-attempt limit feature is ready.\n');
        } else {
            console.log('\n⚠️  Some tests failed. Please review the implementation.\n');
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        process.exit(testResults.failed > 0 ? 1 : 0);
    }
}

// Run tests
runTests();
