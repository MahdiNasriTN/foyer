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
    console.log('Raw personnel API response:', response.data);
    
    // Extract personnel from the nested response structure
    if (response.data.data && response.data.data.personnel) {
      return {
        personnel: response.data.data.personnel,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        results: response.data.results
      };
    } else if (response.data.personnel) {
      return response.data;
    } else if (Array.isArray(response.data)) {
      return { personnel: response.data };
    } else {
      console.warn('Unexpected API response structure:', response.data);
      return { personnel: [] };
    }
  } catch (error) {
    console.error('Error fetching personnel:', error);
    throw error.response?.data || error;
  }
};

// Update the functions to not send weekStartDate:

// FIXED: Remove weekStartDate parameter
export const fetchGeneralSchedule = async () => {
  try {
    const response = await API.get('/schedules/general');
    console.log('Schedule API response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error fetching general schedule:', error);
    throw error.response?.data || error;
  }
};

// FIXED: Remove weekStartDate from payload
export const saveGeneralSchedule = async (scheduleData) => {
  try {
    console.log('Saving schedule data:', scheduleData); // Debug log
    const response = await API.post('/schedules/general', {
      scheduleData
    });
    return response.data;
  } catch (error) {
    console.error('Error saving general schedule:', error);
    throw error.response?.data || error;
  }
};

// FIXED: Remove weekStartDate parameter
export const fetchScheduleSummary = async () => {
  try {
    const response = await API.get('/schedules/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching schedule summary:', error);
    throw error.response?.data || error;
  }
};