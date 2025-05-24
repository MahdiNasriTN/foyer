import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with credentials
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add a request interceptor to include the token in headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fetch all personnel for schedule
export const fetchAllPersonnel = async () => {
  try {
    const response = await API.get('/personnel');
    return response.data;
  } catch (error) {
    console.error('Error fetching personnel:', error);
    throw error.response?.data || error;
  }
};

// Fetch general schedule data
export const fetchGeneralSchedule = async () => {
  try {
    const response = await API.get('/schedule/general');
    return response.data;
  } catch (error) {
    console.error('Error fetching general schedule:', error);
    throw error.response?.data || error;
  }
};

// Save general schedule data
export const saveGeneralSchedule = async (scheduleData) => {
  try {
    const response = await API.post('/schedule/general', { schedule: scheduleData });
    return response.data;
  } catch (error) {
    console.error('Error saving general schedule:', error);
    throw error.response?.data || error;
  }
};
