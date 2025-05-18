import React, { useState, useEffect } from 'react';
import { 
  FilterIcon, 
  CheckCircleIcon, 
  ExclamationIcon,
  OfficeBuildingIcon,
  UserIcon,
  ClockIcon,
  ChevronDownIcon
} from '@heroicons/react/outline';

const PersonnelFilters = ({ filters, onApplyFilters, onResetFilters }) => {
  const [localFilters, setLocalFilters] = useState({
    status: 'all',
    department: 'all',
    role: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: ''
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  // Initialiser les filtres locaux avec les filtres actuels
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Gérer les changements dans les filtres
  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  // Appliquer les filtres
  const applyFilters = () => {
    onApplyFilters(localFilters);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    const resetFilters = {
      status: 'all',
      department: 'all',
      role: 'all',
      dateRange: 'all',
      startDate: '',
      endDate: ''
    };
    setLocalFilters(resetFilters);
    onResetFilters(resetFilters);
  };

  // Compter le nombre de filtres actifs
  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.status !== 'all') count++;
    if (localFilters.department !== 'all') count++;
    if (localFilters.role !== 'all') count++;
    if (localFilters.dateRange !== 'all') count++;
    if (localFilters.startDate || localFilters.endDate) count++;
    return count;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <FilterIcon className="h-4 w-4 mr-2 text-gray-500" />
          Filtres
          {getActiveFilterCount() > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </h3>
        
        <div className="space-x-2">
          <button 
            onClick={applyFilters}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Appliquer
          </button>
          <button 
            onClick={resetFilters}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
          >
            Réinitialiser
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Filtre par statut */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1 flex items-center">
            <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
            Statut
          </label>
          <div className="flex space-x-1">
            <button
              className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                localFilters.status === 'all' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('status', 'all')}
            >
              Tous
            </button>
            <button
              className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                localFilters.status === 'active' 
                  ? 'bg-green-100 text-green-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('status', 'active')}
            >
              Actif
            </button>
            <button
              className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                localFilters.status === 'inactive' 
                  ? 'bg-amber-100 text-amber-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('status', 'inactive')}
            >
              Inactif
            </button>
          </div>
        </div>
        
        {/* Filtre par département */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1 flex items-center">
            <OfficeBuildingIcon className="h-3.5 w-3.5 mr-1" />
            Département
          </label>
          <select
            value={localFilters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tous les départements</option>
            <option value="Administration">Administration</option>
            <option value="Ressources Humaines">Ressources Humaines</option>
            <option value="Sécurité">Sécurité</option>
            <option value="Restauration">Restauration</option>
            <option value="Technique">Technique</option>
            <option value="Hébergement">Hébergement</option>
          </select>
        </div>
        
        {/* Filtre par rôle */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1 flex items-center">
            <UserIcon className="h-3.5 w-3.5 mr-1" />
            Rôle
          </label>
          <select
            value={localFilters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateur</option>
            <option value="manager">Gestionnaire</option>
            <option value="employee">Employé</option>
          </select>
        </div>
        
        {/* Filtre par date */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1 flex items-center">
            <ClockIcon className="h-3.5 w-3.5 mr-1" />
            Date d'embauche
          </label>
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full text-left px-2.5 py-1.5 text-xs border border-gray-300 rounded-md bg-white flex items-center justify-between"
            >
              <span>
                {localFilters.dateRange === 'all' ? 'Toutes les dates' :
                localFilters.dateRange === 'lastMonth' ? 'Dernier mois' :
                localFilters.dateRange === 'lastYear' ? 'Dernière année' :
                localFilters.dateRange === 'custom' ? 'Personnalisé' : 'Toutes les dates'}
              </span>
              <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
            </button>
            
            {showDatePicker && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-2">
                <div className="space-y-1">
                  <button
                    className={`w-full text-left px-2 py-1 text-xs rounded-md transition-colors ${
                      localFilters.dateRange === 'all' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      handleFilterChange('dateRange', 'all');
                      handleFilterChange('startDate', '');
                      handleFilterChange('endDate', '');
                      setShowDatePicker(false);
                    }}
                  >
                    Toutes les dates
                  </button>
                  <button
                    className={`w-full text-left px-2 py-1 text-xs rounded-md transition-colors ${
                      localFilters.dateRange === 'lastMonth' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      handleFilterChange('dateRange', 'lastMonth');
                      const date = new Date();
                      date.setMonth(date.getMonth() - 1);
                      handleFilterChange('startDate', date.toISOString().split('T')[0]);
                      handleFilterChange('endDate', new Date().toISOString().split('T')[0]);
                      setShowDatePicker(false);
                    }}
                  >
                    Dernier mois
                  </button>
                  <button
                    className={`w-full text-left px-2 py-1 text-xs rounded-md transition-colors ${
                      localFilters.dateRange === 'lastYear' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      handleFilterChange('dateRange', 'lastYear');
                      const date = new Date();
                      date.setFullYear(date.getFullYear() - 1);
                      handleFilterChange('startDate', date.toISOString().split('T')[0]);
                      handleFilterChange('endDate', new Date().toISOString().split('T')[0]);
                      setShowDatePicker(false);
                    }}
                  >
                    Dernière année
                  </button>
                  <div className={`pt-2 border-t border-gray-100 mt-2 ${
                    localFilters.dateRange === 'custom' ? 'block' : 'hidden'
                  }`}>
                    <p className="text-xs font-medium text-gray-500 mb-2">Période personnalisée</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Du</label>
                        <input
                          type="date"
                          value={localFilters.startDate}
                          onChange={(e) => handleFilterChange('startDate', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Au</label>
                        <input
                          type="date"
                          value={localFilters.endDate}
                          onChange={(e) => handleFilterChange('endDate', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <button
                      className="mt-2 w-full px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={() => {
                        handleFilterChange('dateRange', 'custom');
                        setShowDatePicker(false);
                      }}
                    >
                      Appliquer
                    </button>
                  </div>
                  <button
                    className={`w-full text-left px-2 py-1 text-xs rounded-md transition-colors ${
                      localFilters.dateRange === 'custom' && !localFilters.startDate && !localFilters.endDate ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      handleFilterChange('dateRange', 'custom');
                      if (localFilters.dateRange !== 'custom') {
                        handleFilterChange('startDate', '');
                        handleFilterChange('endDate', '');
                      }
                    }}
                  >
                    Personnalisé
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Filtres actifs */}
      {getActiveFilterCount() > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Filtres actifs:</span>
          {localFilters.status !== 'all' && (
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center">
              Statut: {localFilters.status === 'active' ? 'Actif' : 'Inactif'}
              <button 
                onClick={() => handleFilterChange('status', 'all')}
                className="ml-1.5 text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          )}
          {localFilters.department !== 'all' && (
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center">
              Département: {localFilters.department}
              <button 
                onClick={() => handleFilterChange('department', 'all')}
                className="ml-1.5 text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          )}
          {localFilters.role !== 'all' && (
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center">
              Rôle: {
                localFilters.role === 'admin' ? 'Administrateur' :
                localFilters.role === 'manager' ? 'Gestionnaire' : 'Employé'
              }
              <button 
                onClick={() => handleFilterChange('role', 'all')}
                className="ml-1.5 text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          )}
          {localFilters.dateRange !== 'all' && (
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center">
              Date: {
                localFilters.dateRange === 'lastMonth' ? 'Dernier mois' :
                localFilters.dateRange === 'lastYear' ? 'Dernière année' :
                localFilters.dateRange === 'custom' && localFilters.startDate && localFilters.endDate 
                  ? `Du ${new Date(localFilters.startDate).toLocaleDateString()} au ${new Date(localFilters.endDate).toLocaleDateString()}` 
                  : 'Personnalisé'
              }
              <button 
                onClick={() => {
                  handleFilterChange('dateRange', 'all');
                  handleFilterChange('startDate', '');
                  handleFilterChange('endDate', '');
                }}
                className="ml-1.5 text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonnelFilters;