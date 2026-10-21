import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mutex & Queue to prevent parallel refresh token race conditions
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Silent Token Refresh Interceptor with Concurrency Lock
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/login') &&
      !originalRequest?.url?.includes('/auth/refreshtoken')
    ) {
      if (isRefreshing) {
        // If already refreshing, wait in line for the single refresh call to finish
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refreshtoken');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API Calls
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);
export const logoutUser = () => api.post('/auth/logout');
export const getCurrentUser = () => api.get('/auth/me');
export const refreshToken = () => api.post('/auth/refreshtoken');

// Manager API Calls
export const getManagerTeam = () => api.get('/manager/team');
export const createManagerTask = (taskData) => api.post('/manager/tasks', taskData);
export const getManagerTasks = () => api.get('/manager/tasks');
export const getManagerLeaves = () => api.get('/manager/leaves');
export const reviewLeave = (id, reviewData) => api.put(`/manager/leaves/${id}/review`, reviewData);

// Employee API Calls
export const getEmployeeTasks = () => api.get('/employee/tasks');
export const updateTaskStatus = (id, statusData) => api.put(`/employee/tasks/${id}/status`, statusData);
export const submitLeaveRequest = (leaveData) => api.post('/employee/leaves', leaveData);
export const getEmployeeLeaves = () => api.get('/employee/leaves');

// General CRUD
export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (userData) => api.post('/users', userData);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);

export const getProducts = () => api.get('/products');
export const searchProducts = (name) => api.get(`/products/search?name=${encodeURIComponent(name || '')}`);
export const createProduct = (productData) => api.post('/products', productData);

export default api;

