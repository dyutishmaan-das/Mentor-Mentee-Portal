const BASE = 'http://localhost:5000/api';

async function runTests() {
    let passed = 0;
    let failed = 0;

    function assert(cond, name) {
        if (cond) {
            console.log(`  ✓ ${name}`);
            passed++;
        } else {
            console.error(`  ✗ ${name}`);
            failed++;
        }
    }

    console.log('\n--- 1. Testing Health ---');
    const health = await (await fetch(`${BASE}/health`)).json();
    assert(health.success === true, 'Health check returns success: true');

    console.log('\n--- 2. Testing Admin Login ---');
    const adminLoginRes = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@mentormentee.local', password: 'Admin@12345' }),
    });
    const adminLogin = await adminLoginRes.json();
    assert(adminLogin.success === true, 'Admin login succeeded');
    assert(adminLogin.data?.accessToken, 'Access token returned in data.accessToken');
    assert(adminLogin.data?.user?.role === 'ADMIN', 'User role is ADMIN');
    const adminToken = adminLogin.data.accessToken;

    console.log('\n--- 3. Testing /api/students (with Admin token) ---');
    const studentsRes = await fetch(`${BASE}/students`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    const students = await studentsRes.json();
    assert(students.success === true, 'Students list returns success');
    assert(Array.isArray(students.data), 'Students is an array');
    assert(students.data.length >= 200, `Fetched ${students.data.length} students (>= 200)`);

    const firstStudent = students.data[0];
    console.log(`  Sample student: ${firstStudent.name} (${firstStudent.rollNo})`);
    console.log(`  Sample academics['Sem 1']:`, firstStudent.academics?.['Sem 1']);
    assert(firstStudent.academics?.['Sem 1'] !== undefined, 'academics["Sem 1"] is accessible as expected by frontend');
    assert(typeof firstStudent.academics?.['Sem 1']?.gpa === 'number', 'academics["Sem 1"].gpa is numeric');

    console.log('\n--- 4. Testing /api/students/:id ---');
    const studentDetailRes = await fetch(`${BASE}/students/${firstStudent.rollNo}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    const studentDetail = await studentDetailRes.json();
    assert(studentDetail.success === true, 'Student detail returns success');
    assert(studentDetail.data.rollNo === firstStudent.rollNo, 'Roll number matches');

    console.log('\n--- 5. Testing Mentee Login & /api/students/me ---');
    if (firstStudent.email) {
        const menteeLoginRes = await fetch(`${BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: firstStudent.email, password: 'student123' }),
        });
        const menteeLogin = await menteeLoginRes.json();
        assert(menteeLogin.success === true, `Mentee login for ${firstStudent.email} succeeded`);
        const menteeToken = menteeLogin.data.accessToken;

        const menteeMeRes = await fetch(`${BASE}/students/me`, {
            headers: { Authorization: `Bearer ${menteeToken}` },
        });
        const menteeMe = await menteeMeRes.json();
        assert(menteeMe.success === true, 'GET /api/students/me returns student record');
        assert(menteeMe.data.rollNo === firstStudent.rollNo, 'Student profile rollNo matches');
    }

    console.log('\n--- 6. Testing Token Refresh (POST /api/auth/refresh) ---');
    const refreshRes = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    const refreshData = await refreshRes.json();
    assert(refreshData.success === true, 'Token refresh returns success: true');
    assert(Boolean(refreshData.data?.accessToken), 'New access token received');

    console.log('\n--- 7. Testing Mentors & Assigned Mentees ---');
    const mentorsRes = await fetch(`${BASE}/mentors`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    const mentors = await mentorsRes.json();
    assert(mentors.success === true, 'GET /api/mentors returns success');
    assert(mentors.data.length > 0, `Found ${mentors.data.length} mentor(s)`);

    const mentor = mentors.data[0];
    const menteesRes = await fetch(`${BASE}/mentors/${mentor.id}/mentees`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    const mentees = await menteesRes.json();
    assert(mentees.success === true, `GET /api/mentors/${mentor.id}/mentees returns success`);
    assert(mentees.data.length > 0, `Mentor has ${mentees.data.length} assigned mentees`);

    console.log('\n--- 8. Testing RBAC: Academic Faculty attendance restriction ---');
    const facLoginRes = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'academic@demo.edu', password: 'demo123' }),
    });
    const facLogin = await facLoginRes.json();
    assert(facLogin.success === true, 'Academic Faculty logged in');
    const facToken = facLogin.data.accessToken;

    // Academic Faculty tries to save attendance -> must be 403
    const attAttempt = await fetch(`${BASE}/attendance`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${facToken}`,
        },
        body: JSON.stringify({
            studentId: firstStudent.rollNo,
            semester: 'Sem 1',
            attendance: 95,
        }),
    });
    assert(attAttempt.status === 403, 'Academic faculty is FORBIDDEN (403) from writing attendance');

    // Mentor tries to save attendance -> must be 200
    const mentorLoginRes = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'mentor@demo.edu', password: 'demo123' }),
    });
    const mentorLogin = await mentorLoginRes.json();
    assert(mentorLogin.success === true, 'Mentor logged in');
    const mentorToken = mentorLogin.data.accessToken;

    const mentorAttAttempt = await fetch(`${BASE}/attendance`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mentorToken}`,
        },
        body: JSON.stringify({
            studentId: firstStudent.rollNo,
            semester: 'Sem 1',
            attendance: 92,
        }),
    });
    assert(mentorAttAttempt.status === 200, 'Mentor is ALLOWED (200) to save attendance');

    console.log('\n--- 9. Testing Marks Update (PUT /api/marks) ---');
    const marksAttempt = await fetch(`${BASE}/marks`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${facToken}`,
        },
        body: JSON.stringify({
            studentId: firstStudent.rollNo,
            semester: 'Sem 1',
            marks: [
                { code: 'CS101', name: 'Programming Fundamentals', obtained: 88, total: 100 },
            ],
            gpa: 8.5,
        }),
    });
    const marksData = await marksAttempt.json();
    assert(marksAttempt.status === 200, 'Academic faculty can update marks');
    assert(marksData.success === true, 'Marks update returned success');

    console.log(`\n===============================`);
    console.log(`RESULTS: ${passed} passed, ${failed} failed`);
    console.log(`===============================\n`);

    if (failed > 0) process.exit(1);
    process.exit(0);
}

runTests().catch(err => {
    console.error('Test run failed:', err);
    process.exit(1);
});
