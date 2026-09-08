
import mongoose from 'mongoose';

/*
|--------------------------------------------------------------------------
| Semester / Aggregate Performance
|--------------------------------------------------------------------------
|
| The Excel may contain:
|
| 65     -> Percentage
| 8.36   -> CGPA
|
| We keep both the value and its type.
|
*/

const performanceSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      min: 0,
    },

    type: {
      type: String,
      enum: ['Percentage', 'CGPA'],
    },
  },
  {
    _id: false,
  },
);

const schema = new mongoose.Schema(
  {
    // ============================================================
    // USER / STUDENT IDENTITY
    // ============================================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    /*
     * IMPORTANT:
     * Excel does NOT need a Student ID column.
     *
     * Roll No. from Excel will be copied into studentId
     * during Excel import.
     *
     * Example:
     * Excel Roll No. = "23CSE001"
     *
     * studentId = "23CSE001"
     * rollNumber = "23CSE001"
     */

    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    fatherName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: ['Male', 'Female'],
    },

    // ============================================================
    // COURSE / BRANCH
    // ============================================================

    /*
     * Excel column:
     *
     * Course / Branch
     */

   program: {
  type: String,
  enum: [
    'B.Tech.-CSE',
    'B.Tech.-AI/ML',
    'B.Tech.-CSE-IoT',
    'B.Tech.-CSE-DS',
  ],
},
    /*
     * Excel column:
     *
     * Year Section
     */

    section: {
      type: String,
      trim: true,
    },

    /*
     * Current semester of the student.
     *
     * This is different from semesterPerformance.
     */

    semester: {
      type: Number,
      min: 1,
      max: 12,
    },

    yearOfPassing: {
      type: Number,
    },

    // ============================================================
    // PREVIOUS ACADEMIC PERFORMANCE
    // ============================================================

    academicDetails: {
      tenth: {
        type: Number,
        min: 0,
        max: 100,
      },

      twelfth: {
        type: Number,
        min: 0,
        max: 100,
      },

      diploma: {
        type: Number,
        min: 0,
        max: 100,
      },
    },

    // ============================================================
    // SEMESTER PERFORMANCE
    // ============================================================
    //
    // These are NOT individual subject marks.
    //
    // Example:
    //
    // Sem 1 = 65
    // -> { value: 65, type: 'Percentage' }
    //
    // Sem 2 = 8.36
    // -> { value: 8.36, type: 'CGPA' }
    //
    // ============================================================

    semesterPerformance: {
      sem1: performanceSchema,
      sem2: performanceSchema,
      sem3: performanceSchema,
      sem4: performanceSchema,
      sem5: performanceSchema,
      sem6: performanceSchema,
      sem7: performanceSchema,
      sem8: performanceSchema,
    },

    // ============================================================
    // AGGREGATE PERFORMANCE
    // ============================================================

    /*
     * Example:
     *
     * 65
     * -> Percentage
     *
     * 8.36
     * -> CGPA
     */

    aggregatePerformance: performanceSchema,

    // ============================================================
    // BACKLOGS
    // ============================================================

    activeBacklogs: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ============================================================
    // SKILLS / CAREER INFORMATION
    // ============================================================

    skillExpertise: {
      type: String,
      trim: true,
    },

    softSkills: {
      type: String,
      trim: true,
    },

    certificationsDone: {
      type: String,
      trim: true,
    },

    internships: {
      type: String,
      trim: true,
    },

    projects: {
      type: String,
      trim: true,
    },

    communicationLevel: {
      type: String,
      trim: true,
    },

    placementInterest: {
      type: String,
      trim: true,
    },

    higherStudiesPlan: {
      type: String,
      trim: true,
    },

    portfolioLinks: {
      type: String,
      trim: true,
    },

    achievementsAwards: {
      type: String,
      trim: true,
    },

    extracurricularLeadership: {
      type: String,
      trim: true,
    },

    remarks: {
      type: String,
      trim: true,
    },

    // ============================================================
    // EXISTING PROFILE INFORMATION
    // ============================================================

    dateOfBirth: {
      type: Date,
    },

    address: {
      type: String,
      trim: true,
    },

    /*
     * Kept because your existing application already uses
     * Department references.
     */

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },

    // ============================================================
    // MENTOR
    // ============================================================

    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mentor',
    },

    // ============================================================
    // PARENT / GUARDIAN
    // ============================================================

    parents: {
      name: {
        type: String,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
      },

      email: {
        type: String,
        lowercase: true,
        trim: true,
      },
    },

    guardian: {
      name: {
        type: String,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
      },

      relationship: {
        type: String,
        trim: true,
      },
    },

    // ============================================================
    // OTHER PROFILE INFORMATION
    // ============================================================

    hobbies: {
      type: [String],
      default: [],
    },

    hostelDetails: {
      requested: Boolean,
      hostelName: String,
      roomNumber: String,
    },

    transportDetails: {
      requested: Boolean,
      route: String,
      pickupPoint: String,
    },

    profilePhoto: {
      type: String,
    },

    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ============================================================
    // SYSTEM / SOFT DELETE
    // ============================================================

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // ============================================================
    // AUDIT
    // ============================================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

// ================================================================
// INDEXES
// ================================================================

schema.index({
  department: 1,
  program: 1,
  semester: 1,
});

schema.index({
  program: 1,
  section: 1,
});

schema.index({
  program: 1,
  gender: 1,
});

schema.index({
  mentorId: 1,
});

schema.index({
  activeBacklogs: 1,
});

schema.index({
  name: 1,
});

schema.index({
  yearOfPassing: 1,
});

export default mongoose.model('Student', schema);

