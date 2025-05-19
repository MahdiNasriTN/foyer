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
      console.log('First attempt succeeded');
      console.log('Login response:', response);
    } catch (apiError) {
      console.error('First attempt failed:', apiError);
      throw new Error(apiError.response?.data.message || apiError);
    }

    console.log('Login response:', response);
    console.log('Login response:', response.data);
    
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
    // Construction des paramètres de requête à partir des filtres
    let queryParams = new URLSearchParams();
    
    // Add search parameter if provided
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    
    // Traitement des différents filtres
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
    
    // Add year filter
    if (filters.year && filters.year !== 'all') {
      queryParams.append('year', filters.year);
    }
    
    if (filters.startDate) {
      queryParams.append('startDate', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('endDate', filters.endDate);
    }
    
    // Construction de l'URL avec les paramètres de requête
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
    const response = await API.get('/api/v1/stagiaires?chambreStatus=disponible');
    return response.data; // Ne pas transformer les données ici
  } catch (error) {
    console.error('Error fetching available stagiaires:', error);
    throw error.response?.data || error;
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
      console.log('Requête annulée:', error.message);
      // Propager l'erreur pour qu'elle soit gérée par le composant
      const abortError = new Error('Request aborted');
      abortError.name = 'AbortError';
      throw abortError;
    }
    console.error('Error fetching chambre occupants:', error);
    throw error.response?.data || error;
  }
};

// Ajouter ces fonctions à votre fichier api.js existant

// Récupérer toutes les chambres avec filtres optionnels
export const fetchChambres = async (filters = {}) => {
  try {
    // Construction des paramètres de requête à partir des filtres
    const queryParams = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }
    
    if (filters.etage && filters.etage !== 'all') {
      queryParams.append('etage', filters.etage);
    }
    
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    
    if (filters.sortBy) {
      queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) {
        queryParams.append('sortOrder', filters.sortOrder);
      }
    }
    
    const queryString = queryParams.toString();
    const url = `/api/v1/chambres${queryString ? `?${queryString}` : ''}`;
    
    const response = await API.get(url);
    return response;
  } catch (error) {
    console.error('Error fetching chambres:', error);
    throw error.response?.data || error;
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
    const response = await API.post(`/api/v1/chambres/${roomId}/occupants`, { occupantIds });
    return response.data;
  } catch (error) {
    console.error('Error assigning occupants:', error);
    throw error.response?.data || error;
  }
};

// Add these export functions to your API service

// Export multiple stagiaires with optional filtering and limit
// Export multiple stagiaires with optional filtering and limit
export const exportStagiaires = async (params = {}) => {
  try {
    console.log('Export parameters:', params);
    // Build query parameters
    let queryParams = new URLSearchParams();
    
    // Add all filter parameters
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.room && params.room !== 'all') queryParams.append('room', params.room);
    if (params.gender && params.gender !== 'all') queryParams.append('gender', params.gender);
    if (params.session && params.session !== 'all') queryParams.append('session', params.session);
    if (params.year && params.year !== 'all') queryParams.append('year', params.year);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.specificRoom) queryParams.append('specificRoom', params.specificRoom);
    if (params.search) queryParams.append('search', params.search);
    
    // Add export specific parameters
    if (params.limit && params.limit !== 'all') queryParams.append('limit', params.limit);
    if (params.format) queryParams.append('format', params.format);
    
    // Create URL with query parameters
    const queryString = queryParams.toString();
    const url = `/api/v1/stagiaires/export${queryString ? `?${queryString}` : ''}`;
    
    console.log('Export URL:', API.defaults.baseURL + url);
    
    // Make the request with responseType blob to handle binary data
    const response = await API.get(url, { responseType: 'blob' });
    return response;
  } catch (error) {
    console.error('Error exporting stagiaires:', error);
    throw error.response?.data || error;
  }
};

// Export a single stagiaire by ID
export const exportStagiaire = async (id, format = 'xlsx') => {
  console.log('Exporting stagiaire with ID:', id);
  try {
    const url = `/api/v1/stagiaires/${id}/export?format=${format}`;
    
    console.log('Single export URL:', API.defaults.baseURL + url);
    
    // Make the request with responseType blob to handle binary data
    const response = await API.get(url, { responseType: 'blob' });
    return response;
  } catch (error) {
    console.error(`Error exporting stagiaire ${id}:`, error);
    throw error.response?.data || error;
  }
};

// Add these functions to your existing API service file

// Update personnel schedule
export const updatePersonnelSchedule = async (personnelId, scheduleData) => {
  try {
    const response = await API.put(`/api/v1/personnel/${personnelId}/schedule`, { schedule: scheduleData });
    return response.data;
  } catch (error) {
    console.error('Error updating personnel schedule:', error);
    throw error.response?.data || error;
  }
};

// Get personnel schedule
export const getPersonnelSchedule = async (personnelId) => {
  try {
    const response = await API.get(`/api/v1/personnel/${personnelId}/schedule`);
    return response.data;
  } catch (error) {
    console.error('Error fetching personnel schedule:', error);
    throw error.response?.data || error;
  }
};