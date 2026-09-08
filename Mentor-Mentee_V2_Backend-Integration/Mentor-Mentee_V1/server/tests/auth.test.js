import test from 'node:test';
import assert from 'node:assert/strict';
import { signAccessToken } from '../utils/tokens.js';
import { getDefaultAdminCredentials } from '../utils/defaultAccounts.js';

test('access tokens include the user id and role', async () => {
  process.env.JWT_ACCESS_SECRET = 'test-access-secret';
  const jwt = (await import('jsonwebtoken')).default;
  const token = signAccessToken({ _id: '507f1f77bcf86cd799439011', role: 'MENTEE' });
  const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  assert.equal(payload.sub, '507f1f77bcf86cd799439011');
  assert.equal(payload.role, 'MENTEE');
});

test('default admin credentials are available for bootstrap', () => {
  const admin = getDefaultAdminCredentials();
  assert.ok(admin);
  assert.equal(admin.email, 'admin@demo.edu');
  assert.equal(admin.role, 'ADMIN');
  assert.equal(admin.password, 'DemoPass123!');
});
