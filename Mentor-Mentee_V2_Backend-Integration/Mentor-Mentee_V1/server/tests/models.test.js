import test from 'node:test';
import assert from 'node:assert/strict';
import Student from '../models/Student.js';
import Marks from '../models/Marks.js';
import Attendance from '../models/Attendance.js';

test('core data integrity indexes are declared', () => {
  assert.ok(Student.schema.indexes().some(([keys]) => keys.studentId === 1));
  assert.ok(Marks.schema.indexes().some(([keys]) => keys.student === 1 && keys.subject === 1));
  assert.ok(
    Attendance.schema
      .indexes()
      .some(([keys]) => keys.student === 1 && keys.subject === 1 && keys.date === 1),
  );
});
