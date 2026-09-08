import mongoose from 'mongoose';
const fields = {
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected', 'Active', 'Completed'],
    default: 'Pending',
  },
  proof: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
};
const create = (name, extra = {}) =>
  mongoose.model(name, new mongoose.Schema({ ...fields, ...extra }, { timestamps: true }));
export const Certification = create('Certification', {
  issuingOrganization: String,
  issueDate: Date,
  expiryDate: Date,
  credentialId: String,
  credentialUrl: String,
  certificateFile: String,
});
export const Internship = create('Internship', {
  company: String,
  role: String,
  startDate: Date,
  endDate: Date,
  type: { type: String, enum: ['Full-time', 'Part-time', 'Remote', 'On-site', 'Hybrid'] },
  location: String,
  certificate: String,
});
export const Project = create('Project', {
  technologies: [String],
  githubUrl: String,
  liveUrl: String,
  startDate: Date,
  endDate: Date,
  role: String,
  projectType: { type: String, enum: ['Mini', 'Major', 'Personal', 'Academic'] },
});
export const ClubActivity = create('ClubActivity', {
  organization: String,
  date: Date,
  role: String,
});
export const Achievement = create('Achievement', {
  date: Date,
  organization: String,
  category: String,
});
export const CompetitiveExam = create('CompetitiveExam', {
  examName: String,
  examDate: Date,
  score: Number,
  percentile: Number,
  rank: Number,
  result: String,
  certificate: String,
});
export const Placement = create('Placement', {
  company: String,
  role: String,
  package: Number,
  applicationDate: Date,
  interviewStatus: String,
  offerStatus: {
    type: String,
    enum: [
      'Applied',
      'Shortlisted',
      'Interview',
      'Selected',
      'Rejected',
      'Offer Received',
      'Joined',
    ],
    default: 'Applied',
  },
  joiningDate: Date,
  placementType: String,
});
