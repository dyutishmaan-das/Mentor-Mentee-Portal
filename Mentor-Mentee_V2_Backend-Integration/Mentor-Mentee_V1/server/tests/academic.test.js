import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMarkResult } from '../services/academicService.js';

test('marks are calculated on the server and cannot use a supplied total', () => {
  const result = calculateMarkResult({
    internal: 20,
    external: 45,
    sessional: 10,
    put: 5,
    total: 1,
  });
  assert.deepEqual(result, { total: 80, grade: 'A+', gradePoint: 9, resultStatus: 'Pass' });
});
