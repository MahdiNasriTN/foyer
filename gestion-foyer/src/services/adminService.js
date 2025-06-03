import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Get the auth token
const getAuthToken = () => localStorage.getItem('token');

// Create auth header
const authHeader = () => ({
  headers: { Authorization: `Bearer ${getAuthToken()}` }
});

// Get all admin users
export const getAllAdmins = async () => {
  return await axios.get(`${API_URL}/users/admins`, authHeader());
};

// Get a specific admin by ID
export const getAdminById = async (id) => {
  return await axios.get(`${API_URL}/users/${id}`, authHeader());
};

// Create a new admin
export const createAdmin = async (adminData) => {
  // Ensure role is set to admin
  const data = { ...adminData, role: 'admin' };
  return await axios.post(`${API_URL}/users/admin`, data, authHeader());
};

// Update an existing admin
export const updateAdmin = async (id, adminData) => {
  try {
    // Filter out the confirmPassword field and any other unnecessary fields
    const { confirmPassword, ...dataToSend } = adminData;
    
    // Log what we're sending to the API
    
    // Make sure role is explicitly included
    if (!dataToSend.role) {
      dataToSend.role = adminData.role || 'admin';
    }
    
    const response = await axios.put(
      `${API_URL}/users/${id}`, 
      dataToSend, 
      authHeader()
    );
    
    // Log the response from the API
    
    return response.data;
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
};

// Delete an admin
export const deleteAdmin = async (id) => {
  return await axios.delete(`${API_URL}/users/${id}`, authHeader());
};