import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with credentials
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add a request interceptor to include the authentication token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get current user profile - USING THE CORRECT PATH
export const getUserProfile = async () => {
  try {
    // Make sure this matches your backend route structure
    // If route is /api/v1/auth/me, then use only '/auth/me'
    const response = await API.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error.response?.data || error;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await API.put('/auth/profile', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error.response?.data || error;
  }
};

// Get auth token from local storage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Update user avatar
export const updateUserAvatar = async (formData) => {
  try {
    const response = await axios.post(
      `${API_URL}/users/avatar`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};
