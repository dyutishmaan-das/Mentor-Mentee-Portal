import Attendance from '../models/Attendance.js';

export async function getAttendanceSummary(studentIds, semester) {
  const match = {
    ...(studentIds?.length && { student: { $in: studentIds } }),
    ...(semester && { semester: Number(semester) }),
  };

  return Attendance.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$student',
        totalClasses: { $sum: 1 },
        presentClasses: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
      },
    },
    {
      $project: {
        totalClasses: 1,
        presentClasses: 1,
        percentage: {
          $round: [{ $multiply: [{ $divide: ['$presentClasses', '$totalClasses'] }, 100] }, 2],
        },
      },
    },
  ]);
}
