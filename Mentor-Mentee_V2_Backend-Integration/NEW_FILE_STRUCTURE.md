# 📁 SMAS-SERVER FILE STRUCTURE (After Migration)

## 🗂️ Complete Directory Layout

```
D:\Projects\Mentor-Mentee_V1\Mentor-Mentee_V2_Backend-Integration\Mentor-Mentee_V1\
│
├── 📂 server/                                    # 🆕 SMAS-SERVER (ACTIVE)
│   │
│   ├── 📄 .env                                   # Environment variables (MongoDB, JWT secrets)
│   ├── 📄 .gitignore                             # Git ignore rules
│   ├── 📄 package.json                           # Dependencies (includes multer, express-validator)
│   ├── 📄 package-lock.json                      # Locked dependency versions
│   ├── 📄 app.js                                 # Express app (336 lines - comprehensive setup)
│   ├── 📄 server.js                              # Server entry point
│   │
│   ├── 📂 config/                                # Configuration files
│   │   ├── db.js                                 # MongoDB connection
│   │   └── permissions.js                        # RBAC permissions system (211 lines)
│   │
│   ├── 📂 controllers/                           # Business logic layer (8 controllers)
│   │   ├── academicController.js                 # Academic records management
│   │   ├── attendanceController.js               # Attendance tracking (RBAC enforced)
│   │   ├── authController.js                     # Login, logout, refresh, me
│   │   ├── facultyController.js                  # ✅ Faculty CRUD operations (NEW)
│   │   ├── mentorController.js                   # Mentor-mentee operations
│   │   ├── resourceController.js                 # File/resource management
│   │   ├── studentController.js                  # Student CRUD operations
│   │   ├── studentImportController.js            # Excel import via API
│   │   └── systemController.js                   # System-level operations
│   │
│   ├── 📂 models/                                # Mongoose schemas (MongoDB)
│   │   ├── User.js                               # ✅ Users (6 roles + 8 faculty fields) - UPDATED
│   │   ├── Student.js                            # Student profiles (468 lines - comprehensive)
│   │   ├── Session.js                            # Mentoring sessions
│   │   └── Feedback.js                           # Anonymous feedback
│   │
│   ├── 📂 routes/                                # API endpoint definitions (10 routes)
│   │   ├── academicRoutes.js                     # Academic records routes
│   │   ├── attendanceRoutes.js                   # Attendance routes
│   │   ├── authRoutes.js                         # Authentication routes
│   │   ├── facultyRoutes.js                      # ✅ Faculty routes (NEW)
│   │   ├── mentorRoutes.js                       # Mentor routes
│   │   ├── ProtectedRoute.jsx                    # React component (misplaced - to be cleaned)
│   │   ├── resourceRoutes.js                     # Resource/file routes
│   │   ├── studentImportRoutes.js                # Import API routes
│   │   ├── studentRoutes.js                      # Student routes
│   │   └── systemRoutes.js                       # System routes
│   │
│   ├── 📂 middleware/                            # Express middleware
│   │   ├── auth.js                               # JWT authentication
│   │   ├── authorize.js                          # RBAC authorization
│   │   └── errorHandler.js                       # Centralized error handling
│   │
│   ├── 📂 services/                              # Business logic services
│   │   ├── academicService.js                    # Academic operations
│   │   ├── accessService.js                      # Access control
│   │   ├── attendanceService.js                  # Attendance operations
│   │   └── auditService.js                       # Audit logging
│   │
│   ├── 📂 validators/                            # Input validation schemas
│   │   └── authValidators.js                     # Auth validation rules
│   │
│   ├── 📂 utils/                                 # Utility functions (8 files)
│   │   ├── ApiError.js                           # Custom error class
│   │   ├── checkColumns.js                       # ✅ Excel column checker (NEW - temp)
│   │   ├── defaultAccounts.js                    # Default user accounts
│   │   ├── importFaculty.js                      # ✅ Faculty import script (NEW)
│   │   ├── importStudents.js                     # ✅ Student import script (NEW)
│   │   ├── query.js                              # Query helpers
│   │   ├── seed.js                               # Database seeding
│   │   └── tokens.js                             # JWT token utilities
│   │
│   ├── 📂 tests/                                 # Test suite
│   │   ├── academic.test.js                      # Academic tests
│   │   ├── attendance.test.js                    # Attendance tests
│   │   ├── auth.test.js                          # Auth tests
│   │   ├── health.test.js                        # Health check tests
│   │   ├── models.test.js                        # Model tests
│   │   └── rbac.test.js                          # RBAC tests
│   │
│   └── 📂 node_modules/                          # Dependencies (200+ packages)
│       ├── express/                              # Web framework
│       ├── mongoose/                             # MongoDB ODM
│       ├── bcryptjs/                             # Password hashing
│       ├── jsonwebtoken/                         # JWT generation
│       ├── multer/                               # ✅ File upload handling
│       ├── express-validator/                    # ✅ Advanced validation
│       ├── helmet/                               # Security headers
│       ├── cors/                                 # Cross-origin requests
│       ├── morgan/                               # Request logging
│       ├── xlsx/                                 # Excel file parsing
│       └── [195+ other packages]
│
├── 📂 client/                                    # Frontend SPA
│   ├── 📄 index.html                             # Single-page application
│   ├── 📄 app.js                                 # UI logic + DataStore
│   ├── 📄 api.js                                 # MentorAPI client
│   └── 📄 styles.css                             # Styling (dark/light mode)
│
├── 📄 for mentor mentee Data.xlsx                # Student data (217 records)
├── 📄 15_Dummy_Faculty_Mentor_Data.xlsx          # Faculty data (15 records)
└── 📄 mentor-mentee_Complete.md                  # Official requirements (622 lines)
```

---

## 🆕 NEW FILES CREATED (Migration)

### Controllers (1 new)
```
✅ controllers/facultyController.js               (184 lines)
   - getFaculty() - List all faculty with filters
   - getFacultyById() - Get single faculty
   - updateFaculty() - Update profile
   - getFacultyMe() - Get current user's profile
```

### Routes (1 new)
```
✅ routes/facultyRoutes.js                        (27 lines)
   - GET  /api/faculty      - List faculty (Admin/HOD)
   - GET  /api/faculty/me   - Current faculty profile
   - GET  /api/faculty/:id  - Faculty by ID
   - PUT  /api/faculty/:id  - Update faculty
```

### Utils (3 new)
```
✅ utils/importStudents.js                        (142 lines)
   - Imports 217 students from Excel
   - Creates User accounts (MENTEE role)
   - Creates Student profiles
   - Maps Excel columns to database fields

✅ utils/importFaculty.js                         (174 lines)
   - Imports 15 faculty from Excel
   - Creates User accounts (faculty roles)
   - Validates data integrity
   - Checks for duplicates
   - Bcrypt password hashing

✅ utils/checkColumns.js                          (16 lines)
   - Temporary utility to check Excel column names
   - Can be deleted after import is complete
```

---

## ✏️ MODIFIED FILES (Migration)

### Models (1 modified)
```
✅ models/User.js                                 (UPDATED)
   Added 8 faculty-specific fields:
   - department
   - designation
   - specialization
   - phone
   - officeRoom
   - qualifications
   - experience
   - researchInterests
```

### App Configuration (1 modified)
```
✅ app.js                                         (UPDATED)
   - Added import: facultyRoutes
   - Registered route: app.use('/api/faculty', facultyRoutes)
   - Line 17: import facultyRoutes
   - Lines 310-315: Route registration
```

---

## 📊 FILE COUNT SUMMARY

| Category | Count | Status |
|----------|-------|--------|
| **Controllers** | 8 | ✅ Complete (+1 faculty) |
| **Routes** | 10 | ✅ Complete (+1 faculty) |
| **Models** | 4 | ✅ Complete (User updated) |
| **Middleware** | 3 | ✅ Complete |
| **Services** | 4 | ✅ Complete |
| **Validators** | 1 | ✅ Complete |
| **Utils** | 8 | ✅ Complete (+3 new) |
| **Tests** | 6 | ✅ Existing (needs faculty tests) |
| **Config** | 2 | ✅ Complete |
| **Dependencies** | 200+ | ✅ Installed (includes multer) |

---

## 🎯 KEY DIFFERENCES FROM OLD SERVER

### **mentor-mentee-server** (Old - Simple)
```
Structure:
├── controllers/     (7 files)
├── routes/          (7 files)
├── models/          (4 files)
├── middleware/      (2 files)
├── seed/            (3 files)
└── test/            (3 files)

Missing:
❌ No multer (file uploads)
❌ No express-validator
❌ No services layer
❌ No validators folder
❌ No resource management
❌ No system routes
❌ Basic error handling
```

### **smas-server** (New - Production Grade)
```
Structure:
├── controllers/     (8 files) ✅ +1 faculty
├── routes/          (10 files) ✅ +1 faculty
├── models/          (4 files) ✅ User updated
├── middleware/      (3 files) ✅ Centralized errors
├── services/        (4 files) ✅ Business logic
├── validators/      (1 file) ✅ Input validation
├── utils/           (8 files) ✅ +3 import scripts
└── tests/           (6 files) ✅ Comprehensive

Advantages:
✅ Multer configured (file uploads)
✅ express-validator (advanced validation)
✅ Services layer (separation of concerns)
✅ Validators folder (input validation)
✅ Resource management (file handling)
✅ System routes (admin operations)
✅ Centralized error handling
✅ More professional architecture
```

---

## 🔧 IMPORT SCRIPTS READY

### **Student Import**
```bash
File: utils/importStudents.js
Source: for mentor mentee Data.xlsx
Records: 217 students
Status: ⚠️ Blocked by MongoDB index conflict
```

**Column Mapping:**
| Excel Column | Database Field |
|--------------|----------------|
| Student Name | name |
| Father's Name | fatherName |
| Roll No. | rollNumber, studentId |
| Email ID | email |
| Mobile No. | phone |
| Course / Branch | course, branch (split) |
| Year Section | year, section (split) |
| Gender | gender |
| 10th % | academicDetails.tenth |
| 12th % | academicDetails.twelfth |
| Sem 1-6 | semesterPerformance.sem1-6 |

### **Faculty Import**
```bash
File: utils/importFaculty.js
Source: 15_Dummy_Faculty_Mentor_Data.xlsx
Records: 15 faculty
Status: ✅ Ready to run
```

**Excel Columns:**
- Name
- Email
- Role (HOD, MENTOR, ACADEMIC_FACULTY, OTHER_FACULTY)
- Department
- Designation
- Specialization
- Phone
- Office Room
- Qualifications
- Experience
- Research Interests

---

## 🚀 API ENDPOINTS (Complete List)

### **Authentication** (`/api/auth`)
```
POST   /api/auth/login          - User login
GET    /api/auth/me             - Get current user
POST   /api/auth/logout         - Logout
POST   /api/auth/refresh        - Refresh token
```

### **Students** (`/api/students`)
```
GET    /api/students            - List all (Admin/HOD/Faculty)
GET    /api/students/me         - Current student (Mentee)
GET    /api/students/:id        - Get by ID
PUT    /api/students/:id        - Update student
POST   /api/students/import     - Import from Excel
```

### **Faculty** (`/api/faculty`) ✅ NEW
```
GET    /api/faculty             - List all (Admin/HOD)
GET    /api/faculty/me          - Current faculty
GET    /api/faculty/:id         - Get by ID
PUT    /api/faculty/:id         - Update profile
```

### **Mentors** (`/api/mentors`)
```
GET    /api/mentors             - List mentors
GET    /api/mentors/:id/mentees - Get assigned mentees
```

### **Academic** (`/api/academic` or `/api/marks`)
```
GET    /api/marks               - Get marks
PUT    /api/marks               - Update marks
```

### **Attendance** (`/api/attendance`)
```
GET    /api/attendance          - Get attendance
POST   /api/attendance          - Save attendance (RBAC: 403 for ACADEMIC_FACULTY)
```

### **Resources** (`/api/resources`)
```
GET    /api/resources           - List resources
POST   /api/resources/upload    - Upload files (multer)
DELETE /api/resources/:id       - Delete resource
```

### **System** (`/api/system`)
```
GET    /api/system/health       - Health check
GET    /api/system/stats        - System statistics
POST   /api/system/settings     - Update settings
```

---

## 🔐 SECURITY FEATURES

### **Middleware Stack**
```javascript
1. CORS (restricted origins)
2. Helmet (security headers)
3. Rate Limiting (300 req/15min)
4. Body Parser (1MB limit)
5. Cookie Parser
6. Morgan (logging)
7. JWT Authentication
8. RBAC Authorization
9. Error Handler (centralized)
```

### **Password Security**
```javascript
- Bcrypt hashing (12 salt rounds)
- Password field: select: false
- Minimum 8 characters
- Never exposed in API responses
```

---

## 💾 DATABASE SCHEMA

### **Collections**
```
mentor-connect (database)
├── users                    # 217+ documents (students + faculty)
│   ├── Indexes: email (unique), role
│   └── Faculty fields: 8 additional fields
│
├── students                 # 217 documents (detailed profiles)
│   ├── Indexes: userId, rollNumber, studentId
│   └── References: User model
│
├── sessions                 # Mentoring sessions
│   └── References: students, mentors
│
└── feedbacks                # Anonymous feedback
    └── References: students, mentors
```

---

## 🎯 NEXT STEPS TO COMPLETE

### **1. Fix MongoDB Index** (2 min)
```bash
mongosh "YOUR_MONGO_URI"
use mentor-connect
db.students.dropIndex("enrollmentNo_1")
exit
```

### **2. Run Imports** (7 min)
```bash
cd server
node utils/importStudents.js    # 217 students
node utils/importFaculty.js     # 15 faculty
```

### **3. Start Server** (1 min)
```bash
npm start
```

### **4. Test System** (5 min)
```
http://localhost:5000
Login and verify all features work
```

---

## 📈 MIGRATION STATUS

```
Progress: ████████████████░░░░ 80% Complete

✅ Completed:
   - Faculty system integrated
   - User model updated
   - Import scripts created
   - Routes registered
   - App.js updated

⚠️ Pending:
   - Fix MongoDB index conflict
   - Run student import
   - Run faculty import
   - Test all features
   - Clean up temp files
```

---

## 📝 CLEANUP TASKS (After Import)

```bash
# Delete temporary utility
rm utils/checkColumns.js

# Remove misplaced React component
rm routes/ProtectedRoute.jsx

# Optional: Remove old server backup
# (Keep for reference initially)
```

---

## 🎓 SUMMARY

**New Server Location:**
```
D:\Projects\Mentor-Mentee_V1\Mentor-Mentee_V2_Backend-Integration\Mentor-Mentee_V1\server
```

**Total Files:**
- Core application: ~40 files
- Dependencies: 200+ packages
- Documentation: 5 comprehensive guides

**Key Features:**
- ✅ Photo upload support (multer)
- ✅ Advanced validation (express-validator)
- ✅ Faculty management system
- ✅ Professional architecture
- ✅ Production-ready security
- ✅ Comprehensive RBAC
- ✅ Import/export capabilities

**Status:** Ready for data import and testing

---

*File Structure Documentation*
*Generated: 2026-09-05 at 11:20 AM*
*Server: smas-server (ACTIVE)*
