import MentoringSession from '../models/MentoringSession.js';
import MentorRemark from '../models/MentorRemark.js';
import MentorAssessment from '../models/MentorAssessment.js';
import SelfAssessment from '../models/SelfAssessment.js';
import CounselingRecord from '../models/CounselingRecord.js';
import Intervention from '../models/Intervention.js';
import ParentMeeting from '../models/ParentMeeting.js';
import StudentProgressReview from '../models/StudentProgressReview.js';
import {
  Certification,
  Internship,
  Project,
  ClubActivity,
  Achievement,
  CompetitiveExam,
  Placement,
} from '../models/PortfolioItem.js';
import StudentFeedback from '../models/StudentFeedback.js';
import MentorAction from '../models/MentorAction.js';

export const resourceRegistry = {
  mentoring: {
    model: MentoringSession,
    domain: 'mentoring',
    roles: ['MENTOR', 'ADMIN', 'HOD'],
    studentField: 'student',
  },
  remarks: {
    model: MentorRemark,
    domain: 'mentorData',
    roles: ['MENTOR', 'ADMIN', 'HOD'],
    studentField: 'student',
  },
  assessments: {
    model: MentorAssessment,
    domain: 'mentorData',
    roles: ['MENTOR', 'ADMIN', 'HOD'],
    studentField: 'student',
  },
  'self-assessments': {
    model: SelfAssessment,
    domain: 'selfAssessment',
    roles: ['MENTEE', 'ADMIN', 'HOD'],
    studentField: 'student',
  },
  counseling: {
    model: CounselingRecord,
    domain: 'mentorData',
    roles: ['MENTOR', 'ADMIN', 'HOD'],
    studentField: 'student',
  },
  interventions: {
    model: Intervention,
    domain: 'mentorData',
    roles: ['MENTOR', 'ADMIN', 'HOD'],
    studentField: 'student',
  },
  'parent-meetings': {
    model: ParentMeeting,
    domain: 'mentorData',
    roles: ['MENTOR', 'ADMIN', 'HOD'],
    studentField: 'student',
  },
  'progress-reviews': {
    model: StudentProgressReview,
    domain: 'mentorData',
    roles: ['MENTOR', 'ADMIN', 'HOD'],
    studentField: 'student',
  },
  certifications: {
    model: Certification,
    domain: 'portfolio',
    roles: ['MENTEE', 'ADMIN', 'HOD'],
    studentField: 'student',
  },
  internships: {
    model: Internship,
    domain: 'portfolio',
    roles: ['MENTEE', 'ADMIN', 'HOD'],
    studentField: 'student',
  },
  projects: {
    model: Project,
    domain: 'portfolio',
    roles: ['MENTEE', 'ADMIN', 'HOD'],
    studentField: 'student',
  },
  'club-activities': {
    model: ClubActivity,
    domain: 'portfolio',
    roles: ['MENTEE', 'ADMIN', 'HOD'],
    studentField: 'student',
  },
  achievements: {
    model: Achievement,
    domain: 'portfolio',
    roles: ['MENTEE', 'ADMIN', 'HOD'],
    studentField: 'student',
  },
  exams: {
    model: CompetitiveExam,
    domain: 'portfolio',
    roles: ['MENTEE', 'ADMIN', 'HOD'],
    studentField: 'student',
  },
  placements: {
    model: Placement,
    domain: 'portfolio',
    roles: ['MENTEE', 'ADMIN', 'HOD', 'ACADEMIC_FACULTY'],
    studentField: 'student',
  },
  feedback: {
    model: StudentFeedback,
    domain: 'feedback',
    roles: ['MENTEE', 'MENTOR', 'ADMIN', 'HOD'],
    studentField: 'student',
  },
  'mentor-actions': {
    model: MentorAction,
    domain: 'mentorData',
    roles: ['MENTOR', 'ADMIN', 'HOD'],
    studentField: 'student',
  },
};
