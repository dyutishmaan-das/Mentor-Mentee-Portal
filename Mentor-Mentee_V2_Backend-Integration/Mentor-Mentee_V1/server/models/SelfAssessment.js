import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    technicalSkills: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    problemSolving: { type: Number, min: 1, max: 5 },
    leadership: { type: Number, min: 1, max: 5 },
    teamwork: { type: Number, min: 1, max: 5 },
    careerGoals: String,
    strengths: String,
    weaknesses: String,
    improvementAreas: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
export default mongoose.model('SelfAssessment', schema);
