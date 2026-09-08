import test from 'node:test';
import assert from 'node:assert/strict';

test('attendance threshold remains in the valid percentage range', () => {
  const threshold = Math.min(Math.max(Number('120') || 75, 0), 100);
  assert.equal(threshold, 100);
});
