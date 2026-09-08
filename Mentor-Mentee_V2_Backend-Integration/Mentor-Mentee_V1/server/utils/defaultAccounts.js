export const DEFAULT_DEMO_PASSWORD = 'DemoPass123!';

export const DEFAULT_DEMO_ACCOUNTS = [
  { name: 'Admin User', email: 'admin@demo.edu', role: 'ADMIN' },
  { name: 'HOD User', email: 'hod@demo.edu', role: 'HOD' },
  { name: 'Academic Faculty', email: 'academic@demo.edu', role: 'ACADEMIC_FACULTY' },
  { name: 'Mentor User', email: 'mentor@demo.edu', role: 'MENTOR' },
  { name: 'Student User', email: 'student@demo.edu', role: 'MENTEE' },
  { name: 'Other Faculty', email: 'faculty@demo.edu', role: 'OTHER_FACULTY' },
];

export function getDefaultDemoAccounts() {
  return DEFAULT_DEMO_ACCOUNTS.map((account) => ({ ...account, password: DEFAULT_DEMO_PASSWORD }));
}

export function getDefaultAdminCredentials() {
  return getDefaultDemoAccounts().find((account) => account.role === 'ADMIN');
}
