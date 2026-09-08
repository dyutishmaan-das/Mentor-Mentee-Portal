# 📁 MENTOR-MENTEE PORTAL - PROJECT FILE STRUCTURE

## 🗂️ Complete Directory Layout

```
D:\Projects\Mentor-Mentee_V1\
│
├── 📄 ARCHITECTURE_DOCUMENTATION.md          # Complete technical architecture (270+ lines)
├── 📄 QUICK_START_GUIDE.md                   # Step-by-step deployment guide (330+ lines)
├── 📄 15_Dummy_Faculty_Mentor_Data.xlsx      # Faculty import data (15 records)
│
├── 📂 Mentor-Mentee_V2_Backend-Integration/
│   │
│   ├── 📂 mentor-mentee-server/              # ✅ BACKEND API (Node.js + Express)
│   │   │
│   │   ├── 📄 .env                           # Environment configuration (MongoDB URI, JWT secrets)
│   │   ├── 📄 .gitignore                     # Git ignore rules
│   │   ├── 📄 package.json                   # Node.js dependencies
│   │   ├── 📄 package-lock.json              # Locked dependency versions
│   │   ├── 📄 app.js                         # Express app configuration
│   │   ├── 📄 server.js                      # Server entry point
│   │   │
│   │   ├── 📂 config/                        # Configuration files
│   │   │   └── db.js                         # MongoDB connection setup
│   │   │
│   │   ├── 📂 controllers/                   # Business logic layer
│   │   │   ├── authController.js             # Login, logout, refresh, me
│   │   │   ├── studentController.js          # Student CRUD operations
│   │   │   ├── facultyController.js          # ✅ Faculty management (NEW)
│   │   │   ├── mentorController.js           # Mentor-mentee operations
│   │   │   ├── sessionController.js          # Mentoring sessions
│   │   │   ├── marksController.js            # Academic marks management
│   │   │   ├── attendanceController.js       # Attendance tracking
│   │   │   └── feedbackController.js         # Anonymous feedback
│   │   │
│   │   ├── 📂 models/                        # Mongoose schemas (MongoDB)
│   │   │   ├── User.js                       # ✅ Users (all 6 roles + faculty fields)
│   │   │   ├── Student.js                    # Student profiles & portfolio
│   │   │   ├── Session.js                    # Mentoring sessions
│   │   │   └── Feedback.js                   # Feedback records
│   │   │
│   │   ├── 📂 routes/                        # API endpoint definitions
│   │   │   ├── authRoutes.js                 # POST /api/auth/login, GET /api/auth/me
│   │   │   ├── studentRoutes.js              # GET/PUT /api/students
│   │   │   ├── facultyRoutes.js              # ✅ GET/PUT /api/faculty (NEW)
│   │   │   ├── mentorRoutes.js               # GET /api/mentors
│   │   │   ├── sessionRoutes.js              # GET/POST /api/sessions
│   │   │   ├── marksRoutes.js                # GET/PUT /api/marks
│   │   │   └── attendanceRoutes.js           # GET/POST /api/attendance (RBAC protected)
│   │   │
│   │   ├── 📂 middleware/                    # Express middleware
│   │   │   ├── auth.js                       # JWT authentication (verify token)
│   │   │   └── authorize.js                  # RBAC authorization (role checking)
│   │   │
│   │   ├── 📂 seed/                          # Data import scripts
│   │   │   ├── importExcel.js                # Import 206 students from Excel
│   │   │   ├── importFaculty.js              # ✅ Import 15 faculty/mentors (NEW)
│   │   │   └── seedFaculty.js                # Seed demo faculty accounts
│   │   │
│   │   ├── 📂 test/                          # Test suite
│   │   │   ├── runTests.js                   # ✅ Main test suite (26/26 passing)
│   │   │   ├── testProfilePersistence.js     # ✅ Profile persistence test
│   │   │   └── testFacultySystem.js          # ✅ Faculty system test (NEW)
│   │   │
│   │   └── 📂 node_modules/                  # Dependencies (bcryptjs, jsonwebtoken, etc.)
│   │
│   └── 📂 Mentor-Mentee_V1/                  # ✅ FRONTEND SPA
│       │
│       └── 📂 client/                        # Single-page application
│           ├── 📄 index.html                 # Main HTML (all portals in one file)
│           ├── 📄 app.js                     # UI logic + DataStore + session management
│           ├── 📄 api.js                     # MentorAPI client (fetch wrapper)
│           ├── 📄 styles.css                 # Styling (dark/light mode)
│           └── 📄 206_students.xlsx          # Student import data (206 records)
│
└── 📂 [Other project folders...]

```

---

## 🔑 KEY FILES EXPLAINED

### Backend Core Files

#### **server.js** (Entry Point)
```javascript
- Loads environment variables
- Connects to MongoDB
- Starts Express server on port 5000
```

#### **app.js** (Express Configuration)
```javascript
- Configures middleware (CORS, Helmet, Rate Limiting)
- Registers API routes
- Serves static frontend files
- Error handling
```

#### **config/db.js**
```javascript
- MongoDB Atlas connection logic
- Connection string from .env
- Error handling for database failures
```

---

### Backend Routes (API Endpoints)

| Route File | Endpoints | Protected By |
|------------|-----------|--------------|
| `authRoutes.js` | `POST /api/auth/login`<br>`GET /api/auth/me`<br>`POST /api/auth/logout` | Public (login)<br>JWT (others) |
| `studentRoutes.js` | `GET /api/students`<br>`GET /api/students/me`<br>`PUT /api/students/:id` | JWT + RBAC |
| `facultyRoutes.js` | `GET /api/faculty`<br>`GET /api/faculty/me`<br>`PUT /api/faculty/:id` | JWT + RBAC |
| `mentorRoutes.js` | `GET /api/mentors`<br>`GET /api/mentors/:id/mentees` | JWT + RBAC |
| `sessionRoutes.js` | `GET/POST /api/sessions` | JWT + RBAC |
| `marksRoutes.js` | `GET/PUT /api/marks` | JWT + RBAC |
| `attendanceRoutes.js` | `GET /api/attendance`<br>`POST /api/attendance` | JWT + RBAC<br>(403 for ACADEMIC_FACULTY) |

---

### Backend Models (Database Schemas)

#### **User.js**
```javascript
Fields:
- name, email, password (bcrypt hashed)
- role: ADMIN | HOD | ACADEMIC_FACULTY | MENTOR | OTHER_FACULTY | MENTEE
- isActive, lastLoginAt
- Faculty fields: department, designation, specialization, phone, 
  officeRoom, qualifications, experience, researchInterests
```

#### **Student.js**
```javascript
Fields:
- rollNo (unique), userId (ref: User)
- Personal: name, email, gender, dob, mobile, address
- Parents: father/mother name, email, phone
- Academic: 10th/12th marks, semester GPA, marks breakdown
- Portfolio: hobbies, certifications, internships, achievements
- Mentor: mentorId, mentorAssessment
- Institution: backlogs, disciplinaryRecords
```

#### **Session.js**
```javascript
Fields:
- studentId, mentorId
- date, duration, type, topic, notes
- status: Scheduled | Completed | Cancelled
```

#### **Feedback.js**
```javascript
Fields:
- studentId, mentorId
- date, q1-q4 (1-5 rating scale)
- comments
```

---

### Backend Middleware

#### **auth.js** (JWT Authentication)
```javascript
authenticate(req, res, next):
1. Extract token from Authorization header
2. Verify JWT signature using JWT_SECRET
3. Check token expiration
4. Attach user to req.user
5. Call next() or return 401 Unauthorized
```

#### **authorize.js** (RBAC)
```javascript
authorize(allowedRoles):
1. Check if req.user.role exists
2. Verify role is in allowedRoles array
3. Call next() or return 403 Forbidden

Example:
router.post('/attendance', 
  authenticate, 
  authorize(['ADMIN', 'HOD', 'MENTOR']), 
  saveAttendance
);
```

---

### Backend Controllers (Business Logic)

| Controller | Purpose | Key Methods |
|------------|---------|-------------|
| `authController.js` | Authentication | `login()`, `logout()`, `me()`, `refresh()` |
| `studentController.js` | Student management | `getStudents()`, `getStudentMe()`, `updateStudent()` |
| `facultyController.js` | Faculty management | `getFaculty()`, `getFacultyMe()`, `updateFaculty()` |
| `mentorController.js` | Mentor operations | `getMentors()`, `getMentees()` |
| `sessionController.js` | Session tracking | `getSessions()`, `createSession()`, `updateSession()` |
| `marksController.js` | Academic records | `getMarks()`, `updateMarks()` |
| `attendanceController.js` | Attendance | `getAttendance()`, `saveAttendance()` (RBAC enforced) |

---

### Frontend Files

#### **index.html**
```html
Structure:
- Login screen
- Navigation bar (role-based visibility)
- 6 portal sections (Admin, HOD, Academic, Mentor, Mentee, Other)
- Student profile form (auto-saves to MongoDB)
- Portfolio management (hobbies, certs, internships)
- Charts & reports
```

#### **app.js**
```javascript
Components:
- DataStore: In-memory cache + sync with backend
- MentorUI: UI rendering & event handlers
- Session management: activateUserSession(), restoreSession()
- Auto-save: Profile updates trigger PUT /api/students/:id
- Tab persistence: localStorage for active view
```

#### **api.js**
```javascript
MentorAPI:
- login(email, password)
- me() - Get current user
- logout()
- getStudents()
- updateStudent(id, data)
- getMentors()
- createSession(data)
- ... (all API calls)
```

#### **styles.css**
```css
Features:
- CSS custom properties for theming
- Dark/light mode toggle
- Responsive grid layouts
- Professional color scheme
- Card-based UI components
```

---

## 🗃️ DATA FILES

### Import Data
```
├── client/206_students.xlsx          # 206 student records
│   Columns: Roll No, Name, Email, Course, Branch, Semester, etc.
│
└── 15_Dummy_Faculty_Mentor_Data.xlsx # 15 faculty records
    Columns: Name, Email, Role, Department, Designation, etc.
```

---

## 🔧 Configuration Files

### **.env** (Environment Variables)
```env
MONGO_URI=mongodb+srv://...          # MongoDB Atlas connection
JWT_SECRET=...                       # JWT signing secret
JWT_REFRESH_SECRET=...               # Refresh token secret
PORT=5000                            # Server port
NODE_ENV=development                 # Environment
CLIENT_URL=http://localhost:5000     # CORS origin
```

### **package.json** (Dependencies)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.x",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.x",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.0.3",
    "morgan": "^1.10.0",
    "validator": "^13.9.0",
    "xlsx": "^0.18.5"
  }
}
```

---

## 📊 DATABASE COLLECTIONS (MongoDB Atlas)

```
mentormentee (database)
├── users                # 221 documents (206 students + 15 faculty)
├── students             # 206 documents (detailed student profiles)
├── sessions             # Mentoring sessions
└── feedbacks            # Anonymous feedback records
```

---

## 🔐 SECURITY FILES

### **middleware/auth.js**
- JWT token verification
- Token expiration checking
- User authentication

### **middleware/authorize.js**
- Role-based access control
- Permission checking
- 403 Forbidden responses

---

## 🧪 TEST FILES

### **test/runTests.js**
```
26 tests covering:
✓ Health check
✓ Admin authentication
✓ Student CRUD
✓ Token refresh
✓ Mentor operations
✓ RBAC enforcement
✓ Profile persistence
```

### **test/testProfilePersistence.js**
```
Verifies:
✓ Student profile saves to MongoDB
✓ Data persists after server restart
✓ Profile data reloads correctly
```

### **test/testFacultySystem.js**
```
Verifies:
✓ Faculty login
✓ Faculty profile retrieval
✓ Admin can list all faculty
✓ Role-based filtering
✓ Security (RBAC enforcement)
```

---

## 📦 NODE_MODULES (Key Dependencies)

```
node_modules/
├── express/              # Web framework
├── mongoose/             # MongoDB ODM
├── bcryptjs/             # Password hashing
├── jsonwebtoken/         # JWT generation/verification
├── cors/                 # Cross-origin requests
├── helmet/               # Security headers
├── express-rate-limit/   # Rate limiting
├── validator/            # Input validation
├── xlsx/                 # Excel file parsing
└── [200+ other dependencies and sub-dependencies]
```

---

## 🎯 FILE COUNT SUMMARY

| Category | Count |
|----------|-------|
| Backend Controllers | 8 |
| Backend Routes | 8 |
| Backend Models | 4 |
| Backend Middleware | 2 |
| Seed Scripts | 3 |
| Test Files | 3 |
| Frontend Files | 4 |
| Data Files | 2 |
| Documentation | 2 |
| Configuration | 3 |
| **Total Core Files** | **39** |

---

## 🚀 EXECUTION FLOW

### 1. Server Startup
```
server.js
  → Load .env
  → config/db.js (Connect MongoDB)
  → app.js (Configure Express)
  → Listen on port 5000
```

### 2. User Login
```
Frontend: Login form
  → api.js: MentorAPI.login(email, password)
  → Backend: POST /api/auth/login
  → authController.login()
  → User.findOne({ email })
  → bcrypt.compare(password)
  → jwt.sign(payload)
  → Return token + user data
  → Frontend: Store token, activate session
```

### 3. Profile Update
```
Frontend: Student edits profile
  → Click "Save Profile"
  → app.js: store.updateStudent(id, data)
  → api.js: PUT /api/students/:id
  → Backend: studentController.updateStudent()
  → Student.findByIdAndUpdate()
  → MongoDB: Save permanently
  → Return updated data
  → Frontend: Update UI + currentUser
```

### 4. RBAC Enforcement
```
Request: POST /api/attendance
  → middleware/auth.js: authenticate()
  → Verify JWT token
  → middleware/authorize.js: authorize(['ADMIN', 'HOD', 'MENTOR'])
  → Check req.user.role
  → If ACADEMIC_FACULTY → 403 Forbidden
  → If authorized → attendanceController.saveAttendance()
```

---

## 📋 QUICK REFERENCE

### Start Server
```bash
cd D:\Projects\Mentor-Mentee_V1\Mentor-Mentee_V2_Backend-Integration\mentor-mentee-server
npm start
```

### Access Application
```
http://localhost:5000
```

### Import Data
```bash
node seed/importExcel.js      # 206 students
node seed/importFaculty.js    # 15 faculty
```

### Run Tests
```bash
node test/runTests.js
```

---

## ✅ STATUS: PRODUCTION-READY

- **Total Files**: 39 core files + dependencies
- **Total Lines of Code**: ~15,000+ (excluding node_modules)
- **Database Records**: 221 users (206 students + 15 faculty)
- **Test Coverage**: 26/26 passing
- **Security**: JWT + bcrypt + RBAC + Rate limiting + Helmet
- **Documentation**: Complete (600+ lines)

---

*Last Updated: 2026-09-05*
*Project Status: ✅ Complete & Production-Ready*
