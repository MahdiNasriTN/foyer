import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000', 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
API.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis le localStorage
    const token = localStorage.getItem('token');
    
    // Si un token existe, l'ajouter à l'en-tête d'autorisation
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs 401 (non autorisé)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si on reçoit une erreur 401, cela signifie que le token n'est plus valide
    if (error.response && error.response.status === 401) {
      // Supprimer les informations d'authentification
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Rediriger vers la page de login (si nécessaire)
      // window.location = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const login = async (credentials) => {
  try {
    // Try a direct request to match Laravel's route configuration
    let response;
    try {
      response = await API.post('/api/v1/auth/login', credentials);
    } catch (apiError) {
      console.error('First attempt failed:', apiError);
      throw new Error(apiError.response?.data.message || apiError);
    }

    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response || error);
    throw error.response?.data || error;
  }
};

export const logout = async () => {
  try {
    await API.post('/api/v1/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Stagiaires endpoints
export const fetchStagiaires = async (filters = {}) => {
  try {
    let queryParams = new URLSearchParams();
    
    // Add search parameter if provided
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    
    // Existing filters
    if (filters.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }
    
    if (filters.room && filters.room !== 'all') {
      queryParams.append('room', filters.room);
    }
    
    if (filters.specificRoom) {
      queryParams.append('specificRoom', filters.specificRoom);
    }
    
    if (filters.gender && filters.gender !== 'all') {
      queryParams.append('gender', filters.gender);
    }
    
    if (filters.session && filters.session !== 'all') {
      queryParams.append('session', filters.session);
    }
    
    if (filters.year && filters.year !== 'all') {
      queryParams.append('year', filters.year);
    }
    
    if (filters.startDate) {
      queryParams.append('startDate', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('endDate', filters.endDate);
    }
    
    // NEW: Separate payment filters
    if (filters.hebergementPaymentStatus && filters.hebergementPaymentStatus !== '') {
      queryParams.append('hebergementPaymentStatus', filters.hebergementPaymentStatus);
      
      // Add trimester filters for hébergement
      if (filters.hebergementTrimester1) queryParams.append('hebergementTrimester1', 'true');
      if (filters.hebergementTrimester2) queryParams.append('hebergementTrimester2', 'true');
      if (filters.hebergementTrimester3) queryParams.append('hebergementTrimester3', 'true');
    }
    
    if (filters.inscriptionPaymentStatus && filters.inscriptionPaymentStatus !== '') {
      queryParams.append('inscriptionPaymentStatus', filters.inscriptionPaymentStatus);
    }
    
    // Legacy support for old paymentStatus filter
    if (filters.paymentStatus && filters.paymentStatus !== '') {
      queryParams.append('paymentStatus', filters.paymentStatus);
    }
    
    const queryString = queryParams.toString();
    const url = `/api/v1/stagiaires${queryString ? `?${queryString}` : ''}`;
    
    const response = await API.get(url);
    return response;
  } catch (error) {
    console.error('Error fetching stagiaires with filters:', error);
    throw error.response?.data || error;
  }
};

export const fetchStagiaire = async (id) => {
  try {
    const response = await API.get(`/api/v1/stagiaires/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createStagiaire = async (data) => {
  try {
    const response = await API.post('/api/v1/stagiaires', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateStagiaire = async (id, data) => {
  try {
    const response = await API.put(`/api/v1/stagiaires/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteStagiaire = async (id) => {
  try {
    const response = await API.delete(`/api/v1/stagiaires/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting stagiaire:', error);
    throw error.response?.data || error;
  }
};

// Ajouter les fonctions spécifiques pour les stagiaires internes et externes
export const createInternStagiaire = async (data) => {
  try {
    // Assurer que le type est correctement défini
    const stagiaireData = {
      ...data,
      type: 'interne',
      // Formater le nom complet
      nom: `${data.firstName} ${data.lastName}`
    };
    
    const response = await API.post('/api/v1/stagiaires', stagiaireData);
    return response.data;
  } catch (error) {
    console.error('Error creating intern stagiaire:', error);
    throw error.response?.data || error;
  }
};

export const createExternStagiaire = async (data) => {
  try {
    // Assurer que le type est correctement défini
    const stagiaireData = {
      ...data,
      type: 'externe',
      // Formater le nom complet
      nom: `${data.firstName} ${data.lastName}`
    };
    
    const response = await API.post('/api/v1/stagiaires', stagiaireData);
    return response.data;
  } catch (error) {
    console.error('Error creating extern stagiaire:', error);
    throw error.response?.data || error;
  }
};

// Récupérer un stagiaire par son ID
export const getStagiaireById = async (id) => {
  try {
    const response = await API.get(`/api/v1/stagiaires/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching stagiaire by ID:', error);
    throw error.response?.data || error;
  }
};

// Ajouter cette fonction pour récupérer les stagiaires disponibles pour l'assignation
export const fetchAvailableStagiaires = async () => {
  try {
    const response = await API.get('/api/v1/stagiaires/available');
    return response.data;
  } catch (error) {
    console.error('Error fetching available stagiaires:', error);
    throw error;
  }
};

// Ajouter cette fonction pour récupérer les occupants actuels d'une chambre
export const fetchChambreOccupants = async (chambreId, signal) => {
  try {
    const response = await API.get(`/api/v1/chambres/${chambreId}/occupants`, { signal });
    return response.data;
  } catch (error) {
    // Vérifier si l'erreur est due à une annulation
    if (axios.isCancel(error)) {
      // Propager l'erreur pour qu'elle soit gérée par le composant
      const abortError = new Error('Request aborted');
      abortError.name = 'AbortError';
      throw abortError;
    }
    console.error('Error fetching chambre occupants:', error);
    throw error.response?.data || error;
  }
};

// Récupérer toutes les chambres avec filtres optionnels
export const fetchChambres = async (filters = {}) => {
  try {
    // Create query parameters
    const params = new URLSearchParams();
    
    // Map status values to what the backend expects
    if (filters.status) {
      // If your backend expects 'occupied' and 'available' instead of 'occupée' and 'libre'
      const statusMap = {
        'occupée': 'occupied',
        'libre': 'available'
      };
      
      params.append('status', statusMap[filters.status] || filters.status);
    }
    
    // Add other filters
    if (filters.etage) params.append('etage', filters.etage);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.gender) params.append('gender', filters.gender);
    
    const url = `/api/v1/chambres${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await API.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching chambres:', error);
    throw error;
  }
};

// Récupérer une chambre par son ID
export const getChambreById = async (id) => {
  try {
    const response = await API.get(`/api/v1/chambres/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching chambre by ID:', error);
    throw error.response?.data || error;
  }
};

// Créer une nouvelle chambre
export const createChambre = async (chambreData) => {
  try {
    const response = await API.post('/api/v1/chambres', chambreData);
    return response;
  } catch (error) {
    console.error('Error creating chambre:', error);
    throw error.response?.data || error;
  }
};

// Mettre à jour une chambre existante
export const updateChambre = async (id, chambreData) => {
  try {
    const response = await API.put(`/api/v1/chambres/${id}`, chambreData);
    return response;
  } catch (error) {
    console.error('Error updating chambre:', error);
    throw error.response?.data || error;
  }
};

// Supprimer une chambre
export const deleteChambre = async (id) => {
  try {
    const response = await API.delete(`/api/v1/chambres/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting chambre:', error);
    throw error.response?.data || error;
  }
};

// Assigner des occupants à une chambre
export const assignOccupantsToRoom = async (roomId, occupantIds) => {
  try {
    
    const sanitizedOccupantIds = occupantIds.map(id => 
      typeof id === 'object' && id._id ? id._id : String(id)
    );
    
    
    const response = await API.post(`/api/v1/chambres/${roomId}/assign`, {
      occupantIds: sanitizedOccupantIds
    });
    
    return response.data;
  } catch (error) {
    console.error("Error in assignOccupantsToRoom:", error);
    
    // Check if we have a response with error details
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // If backend returns specific error message, throw it directly
      if (errorData.message) {
        const backendError = new Error(errorData.message);
        backendError.response = error.response;
        throw backendError;
      }
      
      // Handle validation errors specifically with user-friendly messages
      if (errorData.status === 'fail') {
        const backendError = new Error(errorData.message || 'Erreur de validation');
        backendError.response = error.response;
        throw backendError;
      }
    }
    
    // Fallback error handling for network issues
    if (error.response?.status === 400) {
      throw new Error('Données invalides. Veuillez vérifier votre sélection.');
    } else if (error.response?.status === 404) {
      throw new Error('Chambre ou stagiaire non trouvé.');
    } else if (error.response?.status >= 500) {
      throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
    } else if (!error.response) {
      throw new Error('Erreur de connexion. Vérifiez votre connexion internet.');
    }
    
    // Default fallback
    throw new Error('Erreur lors de l\'assignation des occupants');
  }
};

// Get available stagiaires for a specific room
export const getAvailableStagiairesForRoom = async (roomId) => {
  try {
    const response = await API.get(`/api/v1/chambres/${roomId}/available-stagiaires`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available stagiaires for room:', error);
    throw error.response?.data || error;
  }
};

// Get room statistics
export const getRoomStatistics = async () => {
  try {
    const response = await API.get('/api/v1/chambres/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching room statistics:', error);
    throw error.response?.data || error;
  }
};

// MISSING FUNCTION 1: fetchAllOccupiedRooms
export const fetchAllOccupiedRooms = async () => {
  try {
    const response = await API.get('/api/v1/chambres?status=occupied');
    return response.data;
  } catch (error) {
    console.error('Error fetching occupied rooms:', error);
    throw error.response?.data || error;
  }
};

// MISSING FUNCTION 2: Personnel Schedule functions
export const getPersonnelSchedule = async (personnelId, date) => {
  try {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const url = `/api/v1/personnel/${personnelId}/schedule${params.toString() ? '?' + params.toString() : ''}`;
    const response = await API.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching personnel schedule:', error);
    throw error.response?.data || error;
  }
};

export const updatePersonnelSchedule = async (personnelId, scheduleData) => {
  try {
    const response = await API.put(`/api/v1/personnel/${personnelId}/schedule`, scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error updating personnel schedule:', error);
    throw error.response?.data || error;
  }
};

// MISSING FUNCTION 3: Export functions
export const exportStagiaires = async (filters = {}) => {
  try {
    // Build query parameters from filters
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all' && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const url = `/api/v1/stagiaires/export${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await API.get(url, {
      responseType: 'blob' // Important for file downloads
    });
    
    // Create blob link to download
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Get filename from response headers if available
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'stagiaires_export.xlsx';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    return { success: true, message: 'Export completed successfully' };
  } catch (error) {
    console.error('Error exporting stagiaires:', error);
    throw error.response?.data || error;
  }
};

export const exportStagiaire = async (stagiaireId) => {
  try {
    const response = await API.get(`/api/v1/stagiaires/${stagiaireId}/export`, {
      responseType: 'blob' // Important for file downloads
    });
    
    // Create blob link to download
    const blob = new Blob([response.data], { 
      type: 'application/pdf' // Assuming single stagiaire export is PDF
    });
    
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Get filename from response headers if available
    const contentDisposition = response.headers['content-disposition'];
    let filename = `stagiaire_${stagiaireId}.pdf`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    return { success: true, message: 'Export completed successfully' };
  } catch (error) {
    console.error('Error exporting stagiaire:', error);
    throw error.response?.data || error;
  }
};

// BONUS: Additional useful functions that might be needed

// Check occupants availability for room assignment
export const checkOccupantsAvailability = async (roomId, occupantIds) => {
  try {
    const response = await API.post(`/api/v1/chambres/${roomId}/check-availability`, {
      occupantIds
    });
    return response.data;
  } catch (error) {
    console.error('Error checking occupants availability:', error);
    throw error.response?.data || error;
  }
};

// Get all personnel (if needed for schedules)
export const fetchPersonnel = async () => {
  try {
    const response = await API.get('/api/v1/personnel');
    return response.data;
  } catch (error) {
    console.error('Error fetching personnel:', error);
    throw error.response?.data || error;
  }
};

// Create personnel (if needed)
export const createPersonnel = async (personnelData) => {
  try {
    const response = await API.post('/api/v1/personnel', personnelData);
    return response.data;
  } catch (error) {
    console.error('Error creating personnel:', error);
    throw error.response?.data || error;
  }
};

// Update personnel
export const updatePersonnel = async (id, personnelData) => {
  try {
    const response = await API.put(`/api/v1/personnel/${id}`, personnelData);
    return response.data;
  } catch (error) {
    console.error('Error updating personnel:', error);
    throw error.response?.data || error;
  }
};

// Delete personnel
export const deletePersonnel = async (id) => {
  try {
    const response = await API.delete(`/api/v1/personnel/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting personnel:', error);
    throw error.response?.data || error;
  }
};

// Upload stagiaire profile photo
export const uploadStagiairePhoto = async (stagiaireId, formData) => {
  try {
    const response = await API.post(`/api/v1/stagiaires/${stagiaireId}/upload-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading stagiaire photo:', error);
    throw error.response?.data || error;
  }
};

// Update stagiaire payment info
export const updateStagiairePayment = async (stagiaireId, paymentData) => {
  try {
    const response = await API.put(`/api/v1/stagiaires/${stagiaireId}/payment`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error updating stagiaire payment:', error);
    throw error.response?.data || error;
  }
};

// Check if superadmin exists
export const checkSuperAdminExists = async () => {
  try {
    const response = await API.put(`/api/v1/auth/check-superadmin`);
    return response.data;
  } catch (error) {
    console.error('Error checking superadmin:', error);
    throw error;
  }
};

// Default export for the API instance
export default API;