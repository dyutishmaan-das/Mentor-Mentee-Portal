const BASE = 'http://localhost:5000/api';

async function testProfilePersistence() {
    console.log('=== Testing Profile Data Persistence ===\n');

    // 1. Login as student
    console.log('Step 1: Logging in as student (roll number 230101001)...');
    const loginRes = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '230101001', password: 'student123' }),
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.accessToken;
    console.log('✓ Logged in successfully\n');

    // 2. Fetch current profile
    console.log('Step 2: Fetching current profile from MongoDB...');
    const beforeRes = await fetch(`${BASE}/students/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const beforeData = await beforeRes.json();
    const rollNo = beforeData.data.rollNo;
    console.log(`✓ Current profile for ${beforeData.data.name} (${rollNo})`);
    console.log(`  - Mobile: ${beforeData.data.mobile1 || 'Not set'}`);
    console.log(`  - Blood Group: ${beforeData.data.bloodGroup || 'Not set'}`);
    console.log(`  - Father Name: ${beforeData.data.parentFatherName || 'Not set'}`);
    console.log(`  - 10th School: ${beforeData.data.academics10thSchool || 'Not set'}\n`);

    // 3. Update profile with new data
    console.log('Step 3: Updating profile with new data...');
    const timestamp = new Date().toISOString();
    const updatePayload = {
        mobile1: '9876543210',
        mobile2: '9876543211',
        dob: '2005-04-15',
        bloodGroup: 'B+',
        category: 'General',
        identificationMark: 'Scar on left hand',
        addressPresent: 'Hostel Block A, Room 101',
        addressPermanent: '456 Park Street, Dehradun, UK',
        siblingsCount: '2',
        type: 'Hosteller',
        parentFatherName: 'Rajesh Kumar',
        parentFatherMobile1: '9876500001',
        parentFatherMobile2: '9876500002',
        parentFatherEmail: 'rajesh.kumar@email.com',
        parentMotherName: 'Priya Kumari',
        parentMotherMobile1: '9876500003',
        guardianName: 'Uncle Ram',
        guardianRelationship: 'Uncle',
        guardianOccupation: 'Teacher',
        guardianMobile1: '9876500005',
        academics10thSchool: 'Delhi Public School',
        academics10thYear: '2021',
        academics10thBoard: 'CBSE',
        academics10thDivision: 'First',
        academics10thMarks: '95.5%',
        academics12thSchool: 'St. Joseph Academy',
        academics12thYear: '2023',
        academics12thBoard: 'CBSE',
        academics12thDivision: 'First',
        academics12thMarks: '92.8%',
        hostelName: 'Nilgiri Hostel',
        hostelRoomNumber: '204',
        transportRoute: 'None',
    };

    const putRes = await fetch(`${BASE}/students/${rollNo}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
    });
    const putData = await putRes.json();
    console.log(`✓ Profile updated in MongoDB: ${putData.success ? 'SUCCESS' : 'FAILED'}`);
    if (!putData.success) {
        console.error('ERROR:', putData.message);
        process.exit(1);
    }
    console.log();

    // 4. Verify data was saved by fetching again
    console.log('Step 4: Verifying data was saved to MongoDB...');
    const verifyRes = await fetch(`${BASE}/students/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const verifyData = await verifyRes.json();
    console.log('✓ Fetched profile again from MongoDB');
    console.log(`  - Mobile1: ${verifyData.data.mobile1}`);
    console.log(`  - Mobile2: ${verifyData.data.mobile2}`);
    console.log(`  - Blood Group: ${verifyData.data.bloodGroup}`);
    console.log(`  - Category: ${verifyData.data.category}`);
    console.log(`  - Identification Mark: ${verifyData.data.identificationMark}`);
    console.log(`  - Address Present: ${verifyData.data.addressPresent}`);
    console.log(`  - Address Permanent: ${verifyData.data.addressPermanent}`);
    console.log(`  - Father Name: ${verifyData.data.parentFatherName}`);
    console.log(`  - Father Mobile1: ${verifyData.data.parentFatherMobile1}`);
    console.log(`  - Mother Name: ${verifyData.data.parentMotherName}`);
    console.log(`  - Guardian Name: ${verifyData.data.guardianName}`);
    console.log(`  - 10th School: ${verifyData.data.academics10thSchool}`);
    console.log(`  - 10th Marks: ${verifyData.data.academics10thMarks}`);
    console.log(`  - 12th School: ${verifyData.data.academics12thSchool}`);
    console.log(`  - Hostel Name: ${verifyData.data.hostelName}`);
    console.log(`  - Room Number: ${verifyData.data.hostelRoomNumber}\n`);

    // 5. Check all fields match
    const checks = [
        ['mobile1', '9876543210'],
        ['mobile2', '9876543211'],
        ['bloodGroup', 'B+'],
        ['category', 'General'],
        ['identificationMark', 'Scar on left hand'],
        ['addressPresent', 'Hostel Block A, Room 101'],
        ['addressPermanent', '456 Park Street, Dehradun, UK'],
        ['siblingsCount', '2'],
        ['type', 'Hosteller'],
        ['parentFatherName', 'Rajesh Kumar'],
        ['parentFatherMobile1', '9876500001'],
        ['parentMotherName', 'Priya Kumari'],
        ['guardianName', 'Uncle Ram'],
        ['academics10thSchool', 'Delhi Public School'],
        ['academics10thMarks', '95.5%'],
        ['academics12thSchool', 'St. Joseph Academy'],
        ['hostelName', 'Nilgiri Hostel'],
        ['hostelRoomNumber', '204'],
    ];

    console.log('Step 5: Validating all fields...');
    let allMatch = true;
    for (const [field, expected] of checks) {
        const actual = verifyData.data[field];
        const match = actual === expected;
        if (!match) {
            console.log(`  ✗ ${field}: expected "${expected}", got "${actual}"`);
            allMatch = false;
        } else {
            console.log(`  ✓ ${field}: "${actual}"`);
        }
    }

    console.log();
    if (allMatch) {
        console.log('═══════════════════════════════════════');
        console.log('✓✓✓ ALL TESTS PASSED ✓✓✓');
        console.log('═══════════════════════════════════════');
        console.log('Data is PERMANENTLY saved in MongoDB Atlas');
        console.log('and will appear whenever you log in again!');
        console.log('═══════════════════════════════════════');
    } else {
        console.log('✗✗✗ SOME TESTS FAILED ✗✗✗');
        process.exit(1);
    }
}

testProfilePersistence().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
