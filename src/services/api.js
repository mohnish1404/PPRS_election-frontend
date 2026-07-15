import axios from 'axios'
const API = axios.create({
  baseURL: 'http://localhost:5103/api',
})


// Interceptor to attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========== AUTH APIS ==========
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const sendOtp = (data) => API.post('/auth/send-otp', data);
export const verifyOtp = (data) => API.post('/auth/verify-otp', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const activateUser = (data) => API.post('/auth/activate-user', data);
export const sendResetOtp = (data) => API.post('/auth/send-reset-otp', data);
export const verifyResetOtp = (data) => API.post('/auth/verify-reset-otp', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);
export const getMyApprovalStatus = () => API.get('/auth/my-approval-status');
export const getMyProfile = () => API.get('/auth/my-profile');
export const updateMyProfile = (data) => API.put('/auth/update-profile', data);

// ========== ADMIN APIS ==========
export const getPendingApprovals = () => API.get('/Admin/pending-approvals');
export const approveRequest = (id) => API.post(`/Admin/approve/${id}`);
export const rejectRequest = (id, remarks) => API.post(`/Admin/reject/${id}`, remarks);
export const getAllUsers = () => API.get('/Admin/users');
export const toggleUser = (userId) => API.post(`/Admin/toggle-user/${userId}`);

export default API;