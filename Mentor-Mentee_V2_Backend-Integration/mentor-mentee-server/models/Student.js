import mongoose from 'mongoose';

/*
 * Student model — shaped to match the frontend's flat student object
 * with nested academics dictionary keyed as "Sem 1" … "Sem 8".
 *
 * Fields that come from the Excel import are populated first;
 * the rest are filled in later by menteees / mentors / faculty.
 */

const markSchema = new mongoose.Schema(
    {
        code: { type: String, default: '' },
        name: { type: String, default: '' },
        sessional1: { type: Number, default: 0 },
        sessional2: { type: Number, default: 0 },
        put: { type: Number, default: 0 },
        internal: { type: Number, default: 0 },
        external: { type: Number, default: 0 },
        total: { type: Number, default: 100 },
        obtained: { type: Number, default: 0 },
    },
    { _id: false }
);

const semesterDataSchema = new mongoose.Schema(
    {
        gpa: { type: Number, default: 0 },
        attendance: { type: Number, default: 0 },
        marks: { type: [markSchema], default: [] },
    },
    { _id: false }
);

const hobbySchema = new mongoose.Schema(
    {
        hobby: { type: String, default: '' },
        participation: { type: String, default: '' },
        awards: { type: String, default: '' },
    },
    { _id: false }
);

const certificationSchema = new mongoose.Schema(
    {
        semester: { type: String, default: '' },
        duration: { type: String, default: '' },
        program: { type: String, default: '' },
        onlineOffline: { type: String, default: 'Online' },
        grade: { type: String, default: '' },
        certificateAwarded: { type: String, default: 'Yes' },
    },
    { _id: false }
);

const internshipSchema = new mongoose.Schema(
    {
        driveDate: { type: String, default: '' },
        companyName: { type: String, default: '' },
        onOffCampus: { type: String, default: 'Off Campus' },
        appeared: { type: String, default: 'Yes' },
        outcome: { type: String, default: '' },
        designation: { type: String, default: '' },
        projectTitle: { type: String, default: '' },
        externalGuide: { type: String, default: '' },
        internalGuide: { type: String, default: '' },
    },
    { _id: false }
);

const jobSchema = new mongoose.Schema(
    {
        company: { type: String, default: '' },
        role: { type: String, default: '' },
        duration: { type: String, default: '' },
        description: { type: String, default: '' },
    },
    { _id: false }
);

const clubActivitySchema = new mongoose.Schema(
    {
        year: { type: String, default: '' },
        club: { type: String, default: '' },
        responsibilities: { type: String, default: '' },
    },
    { _id: false }
);

const achievementSchema = new mongoose.Schema(
    {
        title: { type: String, default: '' },
        details: { type: String, default: '' },
        category: { type: String, default: '' },
    },
    { _id: false }
);

const competitiveExamSchema = new mongoose.Schema(
    {
        date: { type: String, default: '' },
        examName: { type: String, default: '' },
        conductingOrg: { type: String, default: '' },
        outcome: { type: String, default: '' },
    },
    { _id: false }
);

const selfAssessmentSchema = new mongoose.Schema(
    {
        semester: { type: String, default: '' },
        score1: { type: Number, default: 0 },
        score2: { type: Number, default: 0 },
        score3: { type: Number, default: 0 },
        score4: { type: Number, default: 0 },
    },
    { _id: false }
);

const backlogSchema = new mongoose.Schema(
    {
        semester: { type: String, default: '' },
        subjectCode: { type: String, default: '' },
        clearDate: { type: String, default: null },
    },
    { _id: false }
);

const disciplinaryRecordSchema = new mongoose.Schema(
    {
        date: { type: String, default: '' },
        details: { type: String, default: '' },
        outcome: { type: String, default: '' },
        actionTaken: { type: String, default: '' },
    },
    { _id: false }
);

const mentorAssessmentSchema = new mongoose.Schema(
    {
        punctuality: { type: Number, default: 0 },
        leadership: { type: Number, default: 0 },
        teamSpirit: { type: Number, default: 0 },
        interpersonal: { type: Number, default: 0 },
        comments: { type: String, default: '' },
    },
    { _id: false }
);

const studentSchema = new mongoose.Schema(
    {
        // ============ Core identity ============
        // "id" in the frontend is the roll number.
        // We keep Mongo _id but expose a virtual "id" from rollNo.
        rollNo: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        name: { type: String, required: true, trim: true },
        email: { type: String, default: '', lowercase: true, trim: true },
        gender: { type: String, default: '' },

        // ============ Academic classification ============
        course: { type: String, default: 'B.Tech' },
        branch: { type: String, default: 'Computer Science & Engineering' },
        department: { type: String, default: '', trim: true },
        specialization: { type: String, default: 'None' },
        semester: { type: String, default: 'Sem 1' },
        batch: { type: String, default: '' },
        section: { type: String, default: '' },
        status: { type: String, default: 'Active' },
        yearOfPassing: { type: String, default: '' },

        // ============ Personal details ============
        category: { type: String, default: '' },
        dob: { type: String, default: '' },
        bloodGroup: { type: String, default: '' },
        identificationMark: { type: String, default: '' },
        mobile1: { type: String, default: '' },
        mobile2: { type: String, default: '' },
        addressPresent: { type: String, default: '' },
        addressPermanent: { type: String, default: '' },
        siblingsCount: { type: String, default: '0' },
        photoUrl: { type: String, default: '' },
        type: { type: String, default: 'Day Scholar' }, // Hosteller or Day Scholar

        // ============ Parent info ============
        parentFatherName: { type: String, default: '' },
        parentFatherMobile1: { type: String, default: '' },
        parentFatherMobile2: { type: String, default: '' },
        parentFatherEmail: { type: String, default: '' },
        parentFatherPhotoUrl: { type: String, default: '' },
        parentMotherName: { type: String, default: '' },
        parentMotherMobile1: { type: String, default: '' },
        parentMotherMobile2: { type: String, default: '' },
        parentMotherEmail: { type: String, default: '' },
        parentMotherPhotoUrl: { type: String, default: '' },

        // ============ Local guardian ============
        guardianName: { type: String, default: '' },
        guardianRelationship: { type: String, default: '' },
        guardianOccupation: { type: String, default: '' },
        guardianAddress: { type: String, default: '' },
        guardianMobile1: { type: String, default: '' },
        guardianMobile2: { type: String, default: '' },
        guardianPhotoUrl: { type: String, default: '' },

        // ============ Pre-university academics ============
        academics10thSchool: { type: String, default: '' },
        academics10thYear: { type: String, default: '' },
        academics10thBoard: { type: String, default: '' },
        academics10thDivision: { type: String, default: '' },
        academics10thMarks: { type: String, default: '' },
        academics12thSchool: { type: String, default: '' },
        academics12thYear: { type: String, default: '' },
        academics12thBoard: { type: String, default: '' },
        academics12thDivision: { type: String, default: '' },
        academics12thMarks: { type: String, default: '' },
        diplomaMarks: { type: String, default: '' },

        // ============ Transport / Hostel ============
        transportRoute: { type: String, default: 'None' },
        hostelName: { type: String, default: 'None' },
        hostelRoomNumber: { type: String, default: '' },

        // ============ Mentor assignment ============
        mentorId: { type: String, default: '' },

        // ============ Photo Upload Tracking ============
        photoUploadAttempts: { type: Number, default: 0, max: 3 },
        photoUploadHistory: [{
            uploadedAt: { type: Date },
            uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            photosUploaded: [String], // Array of photo types: ['studentPhoto', 'fatherPhoto', etc.]
        }],

        // ============ Profile Completion Status ============
        profileCompleted: { type: Boolean, default: false },
        profileCompletedAt: { type: Date },

        // ============ Semester academics (the critical nested map) ============
        // Stored as a plain Map so keys can be "Sem 1" … "Sem 8".
        academics: {
            type: Map,
            of: semesterDataSchema,
            default: () => {
                const m = new Map();
                for (let i = 1; i <= 8; i++) {
                    m.set(`Sem ${i}`, { gpa: 0, attendance: 0, marks: [] });
                }
                return m;
            },
        },

        // ============ Portfolio arrays (entered by mentee) ============
        hobbies: { type: [hobbySchema], default: [] },
        certifications: { type: [certificationSchema], default: [] },
        internships: { type: [internshipSchema], default: [] },
        jobs: { type: [jobSchema], default: [] },
        clubActivities: { type: [clubActivitySchema], default: [] },
        achievements: { type: [achievementSchema], default: [] },
        competitiveExams: { type: [competitiveExamSchema], default: [] },
        selfAssessments: { type: [selfAssessmentSchema], default: [] },

        // ============ Institution-managed records ============
        backlogs: { type: [backlogSchema], default: [] },
        disciplinaryRecords: { type: [disciplinaryRecordSchema], default: [] },
        parentMeetings: { type: [mongoose.Schema.Types.Mixed], default: [] },
        interventions: { type: [mongoose.Schema.Types.Mixed], default: [] },

        // ============ Mentor assessment ============
        mentorAssessment: {
            type: mentorAssessmentSchema,
            default: () => ({}),
        },

        // ============ Extra Excel fields ============
        skillExpertise: { type: String, default: '' },
        softSkills: { type: String, default: '' },
        projects: { type: String, default: '' },
        communicationLevel: { type: String, default: '' },
        placementInterest: { type: String, default: '' },
        higherStudiesPlan: { type: String, default: '' },
        linkedinUrl: { type: String, default: '' },
        remarks: { type: String, default: '' },

        // Link to User model (when student has a login account)
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        // Profile completion status
        profileCompleted: {
            type: Boolean,
            default: false,
        },
        profileCompletedAt: {
            type: Date,
            default: null,
        },

        // Section allotment details (assigned by HOD)
        sectionAllottedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        sectionAllottedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: expose rollNo as "id" for frontend compatibility
studentSchema.virtual('id').get(function () {
    return this.rollNo;
});

// When converting toJSON, transform the Map to a plain object
// so the frontend receives { "Sem 1": {...}, "Sem 2": {...}, … }
studentSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        // Convert academics Map to plain object
        if (ret.academics instanceof Map) {
            const obj = {};
            for (const [key, val] of ret.academics) {
                obj[key] = val;
            }
            ret.academics = obj;
        }
        // Remove Mongo internals the frontend doesn't need
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
