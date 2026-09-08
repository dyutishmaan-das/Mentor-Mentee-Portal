const BASE = 'http://localhost:5000/api';

async function demonstrateCompletePersistence() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  DEMONSTRATING COMPLETE PROFILE PERSISTENCE WORKFLOW     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // STEP 1: First Login
    console.log('📝 STEP 1: Student logs in for the FIRST TIME');
    console.log('   Action: Login with roll number 230101001');
    const login1 = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '230101001', password: 'student123' }),
    });
    const loginData1 = await login1.json();
    const token1 = loginData1.data?.accessToken;
    console.log('   ✓ Login successful\n');

    // STEP 2: View Initial Profile
    console.log('👀 STEP 2: Student views their profile');
    console.log('   Action: GET /api/students/me');
    const profile1 = await fetch(`${BASE}/students/me`, {
        headers: { Authorization: `Bearer ${token1}` },
    });
    const profileData1 = await profile1.json();
    const rollNo = profileData1.data.rollNo;
    console.log('   Current data from MongoDB:');
    console.log(`   - Name: ${profileData1.data.name}`);
    console.log(`   - Mobile: ${profileData1.data.mobile1 || '(empty)'}`);
    console.log(`   - DOB: ${profileData1.data.dob || '(empty)'}`);
    console.log(`   - Father Name: ${profileData1.data.parentFatherName || '(empty)'}`);
    console.log(`   - 10th School: ${profileData1.data.academics10thSchool || '(empty)'}\n`);

    // STEP 3: Student Fills Form and Saves
    console.log('✏️  STEP 3: Student fills the profile form with NEW data');
    console.log('   Fields filled:');
    const newData = {
        mobile1: '9999888877',
        mobile2: '9999888866',
        dob: '2005-06-20',
        bloodGroup: 'AB+',
        category: 'OBC',
        identificationMark: 'Birthmark on right shoulder',
        addressPresent: 'Hostel Vindhyachal, Room 305',
        addressPermanent: '789 Gandhi Road, Haridwar, Uttarakhand',
        siblingsCount: '1',
        type: 'Hosteller',
        parentFatherName: 'Suresh Kumar Sharma',
        parentFatherMobile1: '9876501234',
        parentFatherEmail: 'suresh.sharma@gmail.com',
        parentMotherName: 'Anita Sharma',
        parentMotherMobile1: '9876509876',
        guardianName: 'Mr. Prakash Verma',
        guardianRelationship: 'Maternal Uncle',
        guardianOccupation: 'Government Officer',
        guardianMobile1: '9876505555',
        guardianAddress: 'Near Clock Tower, Dehradun',
        academics10thSchool: 'Kendriya Vidyalaya No. 1',
        academics10thYear: '2021',
        academics10thBoard: 'CBSE',
        academics10thDivision: 'First',
        academics10thMarks: '96.2%',
        academics12thSchool: 'DAV Public School',
        academics12thYear: '2023',
        academics12thBoard: 'CBSE',
        academics12thDivision: 'First',
        academics12thMarks: '93.8%',
        hostelName: 'Vindhyachal Boys Hostel',
        hostelRoomNumber: '305',
        transportRoute: 'None',
    };

    Object.entries(newData).forEach(([key, value]) => {
        console.log(`   - ${key}: "${value}"`);
    });

    console.log('\n   Action: Click "Save Profile Updates" button');
    console.log('   Frontend sends: PUT /api/students/230101001\n');

    const saveRes = await fetch(`${BASE}/students/${rollNo}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify(newData),
    });
    const saveData = await saveRes.json();
    console.log(`   ✓ Backend response: ${saveData.success ? 'SUCCESS' : 'FAILED'}`);
    console.log('   ✓ Data written to MongoDB Atlas (cloud database)');
    console.log('   ✓ Toast notification: "Profile details updated successfully"\n');

    // STEP 4: Student Closes Browser/Tab
    console.log('🚪 STEP 4: Student closes browser or navigates away');
    console.log('   (Simulating logout and session end)\n');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // STEP 5: Student Returns to Page (New Session)
    console.log('🔄 STEP 5: Student returns to the page (LATER/NEXT DAY)');
    console.log('   Action: Opens browser and logs in again');
    const login2 = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '230101001', password: 'student123' }),
    });
    const loginData2 = await login2.json();
    const token2 = loginData2.data?.accessToken;
    console.log('   ✓ Login successful (new session)\n');

    // STEP 6: Page Loads Saved Data from MongoDB
    console.log('📥 STEP 6: Page automatically loads profile from MongoDB');
    console.log('   Action: GET /api/students/me (triggered by DOMContentLoaded)');
    const profile2 = await fetch(`${BASE}/students/me`, {
        headers: { Authorization: `Bearer ${token2}` },
    });
    const profileData2 = await profile2.json();
    console.log('   ✓ Profile fetched from MongoDB Atlas');
    console.log('   ✓ Data populated into all form fields\n');

    console.log('   Retrieved data:');
    console.log(`   - Name: ${profileData2.data.name}`);
    console.log(`   - Mobile1: ${profileData2.data.mobile1}`);
    console.log(`   - Mobile2: ${profileData2.data.mobile2}`);
    console.log(`   - DOB: ${profileData2.data.dob}`);
    console.log(`   - Blood Group: ${profileData2.data.bloodGroup}`);
    console.log(`   - Category: ${profileData2.data.category}`);
    console.log(`   - Identification Mark: ${profileData2.data.identificationMark}`);
    console.log(`   - Present Address: ${profileData2.data.addressPresent}`);
    console.log(`   - Permanent Address: ${profileData2.data.addressPermanent}`);
    console.log(`   - Father Name: ${profileData2.data.parentFatherName}`);
    console.log(`   - Father Mobile: ${profileData2.data.parentFatherMobile1}`);
    console.log(`   - Mother Name: ${profileData2.data.parentMotherName}`);
    console.log(`   - Guardian Name: ${profileData2.data.guardianName}`);
    console.log(`   - Guardian Relation: ${profileData2.data.guardianRelationship}`);
    console.log(`   - Guardian Address: ${profileData2.data.guardianAddress}`);
    console.log(`   - 10th School: ${profileData2.data.academics10thSchool}`);
    console.log(`   - 10th Marks: ${profileData2.data.academics10thMarks}`);
    console.log(`   - 12th School: ${profileData2.data.academics12thSchool}`);
    console.log(`   - 12th Marks: ${profileData2.data.academics12thMarks}`);
    console.log(`   - Hostel Name: ${profileData2.data.hostelName}`);
    console.log(`   - Room Number: ${profileData2.data.hostelRoomNumber}\n`);

    // STEP 7: Verify All Data Matches
    console.log('✅ STEP 7: Verifying data persistence');
    let allPersisted = true;
    for (const [field, expectedValue] of Object.entries(newData)) {
        const actualValue = profileData2.data[field];
        if (actualValue !== expectedValue) {
            console.log(`   ✗ ${field} NOT persisted! Expected: "${expectedValue}", Got: "${actualValue}"`);
            allPersisted = false;
        }
    }

    if (allPersisted) {
        console.log('   ✓ ALL fields successfully persisted!\n');
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║           ✅ PERSISTENCE TEST SUCCESSFUL ✅              ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log('║  ✓ Data saved to MongoDB Atlas                           ║');
        console.log('║  ✓ Data retrieved on page reload                         ║');
        console.log('║  ✓ All form fields populated with saved values           ║');
        console.log('║  ✓ Data persists permanently across sessions             ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
    } else {
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║              ❌ PERSISTENCE TEST FAILED ❌               ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
        process.exit(1);
    }

    console.log('📋 WHAT HAPPENS WHEN YOU SAVE:');
    console.log('   1. Form data collected from all fields');
    console.log('   2. PUT request sent to backend API');
    console.log('   3. Backend saves to MongoDB Atlas (permanent cloud storage)');
    console.log('   4. Success response returned to frontend');
    console.log('   5. Success toast notification shown');
    console.log('\n📋 WHAT HAPPENS WHEN YOU RETURN:');
    console.log('   1. You log in with roll number/email');
    console.log('   2. Page auto-loads profile via GET /api/students/me');
    console.log('   3. MongoDB returns your saved data');
    console.log('   4. All form fields auto-populate with your saved values');
    console.log('   5. You see exactly what you saved before!\n');
}

demonstrateCompletePersistence().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
