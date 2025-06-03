import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserIcon, 
  OfficeBuildingIcon, 
  UserGroupIcon, 
  ChevronRightIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  RefreshIcon,
  BadgeCheckIcon,
  SparklesIcon,
  HomeIcon,
  UsersIcon,
  IdentificationIcon
} from '@heroicons/react/outline';
import { useNavigate } from 'react-router-dom';

// API service for dashboard
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const dashboardAPI = {
  getStats: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getQuickStats: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/dashboard/quick-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

// Composant de carte statistique amélioré avec thème cohérent
const StatCard = ({ title, value, icon, gradient, onClick, description, badge, loading }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer relative group border border-gray-100"
    >
      {/* Header avec gradient */}
      <div className={`h-2 w-full ${gradient}`}></div>
      
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
              {badge && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                  {badge}
                </span>
              )}
            </div>
            <div className="flex items-center">
              {loading ? (
                <div className="text-3xl font-bold text-gray-300">
                  <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
                </div>
              ) : (
                <p className="text-3xl font-bold text-gray-900">{value || 0}</p>
              )}
              <div className="ml-4 p-3 bg-gradient-to-br from-slate-100 to-gray-100 rounded-lg">
                {icon}
              </div>
            </div>
            {description && !loading && (
              <p className="text-sm text-gray-600 mt-2">{description}</p>
            )}
            {loading && (
              <div className="animate-pulse bg-gray-300 h-4 w-32 rounded mt-2"></div>
            )}
          </div>
        </div>
        
        {/* Bouton d'action */}
        <div className="mt-6 flex justify-end">
          <button className="text-sm text-blue-600 font-medium flex items-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-blue-700">
            Voir détails 
            <ChevronRightIcon className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
      
      {/* Effet de lumière au survol */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  );
};

// Composant pour les chambres avec design cohérent
const ChambresOverview = ({ chambres, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 rounded mb-1"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Chambres disponibles</p>
              <p className="text-2xl font-bold text-green-900">{chambres.disponibles || 0}</p>
              <p className="text-xs text-green-600 mt-1">
                {chambres.total > 0 ? Math.round((chambres.disponibles / chambres.total) * 100) : 0}% du total
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Chambres occupées</p>
              <p className="text-2xl font-bold text-blue-900">{chambres.occupees || 0}</p>
              <p className="text-xs text-blue-600 mt-1">{chambres.occupationRate || 0}% d'occupation</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <HomeIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Total chambres</p>
              <p className="text-2xl font-bold text-gray-900">{chambres.total || 0}</p>
              <p className="text-xs text-gray-600 mt-1">
                Capacité: {chambres.capacity?.total || 0} places
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <OfficeBuildingIcon className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Available Rooms List */}
      {chambres.chambresLibres && chambres.chambresLibres.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Chambres disponibles ({chambres.chambresLibres.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {chambres.chambresLibres.map((chambre, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div className="text-sm font-semibold text-green-800">{chambre.numero}</div>
                <div className="text-xs text-green-600">Étage {chambre.etage}</div>
                <div className="text-xs text-green-600">{chambre.capacite} places</div>
                {chambre.gender && (
                  <div className="text-xs text-green-500 mt-1">
                    {chambre.gender === 'garcon' ? '👦' : chambre.gender === 'fille' ? '👧' : '👥'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Capacity Overview */}
      {chambres.capacity && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Vue d'ensemble de la capacité</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{chambres.capacity.total}</div>
              <div className="text-sm text-gray-600">Capacité totale</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{chambres.capacity.occupied}</div>
              <div className="text-sm text-gray-600">Places occupées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{chambres.capacity.available}</div>
              <div className="text-sm text-gray-600">Places disponibles</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${chambres.capacity.total > 0 ? (chambres.capacity.occupied / chambres.capacity.total) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              Taux d'occupation: {chambres.capacity.total > 0 ? Math.round((chambres.capacity.occupied / chambres.capacity.total) * 100) : 0}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour la répartition des stagiaires
const StagiairesOverview = ({ occupants, loading }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-2 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-2 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Par Type */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <IdentificationIcon className="h-5 w-5 text-blue-600 mr-2" />
            Répartition par type
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Stagiaires internes</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{occupants.internes || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${occupants.total ? (occupants.internes / occupants.total) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Stagiaires externes</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{occupants.externes || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${occupants.total ? (occupants.externes / occupants.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Par Genre */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UsersIcon className="h-5 w-5 text-purple-600 mr-2" />
            Répartition par genre
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Garçons</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{occupants.hommes || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${occupants.total ? (occupants.hommes / occupants.total) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-pink-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Filles</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{occupants.femmes || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${occupants.total ? (occupants.femmes / occupants.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-900">{occupants.total || 0}</div>
          <div className="text-sm text-blue-700">Total stagiaires</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-900">{occupants.internes || 0}</div>
          <div className="text-sm text-green-700">Internes</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-900">{occupants.externes || 0}</div>
          <div className="text-sm text-amber-700">Externes</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-900">{occupants.inRooms || 0}</div>
          <div className="text-sm text-purple-700">Logés</div>
        </div>
      </div>

      {/* Recently assigned stagiaires */}
      {occupants.list && occupants.list.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Stagiaires récemment logés ({occupants.list.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {occupants.list.slice(0, 6).map((occupant, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm font-semibold text-blue-800">
                  {occupant.firstName} {occupant.lastName}
                </div>
                <div className="text-xs text-blue-600">
                  Chambre {occupant.roomNumber} - Étage {occupant.roomFloor}
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  {occupant.sexe === 'garcon' || occupant.sexe === 'homme' ? '👦' : '👧'} 
                  {occupant.type && ` • ${occupant.type}`}
                </div>
              </div>
            ))}
          </div>
          {occupants.list.length > 6 && (
            <div className="text-center mt-4">
              <span className="text-sm text-gray-500">
                et {occupants.list.length - 6} autres stagiaires...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Composant pour le personnel
const PersonnelOverview = ({ staff, loading }) => {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-gray-300 rounded mb-2 w-24 mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <UserIcon className="h-5 w-5 text-indigo-600 mr-2" />
        Personnel du foyer
      </h4>
      
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <UserIcon className="h-8 w-8 text-indigo-600" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">{staff.total || 0}</div>
        <div className="text-gray-600">Membres du personnel</div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="font-semibold text-gray-800">Administrateurs</div>
            <div className="text-gray-600">{staff.administrators || 0}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="font-semibold text-gray-800">Surveillants</div>
            <div className="text-gray-600">{staff.supervisors || 0}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="font-semibold text-gray-800">Maintenance</div>
            <div className="text-gray-600">{staff.maintenance || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal du Dashboard
const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    chambres: { total: 0, disponibles: 0, occupees: 0, occupationRate: 0, chambresLibres: [], capacity: {} },
    occupants: { total: 0, hommes: 0, femmes: 0, internes: 0, externes: 0, inRooms: 0, list: [] },
    staff: { total: 0, administrators: 0, supervisors: 0, maintenance: 0 }
  });
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await dashboardAPI.getStats();
      
      setDashboardData(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      let errorMessage = 'Impossible de charger les données du tableau de bord';
      if (err.response?.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        // Optionally redirect to login
        // navigate('/login');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  // Mettre à jour l'heure toutes les minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const refreshTimer = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(refreshTimer);
  }, []);
  
  // Format de la date et heure
  const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const dateString = currentTime.toLocaleDateString('fr-FR', dateOptions);
  const timeString = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  
  // Fonction pour actualiser les données
  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (error && !dashboardData.chambres.total) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <ExclamationCircleIcon className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-gray-800 mb-2">Erreur de chargement</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <RefreshIcon className="h-4 w-4 mr-2" />
          Réessayer
        </button>
      </div>
    );
  }

  const { chambres, occupants, staff } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête premium du dashboard */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-blue-900 shadow-xl mx-6 mt-6">
        {/* Arrière-plan décoratif */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl"></div>
        </div>

        <div className="relative z-10 px-6 py-8 md:px-10 md:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Badge de statut */}
            <div className="inline-flex items-center px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 shadow-sm mb-6">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse mr-2"></span>
              <span className="text-xs font-medium text-white/90">Tableau de bord administrateur</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Gestion du Foyer
                  <span className="text-sm font-normal text-blue-200/80 ml-3">
                    Administration
                  </span>
                </h1>
                <div className="mt-2 h-1 w-16 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
                <div className="mt-4 flex items-center text-blue-100/80 text-sm">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span>{dateString} - {timeString}</span>
                  {lastUpdated && (
                    <span className="ml-4 text-blue-200/60">
                      • Dernière MAJ: {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <button 
                  onClick={handleRefresh}
                  disabled={loading}
                  className={`inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium shadow-sm bg-white/10 text-white border border-white/10 hover:bg-white/20 transition-all backdrop-blur-sm ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <RefreshIcon className={`h-4 w-4 mr-2 text-blue-300 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Actualisation...' : 'Actualiser'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error notification */}
      {error && dashboardData.chambres.total > 0 && (
        <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={handleRefresh}
                className="text-sm text-red-600 hover:text-red-800 underline mt-1"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cartes statistiques principales */}
      <div className="mx-6 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Chambres" 
          value={chambres.total} 
          icon={<OfficeBuildingIcon className="h-6 w-6 text-blue-600" />}
          gradient="bg-gradient-to-r from-blue-500 to-blue-600"
          onClick={() => navigate('/chambres')}
          description={`${chambres.occupees || 0} occupées • ${chambres.disponibles || 0} libres`}
          badge={`${chambres.occupationRate || 0}%`}
          loading={loading}
        />
        <StatCard 
          title="Stagiaires" 
          value={occupants.total} 
          icon={<UserGroupIcon className="h-6 w-6 text-green-600" />}
          gradient="bg-gradient-to-r from-green-500 to-green-600"
          onClick={() => navigate('/stagiaires')}
          description={`${occupants.hommes || 0} garçons • ${occupants.femmes || 0} filles`}
          badge={`${occupants.internes || 0} internes`}
          loading={loading}
        />
        <StatCard 
          title="Personnel" 
          value={staff.total} 
          icon={<UserIcon className="h-6 w-6 text-purple-600" />}
          gradient="bg-gradient-to-r from-purple-500 to-purple-600"
          description="Équipe administrative et de surveillance"
          loading={loading}
        />
      </div>

      {/* Contenu principal en full-width */}
      <div className="mx-6 mt-8 space-y-8 pb-8">
        {/* Section Chambres */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <OfficeBuildingIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Gestion des Chambres</h2>
              </div>
              <button 
                onClick={() => navigate('/chambres')}
                className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center"
              >
                Gérer <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <ChambresOverview chambres={chambres} loading={loading} />
          </div>
        </div>

        {/* Section Stagiaires */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Stagiaires du Foyer</h2>
              </div>
              <button 
                onClick={() => navigate('/stagiaires')}
                className="text-sm text-green-600 font-medium hover:text-green-700 flex items-center"
              >
                Gérer <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <StagiairesOverview occupants={occupants} loading={loading} />
          </div>
        </div>

        {/* Section Personnel */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-purple-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Personnel</h2>
              </div>
            </div>
          </div>
          <div className="p-6">
            <PersonnelOverview staff={staff} loading={loading} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mx-6 pb-6 border-t border-gray-200 pt-6">
        <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-500">
          <div>
            <p>© 2025 Gestion du Foyer - Système de gestion intégré</p>
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-4">
            <span className="text-gray-400">Version 1.0.0</span>
            {lastUpdated && (
              <span className="text-gray-400">
                • Données actualisées à {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;