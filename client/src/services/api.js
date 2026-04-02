import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('civicpulse_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => api.post('/api/auth/register', data);
export const loginUser = (data) => api.post('/api/auth/login', data);

// Issues
export const fetchIssues = (params) => api.get('/api/issues', { params });
export const fetchIssueById = (id) => api.get(`/api/issues/${id}`);
export const createIssue = (data) => api.post('/api/issues', data);
export const updateIssueStatus = (id, status, note) => api.patch(`/api/issues/${id}/status`, { status, note });
export const deleteIssue = (id) => api.delete(`/api/issues/${id}`);

// Votes
export const castVote = (id, type) => api.post(`/api/issues/${id}/vote`, { type });

// Admin
export const fetchFlaggedIssues = () => api.get('/api/admin/flagged');
export const fetchDeptIssues = () => api.get('/api/admin/dept-issues');
export const removeIssue = (id) => api.delete(`/api/admin/issues/${id}`);

export default api;