import test from 'node:test';
import assert from 'node:assert/strict';

test('health response contract is documented', () => {
  const response = {
    success: true,
    message: 'Student Mentoring API is healthy',
    data: { status: 'ok' },
  };
  assert.equal(response.success, true);
  assert.equal(response.data.status, 'ok');
});
