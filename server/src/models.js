import mongoose from "mongoose";

const { Schema, model } = mongoose;
const opts = { timestamps: true };

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["admin", "hod", "mentor", "student"], required: true },
  department: { type: String, trim: true },
  phone: String,
  active: { type: Boolean, default: true }
}, opts);

const studentSchema = new Schema({
  enrollmentNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  mentor: { type: Schema.Types.ObjectId, ref: "User" },
  course: { type: String, required: true },
  branch: { type: String, required: true },
  specialization: String,
  semester: { type: Number, required: true, min: 1, max: 8 },
  batch: String,
  category: String,
  dateOfBirth: Date,
  bloodGroup: String,
  identificationMark: String,
  presentAddress: String,
  permanentAddress: String,
  siblings: Number,
  father: { name: String, phone: String, email: String, occupation: String },
  mother: { name: String, phone: String, email: String, occupation: String },
  localGuardian: { name: String, relation: String, occupation: String, address: String, phone: String },
  priorAcademics: [{ exam: String, institution: String, year: Number, board: String, division: String, percentage: Number }],
  hobbies: [{ name: String, participation: String, award: String }],
  accommodation: [{ semester: Number, hostel: String, room: String, transportRoute: String }],
  attendance: { type: Number, min: 0, max: 100, default: 0 },
  cgpa: { type: Number, min: 0, max: 10, default: 0 },
  risk: { type: String, enum: ["On track", "Watch", "Needs attention"], default: "On track" },
  notes: String
}, opts);

const academicSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  subjects: [{
    name: { type: String, required: true }, code: String, sessional1: Number, sessional2: Number,
    put: Number, internal: Number, external: Number, total: Number
  }],
  totalObtained: Number,
  aggregate: Number,
  sgpa: Number,
  actionTaken: [{ type: String, enum: ["Student counselled", "Parent contacted", "Letter dispatched", "Parent meeting"] }],
  backlogs: [{ subjectCode: String, clearedOn: Date }]
}, opts);
academicSchema.index({ student: 1, semester: 1 }, { unique: true });

const recordSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  category: {
    type: String, required: true,
    enum: ["certification", "activity", "internship", "placement", "club", "achievement", "competitiveExam", "discipline", "attendance", "parentMeeting"]
  },
  semester: { type: Number, min: 1, max: 8 },
  title: { type: String, required: true },
  organization: String,
  date: Date,
  endDate: Date,
  score: String,
  result: String,
  actionTaken: String,
  details: String,
  attachmentUrl: String
}, opts);

const sessionSchema = new Schema({
  mentor: { type: Schema.Types.ObjectId, ref: "User", required: true },
  student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  scheduledAt: { type: Date, required: true },
  agenda: { type: String, required: true, trim: true },
  discussion: String,
  studentConcerns: String,
  mentorAdvice: String,
  actionItems: [{ text: { type: String, required: true }, dueDate: Date, completed: { type: Boolean, default: false } }],
  status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
  confidential: { type: Boolean, default: true }
}, opts);

const assessmentSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  mentor: { type: Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["mentorFeedback", "selfAssessment", "mentorAssessment"], required: true },
  semester: { type: Number, min: 1, max: 8 },
  ratings: [{ criterion: String, score: { type: Number, min: 0, max: 10 } }],
  comments: String,
  suggestions: String,
  submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, opts);

export const User = mongoose.models.User || model("User", userSchema);
export const Student = mongoose.models.Student || model("Student", studentSchema);
export const Academic = mongoose.models.Academic || model("Academic", academicSchema);
export const Record = mongoose.models.Record || model("Record", recordSchema);
export const Session = mongoose.models.Session || model("Session", sessionSchema);
export const Assessment = mongoose.models.Assessment || model("Assessment", assessmentSchema);
