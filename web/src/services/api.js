const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://employee-attendance-backend.onrender.com/api';

/**
 * Helper to perform fetch with standard Authorization header
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred during API request');
  }

  return data;
}

export const api = {
  login: (loginIdentifier, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ loginIdentifier, password }),
    }),

  getCurrentUser: () => request('/auth/me'),

  getUsers: () => request('/users/list'),

  createUser: (userData) =>
    request('/users/create', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  deleteUser: (id) =>
    request(`/users/${id}`, {
      method: 'DELETE',
    }),

  getAttendanceLogs: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/attendance/logs?${params.toString()}`);
  },
};
