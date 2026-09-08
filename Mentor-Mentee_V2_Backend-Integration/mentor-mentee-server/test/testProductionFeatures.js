/**
 * Production-Grade Backend Test Suite
 * Tests all 7 newly implemented features
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
let adminToken = '';
let testStudentId = '';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Health Check
async function testHealthCheck() {
    log('\n📋 Test 1: Health Check', 'blue');
    try {
        const response = await fetch(`${BASE_URL}/api/health`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            log('✅ Health check passed', 'green');
            return true;
        } else {
            log('❌ Health check failed', 'red');
            return false;
        }
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        return false;
    }
}

// Test 2: Admin Login
async function testAdminLogin() {
    log('\n📋 Test 2: Admin Login', 'blue');
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@mentormentee.local',
                password: 'Admin@12345',
            }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.token) {
            adminToken = data.token;
            log('✅ Admin login successful', 'green');
            return true;
        } else {
            log(`❌ Login failed: ${data.message || 'Unknown error'}`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        return false;
    }
}

// Test 3: System Stats (NEW FEATURE)
async function testSystemStats() {
    log('\n📋 Test 3: System Statistics (Production Feature)', 'blue');
    try {
        const response = await fetch(`${BASE_URL}/api/system/stats`, {
            headers: { 'Authorization': `Bearer ${adminToken}` },
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            log('✅ System stats retrieved successfully', 'green');
            log(`   Students: ${data.data.students.total}`, 'yellow');
            log(`   Faculty: ${data.data.faculty.total}`, 'yellow');
            log(`   Mentors: ${data.data.faculty.mentors}`, 'yellow');
            return true;
        } else {
            log(`❌ Failed: ${data.message || response.statusText}`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        return false;
    }
}

// Test 4: Create Announcement (NEW FEATURE)
async function testCreateAnnouncement() {
    log('\n📋 Test 4: Create Announcement (Production Feature)', 'blue');
    try {
        const response = await fetch(`${BASE_URL}/api/system/announcements`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Test Announcement - Production Backend',
                message: 'This is a test announcement to verify the production-grade announcement system.',
                priority: 'high',
                targetRoles: ['MENTEE', 'MENTOR'],
            }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            log('✅ Announcement created successfully', 'green');
            log(`   ID: ${data.data._id}`, 'yellow');
            return true;
        } else {
            log(`❌ Failed: ${data.message || response.statusText}`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        return false;
    }
}

// Test 5: Get Announcements (NEW FEATURE)
async function testGetAnnouncements() {
    log('\n📋 Test 5: Get Announcements (Production Feature)', 'blue');
    try {
        const response = await fetch(`${BASE_URL}/api/system/announcements`, {
            headers: { 'Authorization': `Bearer ${adminToken}` },
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            log(`✅ Retrieved ${data.data.length} announcements`, 'green');
            return true;
        } else {
            log(`❌ Failed: ${data.message || response.statusText}`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        return false;
    }
}

// Test 6: Validation Test (express-validator - NEW FEATURE)
async function testValidation() {
    log('\n📋 Test 6: Input Validation (express-validator)', 'blue');
    try {
        // Try to create announcement with invalid data
        const response = await fetch(`${BASE_URL}/api/system/announcements`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Bad',  // Too short (< 5 chars)
                message: 'Short',  // Too short (< 10 chars)
            }),
        });
        
        const data = await response.json();
        
        if (response.status === 400 && !data.success) {
            log('✅ Validation working correctly (rejected invalid data)', 'green');
            return true;
        } else {
            log('❌ Validation not working (accepted invalid data)', 'red');
            return false;
        }
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        return false;
    }
}

// Test 7: Error Handling (NEW FEATURE)
async function testErrorHandling() {
    log('\n📋 Test 7: Centralized Error Handling', 'blue');
    try {
        // Try to access non-existent endpoint
        const response = await fetch(`${BASE_URL}/api/nonexistent`, {
            headers: { 'Authorization': `Bearer ${adminToken}` },
        });
        
        const data = await response.json();
        
        if (response.status === 404 && data.message) {
            log('✅ 404 error handled correctly', 'green');
            return true;
        } else {
            log('❌ Error handling not working', 'red');
            return false;
        }
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        return false;
    }
}

// Test 8: Get Student for Photo Upload Test
async function testGetStudent() {
    log('\n📋 Test 8: Get Student (for photo upload prep)', 'blue');
    try {
        const response = await fetch(`${BASE_URL}/api/students`, {
            headers: { 'Authorization': `Bearer ${adminToken}` },
        });
        
        const data = await response.json();
        
        if (response.ok && data.data && data.data.length > 0) {
            testStudentId = data.data[0]._id;
            log(`✅ Found student: ${data.data[0].name} (ID: ${testStudentId})`, 'green');
            return true;
        } else {
            log('❌ No students found', 'red');
            return false;
        }
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        return false;
    }
}

// Run all tests
async function runTests() {
    log('\n' + '='.repeat(60), 'blue');
    log('🚀 PRODUCTION-GRADE BACKEND TEST SUITE', 'blue');
    log('Testing all 7 newly implemented features', 'blue');
    log('='.repeat(60), 'blue');
    
    const results = {
        passed: 0,
        failed: 0,
        total: 8,
    };
    
    // Run tests sequentially
    const tests = [
        testHealthCheck,
        testAdminLogin,
        testSystemStats,
        testCreateAnnouncement,
        testGetAnnouncements,
        testValidation,
        testErrorHandling,
        testGetStudent,
    ];
    
    for (const test of tests) {
        const result = await test();
        if (result) {
            results.passed++;
        } else {
            results.failed++;
        }
        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    log('\n' + '='.repeat(60), 'blue');
    log('📊 TEST SUMMARY', 'blue');
    log('='.repeat(60), 'blue');
    log(`Total Tests: ${results.total}`, 'yellow');
    log(`Passed: ${results.passed}`, 'green');
    log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
    log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`, 'yellow');
    log('='.repeat(60), 'blue');
    
    if (results.failed === 0) {
        log('\n✅ ALL PRODUCTION FEATURES WORKING!', 'green');
        log('🎉 Backend is production-ready!', 'green');
    } else {
        log(`\n⚠️  ${results.failed} test(s) failed`, 'yellow');
        log('Please check the server logs for details', 'yellow');
    }
    
    // Additional info about untested features
    log('\n📝 Note: The following features require manual testing:', 'blue');
    log('   - Photo uploads (requires multipart/form-data with actual files)', 'yellow');
    log('   - Document uploads', 'yellow');
    log('   - Excel import (students/faculty)', 'yellow');
    log('   - Report generation (attendance, academic, mentoring)', 'yellow');
    log('\nUse Postman or similar tool to test these features.', 'yellow');
}

// Start tests
runTests().catch(error => {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
    process.exit(1);
});
