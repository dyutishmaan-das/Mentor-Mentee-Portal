export function calculateMarkResult(mark) {
  const total = ['internal', 'external', 'sessional', 'put'].reduce(
    (sum, field) => sum + Number(mark[field] || 0),
    0,
  );

  const percentage = Math.min(total, 100);
  const grade =
    percentage >= 90
      ? 'O'
      : percentage >= 80
        ? 'A+'
        : percentage >= 70
          ? 'A'
          : percentage >= 60
            ? 'B+'
            : percentage >= 50
              ? 'B'
              : percentage >= 40
                ? 'C'
                : 'F';
  const gradePoint = { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, F: 0 }[grade];

  return { total, grade, gradePoint, resultStatus: grade === 'F' ? 'Fail' : 'Pass' };
}
