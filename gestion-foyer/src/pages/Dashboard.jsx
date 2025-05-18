import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserIcon, 
  OfficeBuildingIcon, 
  UserGroupIcon, 
  CakeIcon,
  ChevronRightIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  RefreshIcon,
  PlusIcon,
  DotsVerticalIcon,
  BadgeCheckIcon,
  ShieldCheckIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/outline';
import { useNavigate } from 'react-router-dom';

// API base URL from environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Composant de carte statistique amélioré
const StatCard = ({ title, value, icon, color, change, changeType, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300
        hover:shadow-xl hover:scale-[1.02] cursor-pointer relative group
      `}
    >
      {/* Barre supérieure colorée */}
      <div className={`h-1 w-full ${color.barColor}`}></div>
      
      <div className="p-6">
        <div className="flex items-center">
          <div className={`rounded-lg p-3 ${color.bgColor}`}>
            {icon}
          </div>
          <div className="ml-4 flex-grow">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              {change && (
                <span className={`
                  text-xs font-medium px-2 py-1 rounded-full flex items-center
                  ${changeType === 'increase' ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'}
                `}>
                  {changeType === 'increase' ? '↑' : '↓'} {change}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Bouton d'action qui apparaît au survol */}
        <div className="mt-4 flex justify-end">
          <button className="text-xs text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            Voir détails <ChevronRightIcon className="h-3 w-3 ml-1" />
          </button>
        </div>
      </div>
      
      {/* Effet de lumière au survol */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white via-primary-light/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  );
};

// Composant de carte informative
const InfoCard = ({ title, children, icon, actionLabel, onAction, className }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="text-primary mr-2">
              {icon}
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {actionLabel && (
              <button 
                onClick={onAction}
                className="text-xs bg-primary-light/10 text-primary px-2 py-1 rounded-md hover:bg-primary hover:text-white transition-colors"
              >
                {actionLabel}
              </button>
            )}
            <button className="text-gray-400 hover:text-primary">
              <DotsVerticalIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {children}
      </div>
    </div>
  );
};

// Composant pour afficher les chambres
const ChambresOverview = ({ chambres }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg p-4 border-l-4 border-green-500 shadow">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Chambres disponibles</p>
            <p className="text-2xl font-bold text-green-600">{chambres.disponibles}</p>
          </div>
          <div className="bg-green-100 p-2 rounded-lg">
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xs text-gray-500">
            Numéros: {chambres.chambresLibres.map(c => c.numero).join(', ')}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 shadow">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Chambres occupées</p>
            <p className="text-2xl font-bold text-blue-600">{chambres.occupees}</p>
          </div>
          <div className="bg-blue-100 p-2 rounded-lg">
            <OfficeBuildingIcon className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xs text-gray-500">
            Taux d'occupation: {chambres.occupationRate}%
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour la liste des prochaines tâches
const TasksList = ({ tasks, onAddTask, navigate }) => {
  return (
    <div className="overflow-x-auto -mx-6">
      <div className="inline-block min-w-full align-middle px-6">
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Heure
                </th>
                <th scope="col" className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsable
                </th>
                <th scope="col" className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tâche
                </th>
                <th scope="col" className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(task.date).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {task.timeSlot}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-light/20 flex items-center justify-center mr-2">
                        <UserIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {task.assignedTo}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">{task.title}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {task.status === 'completed' ? 'Terminé' :
                       task.status === 'pending' ? 'À faire' : 'En cours'}
                    </span>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <CakeIcon className="h-10 w-10 text-gray-300 mb-2" />
                      <p>Aucune tâche planifiée pour les prochains jours</p>
                      <button 
                        onClick={() => navigate('/cuisine')} 
                        className="mt-3 text-primary text-sm flex items-center"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" /> Ajouter une tâche
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Composant pour le graphique d'activité
const ActivityChart = ({ weeklyActivity }) => {
  // Fallback si pas de données
  if (!weeklyActivity || weeklyActivity.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }
  
  // Trouver la valeur max pour calculer les hauteurs relatives
  const maxValue = Math.max(...weeklyActivity.map(day => day.total));
  
  return (
    <div className="h-64 flex flex-col items-center justify-center">
      <div className="flex items-end h-32 space-x-2">
        {weeklyActivity.map((day, index) => {
          // Calculer la hauteur relative (min 10% pour visibilité)
          const height = maxValue > 0 
            ? Math.max(10, (day.total / maxValue) * 100) 
            : 10;
          
          return (
            <div 
              key={index} 
              className="w-12 group relative"
              title={`${day.name}: ${day.total} tâches (${day.completed} terminées)`}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {day.completed} / {day.total} tâches
              </div>
              <div 
                className="bg-gradient-to-t from-primary to-primary-light rounded-t-lg"
                style={{ height: `${height}%` }}
              >
                <div 
                  className="bg-green-500 bg-opacity-30 rounded-t-lg"
                  style={{ 
                    height: `${day.total > 0 ? (day.completed / day.total) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="w-full flex justify-around mt-2">
        {weeklyActivity.map((day, index) => (
          <span key={index} className="text-xs text-gray-500">{day.name}</span>
        ))}
      </div>
    </div>
  );
};

// Composant pour afficher les alertes récentes
const AlertsPanel = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <ShieldCheckIcon className="h-10 w-10 text-green-300 mb-2" />
        <p className="text-gray-500">Aucune alerte active</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <div 
          key={alert.id} 
          className={`
            rounded-lg p-3 flex items-start
            ${alert.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}
            ${alert.type === 'info' ? 'bg-blue-50 border-l-4 border-blue-400' : ''}
            ${alert.type === 'error' ? 'bg-red-50 border-l-4 border-red-400' : ''}
          `}
        >
          <div className={`
            rounded-full p-1 flex-shrink-0
            ${alert.type === 'warning' ? 'text-yellow-500' : ''}
            ${alert.type === 'info' ? 'text-blue-500' : ''}
            ${alert.type === 'error' ? 'text-red-500' : ''}
          `}>
            <ExclamationCircleIcon className="h-5 w-5" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-800">{alert.message}</p>
            <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <DotsVerticalIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
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
    chambres: { total: 0, disponibles: 0, occupees: 0, occupationRate: 0, chambresLibres: [] },
    occupants: { total: 0, hommes: 0, femmes: 0 },
    staff: { total: 0 },
    tasks: { upcoming: [] },
    weeklyActivity: [],
    alerts: []
  });
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDashboardData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Impossible de charger les données du tableau de bord');
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
  
  // Format de la date et heure
  const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const dateString = currentTime.toLocaleDateString('fr-FR', dateOptions);
  const timeString = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  
  // Fonction pour actualiser les données
  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 min-h-[400px]">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <ExclamationCircleIcon className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-gray-800 mb-2">Erreur de chargement</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const { chambres, occupants, staff, tasks, weeklyActivity, alerts } = dashboardData;

  return (
    <div className="px-4 py-6 space-y-6 max-w-7xl mx-auto">
      {/* En-tête du dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-lg border-b-2 border-primary">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">Tableau de Bord</h1>
            <span className="ml-3 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium">Admin</span>
          </div>
          <div className="mt-1 flex items-center text-gray-500 text-sm">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{dateString} - {timeString}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleRefresh}
            className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshIcon className="h-4 w-4 mr-2" />
            Actualiser
          </button>
          <button 
            className="px-3 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors"
            onClick={() => {
              // Generate basic report logic would go here
              alert('Fonctionnalité de rapport à venir dans une prochaine version!');
            }}
          >
            Télécharger le rapport
          </button>
        </div>
      </div>
      
      {/* Message d'accueil (peut être fermé) */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-primary-light to-primary text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
          <button 
            className="absolute top-2 right-2 text-white/80 hover:text-white"
            onClick={() => setShowWelcome(false)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Éléments décoratifs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/5 rounded-full -translate-y-1/2 blur-lg pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-lg pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative">
            <div className="flex items-center mb-4">
              <BadgeCheckIcon className="h-6 w-6 text-white mr-2" />
              <h2 className="text-xl font-bold">Bienvenue dans le système de gestion du foyer</h2>
            </div>
            <p className="text-blue-100 mb-4 max-w-lg">
              Suivez facilement les résidents, gérez les chambres et organisez les tâches quotidiennes. 
              Les dernières informations sont mises à jour en temps réel.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <button 
                className="group px-4 py-2 bg-white text-primary rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center"
                onClick={() => navigate('/stagiaires')}
              >
                <SparklesIcon className="h-4 w-4 mr-2 group-hover:animate-spin" />
                Explorer les fonctionnalités
              </button>
              <button 
                className="px-4 py-2 bg-primary-dark/30 text-white rounded-lg font-medium hover:bg-primary-dark/50 backdrop-blur transition-colors flex items-center"
                onClick={() => window.open('https://github.com/yourusername/gestion-foyer', '_blank')}
              >
                <FireIcon className="h-4 w-4 mr-2" />
                Documentation
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Chambres" 
          value={chambres.total} 
          icon={<OfficeBuildingIcon className="h-6 w-6 text-white" />}
          color={{ 
            bgColor: "bg-gradient-to-r from-primary to-primary-dark", 
            barColor: "bg-primary" 
          }}
          onClick={() => navigate('/chambres')}
        />
        <StatCard 
          title="Taux d'occupation" 
          value={`${chambres.occupationRate}%`}
          icon={<OfficeBuildingIcon className="h-6 w-6 text-white" />}
          color={{ 
            bgColor: "bg-gradient-to-r from-green-500 to-green-600", 
            barColor: "bg-green-500" 
          }}
          onClick={() => navigate('/chambres')}
        />
        <StatCard 
          title="Stagiaires" 
          value={occupants.total} 
          icon={<UserGroupIcon className="h-6 w-6 text-white" />}
          color={{ 
            bgColor: "bg-gradient-to-r from-blue-400 to-blue-500", 
            barColor: "bg-blue-400" 
          }}
          change={`H: ${occupants.hommes} / F: ${occupants.femmes}`}
          changeType="info"
          onClick={() => navigate('/stagiaires')}
        />
        <StatCard 
          title="Personnel" 
          value={staff.total} 
          icon={<UserIcon className="h-6 w-6 text-white" />}
          color={{ 
            bgColor: "bg-gradient-to-r from-indigo-500 to-indigo-600", 
            barColor: "bg-indigo-500" 
          }}
        />
      </div>
      
      {/* Section principale avec grid responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section principale (2/3 sur desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vue d'ensemble des chambres */}
          <InfoCard 
            title="Vue d'ensemble des chambres" 
            icon={<OfficeBuildingIcon className="h-5 w-5" />}
            actionLabel="Gérer"
            onAction={() => navigate('/chambres')}
          >
            <ChambresOverview chambres={chambres} />
          </InfoCard>
          
          {/* Tâches en cuisine */}
          <InfoCard 
            title="Prochaines tâches en cuisine" 
            icon={<CakeIcon className="h-5 w-5" />}
            actionLabel="Ajouter"
            onAction={() => navigate('/cuisine')}
          >
            <TasksList 
              tasks={tasks.upcoming} 
              navigate={navigate}
            />
          </InfoCard>
          
          {/* Activité récente */}
          <InfoCard 
            title="Activité hebdomadaire" 
            icon={<ChartBarIcon className="h-5 w-5" />}
            actionLabel="Voir rapports"
          >
            <ActivityChart weeklyActivity={weeklyActivity} />
          </InfoCard>
        </div>
        
        {/* Sidebar latérale (1/3 sur desktop) */}
        <div className="space-y-6">
          {/* Alertes et notifications */}
          <InfoCard 
            title="Alertes et notifications" 
            icon={<ExclamationCircleIcon className="h-5 w-5" />}
            actionLabel="Tout voir"
          >
            <AlertsPanel alerts={alerts} />
          </InfoCard>
          
          {/* Répartition des stagiaires */}
          <InfoCard 
            title="Répartition des stagiaires" 
            icon={<UserGroupIcon className="h-5 w-5" />}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Type</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Internes</span>
                    <span className="text-sm font-medium text-gray-800">{occupants.internes}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${occupants.total ? (occupants.internes / occupants.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">Externes</span>
                    <span className="text-sm font-medium text-gray-800">{occupants.externes}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${occupants.total ? (occupants.externes / occupants.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Genre</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Hommes</span>
                    <span className="text-sm font-medium text-gray-800">{occupants.hommes}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${occupants.total ? (occupants.hommes / occupants.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">Femmes</span>
                    <span className="text-sm font-medium text-gray-800">{occupants.femmes}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-pink-500 rounded-full"
                      style={{ width: `${occupants.total ? (occupants.femmes / occupants.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </InfoCard>
          
          {/* Occupations et calendrier */}
          <InfoCard 
            title="Calendrier" 
            icon={<CalendarIcon className="h-5 w-5" />}
            className="h-auto"
          >
            <div className="text-center py-8 px-4">
              <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-700 font-medium mb-2">Fonctionnalité à venir</h3>
              <p className="text-gray-500 text-sm">
                Le calendrier des événements sera disponible dans la prochaine mise à jour.
              </p>
            </div>
          </InfoCard>
        </div>
      </div>
      
      {/* Footer avec informations supplémentaires */}
      <div className="mt-12 border-t border-gray-200 pt-6">
        <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-500">
          <div>
            <p>© 2025 Gestion du Foyer - Version 1.0.0</p>
          </div>
          <div className="mt-2 sm:mt-0">
            <button onClick={() => alert('Centre d\'aide en cours de développement')} className="text-primary hover:underline">Centre d'aide</button>
            <span className="mx-2">•</span>
            <button onClick={() => alert('Votre problème a été signalé')} className="text-primary hover:underline">Signaler un problème</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;