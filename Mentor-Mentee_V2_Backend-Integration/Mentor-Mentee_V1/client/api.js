/* Mentor-Mentee API client
 * The UI remains vanilla JS; this module connects it to the College Management backend.
 */
(() => {
  const API_BASE = '/api';

  const getToken = () => localStorage.getItem('mm_access_token');
  const setToken = (token) => token
    ? localStorage.setItem('mm_access_token', token)
    : localStorage.removeItem('mm_access_token');

  async function request(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.body && typeof options.body !== 'string') {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    // Try one transparent access-token refresh when the API rejects an expired token.
    if (response.status === 401 && path !== '/auth/refresh') {
      const refresh = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refresh.ok) {
        const payload = await refresh.json();
        setToken(payload?.data?.accessToken);
        if (payload?.data?.accessToken) {
          headers.Authorization = `Bearer ${payload.data.accessToken}`;
          response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers,
            credentials: 'include',
          });
        }
      }
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload?.message || 'API request failed');
      error.status = response.status;
      error.code = payload?.code;
      throw error;
    }
    return payload;
  }

  function legacyRole(role) {
    return {
      MENTEE: 'student',
      MENTOR: 'mentor',
      ACADEMIC_FACULTY: 'faculty',
      OTHER_FACULTY: 'faculty',
      HOD: 'hod',
      ADMIN: 'admin',
    }[role] || null;
  }

  window.MentorAPI = {
    login: async (email, password) => {
      const result = await request('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      setToken(result?.data?.accessToken);
      const user = result?.data?.user;
      if (!user) throw new Error('Login response did not contain a user');
      return { ...user, backendRole: user.role, role: legacyRole(user.role) };
    },

    me: async () => {
      const result = await request('/auth/me');
      const user = result?.data?.user;
      if (!user) return null;
      return { ...user, backendRole: user.role, role: legacyRole(user.role) };
    },
    logout: async () => {
      try {
        await request('/auth/logout', { method: 'POST' });
      } finally {
        setToken(null);
      }
    },

    studentMe: () => request('/students/me'),
    students: (params = '') => request(`/students${params ? `?${params}` : ''}`),
    student: (id) => request(`/students/${id}`),
    updateStudent: (id, data) => request(`/students/${id}`, { method: 'PUT', body: data }),
    toggleStudentStatus: (id, status) => request(`/students/${id}/status`, { method: 'PATCH', body: status ? { status } : {} }),
    deleteStudent: (id) => request(`/students/${id}`, { method: 'DELETE' }),

    marks: (params = '') => request(`/marks${params ? `?${params}` : ''}`),
    saveMarks: (data) => request('/marks', { method: 'PUT', body: data }),

    attendance: (params = '') => request(`/attendance${params ? `?${params}` : ''}`),
    saveAttendance: (data) => request('/attendance', { method: 'POST', body: data }),

    mentors: () => request('/mentors'),
    mentorMentees: (mentorId) => request(`/mentors/${mentorId}/mentees`),

    // Photo Upload APIs
    uploadStudentPhotos: async (studentId, files) => {
      const formData = new FormData();
      if (files.studentPhoto) formData.append('studentPhoto', files.studentPhoto);
      if (files.fatherPhoto) formData.append('fatherPhoto', files.fatherPhoto);
      if (files.motherPhoto) formData.append('motherPhoto', files.motherPhoto);
      if (files.guardianPhoto) formData.append('guardianPhoto', files.guardianPhoto);

      const token = getToken();
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/resources/upload/student/${studentId}`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(payload?.message || 'Photo upload failed');
        error.status = response.status;
        throw error;
      }
      return payload;
    },

    uploadFacultyPhoto: async (facultyId, photoFile) => {
      const formData = new FormData();
      formData.append('photo', photoFile);

      const token = getToken();
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/resources/upload/faculty/${facultyId}`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(payload?.message || 'Photo upload failed');
        error.status = response.status;
        throw error;
      }
      return payload;
    },

    // Registration & Student Self-Service Flow APIs
    generateBatchEmailLinks: (emails, expiresInDays = 7, sendInviteEmail = true) =>
      request('/registration/generate-email-links', {
        method: 'POST',
        body: { emails, expiresInDays, sendInviteEmail },
      }),
    generateRegistrationLink: (data) =>
      request('/registration/generate-link', {
        method: 'POST',
        body: data,
      }),
    getRegistrationTokens: () => request('/registration/tokens'),
    deactivateRegistrationToken: (token) =>
      request(`/registration/deactivate/${token}`, { method: 'POST' }),
    getPendingRegistrations: (params = '') =>
      request(`/registration/pending${params ? `?${params}` : ''}`),
    approveRegistration: (id, data) =>
      request(`/registration/approve/${id}`, { method: 'POST', body: data }),
    rejectRegistration: (id, reason) =>
      request(`/registration/reject/${id}`, { method: 'POST', body: { reason } }),
    changePassword: (currentPassword, newPassword) =>
      request('/registration/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      }),
    completeStudentProfile: (data) =>
      request('/students/profile/complete', { method: 'PUT', body: data }),
    getStudentProfileMe: () => request('/students/profile/me'),
    getStudentProfileStatus: () => request('/students/profile/status'),

    // Section Allotment APIs (HOD / Admin)
    getSectionAllotmentList: (params = '') =>
      request(`/students/section-allotment/list${params ? `?${params}` : ''}`),
    bulkAllotSection: (studentIds, section) =>
      request('/students/section-allotment/bulk', {
        method: 'POST',
        body: { studentIds, section },
      }),

    getFile: (folder, filename) => `${API_BASE}/resources/file/${folder}/${filename}`,

    isAuthenticated: () => Boolean(getToken()),
  };
})();
