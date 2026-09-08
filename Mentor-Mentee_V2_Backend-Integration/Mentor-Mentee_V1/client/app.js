// Global constants for dropdown menus (universal college related details)
const COLLEGE_DETAILS = {
    courses: ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'MBA'],
    branches: [
        'Computer Science & Engineering',
        'Information Technology',
        'Electronics & Communication',
        'Electrical Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Management Studies'
    ],
    specializations: [
        'None',
        'Artificial Intelligence & Machine Learning',
        'Data Science',
        'Cyber Security',
        'Cloud Computing',
        'IoT',
        'VLSI Design'
    ],
    semesters: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'],
    batches: ['2023-2027', '2024-2028', '2025-2029', '2026-2030'],
    sections: ['A', 'B', 'C', 'D'],
    categories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    bloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    routes: ['Route 1 (Dehradun - HU)', 'Route 2 (Rishikesh - HU)', 'Route 3 (Roorkee - HU)', 'Route 4 (Haridwar Local)', 'None'],
    hostels: ['Nilgiri Hostel', 'Shivalik Hostel', 'Aravali Girls Hostel', 'Vindhyachal Boys Hostel', 'None']
};

// ============================================================
// ROLE & PERMISSION SYSTEM
// ============================================================

const FRONTEND_PERMISSIONS = {
    ADMIN: ['*'],

    HOD: [
        'STUDENT_READ',
        'ACADEMIC_READ',
        'ATTENDANCE_READ',
        'ATTENDANCE_OVERRIDE',
        'MENTORING_READ',
        'REPORT_READ'
    ],

    ACADEMIC_FACULTY: [
        'STUDENT_READ',
        'ACADEMIC_READ',
        'ACADEMIC_WRITE',
        'ATTENDANCE_READ',
        'REPORT_READ'
    ],

    MENTOR: [
        'STUDENT_ASSIGNED_READ',
        'MENTEE_READ',
        'ACADEMIC_ASSIGNED_READ',
        'ATTENDANCE_ASSIGNED_READ',
        'ATTENDANCE_WRITE',
        'MENTORING_READ',
        'MENTORING_WRITE',
        'REPORT_ASSIGNED_READ'
    ],

    OTHER_FACULTY: [
        'STUDENT_READ',
        'REPORT_READ'
    ],

    MENTEE: [
        'SELF_READ',
        'SELF_PROFILE_WRITE',
        'SELF_PORTFOLIO_WRITE',
        'ACADEMIC_SELF_READ',
        'ATTENDANCE_SELF_READ',
        'MENTORING_SELF_READ'
    ]
};

function hasFrontendPermission(permission) {
    const role = window.backendRole;

    if (!role) return false;

    const permissions =
        FRONTEND_PERMISSIONS[role] || [];

    return (
        permissions.includes('*') ||
        permissions.includes(permission)
    );
}

function isRole(role) {
    return window.backendRole === role;
}

// Default database seeding
const DEFAULT_DATABASE = {
    students: {
        'HU2023CSE089': {
            id: 'HU2023CSE089',
            password: 'student123',
            name: 'Rakshit',
            email: 'rakshit@haridwar.edu',
            course: 'B.Tech',
            branch: 'Computer Science & Engineering',
            specialization: 'Artificial Intelligence & Machine Learning',
            semester: 'Sem 6',
            batch: '2023-2027',
            section: 'A',
            category: 'General',
            dob: '2005-04-12',
            bloodGroup: 'B+',
            identificationMark: 'Mole on right cheek',
            mobile1: '9876543210',
            mobile2: '9876543211',
            addressPresent: 'HU Campus, Room 102, Shivalik Hostel, Haridwar',
            addressPermanent: 'Sector 4, Rohini, New Delhi - 110085',
            siblingsCount: '1',
            photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
            status: 'Active',
            type: 'Hosteller', // Hosteller or Day Scholar
            mentorId: 'MENTOR01',
            
            // Parent info
            parentFatherName: 'Mr. Suresh Kumar',
            parentFatherMobile1: '9876543212',
            parentFatherMobile2: '9876543213',
            parentFatherEmail: 'suresh@gmail.com',
            parentFatherPhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
            parentMotherName: 'Mrs. Sunita Devi',
            parentMotherMobile1: '9876543214',
            parentMotherMobile2: '9876543215',
            parentMotherEmail: 'sunita@gmail.com',
            parentMotherPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
            
            // Local Guardian
            guardianName: 'Mr. Rajesh Sharma',
            guardianRelationship: 'Uncle',
            guardianOccupation: 'Business Analyst',
            guardianAddress: 'Shivalik Nagar, Haridwar',
            guardianMobile1: '9876543216',
            guardianMobile2: '9876543217',
            guardianPhotoUrl: '',

            // Pre-university academics
            academics10thSchool: 'HU Public School',
            academics10thYear: '2021',
            academics10thBoard: 'CBSE',
            academics10thDivision: 'First',
            academics10thMarks: '92',
            academics12thSchool: 'HU Public School',
            academics12thYear: '2023',
            academics12thBoard: 'CBSE',
            academics12thDivision: 'First',
            academics12thMarks: '89',

            // Custom lists entered by Mentee
            hobbies: [
                { hobby: 'Coding', participation: 'Hackathons', awards: '1st in ByteCraft 2025' },
                { hobby: 'Debate', participation: 'Inter-College Debate', awards: 'Runner Up' }
            ],
            certifications: [
                { semester: 'Sem 4', duration: '6 Weeks', program: 'Full Stack React Developer', onlineOffline: 'Online', grade: 'A+', certificateAwarded: 'Yes' },
                { semester: 'Sem 5', duration: '8 Weeks', program: 'AI/ML Foundations', onlineOffline: 'Online', grade: 'A', certificateAwarded: 'Yes' }
            ],
            internships: [
                { driveDate: '2025-05-10', companyName: 'Infoxis Solutions', onOffCampus: 'Off Campus', appeared: 'Yes', outcome: 'Selected', designation: 'Web Dev Intern', projectTitle: 'HU Student Portal', externalGuide: 'Mr. Rohan Dev', internalGuide: 'Dr. Amit Sharma' }
            ],
            jobs: [
                { company: 'None', role: 'Student', duration: 'None', description: 'Currently studying' }
            ],
            clubActivities: [
                { year: '2024', club: 'Google Developer Student Clubs (GDSC)', responsibilities: 'Core Tech Team Member' },
                { year: '2025', club: 'Codechef Chapter', responsibilities: 'Lead Coordinator' }
            ],
            achievements: [
                { title: 'Smart India Hackathon', details: 'Selected for Grand Finale', category: 'Technical' }
            ],
            competitiveExams: [
                { date: '2026-02-15', examName: 'GATE CSE', conductingOrg: 'IIT', outcome: 'Appearing' }
            ],
            selfAssessments: [
                { semester: 'Sem 6', score1: 5, score2: 4, score3: 5, score4: 4, score5: 5, score6: 4, score7: 5 }
            ],

            // Institution Managed / Read-only Data (Enter by Admin/Mentor)
            academics: {
                'Sem 1': { gpa: 7.8, attendance: 82, marks: [{ code: 'HAS101', name: 'Mathematics-I', sessional1: 24, sessional2: 26, put: 42, internal: 40, external: 55, total: 100, obtained: 95 }] },
                'Sem 2': { gpa: 8.1, attendance: 85, marks: [{ code: 'HAS102', name: 'Physics', sessional1: 23, sessional2: 25, put: 40, internal: 38, external: 56, total: 100, obtained: 94 }] },
                'Sem 3': { gpa: 8.0, attendance: 90, marks: [{ code: 'TCS301', name: 'Data Structures', sessional1: 25, sessional2: 27, put: 45, internal: 42, external: 50, total: 100, obtained: 92 }] },
                'Sem 4': { gpa: 8.6, attendance: 90, marks: [{ code: 'TCS401', name: 'Operating Systems', sessional1: 28, sessional2: 28, put: 46, internal: 45, external: 52, total: 100, obtained: 97 }] },
                'Sem 5': { gpa: 8.15, attendance: 91, marks: [{ code: 'TCS501', name: 'Computer Networks', sessional1: 22, sessional2: 24, put: 38, internal: 40, external: 48, total: 100, obtained: 88 }] },
                'Sem 6': { gpa: 8.45, attendance: 88.5, marks: [{ code: 'TCS601', name: 'Compiler Design', sessional1: 26, sessional2: 27, put: 44, internal: 43, external: 51, total: 100, obtained: 94 }] },
                'Sem 7': { gpa: 0, attendance: 0, marks: [] },
                'Sem 8': { gpa: 0, attendance: 0, marks: [] }
            },
            backlogs: [],
            disciplinaryRecords: [],
            parentMeetings: [],
            interventions: []
        },
        'HU2023CSE090': {
            id: 'HU2023CSE090',
            password: 'student123',
            name: 'Anjali Bisht',
            email: 'anjali@haridwar.edu',
            course: 'B.Tech',
            branch: 'Computer Science & Engineering',
            specialization: 'Artificial Intelligence & Machine Learning',
            semester: 'Sem 6',
            batch: '2023-2027',
            section: 'B',
            category: 'OBC',
            dob: '2004-09-18',
            bloodGroup: 'O+',
            identificationMark: 'Scar on forehead',
            mobile1: '9876543220',
            mobile2: '9876543221',
            addressPresent: 'Day Scholar, Roorkee Road, Haridwar',
            addressPermanent: 'Roorkee Road, Haridwar',
            siblingsCount: '2',
            photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
            status: 'Active',
            type: 'Day Scholar',
            mentorId: 'MENTOR01',
            parentFatherName: 'Mr. Ramesh Bisht',
            parentFatherMobile1: '9876543222',
            parentFatherMobile2: '',
            parentFatherEmail: '',
            parentFatherPhotoUrl: '',
            parentMotherName: 'Mrs. Maya Bisht',
            parentMotherMobile1: '9876543224',
            parentMotherMobile2: '',
            parentMotherEmail: '',
            parentMotherPhotoUrl: '',
            guardianName: '',
            guardianRelationship: '',
            guardianOccupation: '',
            guardianAddress: '',
            guardianMobile1: '',
            guardianMobile2: '',
            guardianPhotoUrl: '',
            academics10thSchool: 'Mount Litera School',
            academics10thYear: '2021',
            academics10thBoard: 'ICSE',
            academics10thDivision: 'First',
            academics10thMarks: '94',
            academics12thSchool: 'Mount Litera School',
            academics12thYear: '2023',
            academics12thBoard: 'ISC',
            academics12thDivision: 'First',
            academics12thMarks: '91',
            hobbies: [{ hobby: 'Painting', participation: 'Exhibition', awards: 'Gold Medal' }],
            certifications: [{ semester: 'Sem 4', duration: '4 Weeks', program: 'UI/UX Design Masterclass', onlineOffline: 'Online', grade: 'O', certificateAwarded: 'Yes' }],
            internships: [],
            jobs: [],
            clubActivities: [],
            achievements: [],
            competitiveExams: [],
            selfAssessments: [],
            academics: {
                'Sem 1': { gpa: 8.5, attendance: 92, marks: [] },
                'Sem 2': { gpa: 8.9, attendance: 94, marks: [] },
                'Sem 3': { gpa: 8.7, attendance: 89, marks: [] },
                'Sem 4': { gpa: 9.0, attendance: 91, marks: [] },
                'Sem 5': { gpa: 8.8, attendance: 90, marks: [] },
                'Sem 6': { gpa: 8.95, attendance: 93.5, marks: [] },
                'Sem 7': { gpa: 0, attendance: 0, marks: [] },
                'Sem 8': { gpa: 0, attendance: 0, marks: [] }
            },
            backlogs: [],
            disciplinaryRecords: [],
            parentMeetings: [],
            interventions: []
        }
    },
    mentors: {
        'MENTOR01': {
            id: 'MENTOR01',
            password: 'mentor123',
            name: 'Dr. Amit Sharma',
            email: 'amit.sharma@haridwar.edu',
            department: 'Computer Science & Engineering',
            designation: 'Associate Professor',
            contact: '9876543299',
            period: '2023-Present',
            signatureUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100'
        }
    },
    faculties: {
        'FACULTY01': {
            id: 'FACULTY01',
            password: 'faculty123',
            name: 'Prof. Rajesh Verma',
            email: 'rajesh.verma@haridwar.edu',
            department: 'Computer Science & Engineering',
            designation: 'Academic Controller / Faculty',
            contact: '9876543210'
        }
    },
    admins: {
        'ADMIN01': {
            id: 'ADMIN01',
            password: 'admin123',
            name: 'HOD CSE (Admin)',
            email: 'admin@haridwar.edu',
            department: 'Computer Science & Engineering'
        }
    },
    sessions: [
        { id: 'SESS01', studentId: 'HU2023CSE089', mentorId: 'MENTOR01', date: '2026-08-01', time: '14:30', type: 'In Person', agenda: 'Discussing internship outcomes and Sem 6 project progress.', notes: 'Rakshit showed good interest in Web Development. Focused on completing his certifications.', actionItems: 'Finish compilation lab exercises.', status: 'Completed' },
        { id: 'SESS02', studentId: 'HU2023CSE089', mentorId: 'MENTOR01', date: '2026-08-10', time: '11:00', type: 'In Person', agenda: 'Midterm assessment review and attendance monitoring.', notes: 'Attendance is above 88%, which is great. Counseled regarding minor backlog fears.', actionItems: 'Keep studying Compiler Design.', status: 'Completed' }
    ],
    feedback: [], // Anonymous mentor feedback from students
};

// Database class — localStorage as primary (instant reads) + Google Sheets sync on every write
class DataStore {
    constructor() {
        if (!localStorage.getItem('hu_portal_db')) {
            localStorage.setItem('hu_portal_db', JSON.stringify(DEFAULT_DATABASE));
        }
        this._reload();
    }

    // Reload in-memory db from localStorage (called after SheetsAPI sync)
    _reload() {
        this.db = JSON.parse(localStorage.getItem('hu_portal_db'));
        if (!this.db.faculties) {
            this.db.faculties = DEFAULT_DATABASE.faculties;
            this.save();
        }
    }

    save() {
        localStorage.setItem('hu_portal_db', JSON.stringify(this.db));
    }

    // ---------- Student ----------
    getStudent(id) {
        if (!id) return null;
        if (this.db.students && this.db.students[id]) return this.db.students[id];
        if (this.db.students) {
            return Object.values(this.db.students).find(s => s.rollNo === id || s.id === id || s._id === id) || null;
        }
        return null;
    }
    getStudents() { return Object.values(this.db.students || {}); }
    async updateStudent(id, data) {
        const studentId = id || (data && (data.rollNo || data.id));
        if (!studentId) return null;
        const current = this.getStudent(studentId) || {};
        const merged = { ...current, ...data };
        const key = merged.rollNo || merged.id || studentId;
        if (!this.db.students) this.db.students = {};
        this.db.students[key] = merged;
        this.save();
        if (window.MentorAPI && window.MentorAPI.isAuthenticated()) {
            try {
                const res = await window.MentorAPI.updateStudent(key, data);
                if (res && res.data) {
                    this.db.students[key] = { ...this.db.students[key], ...res.data };
                    this.save();
                    return this.db.students[key];
                }
            } catch (err) {
                console.warn('Backend updateStudent error:', err);
            }
        }
        // Fire-and-forget: push to Google Sheets in background
        if (window.SheetsAPI) SheetsAPI.push('updateStudent', this.db.students[key]);
        return this.db.students[key];
    }

    // ---------- Mentor ----------
    getMentor(id) { return this.db.mentors[id]; }
    getMentors() { return Object.values(this.db.mentors); }
    updateMentor(id, data) {
        this.db.mentors[id] = { ...this.db.mentors[id], ...data };
        this.save();
        if (window.SheetsAPI) SheetsAPI.push('updateMentor', this.db.mentors[id]);
    }

    // ---------- Faculty ----------
    getFaculty(id) { return this.db.faculties ? this.db.faculties[id] : null; }
    getFaculties() { return this.db.faculties ? Object.values(this.db.faculties) : []; }
    updateFaculty(id, data) {
        if (!this.db.faculties) this.db.faculties = {};
        this.db.faculties[id] = { ...this.db.faculties[id], ...data };
        this.save();
    }

    // ---------- Admin ----------
    getAdmin(id) { return this.db.admins[id]; }

    // ---------- Sessions ----------
    getSessions() { return this.db.sessions; }
    addSession(session) {
        this.db.sessions.push(session);
        this.save();
        if (window.SheetsAPI) SheetsAPI.push('addSession', session);
    }

    // ---------- Feedback ----------
    addFeedback(fb) {
        this.db.feedback.push(fb);
        this.save();
        if (window.SheetsAPI) SheetsAPI.push('addFeedback', fb);
    }
    getFeedback() { return this.db.feedback; }
}

const store = new DataStore();

// Authentication State
let currentUser = null;
let currentRole = null; // frontend compatibility: student, faculty, mentor, admin
let backendRole = null; // ADMIN, HOD, ACADEMIC_FACULTY, MENTOR, OTHER_FACULTY, MENTEE
let selectedStudentForMentor = null; // Mentee ID being reviewed by Mentor
let selectedStudentForAdmin = null; // Student ID being reviewed by Admin
let charts = {}; // References to ChartJS instances

// Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} fade-in`;
    
    let icon = '';
    if (type === 'success') icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    else if (type === 'error') icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    else icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 50);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Universal Select Populator
function populateDropdowns() {
    const populate = (id, options) => {
        const select = document.getElementById(id);
        if (select) {
            const currentVal = select.value;
            select.innerHTML = '';
            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                select.appendChild(option);
            });
            if (currentVal && options.includes(currentVal)) {
                select.value = currentVal;
            }
        }
    };

    populate('student-course', COLLEGE_DETAILS.courses);
    populate('student-branch', COLLEGE_DETAILS.branches);
    populate('student-specialization', COLLEGE_DETAILS.specializations);
    populate('student-semester', COLLEGE_DETAILS.semesters);
    populate('student-batch', COLLEGE_DETAILS.batches);
    populate('student-section', COLLEGE_DETAILS.sections);
    populate('student-category', COLLEGE_DETAILS.categories);
    populate('student-blood', COLLEGE_DETAILS.bloodGroups);
    populate('student-route', COLLEGE_DETAILS.routes);
    populate('student-hostel', COLLEGE_DETAILS.hostels);
}

// Login Controller — Auto-detects user role based on ID & password
function initLogin() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailOrId = document.getElementById('login-id').value.trim();
        const pass = document.getElementById('login-password').value;

        if (!emailOrId || !pass) {
            showToast('Please enter both User ID / Email and Password', 'error');
            return;
        }

        // Authentication is now handled by the College Management backend.
        // The old hard-coded/localStorage credential check has been removed.
        try {
            const email = emailOrId.includes('@')
                ? emailOrId
                : ({
                    'ADMIN01': 'admin@demo.edu',
                    'HOD01': 'hod@demo.edu',
                    'FACULTY01': 'academic@demo.edu',
                    'MENTOR01': 'mentor@demo.edu',
                    'STUDENT01': 'student@demo.edu'
                }[emailOrId] || emailOrId);

            const user = await MentorAPI.login(email, pass);
            await activateUserSession(user);
            showToast(`Logged in successfully as ${currentUser.name}`);
        } catch (error) {
            console.error(error);
            showToast(error.message || 'Login failed', 'error');
        }
    });
}

// Universal session activation (used on login and on page reload/refresh)
async function activateUserSession(user) {
    currentUser = user;
    currentRole = user.role;
    window.backendRole = user.backendRole;

    // Load the real student profile or full student list where applicable.
    if (user.backendRole === 'MENTEE') {
        try {
            const profile = await MentorAPI.studentMe();
            if (profile && profile.data) {
                currentUser = { ...currentUser, ...profile.data };
                const sid = profile.data.id || profile.data.rollNo;
                store.db.students[sid] = profile.data;
                store.save();
            }
        } catch (profileError) {
            console.warn('Student profile could not be loaded:', profileError);
        }
    } else {
        try {
            const studentsRes = await MentorAPI.students();
            if (studentsRes && studentsRes.data && Array.isArray(studentsRes.data)) {
                store.db.students = {};
                for (const s of studentsRes.data) {
                    const sid = s.id || s.rollNo;
                    store.db.students[sid] = s;
                }
                store.save();
            }
        } catch (err) {
            console.warn('Could not load student list from backend:', err);
        }
    }

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'grid';

    const badge = document.getElementById('portal-badge');
    function getPortalBadgeTitle() {
        if (window.backendRole === 'HOD' || currentRole === 'hod') {
            return `HOD Portal — ${currentUser?.department || 'Department'}`;
        }
        if (window.backendRole === 'ADMIN' || currentRole === 'admin') {
            return 'System Admin Portal';
        }
        if (window.backendRole === 'ACADEMIC_FACULTY') {
            return 'Academic Faculty Portal';
        }
        if (window.backendRole === 'MENTOR' || currentRole === 'mentor') {
            return 'Mentor Portal';
        }
        if (window.backendRole === 'MENTEE' || currentRole === 'student') {
            return 'Mentee Portal';
        }
        return 'Portal';
    }
    badge.textContent = getPortalBadgeTitle();

    renderSidebar();
    applyAccessModelPermissions(currentRole);
    initNavigation();

    // Restore previously active view tab or default to first link
    const savedView = localStorage.getItem('mm_active_view');
    let targetLink = null;
    if (savedView) {
        targetLink = document.querySelector(`.nav-link[data-view="${savedView}"]`);
    }
    if (!targetLink) {
        targetLink = document.querySelector('.nav-link');
    }
    if (targetLink) {
        targetLink.click();
    }
}

function loginSuccess(user, role) {
    currentUser = user;
    currentRole = role;
    showToast(`Logged in successfully as ${user.name}`);
    
    // Hide login screen, show application layout
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'grid';

    // Set portal badge
    const badge = document.getElementById('portal-badge');
    if (window.backendRole === 'HOD' || role === 'hod') {
        badge.textContent = `HOD Portal — ${user.department || 'Department'}`;
    } else if (window.backendRole === 'ADMIN' || role === 'admin') {
        badge.textContent = 'System Admin Portal';
    } else if (window.backendRole === 'ACADEMIC_FACULTY') {
        badge.textContent = 'Academic Faculty Portal';
    } else if (window.backendRole === 'MENTOR' || role === 'mentor') {
        badge.textContent = 'Mentor Portal';
    } else {
        badge.textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} Portal`;
    }

    // Render Side bar Profile & Nav
    renderSidebar();
    
    // Apply granular field permissions based on access model
    applyAccessModelPermissions(role);

    // Setup Navigation Routing
    initNavigation();
    
    // Go to first screen (Overview)
    document.querySelector('.nav-link').click();

    // Check if user requires password change (first login with temp password)
    if (user.requirePasswordChange) {
        showForcePasswordChangeModal();
    }
}

function showForcePasswordChangeModal() {
    const modal = document.getElementById('modal-force-password-change');
    if (!modal) return;
    modal.classList.add('active');

    const form = document.getElementById('form-force-password-change');
    const errorDiv = document.getElementById('force-password-error');

    form.onsubmit = async (e) => {
        e.preventDefault();
        errorDiv.style.display = 'none';

        const curPass = document.getElementById('force-current-password').value;
        const newPass = document.getElementById('force-new-password').value;
        const confirmPass = document.getElementById('force-confirm-password').value;

        if (newPass.length < 8) {
            errorDiv.textContent = 'New password must be at least 8 characters long';
            errorDiv.style.display = 'block';
            return;
        }

        if (newPass !== confirmPass) {
            errorDiv.textContent = 'New passwords do not match';
            errorDiv.style.display = 'block';
            return;
        }

        const btn = document.getElementById('btn-submit-force-password');
        btn.disabled = true;
        btn.textContent = 'Updating Password…';

        try {
            await MentorAPI.changePassword(curPass, newPass);
            showToast('Password updated successfully! Welcome to your portal.');
            modal.classList.remove('active');
            if (currentUser) currentUser.requirePasswordChange = false;
        } catch (err) {
            errorDiv.textContent = err.message || 'Failed to update password. Please check your temporary password.';
            errorDiv.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Update Password & Continue to Portal';
        }
    };
}

function renderSidebar() {
    const profileCard = document.getElementById('sidebar-profile-card');
    
    if (currentRole === 'student') {
        const studentTypeTag = currentUser.type === 'Hosteller' ? 
            `<span class="badge-tag badge-hosteller">Hosteller</span>` : 
            `<span class="badge-tag badge-scholar">Day Scholar</span>`;
        
        const sectionBadge = currentUser.section
            ? `<span class="badge-tag" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-weight: 600;">Sec ${currentUser.section}</span>`
            : `<span class="badge-tag" style="background: rgba(234, 88, 12, 0.15); color: #ea580c; font-weight: 500;">Pending Section</span>`;

        profileCard.innerHTML = `
            <div class="avatar-wrapper">
                <img class="profile-avatar" src="${currentUser.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}" alt="Avatar">
            </div>
            <div class="profile-name">${currentUser.name}</div>
            <div class="profile-dept">${currentUser.rollNo ? `<span style="font-weight:600; color:var(--primary-light);">Roll No: ${currentUser.rollNo}</span><br>` : ''}${currentUser.course || 'B.Tech'} ${currentUser.branch || ''} - ${currentUser.semester || ''}</div>
            <div class="profile-tags">
                <span class="badge-tag badge-active">${currentUser.status}</span>
                ${sectionBadge}
                ${studentTypeTag}
            </div>
        `;
    } else if (currentRole === 'faculty') {
        profileCard.innerHTML = `
            <div class="avatar-wrapper">
                <img class="profile-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" alt="Avatar">
            </div>
            <div class="profile-name">${currentUser.name}</div>
            <div class="profile-dept">${currentUser.designation}</div>
            <div class="profile-tags">
                <span class="badge-tag badge-active" style="background: rgba(2, 132, 199, 0.15); color: #0284c7;">${currentUser.department}</span>
            </div>
        `;
    } else if (currentRole === 'mentor') {
        profileCard.innerHTML = `
            <div class="avatar-wrapper">
                <img class="profile-avatar" src="${currentUser.signatureUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'}" alt="Avatar">
            </div>
            <div class="profile-name">${currentUser.name}</div>
            <div class="profile-dept">${currentUser.designation}</div>
            <div class="profile-tags">
                <span class="badge-tag badge-active">${currentUser.department}</span>
            </div>
        `;
    } else if (window.backendRole === 'HOD' || currentRole === 'hod') {
        profileCard.innerHTML = `
            <div class="avatar-wrapper">
                <img class="profile-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" alt="Avatar">
            </div>
            <div class="profile-name">${currentUser.name}</div>
            <div class="profile-dept">${currentUser.designation || 'Head of Department'}</div>
            <div class="profile-tags">
                <span class="badge-tag badge-active" style="background: rgba(147, 51, 234, 0.15); color: #7e22ce;">🏢 ${currentUser.department || 'Department HOD'}</span>
            </div>
        `;
    } else { // System Admin
        profileCard.innerHTML = `
            <div class="avatar-wrapper">
                <img class="profile-avatar" src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150" alt="Avatar">
            </div>
            <div class="profile-name">${currentUser.name}</div>
            <div class="profile-dept">System Administrator</div>
            <div class="profile-tags">
                <span class="badge-tag badge-active" style="background: rgba(37, 99, 235, 0.15); color: #2563eb;">🏛️ Central Administration</span>
            </div>
        `;
    }

    // Build sidebar menu links based on role
    const navMenu = document.getElementById('sidebar-nav-menu');
    navMenu.innerHTML = '';

    const addLink = (viewId, label, iconSvg) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#" class="nav-link" data-view="${viewId}">
                ${iconSvg}
                <span>${label}</span>
            </a>
        `;
        navMenu.appendChild(li);
    };

    const overviewIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>`;
    const profileIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></circle><circle cx="12" cy="7" r="4"></circle></svg>`;
    const academicsIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>`;
    const sessionsIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
    const activitiesIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`;
    const feedbackIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></svg>`;
    const allotmentIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>`;

    // ============================================================
// ROLE-BASED SIDEBAR
// ============================================================

if (window.backendRole === 'MENTEE') {

    addLink(
        'student-overview',
        'Overview',
        overviewIcon
    );

    addLink(
        'student-profile',
        'My Profile',
        profileIcon
    );

    addLink(
        'student-academics',
        'Academic Records',
        academicsIcon
    );

    addLink(
        'student-sessions',
        'Mentoring Sessions',
        sessionsIcon
    );

    addLink(
        'student-activities',
        'Activities & Achievements',
        activitiesIcon
    );

} else if (window.backendRole === 'MENTOR') {

    addLink(
        'mentor-dashboard',
        'My Mentees',
        overviewIcon
    );

    addLink(
        'mentor-sessions',
        'Mentoring Sessions',
        sessionsIcon
    );

    addLink(
        'mentor-attendance',
        'Attendance',
        academicsIcon
    );

    addLink(
        'mentor-profile-view',
        'My Profile',
        profileIcon
    );

} else if (
    window.backendRole === 'ACADEMIC_FACULTY'
) {

    addLink(
        'faculty-manage',
        'Academic Records',
        academicsIcon
    );

    addLink(
        'admin-dashboard',
        'Student Directory',
        overviewIcon
    );

    // Attendance is VIEW ONLY for Academic Faculty.
    addLink(
        'faculty-attendance-view',
        'Attendance',
        academicsIcon
    );

} else if (
    window.backendRole === 'OTHER_FACULTY'
) {

    addLink(
        'admin-dashboard',
        'Student Directory',
        overviewIcon
    );

} else if (
    window.backendRole === 'HOD' || currentRole === 'hod'
) {

    addLink(
        'admin-dashboard',
        'Department Overview',
        overviewIcon
    );

    addLink(
        'hod-section-allotment',
        'Section Allotment',
        allotmentIcon
    );

    addLink(
        'admin-invite-links',
        'Department Invites',
        sessionsIcon
    );

    addLink(
        'admin-pending-registrations',
        'Pending Approvals',
        profileIcon
    );

    addLink(
        'faculty-manage',
        'Academic Records',
        academicsIcon
    );

    addLink(
        'admin-attendance',
        'Attendance',
        academicsIcon
    );

    addLink(
        'admin-feedback',
        'Mentoring & Feedback',
        feedbackIcon
    );

} else if (
    window.backendRole === 'ADMIN' || currentRole === 'admin'
) {

    addLink(
        'admin-dashboard',
        'Institution Overview',
        overviewIcon
    );

    addLink(
        'hod-section-allotment',
        'Section Allotments',
        allotmentIcon
    );

    addLink(
        'admin-invite-links',
        'Registration Links',
        sessionsIcon
    );

    addLink(
        'admin-pending-registrations',
        'Pending Registrations',
        profileIcon
    );

    addLink(
        'admin-manage',
        'Student Records',
        profileIcon
    );

    addLink(
        'faculty-manage',
        'Academic Management',
        academicsIcon
    );

    addLink(
        'admin-attendance',
        'Attendance',
        academicsIcon
    );

    addLink(
        'admin-feedback',
        'Mentoring & Feedback',
        feedbackIcon
    );

}
}

// Navigation router
function initNavigation() {
    const links = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.view-section');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const viewId = link.dataset.view;
            localStorage.setItem('mm_active_view', viewId);
            sections.forEach(sec => sec.classList.remove('active'));
            
            const targetSection = document.getElementById(viewId);
            if (targetSection) {
                targetSection.classList.add('active');
                // Trigger view rendering logic
                handleViewChange(viewId);
            }
        });
    });
}

function handleViewChange(viewId) {
    if (viewId === 'student-overview') {
        renderStudentOverview(currentUser);
    } else if (viewId === 'student-profile') {
        renderStudentProfileForm(currentUser);
    } else if (viewId === 'student-academics') {
        renderStudentAcademics(currentUser);
    } else if (viewId === 'student-sessions') {
        renderStudentSessions(currentUser);
    } else if (viewId === 'student-activities') {
        renderStudentActivities(currentUser);
    } else if (viewId === 'mentor-dashboard') {
        renderMentorMentees();
    } else if (viewId === 'mentor-sessions') {
        renderMentorSessionForm();
    } else if (viewId === 'mentor-profile-view') {
        renderMentorProfileForm();
    } else if (viewId === 'admin-dashboard') {
        renderAdminDashboard();
    } else if (viewId === 'admin-invite-links') {
        renderAdminInviteLinksView();
    } else if (viewId === 'admin-pending-registrations') {
        renderAdminPendingRegistrationsView();
    } else if (viewId === 'hod-section-allotment') {
        renderSectionAllotmentView();
    } else if (viewId === 'faculty-manage') {
        renderFacultyManageView();
    } else if (viewId === 'admin-manage') {
        renderAdminManageView();
    } else if (viewId === 'admin-feedback') {
        renderAdminFeedbackView();
    }
}

// Theme Toggler
function initTheme() {
    const storedTheme = localStorage.getItem('hu_portal_theme') || 'light';
    document.documentElement.setAttribute('data-theme', storedTheme);
    updateThemeIcon(storedTheme);

    const toggleBtn = document.getElementById('theme-toggle');
    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('hu_portal_theme', newTheme);
        updateThemeIcon(newTheme);
        showToast(`Switched to ${newTheme} mode`, 'info');
        
        // Re-render active charts to update grid color
        const activeView = document.querySelector('.nav-link.active')?.dataset.view;
        if (activeView === 'student-overview' || activeView === 'mentor-student-review') {
            const studentId = currentRole === 'student' ? currentUser.id : selectedStudentForMentor;
            if (studentId) {
                setTimeout(() => renderOverviewCharts(store.getStudent(studentId)), 200);
            }
        }
    });
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (theme === 'dark') {
        icon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path></svg>`;
    } else {
        icon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
}

// ----------------------------------------------------
// 1. STUDENT/MENTEE VIEWS
// ----------------------------------------------------

function calculateCGPA(student) {
    let semesters = Object.values(student.academics);
    let validSems = semesters.filter(s => s.gpa > 0);
    if (validSems.length === 0) return '0.00';
    let total = validSems.reduce((acc, curr) => acc + curr.gpa, 0);
    return (total / validSems.length).toFixed(2);
}

function calculateAttendance(student) {
    let semesters = Object.values(student.academics);
    let validSems = semesters.filter(s => s.attendance > 0);
    if (validSems.length === 0) return '0.0%';
    let total = validSems.reduce((acc, curr) => acc + curr.attendance, 0);
    return (total / validSems.length).toFixed(1) + '%';
}

function getActiveBacklogsCount(student) {
    return student.backlogs ? student.backlogs.filter(b => !b.clearDate).length : 0;
}

function renderStudentOverview(student) {
    const kpiSessions = document.getElementById('student-kpi-sessions');
    const kpiCgpa = document.getElementById('student-kpi-cgpa');
    const kpiAttendance = document.getElementById('student-kpi-attendance');
    const kpiBacklogs = document.getElementById('student-kpi-backlogs');

    // Profile incomplete banner check
    const warningBanner = document.getElementById('student-profile-warning-banner');
    if (warningBanner) {
        if (student && student.profileCompleted === false) {
            warningBanner.style.display = 'flex';
            const btnGoto = document.getElementById('btn-goto-profile');
            if (btnGoto) {
                btnGoto.onclick = () => {
                    const profileLink = document.querySelector('.nav-link[data-view="student-profile"]');
                    if (profileLink) profileLink.click();
                };
            }
        } else {
            warningBanner.style.display = 'none';
        }
    }

    // Section pending banner check
    const sectionPendingBanner = document.getElementById('student-section-pending-banner');
    if (sectionPendingBanner) {
        if (student && student.profileCompleted && (!student.section || !student.section.trim())) {
            sectionPendingBanner.style.display = 'flex';
        } else {
            sectionPendingBanner.style.display = 'none';
        }
    }

    // Count completed sessions for this student
    const studentSessions = store.getSessions().filter(s => s.studentId === student.id && s.status === 'Completed');
    kpiSessions.textContent = studentSessions.length;

    kpiCgpa.textContent = calculateCGPA(student);
    kpiAttendance.textContent = calculateAttendance(student);
    kpiBacklogs.textContent = getActiveBacklogsCount(student);

    renderOverviewCharts(student);
}

function renderOverviewCharts(student) {
    // Destroy previous chart instances
    if (charts.cgpa) charts.cgpa.destroy();
    if (charts.attendance) charts.attendance.destroy();

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#9ca3af' : '#64748b';

    const semLabels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
    const gpaData = semLabels.map(sem => student.academics[sem]?.gpa || 0);
    const attData = semLabels.map(sem => student.academics[sem]?.attendance || 0);

    // Filter labels to only show up to current filled semesters (where gpa > 0 or attendance > 0)
    let maxIdx = 0;
    for (let i = 0; i < semLabels.length; i++) {
        if (gpaData[i] > 0 || attData[i] > 0) maxIdx = i;
    }
    const filteredLabels = semLabels.slice(0, maxIdx + 1);
    const filteredGpa = gpaData.slice(0, maxIdx + 1);
    const filteredAtt = attData.slice(0, maxIdx + 1);

    // Line Chart: GPA Trend
    const ctxGpa = document.getElementById('cgpaChart').getContext('2d');
    charts.cgpa = new Chart(ctxGpa, {
        type: 'line',
        data: {
            labels: filteredLabels,
            datasets: [{
                label: 'GPA / SGPA',
                data: filteredGpa,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#1e40af',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { min: 0, max: 10, grid: { color: gridColor }, ticks: { color: textColor } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            }
        }
    });

    // Bar Chart: Attendance Trend
    const ctxAtt = document.getElementById('attendanceChart').getContext('2d');
    charts.attendance = new Chart(ctxAtt, {
        type: 'bar',
        data: {
            labels: filteredLabels,
            datasets: [{
                label: 'Attendance %',
                data: filteredAtt,
                backgroundColor: '#10b981',
                borderRadius: 6,
                maxBarThickness: 35
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { min: 0, max: 100, grid: { color: gridColor }, ticks: { color: textColor } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            }
        }
    });
}

function renderStudentProfileForm(student) {
    populateDropdowns();

    // Fill form inputs
    document.getElementById('student-id-field').value = student.rollNo || student.id || '';
    document.getElementById('student-name').value = student.name || '';
    document.getElementById('student-email').value = student.email || '';
    document.getElementById('student-course').value = student.course || 'B.Tech';
    document.getElementById('student-branch').value = student.branch || 'Computer Science & Engineering';
    document.getElementById('student-specialization').value = student.specialization || 'None';
    document.getElementById('student-semester').value = student.semester || 'Sem 1';
    document.getElementById('student-batch').value = student.batch || '2023-2027';
    const sectionSelect = document.getElementById('student-section');
    if (sectionSelect) {
        if (student.section && student.section.trim()) {
            sectionSelect.value = student.section.trim();
        } else {
            let pendingOption = sectionSelect.querySelector('option[value=""]');
            if (!pendingOption) {
                pendingOption = document.createElement('option');
                pendingOption.value = '';
                pendingOption.textContent = '⏳ Pending HOD Allotment';
                sectionSelect.prepend(pendingOption);
            }
            sectionSelect.value = '';
        }
    }
    document.getElementById('student-category').value = student.category || 'General';
    document.getElementById('student-dob').value = student.dob || '';
    document.getElementById('student-blood').value = student.bloodGroup || 'A+';
    document.getElementById('student-mark').value = student.identificationMark || '';
    document.getElementById('student-phone1').value = student.mobile1 || '';
    document.getElementById('student-phone2').value = student.mobile2 || '';
    document.getElementById('student-addr-present').value = student.addressPresent || '';
    document.getElementById('student-addr-perm').value = student.addressPermanent || '';
    document.getElementById('student-siblings').value = student.siblingsCount || '0';
    // Note: student-photo-url field was removed from UI, photos now uploaded via separate interface
    document.getElementById('student-type').value = student.type || 'Day Scholar';

    // Parent details
    document.getElementById('parent-father-name').value = student.parentFatherName || '';
    document.getElementById('parent-father-phone1').value = student.parentFatherMobile1 || '';
    document.getElementById('parent-father-phone2').value = student.parentFatherMobile2 || '';
    document.getElementById('parent-father-email').value = student.parentFatherEmail || '';
    document.getElementById('parent-father-photo').value = student.parentFatherPhotoUrl || '';
    document.getElementById('parent-mother-name').value = student.parentMotherName || '';
    document.getElementById('parent-mother-phone1').value = student.parentMotherMobile1 || '';
    document.getElementById('parent-mother-phone2').value = student.parentMotherMobile2 || '';
    document.getElementById('parent-mother-email').value = student.parentMotherEmail || '';
    document.getElementById('parent-mother-photo').value = student.parentMotherPhotoUrl || '';

    // Local Guardian
    document.getElementById('guardian-name').value = student.guardianName || '';
    document.getElementById('guardian-relation').value = student.guardianRelationship || '';
    document.getElementById('guardian-occupation').value = student.guardianOccupation || '';
    document.getElementById('guardian-addr').value = student.guardianAddress || '';
    document.getElementById('guardian-phone1').value = student.guardianMobile1 || '';
    document.getElementById('guardian-phone2').value = student.guardianMobile2 || '';

    // Pre-uni
    document.getElementById('pre-10-school').value = student.academics10thSchool || '';
    document.getElementById('pre-10-year').value = student.academics10thYear || '';
    document.getElementById('pre-10-board').value = student.academics10thBoard || '';
    document.getElementById('pre-10-division').value = student.academics10thDivision || 'First';
    document.getElementById('pre-10-marks').value = student.academics10thMarks || '';
    document.getElementById('pre-12-school').value = student.academics12thSchool || '';
    document.getElementById('pre-12-year').value = student.academics12thYear || '';
    document.getElementById('pre-12-board').value = student.academics12thBoard || '';
    document.getElementById('pre-12-division').value = student.academics12thDivision || 'First';
    document.getElementById('pre-12-marks').value = student.academics12thMarks || '';

    // Transport/Hostel inputs
    document.getElementById('student-route').value = student.transportRoute || 'None';
    document.getElementById('student-hostel').value = student.hostelName || 'None';
    document.getElementById('student-room').value = student.hostelRoomNumber || '';

    // Handle student type toggle (Hosteller/Day Scholar)
    const toggleInstitutionalInputs = () => {
        const isHosteller = document.getElementById('student-type').value === 'Hosteller';
        const hostelGroup = document.getElementById('hostel-fields-group');
        const transportGroup = document.getElementById('transport-fields-group');
        if (hostelGroup) hostelGroup.style.display = isHosteller ? 'block' : 'none';
        if (transportGroup) transportGroup.style.display = isHosteller ? 'none' : 'block';
    };
    document.getElementById('student-type').addEventListener('change', toggleInstitutionalInputs);
    toggleInstitutionalInputs();

    // Disable role fields (Course, Branch, Section, Semester) if NOT Admin or Mentor
    const inputsToLock = ['student-course', 'student-branch', 'student-semester', 'student-section', 'student-batch'];
    inputsToLock.forEach(id => {
        document.getElementById(id).disabled = (currentRole === 'student');
    });

    // Handle Form Submit
    const form = document.getElementById('student-profile-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const updatedData = {
            name: document.getElementById('student-name').value,
            email: document.getElementById('student-email').value,
            specialization: document.getElementById('student-specialization').value,
            category: document.getElementById('student-category').value,
            dob: document.getElementById('student-dob').value,
            bloodGroup: document.getElementById('student-blood').value,
            identificationMark: document.getElementById('student-mark').value,
            mobile1: document.getElementById('student-phone1').value,
            mobile2: document.getElementById('student-phone2').value,
            addressPresent: document.getElementById('student-addr-present').value,
            addressPermanent: document.getElementById('student-addr-perm').value,
            siblingsCount: document.getElementById('student-siblings').value,
            photoUrl: document.getElementById('student-photo-url').value,
            type: document.getElementById('student-type').value,

            // Parent details
            parentFatherName: document.getElementById('parent-father-name').value,
            parentFatherMobile1: document.getElementById('parent-father-phone1').value,
            parentFatherMobile2: document.getElementById('parent-father-phone2').value,
            parentFatherEmail: document.getElementById('parent-father-email').value,
            parentFatherPhotoUrl: document.getElementById('parent-father-photo').value,
            parentMotherName: document.getElementById('parent-mother-name').value,
            parentMotherMobile1: document.getElementById('parent-mother-phone1').value,
            parentMotherMobile2: document.getElementById('parent-mother-phone2').value,
            parentMotherEmail: document.getElementById('parent-mother-email').value,
            parentMotherPhotoUrl: document.getElementById('parent-mother-photo').value,

            // Local Guardian
            guardianName: document.getElementById('guardian-name').value,
            guardianRelationship: document.getElementById('guardian-relation').value,
            guardianOccupation: document.getElementById('guardian-occupation').value,
            guardianAddress: document.getElementById('guardian-addr').value,
            guardianMobile1: document.getElementById('guardian-phone1').value,
            guardianMobile2: document.getElementById('guardian-phone2').value,

            // Pre-uni
            academics10thSchool: document.getElementById('pre-10-school').value,
            academics10thYear: document.getElementById('pre-10-year').value,
            academics10thBoard: document.getElementById('pre-10-board').value,
            academics10thDivision: document.getElementById('pre-10-division').value,
            academics10thMarks: document.getElementById('pre-10-marks').value,
            academics12thSchool: document.getElementById('pre-12-school').value,
            academics12thYear: document.getElementById('pre-12-year').value,
            academics12thBoard: document.getElementById('pre-12-board').value,
            academics12thDivision: document.getElementById('pre-12-division').value,
            academics12thMarks: document.getElementById('pre-12-marks').value,

            // Transport/Hostel
            transportRoute: document.getElementById('student-route').value,
            hostelName: document.getElementById('student-hostel').value,
            hostelRoomNumber: document.getElementById('student-room').value,
        };

        // If Admin or Mentor, allowed to change institutional fields
        if (currentRole !== 'student') {
            updatedData.course = document.getElementById('student-course').value;
            updatedData.branch = document.getElementById('student-branch').value;
            updatedData.semester = document.getElementById('student-semester').value;
            updatedData.section = document.getElementById('student-section').value;
            updatedData.batch = document.getElementById('student-batch').value;
        }

        const sid = student.rollNo || student.id || (currentUser && (currentUser.rollNo || currentUser.id));
        let updated = null;
        if (currentRole === 'student') {
            try {
                const completeRes = await MentorAPI.completeStudentProfile(updatedData);
                if (completeRes && completeRes.data) {
                    updated = completeRes.data;
                }
            } catch (err) {
                console.warn('Profile complete endpoint notice:', err.message);
                updated = await store.updateStudent(sid, updatedData);
            }
        } else {
            updated = await store.updateStudent(sid, updatedData);
        }
        showToast('Profile details updated successfully');
        
        if (currentRole === 'student') {
            currentUser = { ...currentUser, ...(updated || updatedData), profileCompleted: true };
            renderSidebar();
            renderStudentProfileForm(currentUser);
        } else if (currentRole === 'mentor') {
            renderStudentReviewPortal(sid);
        }
    };
}

function renderStudentAcademics(student) {
    const list = document.getElementById('student-academic-sem-list');
    list.innerHTML = '';

    COLLEGE_DETAILS.semesters.forEach(sem => {
        const semData = student.academics[sem] || { gpa: 0, attendance: 0, marks: [] };
        const row = document.createElement('div');
        row.className = 'card';
        row.innerHTML = `
            <div class="card-title">
                <span>${sem}</span>
                <div>
                    <span style="font-size: 0.9rem; margin-right: 1.5rem;">SGPA: <strong>${semData.gpa > 0 ? semData.gpa : 'N/A'}</strong></span>
                    <span style="font-size: 0.9rem;">Attendance: <strong>${semData.attendance > 0 ? semData.attendance + '%' : 'N/A'}</strong></span>
                </div>
            </div>
            ${semData.marks && semData.marks.length > 0 ? `
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Subject Code</th>
                                <th>Subject Name</th>
                                <th>Sessional I</th>
                                <th>Sessional II</th>
                                <th>PUT</th>
                                <th>Internal</th>
                                <th>External</th>
                                <th>Total Obtained</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${semData.marks.map(m => `
                                <tr>
                                    <td><strong>${m.code}</strong></td>
                                    <td>${m.name}</td>
                                    <td>${m.sessional1}</td>
                                    <td>${m.sessional2}</td>
                                    <td>${m.put}</td>
                                    <td>${m.internal}</td>
                                    <td>${m.external}</td>
                                    <td><strong style="color: var(--primary-light);">${m.obtained}/${m.total}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : `<p style="color: var(--text-muted); font-size: 0.9rem;">Academic marks records not declared for this semester.</p>`}
        `;
        list.appendChild(row);
    });

    // Add backlogs sub-card
    const backlogsCard = document.createElement('div');
    backlogsCard.className = 'card';
    const activeBacklogs = student.backlogs || [];
    backlogsCard.innerHTML = `
        <div class="card-title"><span>Backlogs Records</span></div>
        ${activeBacklogs.length > 0 ? `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Semester</th>
                            <th>Subject Code</th>
                            <th>Status</th>
                            <th>Date Cleared</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activeBacklogs.map(b => `
                            <tr>
                                <td>${b.semester}</td>
                                <td><strong>${b.subjectCode}</strong></td>
                                <td><span class="badge-tag ${b.clearDate ? 'badge-active' : 'badge-danger'}">${b.clearDate ? 'Cleared' : 'Active'}</span></td>
                                <td>${b.clearDate || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : `<p style="color: var(--text-muted); font-size: 0.9rem;">Congratulations! No backlog records found.</p>`}
    `;
    list.appendChild(backlogsCard);
}

function renderStudentSessions(student) {
    const list = document.getElementById('student-sessions-list');
    list.innerHTML = '';

    const studentSessions = store.getSessions().filter(s => s.studentId === student.id);

    if (studentSessions.length === 0) {
        list.innerHTML = `<p style="color: var(--text-muted); padding: 1rem 0;">No mentoring sessions logged yet.</p>`;
        return;
    }

    studentSessions.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(sess => {
        const item = document.createElement('div');
        item.className = 'record-item';
        item.innerHTML = `
            <div class="record-meta">
                <span class="record-title">${sess.agenda}</span>
                <span class="record-sub">
                    Date: <strong>${sess.date}</strong> at <strong>${sess.time}</strong> | Type: <strong>${sess.type}</strong>
                </span>
                <span class="record-sub" style="margin-top: 0.5rem; display: block; font-style: italic;">
                    Mentor Notes: "${sess.notes || 'No comments'}"
                </span>
                <span class="record-sub" style="display: block;">
                    Action Items: <strong style="color: var(--secondary);">${sess.actionItems || 'None'}</strong>
                </span>
            </div>
            <div style="text-align: right;">
                <span class="badge-tag badge-active">${sess.status}</span>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">Mentor Signed</p>
            </div>
        `;
        list.appendChild(item);
    });
}

function renderStudentActivities(student) {
    // 1. Render Hobbies & Interests
    const hobbiesList = document.getElementById('hobbies-list');
    hobbiesList.innerHTML = '';
    if (student.hobbies && student.hobbies.length > 0) {
        student.hobbies.forEach(h => {
            const row = document.createElement('div');
            row.className = 'record-item';
            row.innerHTML = `
                <div class="record-meta">
                    <span class="record-title">${h.hobby}</span>
                    <span class="record-sub">Details: ${h.participation}</span>
                </div>
                ${h.awards ? `<span class="badge-tag badge-scholar">${h.awards}</span>` : ''}
            `;
            hobbiesList.appendChild(row);
        });
    } else {
        hobbiesList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No hobbies entered yet.</p>`;
    }

    // 2. Render Certifications
    const certsList = document.getElementById('certs-list');
    certsList.innerHTML = '';
    if (student.certifications && student.certifications.length > 0) {
        student.certifications.forEach(c => {
            const row = document.createElement('div');
            row.className = 'record-item';
            row.innerHTML = `
                <div class="record-meta">
                    <span class="record-title">${c.program} (${c.duration})</span>
                    <span class="record-sub">Semester: ${c.semester} | Mode: ${c.onlineOffline}</span>
                </div>
                <div>
                    <span class="badge-tag badge-active">Grade: ${c.grade}</span>
                </div>
            `;
            certsList.appendChild(row);
        });
    } else {
        certsList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No certifications added.</p>`;
    }

    // 3. Render Internships & Placements
    const internshipsList = document.getElementById('internships-list');
    internshipsList.innerHTML = '';
    if (student.internships && student.internships.length > 0) {
        student.internships.forEach(i => {
            const row = document.createElement('div');
            row.className = 'record-item';
            row.innerHTML = `
                <div class="record-meta">
                    <span class="record-title">${i.companyName} - ${i.designation}</span>
                    <span class="record-sub">Project: "${i.projectTitle}" | Outcome: <strong>${i.outcome}</strong></span>
                    <span class="record-sub">Internal Guide: ${i.internalGuide} | External Guide: ${i.externalGuide}</span>
                </div>
                <span class="badge-tag badge-hosteller">${i.onOffCampus}</span>
            `;
            internshipsList.appendChild(row);
        });
    } else {
        internshipsList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No internship/placement records added.</p>`;
    }

    // Modal adding events setup
    setupModalTrigger('btn-add-hobby', 'modal-hobby');
    setupModalTrigger('btn-add-cert', 'modal-cert');
    setupModalTrigger('btn-add-internship', 'modal-internship');

    // Add forms submit hooks
    document.getElementById('form-add-hobby').onsubmit = async (e) => {
        e.preventDefault();
        const newItem = {
            hobby: document.getElementById('add-hobby-name').value,
            participation: document.getElementById('add-hobby-details').value,
            awards: document.getElementById('add-hobby-award').value
        };
        const sid = student.rollNo || student.id;
        const currentStudent = store.getStudent(sid) || { ...student };
        if (!currentStudent.hobbies) currentStudent.hobbies = [];
        currentStudent.hobbies.push(newItem);
        const updated = await store.updateStudent(sid, currentStudent);
        if (currentRole === 'student') currentUser = { ...currentUser, ...(updated || currentStudent) };
        closeModal('modal-hobby');
        renderStudentActivities(currentUser || currentStudent);
        showToast('Hobby record added successfully!');
    };

    document.getElementById('form-add-cert').onsubmit = async (e) => {
        e.preventDefault();
        const newItem = {
            semester: document.getElementById('add-cert-sem').value,
            duration: document.getElementById('add-cert-duration').value,
            program: document.getElementById('add-cert-program').value,
            onlineOffline: document.getElementById('add-cert-mode').value,
            grade: document.getElementById('add-cert-grade').value,
            certificateAwarded: 'Yes'
        };
        const sid = student.rollNo || student.id;
        const currentStudent = store.getStudent(sid) || { ...student };
        if (!currentStudent.certifications) currentStudent.certifications = [];
        currentStudent.certifications.push(newItem);
        const updated = await store.updateStudent(sid, currentStudent);
        if (currentRole === 'student') currentUser = { ...currentUser, ...(updated || currentStudent) };
        closeModal('modal-cert');
        renderStudentActivities(currentUser || currentStudent);
        showToast('Certification added!');
    };

    document.getElementById('form-add-internship').onsubmit = async (e) => {
        e.preventDefault();
        const newItem = {
            driveDate: document.getElementById('add-intern-date').value,
            companyName: document.getElementById('add-intern-company').value,
            onOffCampus: document.getElementById('add-intern-mode').value,
            appeared: 'Yes',
            outcome: document.getElementById('add-intern-outcome').value,
            designation: document.getElementById('add-intern-role').value,
            projectTitle: document.getElementById('add-intern-project').value,
            externalGuide: document.getElementById('add-intern-guide-ext').value,
            internalGuide: document.getElementById('add-intern-guide-int').value
        };
        const sid = student.rollNo || student.id;
        const currentStudent = store.getStudent(sid) || { ...student };
        if (!currentStudent.internships) currentStudent.internships = [];
        currentStudent.internships.push(newItem);
        const updated = await store.updateStudent(sid, currentStudent);
        if (currentRole === 'student') currentUser = { ...currentUser, ...(updated || currentStudent) };
        closeModal('modal-internship');
        renderStudentActivities(currentUser || currentStudent);
        showToast('Internship details saved!');
    };

    // Anonymous feedback section
    const feedbackForm = document.getElementById('feedback-mentor-form');
    feedbackForm.onsubmit = async (e) => {
        e.preventDefault();
        const fb = {
            mentorId: student.mentorId || 'MENTOR01',
            date: new Date().toISOString().split('T')[0],
            q1: parseInt(document.querySelector('input[name="fb-q1"]:checked')?.value || 5),
            q2: parseInt(document.querySelector('input[name="fb-q2"]:checked')?.value || 5),
            q3: parseInt(document.querySelector('input[name="fb-q3"]:checked')?.value || 5),
            q4: parseInt(document.querySelector('input[name="fb-q4"]:checked')?.value || 5),
            comments: document.getElementById('feedback-comments').value
        };
        store.addFeedback(fb);
        showToast('Anonymous mentor evaluation feedback submitted successfully. Thank you!', 'success');
        feedbackForm.reset();
    };

    // Self assessment form
    const assessmentForm = document.getElementById('self-assessment-form');
    assessmentForm.onsubmit = async (e) => {
        e.preventDefault();
        const sa = {
            semester: student.semester,
            score1: parseInt(document.querySelector('input[name="sa-q1"]:checked')?.value || 5),
            score2: parseInt(document.querySelector('input[name="sa-q2"]:checked')?.value || 5),
            score3: parseInt(document.querySelector('input[name="sa-q3"]:checked')?.value || 5),
            score4: parseInt(document.querySelector('input[name="sa-q4"]:checked')?.value || 5)
        };
        const sid = student.rollNo || student.id;
        const currentStudent = store.getStudent(sid) || { ...student };
        if (!currentStudent.selfAssessments) currentStudent.selfAssessments = [];
        currentStudent.selfAssessments.push(sa);
        const updated = await store.updateStudent(sid, currentStudent);
        if (currentRole === 'student') currentUser = { ...currentUser, ...(updated || currentStudent) };
        showToast('Self assessment saved successfully.');
        assessmentForm.reset();
    };
}

// Modal management utilities
function setupModalTrigger(btnId, modalId) {
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.onclick = () => {
            document.getElementById(modalId).classList.add('open');
        };
    }
    const modal = document.getElementById(modalId);
    if (modal) {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => closeModal(modalId);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('open');
        modal.classList.remove('active');
    }
}

// ----------------------------------------------------
// 2. MENTOR VIEW CONTROLLERS
// ----------------------------------------------------

function renderMentorMentees() {
    const listGrid = document.getElementById('mentor-mentees-grid');
    listGrid.innerHTML = '';

    // Mentees assigned to this mentor
    const mentees = store.getStudents().filter(s => s.mentorId === currentUser.id);

    if (mentees.length === 0) {
        listGrid.innerHTML = `<p style="color: var(--text-muted);">No student mentees assigned to you.</p>`;
        return;
    }

    mentees.forEach(student => {
        const card = document.createElement('div');
        card.className = 'mentee-card';
        card.innerHTML = `
            <div class="mentee-card-header">
                <img class="mentee-avatar" src="${student.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}" alt="Avatar">
                <div class="mentee-card-info">
                    <h4>${student.name}</h4>
                    <p>Roll No: ${student.rollNo || student.id} | Section: ${student.section}</p>
                </div>
            </div>
            <div class="mentee-stats-row">
                <div class="mentee-stat-item">
                    <p>CGPA</p>
                    <span>${calculateCGPA(student)}</span>
                </div>
                <div class="mentee-stat-item">
                    <p>Attendance</p>
                    <span>${calculateAttendance(student)}</span>
                </div>
                <div class="mentee-stat-item">
                    <p>Backlogs</p>
                    <span style="color: ${getActiveBacklogsCount(student) > 0 ? 'var(--danger)' : 'var(--success)'};">${getActiveBacklogsCount(student)}</span>
                </div>
            </div>
            <button class="btn btn-primary" style="margin-top: 0.5rem; justify-content: center; width: 100%;">
                Review Portfolio
            </button>
        `;

        card.addEventListener('click', () => {
            selectedStudentForMentor = student.id;
            enterMentorReviewPortal(student);
        });

        listGrid.appendChild(card);
    });
}

function enterMentorReviewPortal(student) {
    // Hide regular sections, show custom Mentor Review screen
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    const reviewPortal = document.getElementById('mentor-student-review');
    reviewPortal.classList.add('active');
    
    // Set headers
    document.getElementById('review-student-name').textContent = student.name;
    document.getElementById('review-student-id').textContent = student.rollNo || student.id;

    // Render Sub view
    renderStudentOverview(student);

    // Dynamic Navigation Tab inside Review Portal
    const tabLinks = document.querySelectorAll('.review-tab-link');
    tabLinks.forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const tab = link.dataset.tab;
            document.querySelectorAll('.review-sub-section').forEach(s => s.style.display = 'none');
            
            const target = document.getElementById(`review-tab-${tab}`);
            if (target) {
                target.style.display = 'block';
                if (tab === 'profile') renderStudentProfileForm(student);
                else if (tab === 'academics') renderStudentAcademics(student);
                else if (tab === 'sessions') renderMentorSessionsView(student);
                else if (tab === 'assessment') renderMentorAssessmentTab(student);
            }
        };
    });

    // Default click first tab
    tabLinks[0].click();
}

function renderMentorSessionsView(student) {
    const list = document.getElementById('review-sessions-list');
    list.innerHTML = '';

    const sessions = store.getSessions().filter(s => s.studentId === student.id);
    if (sessions.length === 0) {
        list.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No mentoring sessions logged.</p>`;
        return;
    }

    sessions.forEach(sess => {
        const item = document.createElement('div');
        item.className = 'record-item';
        item.innerHTML = `
            <div class="record-meta">
                <span class="record-title">${sess.agenda}</span>
                <span class="record-sub">Date: ${sess.date} | Mode: ${sess.type}</span>
                <span class="record-sub">Notes: "${sess.notes}"</span>
            </div>
            <span class="badge-tag badge-active">${sess.status}</span>
        `;
        list.appendChild(item);
    });
}

function renderMentorAssessmentTab(student) {
    // Fill in values if they already exist
    const currentAssessment = student.mentorAssessment || {};
    
    // Quick populate radio groups
    const setRating = (name, value) => {
        const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (radio) radio.checked = true;
    };

    setRating('m-assess-q1', currentAssessment.punctuality || 5);
    setRating('m-assess-q2', currentAssessment.leadership || 5);
    setRating('m-assess-q3', currentAssessment.teamSpirit || 5);
    setRating('m-assess-q4', currentAssessment.interpersonal || 5);
    document.getElementById('m-assess-comments').value = currentAssessment.comments || '';

    // Handle submit
    const form = document.getElementById('mentor-assessment-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const assessment = {
            punctuality: parseInt(document.querySelector('input[name="m-assess-q1"]:checked')?.value || 5),
            leadership: parseInt(document.querySelector('input[name="m-assess-q2"]:checked')?.value || 5),
            teamSpirit: parseInt(document.querySelector('input[name="m-assess-q3"]:checked')?.value || 5),
            interpersonal: parseInt(document.querySelector('input[name="m-assess-q4"]:checked')?.value || 5),
            comments: document.getElementById('m-assess-comments').value
        };

        const sid = student.rollNo || student.id;
        const currentStudent = store.getStudent(sid) || { ...student };
        currentStudent.mentorAssessment = assessment;
        await store.updateStudent(sid, currentStudent);
        showToast('Mentor evaluation assessment saved successfully!');
    };
}

function renderMentorSessionForm() {
    const studentSelect = document.getElementById('sess-student-select');
    studentSelect.innerHTML = '';

    // Fetch assigned mentees
    const mentees = store.getStudents().filter(s => s.mentorId === currentUser.id);
    mentees.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = `${m.name} (${m.id})`;
        studentSelect.appendChild(opt);
    });

    const form = document.getElementById('mentor-add-session-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        const studentId = studentSelect.value;
        if (!studentId) {
            showToast('No student selected', 'error');
            return;
        }

        const newSession = {
            id: 'SESS' + Date.now(),
            studentId: studentId,
            mentorId: currentUser.id,
            date: document.getElementById('sess-date').value,
            time: document.getElementById('sess-time').value,
            type: document.getElementById('sess-mode').value,
            agenda: document.getElementById('sess-agenda').value,
            notes: document.getElementById('sess-notes').value,
            actionItems: document.getElementById('sess-actions').value,
            status: 'Completed'
        };

        store.addSession(newSession);
        showToast('Mentoring session logged successfully!');
        form.reset();
        
        // Redirect to Mentees list
        document.querySelector('.nav-link[data-view="mentor-dashboard"]').click();
    };
}

function renderMentorProfileForm() {
    document.getElementById('m-profile-name').value = currentUser.name;
    document.getElementById('m-profile-email').value = currentUser.email;
    document.getElementById('m-profile-dept').value = currentUser.department;
    document.getElementById('m-profile-designation').value = currentUser.designation;
    document.getElementById('m-profile-phone').value = currentUser.contact;
    document.getElementById('m-profile-period').value = currentUser.period;

    const form = document.getElementById('mentor-profile-edit-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        const updated = {
            name: document.getElementById('m-profile-name').value,
            email: document.getElementById('m-profile-email').value,
            department: document.getElementById('m-profile-dept').value,
            designation: document.getElementById('m-profile-designation').value,
            contact: document.getElementById('m-profile-phone').value,
            period: document.getElementById('m-profile-period').value
        };
        store.updateMentor(currentUser.id, updated);
        currentUser = store.getMentor(currentUser.id);
        renderSidebar();
        showToast('Mentor profile updated!');
    };
}

// ----------------------------------------------------
// 3. ADMIN / HOD VIEW CONTROLLERS
// ----------------------------------------------------

async function renderAdminDashboard() {
    const tableBody = document.getElementById('admin-student-list-body');
    const searchInput = document.getElementById('admin-student-search');
    const statusFilter = document.getElementById('admin-student-filter-status');
    const countBadge = document.getElementById('admin-student-count-badge');
    const refreshBtn = document.getElementById('btn-refresh-admin-students');

    const isHod = window.backendRole === 'HOD' || currentRole === 'hod';
    const deptName = currentUser?.department || 'Department';

    // Set contextual titles & labels
    const dashTitleEl = document.getElementById('admin-dashboard-title');
    if (dashTitleEl) {
        dashTitleEl.textContent = isHod
            ? `Department Overview — ${deptName}`
            : 'Institution Overview — Central Administration';
    }

    const statStudentsLabel = document.getElementById('admin-stat-students-label');
    if (statStudentsLabel) {
        statStudentsLabel.textContent = isHod ? `${deptName} Students` : 'Total Mentees';
    }

    const statMentorsLabel = document.getElementById('admin-stat-mentors-label');
    if (statMentorsLabel) {
        statMentorsLabel.textContent = isHod ? `${deptName} Mentors` : 'Total Mentors';
    }

    const statSessionsLabel = document.getElementById('admin-stat-sessions-label');
    if (statSessionsLabel) {
        statSessionsLabel.textContent = isHod ? `${deptName} Sessions` : 'Sessions Conducted';
    }

    const directoryTitleEl = document.getElementById('admin-student-directory-title');
    if (directoryTitleEl) {
        directoryTitleEl.textContent = isHod
            ? `${deptName} Students Directory`
            : 'All Enrolled Students List';
    }

    const mentors = store.getMentors();
    const sessions = store.getSessions();

    document.getElementById('admin-stat-mentors').textContent = mentors.length;
    document.getElementById('admin-stat-sessions').textContent = sessions.length;

    async function loadAdminStudentList() {
        if (!tableBody) return;
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">Loading enrolled students…</td></tr>`;

        const params = new URLSearchParams();
        const status = statusFilter ? statusFilter.value : '';
        if (status) params.append('status', status);

        const search = searchInput ? searchInput.value.trim() : '';
        if (search) params.append('search', search);

        let students = [];
        try {
            const res = await MentorAPI.students(params.toString());
            students = res.data || [];
            
            // Sync local store
            if (Array.isArray(students)) {
                store.db.students = {};
                students.forEach(s => {
                    const sid = s.id || s.rollNo;
                    store.db.students[sid] = s;
                });
                store.save();
            }
        } catch (err) {
            console.warn('Fallback to local store students:', err.message);
            students = store.getStudents();
            if (status) {
                students = students.filter(s => s.status === status);
            }
            if (search) {
                const q = search.toLowerCase();
                students = students.filter(s =>
                    (s.name && s.name.toLowerCase().includes(q)) ||
                    (s.rollNo && s.rollNo.toLowerCase().includes(q)) ||
                    (s.email && s.email.toLowerCase().includes(q))
                );
            }
        }

        const totalActive = store.getStudents().filter(s => s.status !== 'Inactive').length;
        document.getElementById('admin-stat-students').textContent = totalActive;

        if (countBadge) {
            countBadge.textContent = `${students.length} Student${students.length === 1 ? '' : 's'}`;
        }

        if (students.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 28px;">No students found matching current criteria.</td></tr>`;
            return;
        }

        const isSystemAdmin = window.backendRole === 'ADMIN' || (!isHod && currentRole === 'admin');

        tableBody.innerHTML = students.map(std => {
            const sid = std.rollNo || std.id;
            const isInactive = std.status === 'Inactive';

            const statusBadge = isInactive
                ? `<span class="badge-tag" style="background: rgba(239, 68, 68, 0.15); color: #dc2626; font-weight: 600;">🔴 Inactive</span>`
                : `<span class="badge-tag" style="background: rgba(16, 185, 129, 0.15); color: #059669; font-weight: 600;">🟢 Active</span>`;

            const sectionBadge = std.section
                ? `<span class="badge-tag" style="background: #e0f2fe; color: #0369a1; font-weight: 600;">Sec ${std.section}</span>`
                : `<span class="badge-tag" style="background: #fef3c7; color: #92400e;">Unallotted</span>`;

            const deactivateBtnLabel = isInactive ? 'Activate' : 'Deactivate';
            const deactivateBtnClass = isInactive ? 'btn-success' : 'btn-secondary';
            const deactivateBtnStyle = isInactive
                ? 'background: #059669; color: white; border: none;'
                : 'color: #d97706; border-color: #fde68a;';

            const deleteBtnHtml = isSystemAdmin ? `
                <button class="btn btn-sm btn-delete-student" 
                    data-id="${sid}" 
                    data-name="${std.name}" 
                    data-roll="${std.rollNo || sid}"
                    style="background: rgba(239, 68, 68, 0.1); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.3); padding: 4px 8px; font-size: 12px;" 
                    title="Permanently delete student">
                    🗑️
                </button>
            ` : '';

            return `
                <tr style="${isInactive ? 'opacity: 0.65; background: rgba(241, 245, 249, 0.5);' : ''}">
                    <td><strong style="color: var(--primary-light); font-family: monospace; font-size: 13.5px;">${std.rollNo || sid}</strong></td>
                    <td>
                        <strong>${std.name}</strong>
                        <div style="font-size: 12px; color: var(--text-muted);">${std.email || 'No email registered'}</div>
                    </td>
                    <td>${std.course || 'B.Tech'} - ${std.branch || ''}</td>
                    <td>${std.semester || 'Sem 1'}</td>
                    <td>${sectionBadge}</td>
                    <td>${statusBadge}</td>
                    <td><strong>${calculateCGPA(std)}</strong></td>
                    <td style="text-align: right;">
                        <div style="display: inline-flex; gap: 6px; align-items: center; justify-content: flex-end;">
                            <button class="btn btn-secondary btn-sm" onclick="openAdminEditStudent('${sid}')" title="Manage Academic Records">Records</button>
                            <button class="btn btn-sm btn-toggle-student-status" 
                                data-id="${sid}" 
                                data-name="${std.name}" 
                                data-status="${std.status || 'Active'}"
                                style="${deactivateBtnStyle} padding: 4px 8px; font-size: 12px;" 
                                title="${isInactive ? 'Re-activate student account' : 'Deactivate student account'}">
                                ${deactivateBtnLabel}
                            </button>
                            ${deleteBtnHtml}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Bind Toggle Status Buttons
        tableBody.querySelectorAll('.btn-toggle-student-status').forEach(btn => {
            btn.onclick = async () => {
                const sid = btn.dataset.id;
                const name = btn.dataset.name;
                const currentStatus = btn.dataset.status;
                const newStatus = currentStatus === 'Inactive' ? 'Active' : 'Inactive';

                btn.disabled = true;
                btn.textContent = '…';

                try {
                    const res = await MentorAPI.toggleStudentStatus(sid, newStatus);
                    showToast(res.message || `Student ${name} status set to ${newStatus}`, 'success');
                    await loadAdminStudentList();
                } catch (err) {
                    showToast(err.message || 'Failed to update student status', 'error');
                    btn.disabled = false;
                    btn.textContent = currentStatus === 'Inactive' ? 'Activate' : 'Deactivate';
                }
            };
        });

        // Bind Delete Student Buttons to open Delete Confirmation Modal
        tableBody.querySelectorAll('.btn-delete-student').forEach(btn => {
            btn.onclick = () => {
                const sid = btn.dataset.id;
                const name = btn.dataset.name;
                const roll = btn.dataset.roll;

                const modal = document.getElementById('modal-confirm-delete-student');
                const nameEl = document.getElementById('delete-student-name');
                const rollEl = document.getElementById('delete-student-roll');
                const valEl = document.getElementById('delete-student-id-val');

                if (!modal) return;
                if (nameEl) nameEl.textContent = name;
                if (rollEl) rollEl.textContent = roll;
                if (valEl) valEl.value = sid;

                modal.classList.add('active');
            };
        });
    }

    // Attach listeners once
    if (statusFilter && !statusFilter.dataset.listenerAttached) {
        statusFilter.dataset.listenerAttached = 'true';
        statusFilter.onchange = () => loadAdminStudentList();
    }

    if (refreshBtn && !refreshBtn.dataset.listenerAttached) {
        refreshBtn.dataset.listenerAttached = 'true';
        refreshBtn.onclick = () => loadAdminStudentList();
    }

    if (searchInput && !searchInput.dataset.listenerAttached) {
        searchInput.dataset.listenerAttached = 'true';
        let debounceTimer;
        searchInput.oninput = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => loadAdminStudentList(), 300);
        };
    }

    // Delete submission listener in modal
    const deleteSubmitBtn = document.getElementById('btn-confirm-delete-student-submit');
    if (deleteSubmitBtn && !deleteSubmitBtn.dataset.listenerAttached) {
        deleteSubmitBtn.dataset.listenerAttached = 'true';
        deleteSubmitBtn.onclick = async () => {
            const valEl = document.getElementById('delete-student-id-val');
            const sid = valEl ? valEl.value : null;
            if (!sid) return;

            deleteSubmitBtn.disabled = true;
            deleteSubmitBtn.innerHTML = '<span>Deleting Student…</span>';

            try {
                const res = await MentorAPI.deleteStudent(sid);
                showToast(res.message || 'Student deleted successfully', 'success');
                delete store.db.students[sid];
                store.save();
                closeModal('modal-confirm-delete-student');
                await loadAdminStudentList();
            } catch (err) {
                showToast(err.message || 'Failed to delete student', 'error');
            } finally {
                deleteSubmitBtn.disabled = false;
                deleteSubmitBtn.innerHTML = '<span>Delete Student Record</span>';
            }
        };
    }

    loadAdminStudentList();
}

function openAdminEditStudent(studentId) {
    selectedStudentForAdmin = studentId;
    const student = store.getStudent(studentId);

    // Hide general views, show Admin Student Edit screen
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    const editScreen = document.getElementById('admin-student-records-edit');
    editScreen.classList.add('active');

    document.getElementById('admin-student-name').textContent = student.name;
    document.getElementById('admin-student-id').textContent = student.rollNo || student.id;

    // Pre-populate add-marks inputs
    const semSelect = document.getElementById('marks-sem-select');
    semSelect.innerHTML = '';
    COLLEGE_DETAILS.semesters.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        semSelect.appendChild(opt);
    });

    // Render marks table for review
    renderAdminStudentMarksTable(student);
}

function renderAdminStudentMarksTable(student) {
    const container = document.getElementById('admin-student-marks-container');
    container.innerHTML = '';

    COLLEGE_DETAILS.semesters.forEach(sem => {
        const semData = student.academics[sem] || { gpa: 0, attendance: 0, marks: [] };
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-title" style="margin-bottom: 0.5rem;">
                <span>${sem} Details</span>
                <div style="font-size: 0.85rem; display: flex; gap: 1rem;">
                    <span>SGPA: <strong style="color: var(--primary-light);">${semData.gpa || 'Not set'}</strong></span>
                    <span>Attendance: <strong style="color: var(--success);">${semData.attendance || 'Not set'}%</strong></span>
                </div>
            </div>
            ${semData.marks.length > 0 ? `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Subject</th>
                            <th>Sess 1</th>
                            <th>Sess 2</th>
                            <th>PUT</th>
                            <th>Int</th>
                            <th>Ext</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${semData.marks.map(m => `
                            <tr>
                                <td><strong>${m.code}</strong></td>
                                <td>${m.name}</td>
                                <td>${m.sessional1}</td>
                                <td>${m.sessional2}</td>
                                <td>${m.put}</td>
                                <td>${m.internal}</td>
                                <td>${m.external}</td>
                                <td><strong>${m.obtained}/${m.total}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : `<p style="color: var(--text-muted); font-size: 0.85rem;">No subjects/marks entered.</p>`}
        `;
        container.appendChild(card);
    });
}

function renderAdminManageView() {
    // Admin manage screen controls
    const searchInput = document.getElementById('admin-student-search');
    searchInput.oninput = () => {
        const query = searchInput.value.toLowerCase();
        const rows = document.querySelectorAll('#admin-student-list-body tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    };

    // Form add marks/attendance handler
    const marksForm = document.getElementById('admin-add-marks-form');
    marksForm.onsubmit = async (e) => {
        e.preventDefault();
        const studentId = selectedStudentForAdmin;
        if (!studentId) return;

        const student = store.getStudent(studentId);
        const sem = document.getElementById('marks-sem-select').value;
        const code = document.getElementById('marks-sub-code').value.trim();
        const name = document.getElementById('marks-sub-name').value.trim();
        const sess1 = parseInt(document.getElementById('marks-sess1').value || 0);
        const sess2 = parseInt(document.getElementById('marks-sess2').value || 0);
        const put = parseInt(document.getElementById('marks-put').value || 0);
        const internal = parseInt(document.getElementById('marks-internal').value || 0);
        const external = parseInt(document.getElementById('marks-external').value || 0);
        const total = parseInt(document.getElementById('marks-total').value || 100);

        if (!code || !name) {
            showToast('Subject details required', 'error');
            return;
        }

        const newSubjectMark = {
            code: code,
            name: name,
            sessional1: sess1,
            sessional2: sess2,
            put: put,
            internal: internal,
            external: external,
            total: total,
            obtained: (internal + external)
        };

        if (!student.academics[sem]) {
            student.academics[sem] = { gpa: 0, attendance: 0, marks: [] };
        }
        student.academics[sem].marks.push(newSubjectMark);

        // Auto-recalculate SGPA and Attendance values
        // Average the subject total grades to find GPA
        const totalObtained = student.academics[sem].marks.reduce((acc, m) => acc + (m.obtained / m.total), 0);
        const calcGpa = parseFloat(((totalObtained / student.academics[sem].marks.length) * 10).toFixed(2));
        student.academics[sem].gpa = calcGpa;

        // Take manual inputs for SGPA/Attendance override
        const overrideGpa = parseFloat(document.getElementById('marks-gpa-override').value);
        if (!isNaN(overrideGpa) && overrideGpa > 0) {
            student.academics[sem].gpa = overrideGpa;
        }

        const attVal = parseFloat(document.getElementById('marks-att-override').value);
        if (!isNaN(attVal) && attVal > 0) {
            student.academics[sem].attendance = attVal;
        }

        await store.updateStudent(studentId, student);
        showToast(`Official record added for ${sem}`);
        marksForm.reset();
        renderAdminStudentMarksTable(student);
    };

    // Add backlog record
    const backlogForm = document.getElementById('admin-add-backlog-form');
    backlogForm.onsubmit = async (e) => {
        e.preventDefault();
        const studentId = selectedStudentForAdmin;
        if (!studentId) return;

        const student = store.getStudent(studentId);
        const newBacklog = {
            semester: document.getElementById('backlog-sem-select').value,
            subjectCode: document.getElementById('backlog-sub-code').value.trim(),
            clearDate: document.getElementById('backlog-clear-date').value || null
        };

        if (!newBacklog.subjectCode) {
            showToast('Subject code is required', 'error');
            return;
        }

        if (!student.backlogs) student.backlogs = [];
        student.backlogs.push(newBacklog);
        await store.updateStudent(studentId, student);
        showToast('Backlog record added');
        backlogForm.reset();
    };

    // Add adverse record
    const adverseForm = document.getElementById('admin-add-adverse-form');
    adverseForm.onsubmit = async (e) => {
        e.preventDefault();
        const studentId = selectedStudentForAdmin;
        if (!studentId) return;

        const student = store.getStudent(studentId);
        const record = {
            date: document.getElementById('adverse-date').value,
            details: document.getElementById('adverse-details').value.trim(),
            outcome: document.getElementById('adverse-outcome').value.trim(),
            actionTaken: document.getElementById('adverse-action').value.trim()
        };

        if (!record.details) {
            showToast('Adverse incident details are required', 'error');
            return;
        }

        if (!student.disciplinaryRecords) student.disciplinaryRecords = [];
        student.disciplinaryRecords.push(record);
        await store.updateStudent(studentId, student);
        showToast('Disciplinary record entered');
        adverseForm.reset();
    };
}

function renderAdminFeedbackView() {
    const list = document.getElementById('admin-feedback-list');
    list.innerHTML = '';

    const feedList = store.getFeedback();
    if (feedList.length === 0) {
        list.innerHTML = `<p style="color: var(--text-muted); padding: 1rem 0;">No anonymous feedback submitted by mentees yet.</p>`;
        return;
    }

    feedList.forEach(fb => {
        const item = document.createElement('div');
        item.className = 'record-item';
        // Compute average score
        const avg = ((fb.q1 + fb.q2 + fb.q3 + fb.q4) / 4).toFixed(1);
        item.innerHTML = `
            <div class="record-meta">
                <span class="record-title" style="color: var(--primary-light);">Anonymous Feedback for Mentor: ${fb.mentorId}</span>
                <span class="record-sub">Submitted: ${fb.date}</span>
                <span class="record-sub" style="margin-top: 0.5rem; display: block; font-style: italic;">
                    "Comments: ${fb.comments || 'None'}"
                </span>
            </div>
            <div style="text-align: right;">
                <span class="badge-tag badge-scholar">Avg Rating: ${avg}/5</span>
                <p style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem;">
                    Availability: ${fb.q1} | Preparedness: ${fb.q3}
                </p>
            </div>
        `;
        list.appendChild(item);
    });
}

// ----------------------------------------------------
// 3.4 ADMIN: REGISTRATION INVITES & PENDING APPROVALS
// ----------------------------------------------------

function renderAdminInviteLinksView() {
    const form = document.getElementById('form-generate-batch-links');
    const refreshBtn = document.getElementById('btn-refresh-tokens');

    async function loadTokens() {
        const tbody = document.getElementById('tokens-list-tbody');
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 16px;">Loading tokens…</td></tr>`;

        try {
            const res = await MentorAPI.getRegistrationTokens();
            const tokens = res.data || [];

            if (tokens.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 16px;">No registration links generated yet.</td></tr>`;
                return;
            }

            const origin = window.location.origin;

            tbody.innerHTML = tokens.map(t => {
                const url = `${origin}/register.html?token=${t.token}${t.assignedEmail ? `&email=${encodeURIComponent(t.assignedEmail)}` : ''}`;
                const isExpired = t.expiresAt && new Date(t.expiresAt) < new Date();
                const statusBadge = !t.isActive 
                    ? `<span class="badge-tag" style="background:#fee2e2; color:#b91c1c;">Deactivated</span>`
                    : (isExpired 
                        ? `<span class="badge-tag" style="background:#fee2e2; color:#b91c1c;">Expired</span>`
                        : `<span class="badge-tag badge-active">Active</span>`);

                const emailBadge = t.emailSent 
                    ? `<span style="color: #10b981; font-weight: 600; font-size: 12px;">✅ Sent</span>`
                    : `<span style="color: #94a3b8; font-size: 12px;">—</span>`;

                const usesText = t.maxUses ? `${t.usedCount || 0} / ${t.maxUses}` : `${t.usedCount || 0} (Unlimited)`;
                const expiryText = t.expiresAt ? new Date(t.expiresAt).toLocaleDateString() : 'Never';

                return `
                    <tr>
                        <td>
                            <strong>${t.assignedEmail || '<span style="color:#64748b;">Any / Open</span>'}</strong>
                            ${t.studentName ? `<br><small style="color:#64748b;">${t.studentName}</small>` : ''}
                        </td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <input type="text" value="${url}" readonly style="width: 170px; font-size: 11px; padding: 3px 6px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc;">
                                <button type="button" class="btn btn-secondary btn-copy-token-url" data-url="${url}" style="padding: 3px 6px; font-size: 11px;" title="Copy to clipboard">📋</button>
                            </div>
                        </td>
                        <td>${usesText}</td>
                        <td>${emailBadge}</td>
                        <td>${expiryText}</td>
                        <td>${statusBadge}</td>
                        <td>
                            ${t.isActive && !isExpired ? `
                                <button type="button" class="btn btn-danger btn-deact-token" data-token="${t.token}" style="padding: 3px 8px; font-size: 11px;">Deactivate</button>
                            ` : `<span style="color: #94a3b8; font-size: 12px;">—</span>`}
                        </td>
                    </tr>
                `;
            }).join('');

            // Bind copy buttons
            tbody.querySelectorAll('.btn-copy-token-url').forEach(btn => {
                btn.onclick = () => {
                    navigator.clipboard.writeText(btn.dataset.url);
                    showToast('Link copied to clipboard!');
                };
            });

            // Bind deactivate buttons
            tbody.querySelectorAll('.btn-deact-token').forEach(btn => {
                btn.onclick = async () => {
                    if (!confirm('Are you sure you want to deactivate this registration link?')) return;
                    try {
                        await MentorAPI.deactivateRegistrationToken(btn.dataset.token);
                        showToast('Registration link deactivated');
                        loadTokens();
                    } catch (err) {
                        showToast(err.message || 'Failed to deactivate link', 'error');
                    }
                };
            });

        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #ef4444; padding: 16px;">Failed to load tokens: ${err.message}</td></tr>`;
        }
    }

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();

            const rawInput = document.getElementById('batch-email-input').value.trim();
            const expiresDays = parseInt(document.getElementById('batch-expires-days').value) || 7;
            const sendEmail = true;

            if (!rawInput) {
                showToast('Please enter at least one email address.', 'error');
                return;
            }

            // Parse emails (support newline, comma, semicolon)
            const rawList = rawInput.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
            const parsedList = [];

            for (const item of rawList) {
                // Check format: "Name <email@domain.com>" or just "email@domain.com"
                const match = item.match(/^(?:([^<]+)<)?\s*([^\s<>@]+@[^\s<>@]+\.[^\s<>@]+)\s*>?$/);
                if (match) {
                    const name = match[1] ? match[1].trim() : '';
                    const email = match[2].trim().toLowerCase();
                    parsedList.push({ name, email });
                } else if (item.includes('@')) {
                    parsedList.push({ name: '', email: item.toLowerCase() });
                }
            }

            if (parsedList.length === 0) {
                showToast('No valid email addresses found. Please check your format.', 'error');
                return;
            }

            if (parsedList.length > 20) {
                showToast(`You entered ${parsedList.length} emails. Maximum limit is 20 per batch.`, 'error');
                return;
            }

            // Populate and open Confirmation Modal
            const confirmModal = document.getElementById('modal-confirm-send-invites');
            const countEl = document.getElementById('confirm-invite-count');
            const listEl = document.getElementById('confirm-invite-recipient-list');
            const validityEl = document.getElementById('confirm-invite-validity');
            const confirmBtn = document.getElementById('btn-confirm-send-invites');

            if (!confirmModal || !confirmBtn) return;

            if (countEl) countEl.textContent = `${parsedList.length} recipient${parsedList.length > 1 ? 's' : ''}`;
            if (validityEl) validityEl.textContent = `${expiresDays} day${expiresDays > 1 ? 's' : ''}`;

            if (listEl) {
                listEl.innerHTML = parsedList.map(item => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 6px; border-bottom: 1px dashed #e2e8f0;">
                        <span style="font-weight: 600; color: #1e293b;">${item.email}</span>
                        ${item.name ? `<span style="color: #64748b; font-size: 11.5px;">${item.name}</span>` : '<span style="color: #94a3b8; font-size: 11px;">(No Name)</span>'}
                    </div>
                `).join('');
            }

            // Open confirmation dialog
            confirmModal.classList.add('open');

            // Handle confirmation click
            confirmBtn.onclick = async () => {
                confirmBtn.disabled = true;
                confirmBtn.innerHTML = `
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" style="animation: spin 1s linear infinite;">
                        <line x1="12" y1="2" x2="12" y2="6"></line>
                        <line x1="12" y1="18" x2="12" y2="22"></line>
                        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                        <line x1="2" y1="12" x2="6" y2="12"></line>
                        <line x1="18" y1="12" x2="22" y2="12"></line>
                        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                    <span>Sending Invites…</span>
                `;

                try {
                    const res = await MentorAPI.generateBatchEmailLinks(parsedList, expiresDays, sendEmail);
                    const links = res.data?.links || [];
                    const sentCount = links.filter(l => l.emailSent).length;
                    const failedCount = links.length - sentCount;

                    closeModal('modal-confirm-send-invites');
                    
                    if (sentCount > 0 && failedCount === 0) {
                        showToast(`Successfully generated ${links.length} link(s) and sent all invitation emails!`);
                    } else if (sentCount > 0 && failedCount > 0) {
                        showToast(`Generated ${links.length} link(s). ${sentCount} emailed, ${failedCount} could not be emailed (see table).`, 'warning');
                    } else {
                        showToast(`Generated ${links.length} link(s). Emails could not be dispatched (see table for reasons).`, 'warning');
                    }
                    form.reset();

                    // Show batch results table
                    const resultsPanel = document.getElementById('batch-results-panel');
                    const resultsTbody = document.getElementById('batch-results-tbody');
                    
                    if (resultsPanel && resultsTbody) {
                        resultsTbody.innerHTML = links.map(item => `
                            <tr>
                                <td>
                                    <strong>${item.email}</strong>
                                    ${item.name ? `<br><small style="color: #64748b;">${item.name}</small>` : ''}
                                </td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        <input type="text" value="${item.registrationUrl}" readonly style="width: 220px; font-size: 11px; padding: 4px 6px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc;">
                                        <button type="button" class="btn btn-secondary btn-copy-batch-url" data-url="${item.registrationUrl}" style="padding: 4px 8px; font-size: 11px;">Copy</button>
                                    </div>
                                </td>
                                <td>
                                    ${item.emailSent 
                                        ? `<span style="color: #10b981; font-weight: 600;">✅ Sent</span>` 
                                        : `<span style="color: #dc2626; font-size: 12px; font-weight: 500;" title="${item.emailError || ''}">⚠️ ${item.emailError || 'Not sent'}</span>`}
                                </td>
                                <td>
                                    <a href="${item.registrationUrl}" target="_blank" class="btn btn-secondary" style="font-size: 11px; padding: 4px 8px; text-decoration: none;">Open &rarr;</a>
                                </td>
                            </tr>
                        `).join('');

                        resultsTbody.querySelectorAll('.btn-copy-batch-url').forEach(btn => {
                            btn.onclick = () => {
                                navigator.clipboard.writeText(btn.dataset.url);
                                showToast('Link copied to clipboard!');
                            };
                        });

                        resultsPanel.style.display = 'block';
                    }

                    loadTokens();

                } catch (err) {
                    showToast(err.message || 'Failed to generate registration links', 'error');
                } finally {
                    confirmBtn.disabled = false;
                    confirmBtn.innerHTML = `
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                        <span>Confirm & Send Invites</span>
                    `;
                }
            };
        };
    }

    if (refreshBtn) {
        refreshBtn.onclick = () => loadTokens();
    }

    loadTokens();
}

function renderAdminPendingRegistrationsView() {
    const statusFilter = document.getElementById('pending-reg-filter-status');
    const refreshBtn = document.getElementById('btn-refresh-pending-reg');

    async function loadPending() {
        const tbody = document.getElementById('pending-reg-tbody');
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 16px;">Loading registrations…</td></tr>`;

        const filter = statusFilter ? statusFilter.value : 'PENDING_APPROVAL';

        try {
            const res = await MentorAPI.getPendingRegistrations(filter ? `status=${filter}` : '');
            const registrations = res.data?.registrations || [];

            // Update stats
            const pendingCountEl = document.getElementById('pending-reg-count');
            if (pendingCountEl) {
                pendingCountEl.textContent = registrations.filter(r => r.status === 'PENDING_APPROVAL').length;
            }

            if (registrations.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No registrations found matching the selected filter.</td></tr>`;
                return;
            }

            tbody.innerHTML = registrations.map(item => {
                let badge = '';
                if (item.status === 'PENDING_APPROVAL') {
                    badge = `<span class="badge-tag" style="background:#fef3c7; color:#92400e;">Pending Approval</span>`;
                } else if (item.status === 'APPROVED') {
                    badge = `<span class="badge-tag badge-active">Approved (${item.assignedRollNo || ''})</span>`;
                } else if (item.status === 'REJECTED') {
                    badge = `<span class="badge-tag" style="background:#fee2e2; color:#b91c1c;">Rejected</span>`;
                } else {
                    badge = `<span class="badge-tag" style="background:#f1f5f9; color:#475569;">${item.status}</span>`;
                }

                const verifiedDate = item.otpVerifiedAt 
                    ? new Date(item.otpVerifiedAt).toLocaleString() 
                    : (item.createdAt ? new Date(item.createdAt).toLocaleString() : '—');

                return `
                    <tr>
                        <td><strong>${item.name}</strong></td>
                        <td>${item.email}</td>
                        <td>${item.mobile || '—'}</td>
                        <td><small style="color: #64748b;">${verifiedDate}</small></td>
                        <td>${badge}</td>
                        <td>
                            ${item.status === 'PENDING_APPROVAL' ? `
                                <div style="display: flex; gap: 6px;">
                                    <button type="button" class="btn btn-primary btn-action-approve" 
                                        data-id="${item._id}" 
                                        data-name="${item.name}" 
                                        data-email="${item.email}" 
                                        data-mobile="${item.mobile || ''}"
                                        style="padding: 4px 10px; font-size: 12px; background: #10b981; border-color: #10b981;">
                                        Approve & Enroll
                                    </button>
                                    <button type="button" class="btn btn-danger btn-action-reject" 
                                        data-id="${item._id}" 
                                        style="padding: 4px 8px; font-size: 12px;">
                                        Reject
                                    </button>
                                </div>
                            ` : (item.status === 'APPROVED' ? `
                                <small style="color: #10b981;">Enrolled as ${item.assignedRollNo || 'Mentee'}</small>
                            ` : (item.status === 'REJECTED' ? `
                                <small style="color: #ef4444;">Reason: ${item.rejectionReason || 'Not specified'}</small>
                            ` : '—'))}
                        </td>
                    </tr>
                `;
            }).join('');

            // Bind Approve buttons
            tbody.querySelectorAll('.btn-action-approve').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.dataset.id;
                    const name = btn.dataset.name;
                    const email = btn.dataset.email;

                    document.getElementById('approve-reg-id').value = id;
                    document.getElementById('approve-display-name').textContent = name;
                    document.getElementById('approve-display-email').textContent = email;

                    // Suggest roll number
                    const currentYearPrefix = new Date().getFullYear().toString().slice(-2);
                    const randomDigits = Math.floor(1000 + Math.random() * 9000);
                    document.getElementById('approve-roll-no').value = `${currentYearPrefix}0101${randomDigits}`;
                    document.getElementById('approve-admission-year').value = new Date().getFullYear();

                    const modal = document.getElementById('modal-approve-registration');
                    if (modal) modal.classList.add('active');
                };
            });

            // Bind Reject buttons
            tbody.querySelectorAll('.btn-action-reject').forEach(btn => {
                btn.onclick = async () => {
                    const id = btn.dataset.id;
                    const reason = prompt('Please enter the reason for rejecting this registration:');
                    if (!reason || !reason.trim()) return;

                    try {
                        await MentorAPI.rejectRegistration(id, reason.trim());
                        showToast('Registration rejected');
                        loadPending();
                    } catch (err) {
                        showToast(err.message || 'Failed to reject registration', 'error');
                    }
                };
            });

        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #ef4444; padding: 16px;">Failed to load registrations: ${err.message}</td></tr>`;
        }
    }

    // Modal Approve Form submission
    const approveForm = document.getElementById('form-approve-registration');
    if (approveForm) {
        approveForm.onsubmit = async (e) => {
            e.preventDefault();

            const id = document.getElementById('approve-reg-id').value;
            const rollNo = document.getElementById('approve-roll-no').value.trim();
            const course = document.getElementById('approve-course').value;
            const branch = document.getElementById('approve-branch').value;
            const semester = parseInt(document.getElementById('approve-semester').value) || 1;
            const admissionYear = parseInt(document.getElementById('approve-admission-year').value) || new Date().getFullYear();
            const adminNotes = document.getElementById('approve-admin-notes').value.trim();

            if (!rollNo || !course || !branch) {
                alert('Please enter Roll Number, Course, and Branch');
                return;
            }

            const submitBtn = document.getElementById('btn-confirm-approve-reg');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Approving & Sending Email…</span>';

            try {
                const res = await MentorAPI.approveRegistration(id, {
                    rollNo,
                    course,
                    branch,
                    semester,
                    admissionYear,
                    adminNotes,
                });

                showToast(res.message || 'Registration approved and credentials emailed!');
                const modal = document.getElementById('modal-approve-registration');
                if (modal) modal.classList.remove('active');
                approveForm.reset();
                loadPending();

            } catch (err) {
                showToast(err.message || 'Failed to approve registration', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Approve & Send Credentials Email</span>';
            }
        };
    }

    if (statusFilter) {
        statusFilter.onchange = () => loadPending();
    }

    if (refreshBtn) {
        refreshBtn.onclick = () => loadPending();
    }

    loadPending();
}

// ----------------------------------------------------
// 3.4.B HOD / ADMIN SECTION ALLOTMENT VIEW
// ----------------------------------------------------

let selectedAllotmentStudentIds = new Set();
let currentAllotmentStudentsList = [];

function renderSectionAllotmentView() {
    const isHod = window.backendRole === 'HOD' || currentRole === 'hod';
    const deptName = currentUser?.department || 'Department';

    const titleEl = document.getElementById('allotment-page-title');
    if (titleEl) {
        titleEl.textContent = isHod
            ? `Department of ${deptName} — Section Allotment`
            : 'Institution-Wide Section Allotment & Distribution';
    }

    const subtitleEl = document.getElementById('allotment-page-subtitle');
    if (subtitleEl) {
        subtitleEl.textContent = isHod
            ? `Manage and allot verified ${deptName} students with completed profiles to their respective sections`
            : 'Manage and allot verified students across all departments to their respective sections';
    }

    const statusFilter = document.getElementById('allotment-filter-status');
    const semFilter = document.getElementById('allotment-filter-semester');
    const searchInput = document.getElementById('allotment-search-input');
    const refreshBtn = document.getElementById('btn-refresh-allotment');
    const selectAllCheckbox = document.getElementById('allotment-select-all');
    const selectedCountBadge = document.getElementById('allotment-selected-count');
    const bulkAllotBtn = document.getElementById('btn-bulk-allot-section');
    const targetSectionSelect = document.getElementById('allotment-target-section');
    const tbody = document.getElementById('allotment-students-tbody');

    if (!tbody) return;

    function updateSelectionUI() {
        const count = selectedAllotmentStudentIds.size;
        if (selectedCountBadge) {
            selectedCountBadge.textContent = `${count} student${count === 1 ? '' : 's'} selected`;
        }
        if (bulkAllotBtn) {
            bulkAllotBtn.disabled = count === 0;
        }

        // Update select-all checkbox state
        if (selectAllCheckbox) {
            const visibleCheckboxes = tbody.querySelectorAll('.allot-student-chk');
            if (visibleCheckboxes.length > 0) {
                const allChecked = Array.from(visibleCheckboxes).every(chk => chk.checked);
                const someChecked = Array.from(visibleCheckboxes).some(chk => chk.checked);
                selectAllCheckbox.checked = allChecked;
                selectAllCheckbox.indeterminate = someChecked && !allChecked;
            } else {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            }
        }
    }

    async function loadAllotmentQueue() {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">Loading allotment queue…</td></tr>`;

        const params = new URLSearchParams();
        const status = statusFilter ? statusFilter.value : 'pending';
        if (status) params.append('status', status);

        const sem = semFilter ? semFilter.value : '';
        if (sem) params.append('semester', sem);

        const search = searchInput ? searchInput.value.trim() : '';
        if (search) params.append('search', search);

        try {
            const res = await MentorAPI.getSectionAllotmentList(params.toString());
            const students = res.data || [];
            currentAllotmentStudentsList = students;

            // Update stats
            const counts = res.counts || {};
            const statPending = document.getElementById('allotment-stat-pending');
            const statAllotted = document.getElementById('allotment-stat-allotted');
            const statUncompleted = document.getElementById('allotment-stat-uncompleted');
            const statTotal = document.getElementById('allotment-stat-total');

            if (statPending) statPending.textContent = counts.pending ?? 0;
            if (statAllotted) statAllotted.textContent = counts.allotted ?? 0;
            if (statUncompleted) statUncompleted.textContent = counts.uncompleted ?? 0;
            if (statTotal) statTotal.textContent = counts.total ?? 0;

            if (students.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 28px;">No students found matching the selected filter.</td></tr>`;
                updateSelectionUI();
                return;
            }

            tbody.innerHTML = students.map(st => {
                const studentId = st.id || st._id;
                const isSelected = selectedAllotmentStudentIds.has(studentId);
                const isCompleted = st.profileCompleted;
                const hasSection = Boolean(st.section && st.section.trim());

                let profileBadge = isCompleted
                    ? `<span class="badge-tag" style="background: rgba(16, 185, 129, 0.15); color: #047857; font-weight: 600;">🟢 Completed</span>`
                    : `<span class="badge-tag" style="background: rgba(234, 88, 12, 0.15); color: #c2410c; font-weight: 500;">⏳ Details Pending</span>`;

                let sectionBadge = hasSection
                    ? `<span class="badge-tag" style="background: #dbeafe; color: #1e40af; font-weight: 700; font-size: 13px;">Section ${st.section}</span>`
                    : `<span class="badge-tag" style="background: #fef3c7; color: #92400e; font-weight: 600;">Unallotted</span>`;

                return `
                    <tr data-student-id="${studentId}">
                        <td style="text-align: center;">
                            <input type="checkbox" class="allot-student-chk" 
                                data-id="${studentId}" 
                                data-name="${st.name}" 
                                data-roll="${st.rollNo}"
                                ${isSelected ? 'checked' : ''} 
                                style="cursor: pointer; width: 16px; height: 16px;">
                        </td>
                        <td>
                            <strong style="color: var(--primary-light, #2563eb); font-family: monospace; font-size: 13.5px;">${st.rollNo}</strong>
                        </td>
                        <td>
                            <strong>${st.name}</strong>
                            <div style="font-size: 12px; color: var(--text-muted);">${st.email}</div>
                        </td>
                        <td>
                            <span style="font-size: 13px;">${st.course} - ${st.branch}</span>
                        </td>
                        <td>
                            <span style="font-size: 13px;">${st.semester || 'Sem 1'}</span>
                        </td>
                        <td>${profileBadge}</td>
                        <td>${sectionBadge}</td>
                        <td>
                            <div style="display: flex; gap: 4px; align-items: center;">
                                <select class="form-control quick-section-select" style="width: 75px; padding: 3px 6px; font-size: 12px; height: 28px;">
                                    <option value="A" ${st.section === 'A' ? 'selected' : ''}>Sec A</option>
                                    <option value="B" ${st.section === 'B' ? 'selected' : ''}>Sec B</option>
                                    <option value="C" ${st.section === 'C' ? 'selected' : ''}>Sec C</option>
                                    <option value="D" ${st.section === 'D' ? 'selected' : ''}>Sec D</option>
                                    <option value="E" ${st.section === 'E' ? 'selected' : ''}>Sec E</option>
                                    <option value="F" ${st.section === 'F' ? 'selected' : ''}>Sec F</option>
                                </select>
                                <button type="button" class="btn btn-secondary btn-quick-allot" 
                                    data-id="${studentId}" 
                                    data-name="${st.name}"
                                    style="padding: 3px 8px; font-size: 11.5px; height: 28px;">
                                    Allot
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            // Bind Row Checkboxes
            tbody.querySelectorAll('.allot-student-chk').forEach(chk => {
                chk.onchange = () => {
                    const id = chk.dataset.id;
                    if (chk.checked) {
                        selectedAllotmentStudentIds.add(id);
                    } else {
                        selectedAllotmentStudentIds.delete(id);
                    }
                    updateSelectionUI();
                };
            });

            // Bind Quick Allot Buttons
            tbody.querySelectorAll('.btn-quick-allot').forEach(btn => {
                btn.onclick = async () => {
                    const id = btn.dataset.id;
                    const name = btn.dataset.name;
                    const row = btn.closest('tr');
                    const selectEl = row ? row.querySelector('.quick-section-select') : null;
                    const targetSec = selectEl ? selectEl.value : 'A';

                    btn.disabled = true;
                    btn.textContent = '…';

                    try {
                        const res = await MentorAPI.bulkAllotSection([id], targetSec);
                        showToast(res.message || `Allotted ${name} to Section ${targetSec}!`, 'success');
                        await loadAllotmentQueue();
                    } catch (err) {
                        showToast(err.message || 'Failed to allot section', 'error');
                        btn.disabled = false;
                        btn.textContent = 'Allot';
                    }
                };
            });

            updateSelectionUI();

        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #ef4444; padding: 20px;">Failed to load allotment queue: ${err.message}</td></tr>`;
        }
    }

    // Bind Select All Checkbox
    if (selectAllCheckbox && !selectAllCheckbox.dataset.listenerAttached) {
        selectAllCheckbox.dataset.listenerAttached = 'true';
        selectAllCheckbox.onchange = () => {
            const isChecked = selectAllCheckbox.checked;
            const checkboxes = tbody.querySelectorAll('.allot-student-chk');
            checkboxes.forEach(chk => {
                chk.checked = isChecked;
                const id = chk.dataset.id;
                if (isChecked) {
                    selectedAllotmentStudentIds.add(id);
                } else {
                    selectedAllotmentStudentIds.delete(id);
                }
            });
            updateSelectionUI();
        };
    }

    // Bind Bulk Allot Button to open Confirmation Modal
    if (bulkAllotBtn && !bulkAllotBtn.dataset.listenerAttached) {
        bulkAllotBtn.dataset.listenerAttached = 'true';
        bulkAllotBtn.onclick = () => {
            if (selectedAllotmentStudentIds.size === 0) {
                showToast('Please select at least one student.', 'error');
                return;
            }

            const targetSection = targetSectionSelect ? targetSectionSelect.value : 'A';
            const modal = document.getElementById('modal-confirm-allot-section');
            const countEl = document.getElementById('confirm-allot-student-count');
            const badgeEl = document.getElementById('confirm-allot-target-section-badge');
            const namesEl = document.getElementById('confirm-allot-student-names');

            if (!modal) return;

            if (countEl) {
                countEl.textContent = `${selectedAllotmentStudentIds.size} student${selectedAllotmentStudentIds.size === 1 ? '' : 's'}`;
            }
            if (badgeEl) {
                badgeEl.textContent = `Section ${targetSection}`;
            }
            if (namesEl) {
                const selectedObjs = currentAllotmentStudentsList.filter(s => selectedAllotmentStudentIds.has(s.id || s._id));
                namesEl.innerHTML = selectedObjs.map(s => `
                    <div style="display: flex; justify-content: space-between; padding: 2px 0;">
                        <span><strong>${s.name}</strong> <small style="color: var(--text-muted);">(${s.rollNo})</small></span>
                        <span style="color: var(--text-muted); font-size: 11.5px;">${s.branch}</span>
                    </div>
                `).join('');
            }

            modal.classList.add('active');
        };
    }

    // Bind Confirm Allot Button inside Confirmation Modal
    const confirmSubmitBtn = document.getElementById('btn-confirm-allot-submit');
    if (confirmSubmitBtn && !confirmSubmitBtn.dataset.listenerAttached) {
        confirmSubmitBtn.dataset.listenerAttached = 'true';
        confirmSubmitBtn.onclick = async () => {
            const targetSection = targetSectionSelect ? targetSectionSelect.value : 'A';
            const studentIds = Array.from(selectedAllotmentStudentIds);

            if (studentIds.length === 0) {
                closeModal('modal-confirm-allot-section');
                return;
            }

            confirmSubmitBtn.disabled = true;
            confirmSubmitBtn.innerHTML = '<span>Allotting Sections…</span>';

            try {
                const res = await MentorAPI.bulkAllotSection(studentIds, targetSection);
                showToast(res.message || `Successfully allotted ${studentIds.length} students to Section ${targetSection}!`, 'success');
                selectedAllotmentStudentIds.clear();
                closeModal('modal-confirm-allot-section');
                await loadAllotmentQueue();
            } catch (err) {
                showToast(err.message || 'Failed to allot section', 'error');
            } finally {
                confirmSubmitBtn.disabled = false;
                confirmSubmitBtn.innerHTML = '<span>Confirm & Allot Section</span>';
            }
        };
    }

    // Bind Filters & Search
    if (statusFilter && !statusFilter.dataset.listenerAttached) {
        statusFilter.dataset.listenerAttached = 'true';
        statusFilter.onchange = () => loadAllotmentQueue();
    }

    if (semFilter && !semFilter.dataset.listenerAttached) {
        semFilter.dataset.listenerAttached = 'true';
        semFilter.onchange = () => loadAllotmentQueue();
    }

    if (refreshBtn && !refreshBtn.dataset.listenerAttached) {
        refreshBtn.dataset.listenerAttached = 'true';
        refreshBtn.onclick = () => loadAllotmentQueue();
    }

    if (searchInput && !searchInput.dataset.listenerAttached) {
        searchInput.dataset.listenerAttached = 'true';
        let debounceTimer;
        searchInput.oninput = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => loadAllotmentQueue(), 300);
        };
    }

    loadAllotmentQueue();
}

// ----------------------------------------------------
// 3.5 ACADEMIC FACULTY VIEW & DATA CONTROLS
// ----------------------------------------------------

function renderFacultyManageView() {
    const studentSelect = document.getElementById('faculty-student-select');
    const semSelect = document.getElementById('faculty-sem-select');
    if (!studentSelect || !semSelect) return;

    const students = store.getStudents();
    studentSelect.innerHTML = '';
    
    if (students.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No students found';
        studentSelect.appendChild(option);
        return;
    }

    students.forEach(st => {
        const option = document.createElement('option');
        option.value = st.id;
        option.textContent = `${st.name} (Roll No: ${st.rollNo || st.id}) - ${st.course} ${st.branch} (${st.semester})`;
        studentSelect.appendChild(option);
    });

    // Populate grade sheet for first selected student
    updateFacultyGradeSheet();

    // Attach change listeners if not attached yet
    if (!studentSelect.dataset.listenerAttached) {
        studentSelect.dataset.listenerAttached = 'true';
        studentSelect.addEventListener('change', updateFacultyGradeSheet);
        semSelect.addEventListener('change', updateFacultyGradeSheet);
    }

    // Attach form submit handler if not attached yet
    const form = document.getElementById('form-faculty-marks');
    if (form && !form.dataset.listenerAttached) {
        form.dataset.listenerAttached = 'true';
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const studentId = studentSelect.value;
            const sem = semSelect.value;
            if (!studentId) return;

            const student = store.getStudent(studentId);
            if (!student) return;

            if (!student.academics) student.academics = {};
            if (!student.academics[sem]) {
                student.academics[sem] = { gpa: 0, attendance: 0, marks: [] };
            }

            const code = document.getElementById('fac-subject-code').value.trim();
            const name = document.getElementById('fac-subject-name').value.trim();
            const s1 = parseFloat(document.getElementById('fac-sessional1').value) || 0;
            const s2 = parseFloat(document.getElementById('fac-sessional2').value) || 0;
            const put = parseFloat(document.getElementById('fac-put').value) || 0;
            const internal = parseFloat(document.getElementById('fac-internal').value) || 0;
            const external = parseFloat(document.getElementById('fac-external').value) || 0;
            const obtained = parseFloat(document.getElementById('fac-obtained').value) || (internal + external);
            const total = 100;
            const sgpa = parseFloat(document.getElementById('fac-sem-gpa').value) || 0;
            const backlogStatus = document.getElementById('fac-backlog-status').value.trim();

            if (sgpa > 0) student.academics[sem].gpa = sgpa;

            if (!student.academics[sem].marks) student.academics[sem].marks = [];
            
            const existingIdx = student.academics[sem].marks.findIndex(m => m.code.toLowerCase() === code.toLowerCase());
            const markObj = {
                code, name, sessional1: s1, sessional2: s2, put, internal, external, total, obtained
            };

            if (existingIdx >= 0) {
                student.academics[sem].marks[existingIdx] = markObj;
            } else {
                student.academics[sem].marks.push(markObj);
            }

            if (backlogStatus && backlogStatus.toLowerCase() !== 'none') {
                if (!student.backlogs) student.backlogs = [];
                const existingBacklog = student.backlogs.find(b => b.code === code && b.sem === sem);
                if (existingBacklog) {
                    existingBacklog.clearDate = backlogStatus.toLowerCase().includes('clear') ? new Date().toISOString().split('T')[0] : '';
                    existingBacklog.status = backlogStatus;
                } else {
                    student.backlogs.push({
                        sem, code, status: backlogStatus, clearDate: backlogStatus.toLowerCase().includes('clear') ? new Date().toISOString().split('T')[0] : ''
                    });
                }
            }

            store.updateStudent(student.id, student);
            showToast(`Academic record for ${student.name} (${sem}) saved successfully!`);
            updateFacultyGradeSheet();
        });
    }
}

function updateFacultyGradeSheet() {
    const studentId = document.getElementById('faculty-student-select')?.value;
    const sem = document.getElementById('faculty-sem-select')?.value;
    const container = document.getElementById('faculty-grade-sheet-container');
    if (!container) return;

    if (!studentId) {
        container.innerHTML = '<div class="empty-state">Please select a student to view academic records.</div>';
        return;
    }

    const student = store.getStudent(studentId);
    if (!student || !student.academics || !student.academics[sem]) {
        container.innerHTML = `<div class="empty-state">No academic records entered yet for ${sem}. Use the form above to enter marks.</div>`;
        return;
    }

    const semData = student.academics[sem];
    const marks = semData.marks || [];

    if (marks.length === 0) {
        container.innerHTML = `<div class="empty-state">No subject marks recorded for ${student.name} in ${sem}.</div>`;
        return;
    }

    let tableHtml = `
        <div style="margin-bottom: 1rem; display: flex; gap: 1.5rem; background: rgba(0,0,0,0.02); padding: 0.75rem 1rem; border-radius: 8px;">
            <div><strong>Semester GPA:</strong> ${semData.gpa || 'N/A'}</div>
            <div><strong>Attendance:</strong> ${semData.attendance ? semData.attendance + '%' : 'N/A'}</div>
            <div><strong>Total Subjects:</strong> ${marks.length}</div>
        </div>
        <div style="overflow-x: auto;">
            <table class="table" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border-color); text-align: left;">
                        <th style="padding: 8px;">Code</th>
                        <th style="padding: 8px;">Subject Name</th>
                        <th style="padding: 8px;">Sess I (30)</th>
                        <th style="padding: 8px;">Sess II (30)</th>
                        <th style="padding: 8px;">PUT (50)</th>
                        <th style="padding: 8px;">Internal (50)</th>
                        <th style="padding: 8px;">External (50)</th>
                        <th style="padding: 8px;">Total (100)</th>
                        <th style="padding: 8px;">Obtained</th>
                    </tr>
                </thead>
                <tbody>
    `;

    marks.forEach(m => {
        tableHtml += `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 8px; font-weight: 600;">${m.code}</td>
                <td style="padding: 8px;">${m.name}</td>
                <td style="padding: 8px;">${m.sessional1 ?? '-'}</td>
                <td style="padding: 8px;">${m.sessional2 ?? '-'}</td>
                <td style="padding: 8px;">${m.put ?? '-'}</td>
                <td style="padding: 8px;">${m.internal ?? '-'}</td>
                <td style="padding: 8px;">${m.external ?? '-'}</td>
                <td style="padding: 8px;">${m.total ?? 100}</td>
                <td style="padding: 8px; font-weight: bold; color: var(--primary-color);">${m.obtained ?? '-'}</td>
            </tr>
        `;
    });

    tableHtml += `</tbody></table></div>`;
    container.innerHTML = tableHtml;
}

function applyAccessModelPermissions(role) {

    // ========================================================
    // OFFICIAL STUDENT INFORMATION
    // Admin only
    // ========================================================

    const officialIds = [
        'student-enrollment',
        'student-name',
        'student-course',
        'student-branch',
        'student-specialization',
        'student-semester',
        'student-batch',
        'student-section',
        'student-mobile',
        'student-type'
    ];

    const canEditOfficial =
        window.backendRole === 'ADMIN' || window.backendRole === 'HOD';

    officialIds.forEach(id => {
        const el = document.getElementById(id);

        if (el) {
            el.disabled = !canEditOfficial;
        }
    });


    // ========================================================
    // ACADEMIC FACULTY
    // Academic marks = WRITE
    // Attendance = READ ONLY
    // ========================================================

    if (window.backendRole === 'ACADEMIC_FACULTY') {

        // Academic Faculty cannot edit general student data
        document.querySelectorAll(
            '[data-permission="STUDENT_WRITE"],' +
            '[data-permission="PROFILE_WRITE"],' +
            '[data-permission="MENTORING_WRITE"]'
        ).forEach(el => {
            el.disabled = true;
            el.style.display = 'none';
        });

        // Academic Faculty CANNOT write attendance
        document.querySelectorAll(
            '[data-permission="ATTENDANCE_WRITE"]'
        ).forEach(el => {
            el.disabled = true;
            el.style.display = 'none';
        });

        // Academic writing controls remain available
        document.querySelectorAll(
            '[data-permission="ACADEMIC_WRITE"]'
        ).forEach(el => {
            el.disabled = false;
            el.style.display = '';
        });
    }


    // ========================================================
    // MENTEE
    // ========================================================

    if (window.backendRole === 'MENTEE') {

        // Official fields are read-only
        document.querySelectorAll(
            '[data-permission="OFFICIAL_WRITE"]'
        ).forEach(el => {
            el.disabled = true;
            el.readOnly = true;
        });

        // Mentee cannot write academic/attendance/mentoring data
        document.querySelectorAll(
            '[data-permission="ACADEMIC_WRITE"],' +
            '[data-permission="ATTENDANCE_WRITE"],' +
            '[data-permission="MENTORING_WRITE"]'
        ).forEach(el => {
            el.disabled = true;
            el.style.display = 'none';
        });
    }


    // ========================================================
    // MENTOR
    // Attendance = WRITE
    // Academic = READ ONLY
    // ========================================================

    if (window.backendRole === 'MENTOR') {

        document.querySelectorAll(
            '[data-permission="ATTENDANCE_WRITE"]'
        ).forEach(el => {
            el.disabled = false;
            el.style.display = '';
        });

        document.querySelectorAll(
            '[data-permission="ACADEMIC_WRITE"]'
        ).forEach(el => {
            el.disabled = true;
            el.style.display = 'none';
        });
    }


    // ========================================================
    // OTHER FACULTY
    // ========================================================

    if (window.backendRole === 'OTHER_FACULTY') {

        document.querySelectorAll(
            '[data-permission="ACADEMIC_WRITE"],' +
            '[data-permission="ATTENDANCE_WRITE"],' +
            '[data-permission="MENTORING_WRITE"]'
        ).forEach(el => {
            el.disabled = true;
            el.style.display = 'none';
        });
    }
}
// ----------------------------------------------------
// 4. MAIN PAGE INITIALIZATION
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    // Check local storage theme
    initTheme();

    // Setup Toast container if not present
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // The backend is now the source of truth. localStorage remains only as a
    // temporary UI cache until each feature is migrated to its REST endpoint.
    store._reload();

    // Init Login Form Role switching and credentials check
    initLogin();

    // Auto-restore authenticated user session on page load / reload
    if (window.MentorAPI && MentorAPI.isAuthenticated()) {
        try {
            const user = await MentorAPI.me();
            if (user) {
                await activateUserSession(user);
            }
        } catch (err) {
            console.warn('Session auto-restore failed:', err);
            localStorage.removeItem('mm_access_token');
            localStorage.removeItem('mm_active_view');
        }
    }

    // Universal Logout Button hook
    document.querySelectorAll('.btn-logout').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            MentorAPI.logout().catch(err => console.warn('Logout API error:', err));
            currentUser = null;
            currentRole = null;
            backendRole = null;
            selectedStudentForMentor = null;
            selectedStudentForAdmin = null;
            localStorage.removeItem('mm_active_view');
            
            showToast('Logged out successfully', 'info');
            
            // Clean active charts
            if (charts.cgpa) charts.cgpa.destroy();
            if (charts.attendance) charts.attendance.destroy();
            charts = {};

            document.getElementById('app-screen').style.display = 'none';
            document.getElementById('login-screen').style.display = 'flex';
        });
    });

    // Cancel buttons back to Mentees list (for Mentor Review screen)
    document.getElementById('btn-back-to-mentees').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        document.getElementById('mentor-dashboard').classList.add('active');
        renderMentorMentees();
    });

    // Cancel buttons back to Admin dashboard (for Admin Student Edit screen)
    document.getElementById('btn-back-to-admin').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        document.getElementById('admin-dashboard').classList.add('active');
        renderAdminDashboard();
    });

    // ============================================================
    // PHOTO UPLOAD FUNCTIONALITY
    // ============================================================

    // Photo preview handlers
    const photoInputs = [
        { input: 'upload-student-photo', preview: 'preview-student-photo' },
        { input: 'upload-father-photo', preview: 'preview-father-photo' },
        { input: 'upload-mother-photo', preview: 'preview-mother-photo' },
        { input: 'upload-guardian-photo', preview: 'preview-guardian-photo' }
    ];

    photoInputs.forEach(({ input, preview }) => {
        const inputEl = document.getElementById(input);
        const previewEl = document.getElementById(preview);
        
        if (inputEl && previewEl) {
            inputEl.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Validate file type
                    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
                    if (!validTypes.includes(file.type)) {
                        showToast('Please select a valid image file (JPG, PNG, WEBP, GIF)', 'error');
                        e.target.value = '';
                        return;
                    }
                    
                    // Validate file size (500KB max)
                    if (file.size > 500 * 1024) {
                        showToast('File size must be less than 500KB', 'error');
                        e.target.value = '';
                        return;
                    }
                    
                    // Show preview
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = previewEl.querySelector('img');
                        img.src = event.target.result;
                        previewEl.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    });

    // Upload photos button handler
    const btnUploadPhotos = document.getElementById('btn-upload-photos');
    const uploadStatus = document.getElementById('upload-status');

    if (btnUploadPhotos) {
        btnUploadPhotos.addEventListener('click', async () => {
            try {
                // Get student ID (roll number) from current user
                let studentId;
                
                if (currentRole === 'student') {
                    // Use rollNo for students (backend expects roll number, not MongoDB _id)
                    studentId = currentUser.rollNo || currentUser.id;
                } else if (selectedStudentForMentor) {
                    studentId = selectedStudentForMentor.rollNo || selectedStudentForMentor.id;
                } else if (selectedStudentForAdmin) {
                    studentId = selectedStudentForAdmin.rollNo || selectedStudentForAdmin.id;
                } else {
                    showToast('Unable to determine student ID', 'error');
                    return;
                }

                // Collect selected files
                const files = {};
                const studentPhotoInput = document.getElementById('upload-student-photo');
                const fatherPhotoInput = document.getElementById('upload-father-photo');
                const motherPhotoInput = document.getElementById('upload-mother-photo');
                const guardianPhotoInput = document.getElementById('upload-guardian-photo');

                if (studentPhotoInput?.files[0]) files.studentPhoto = studentPhotoInput.files[0];
                if (fatherPhotoInput?.files[0]) files.fatherPhoto = fatherPhotoInput.files[0];
                if (motherPhotoInput?.files[0]) files.motherPhoto = motherPhotoInput.files[0];
                if (guardianPhotoInput?.files[0]) files.guardianPhoto = guardianPhotoInput.files[0];

                // Check if at least one file is selected
                if (Object.keys(files).length === 0) {
                    showToast('Please select at least one photo to upload', 'warning');
                    return;
                }

                // Show loading status
                btnUploadPhotos.disabled = true;
                uploadStatus.textContent = 'Uploading...';
                uploadStatus.style.color = 'var(--primary-light)';

                // Upload photos via API
                const result = await MentorAPI.uploadStudentPhotos(studentId, files);

                if (result.success) {
                    // Show success message with remaining attempts info
                    const successMsg = result.message || `Successfully uploaded ${Object.keys(files).length} photo(s)!`;
                    showToast(successMsg, 'success');
                    
                    // Update status with remaining attempts if available
                    if (result.data.remainingAttempts !== undefined && result.data.remainingAttempts !== null) {
                        uploadStatus.textContent = `✓ Upload complete! ${result.data.remainingAttempts} attempt(s) remaining.`;
                        
                        // Show warning if only 1 attempt left
                        if (result.data.remainingAttempts === 1) {
                            uploadStatus.style.color = 'var(--warning-color, #f59e0b)';
                        } else if (result.data.remainingAttempts === 0) {
                            uploadStatus.style.color = 'var(--error-color, #ef4444)';
                            uploadStatus.textContent = '✓ Upload complete! No more attempts remaining.';
                            // Disable upload button if no attempts left
                            btnUploadPhotos.disabled = true;
                            btnUploadPhotos.textContent = 'Upload Limit Reached';
                        } else {
                            uploadStatus.style.color = 'var(--success-color, #10b981)';
                        }
                    } else {
                        uploadStatus.textContent = '✓ Upload complete!';
                        uploadStatus.style.color = 'var(--success-color, #10b981)';
                    }

                    // Update photo URL fields with uploaded URLs (for backend storage, but not displayed in UI)
                    // Note: The Photograph URL field has been removed from the UI as requested
                    
                    if (result.data.parentFatherPhotoUrl) {
                        const fatherPhotoUrlField = document.getElementById('parent-father-photo');
                        if (fatherPhotoUrlField) {
                            fatherPhotoUrlField.value = result.data.parentFatherPhotoUrl;
                        }
                    }
                    if (result.data.parentMotherPhotoUrl) {
                        const motherPhotoUrlField = document.getElementById('parent-mother-photo');
                        if (motherPhotoUrlField) {
                            motherPhotoUrlField.value = result.data.parentMotherPhotoUrl;
                        }
                    }
                    if (result.data.guardianPhotoUrl) {
                        const guardianPhotoUrlField = document.getElementById('guardian-photo-url');
                        if (!guardianPhotoUrlField) {
                            // Add guardian photo URL field if it doesn't exist
                            const guardianSection = document.querySelector('#guardian-addr').parentElement.parentElement;
                            if (guardianSection) {
                                const photoField = document.createElement('div');
                                photoField.className = 'form-group';
                                photoField.innerHTML = `
                                    <label>Guardian Photo URL (Auto-filled)</label>
                                    <input type="text" id="guardian-photo-url" class="form-control" value="${result.data.guardianPhotoUrl}" readonly>
                                `;
                                guardianSection.appendChild(photoField);
                            }
                        } else {
                            guardianPhotoUrlField.value = result.data.guardianPhotoUrl;
                        }
                    }

                    // Update currentUser photoUrl if student photo was uploaded
                    if (result.data.photoUrl) {
                        currentUser.photoUrl = result.data.photoUrl;
                        
                        // Update the profile avatar in the sidebar immediately
                        const profileAvatar = document.querySelector('.profile-avatar');
                        if (profileAvatar) {
                            profileAvatar.src = result.data.photoUrl;
                        }
                    }

                    // Clear file inputs and previews after successful upload
                    [studentPhotoInput, fatherPhotoInput, motherPhotoInput, guardianPhotoInput].forEach(input => {
                        if (input) input.value = '';
                    });
                    
                    photoInputs.forEach(({ preview }) => {
                        const previewEl = document.getElementById(preview);
                        if (previewEl) previewEl.style.display = 'none';
                    });

                    // Reload student data to reflect uploaded photos in form fields
                    if (currentRole === 'student') {
                        try {
                            const refreshedStudent = await MentorAPI.getStudentById(studentId);
                            if (refreshedStudent) {
                                // Update currentUser with fresh data including all photo URLs
                                Object.assign(currentUser, refreshedStudent);
                            }
                        } catch (err) {
                            console.log('Could not refresh student data:', err);
                        }
                    }
                } else {
                    showToast('Photo upload failed. Please try again.', 'error');
                    uploadStatus.textContent = '✗ Upload failed';
                    uploadStatus.style.color = 'var(--error-color, #ef4444)';
                }
            } catch (error) {
                console.error('Photo upload error:', error);
                showToast(error.message || 'Photo upload failed. Please try again.', 'error');
                uploadStatus.textContent = '✗ Upload failed';
                uploadStatus.style.color = 'var(--error-color, #ef4444)';
            } finally {
                btnUploadPhotos.disabled = false;
                
                // Clear status message after 3 seconds
                setTimeout(() => {
                    uploadStatus.textContent = '';
                }, 3000);
            }
        });
    }
});
