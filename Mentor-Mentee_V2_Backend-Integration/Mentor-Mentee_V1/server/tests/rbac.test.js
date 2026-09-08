import test from 'node:test';
import assert from 'node:assert/strict';
import { hasPermission } from '../config/permissions.js';
test('central permissions keep mentee academic records read-only', () => {
  assert.equal(hasPermission('MENTEE', 'ACADEMIC_SELF_READ'), true);
  assert.equal(hasPermission('MENTEE', 'ACADEMIC_WRITE'), false);
  assert.equal(hasPermission('ADMIN', 'AUDIT_LOG_READ'), true);
});
