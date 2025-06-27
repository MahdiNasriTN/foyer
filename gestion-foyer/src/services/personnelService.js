import axios from 'axios';

// Créer une instance axios avec la configuration de base
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Ajouter un intercepteur pour inclure le token JWT dans toutes les requêtes
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Récupérer tous les membres du personnel
// Update the getAllPersonnel function
export const getAllPersonnel = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    console.log('Service received filters:', filters);
    
    // Map frontend filters to backend parameters
    const filterMapping = {
      search: filters.search,
      status: filters.status, // 'all', 'active', 'inactive'
      department: filters.department, // 'all' or department name
      role: filters.role, // 'all', 'admin', 'manager', 'employee'
      startDate: filters.startDate,
      endDate: filters.endDate
    };
    
    // Only add filters that have actual values
    Object.keys(filterMapping).forEach(key => {
      const value = filterMapping[key];
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        params.append(key, value);
        console.log(`Adding filter ${key}:`, value);
      }
    });
    
    console.log('Final URL params:', params.toString());
    
    const response = await axiosInstance.get(`/api/v1/personnel?${params.toString()}`);
    
    console.log('Raw API response:', response.data); // Debug log
    
    // Extract the data from the nested structure and return it in a clean format
    return {
      personnel: response.data.data.personnel || [],  // Extract the personnel array
      totalPages: response.data.totalPages || 1,
      currentPage: response.data.currentPage || 1,
      results: response.data.results || 0,
      totalRecords: response.data.totalRecords || 0,
      status: response.data.status
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error.response?.data || error;
  }
};

// Récupérer un membre du personnel par ID
export const getPersonnelById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/v1/personnel/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Créer un nouveau membre du personnel
export const createPersonnel = async (data) => {
  try {
    const response = await axiosInstance.post('/api/v1/personnel', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Mettre à jour un membre du personnel
export const updatePersonnel = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/v1/personnel/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Supprimer un membre du personnel
export const deletePersonnel = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/v1/personnel/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Récupérer les statistiques du personnel
export const getPersonnelStats = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/personnel/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Mettre à jour le planning d'un membre du personnel
export const updatePersonnelSchedule = async (personnelId, scheduleData) => {
  try {
    const response = await fetch(`/api/personnel/${personnelId}/schedule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ schedule: scheduleData }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Échec de la mise à jour du planning');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour du planning du personnel :', error);
    throw error;
  }
};

// Add these new functions at the end of the file

// Export personnel data
export const exportPersonnel = async (filters = {}, format = 'csv') => {
  try {
    const params = new URLSearchParams();
    
    // Add filters
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        params.append(key, value);
      }
    });
    
    params.append('format', format);
    
    const response = await axiosInstance.get(`/api/v1/personnel/export?${params.toString()}`, {
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get unique postes for filtering
export const getUniquePostes = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/personnel/postes');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};