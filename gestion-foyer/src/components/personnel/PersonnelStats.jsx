import React from 'react';
import { 
  UserGroupIcon, 
  ClockIcon, 
  OfficeBuildingIcon,
  UserIcon,
  CheckCircleIcon, 
  ExclamationIcon 
} from '@heroicons/react/outline';

const PersonnelStats = ({ stats }) => {
  // Liste des départements avec leurs couleurs associées
  const departmentColors = {
    'Administration': 'blue',
    'Ressources Humaines': 'indigo',
    'Sécurité': 'purple',
    'Restauration': 'orange',
    'Technique': 'teal',
    'Hébergement': 'green',
    'default': 'gray'
  };

  const getColorClass = (department, type) => {
    const color = departmentColors[department] || departmentColors.default;
    if (type === 'bg') return `bg-${color}-100`;
    if (type === 'text') return `text-${color}-600`;
    if (type === 'border') return `border-${color}-200`;
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Statistiques sommaires */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
              <UserGroupIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total du personnel</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Employés actifs</p>
              <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full" 
                style={{ width: `${stats.activeRate}%` }}
              ></div>
            </div>
            <p className="text-xs text-right mt-1 text-gray-500">
              {stats.activeRate}% actifs
            </p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-100 p-2 rounded-full">
              <ExclamationIcon className="h-5 w-5 text-amber-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Employés inactifs</p>
              <p className="text-2xl font-bold text-gray-800">{stats.inactive}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full" 
                style={{ width: `${100 - stats.activeRate}%` }}
              ></div>
            </div>
            <p className="text-xs text-right mt-1 text-gray-500">
              {100 - stats.activeRate}% inactifs
            </p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-full">
              <OfficeBuildingIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Départements</p>
              <p className="text-2xl font-bold text-gray-800">{Object.keys(stats.departments || {}).length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Répartition par département */}
      {stats.departments && Object.keys(stats.departments).length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-700 mb-4">Répartition par département</h3>
          <div className="space-y-4">
            {Object.entries(stats.departments).map(([department, count]) => {
              const percentage = Math.round((count / stats.total) * 100);
              return (
                <div key={department} className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getColorClass(department, 'bg')} mr-2`}></div>
                      <span className="text-sm font-medium text-gray-600">{department}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium ${getColorClass(department, 'text')}`}>
                        {count} employés
                      </span>
                      <span className="text-xs text-gray-500">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getColorClass(department, 'bg')}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Activité du personnel (mock) */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-base font-medium text-gray-700 mb-4">Activité du personnel</h3>
        <div className="flex justify-between items-center text-sm">
          <div className="flex flex-col items-center p-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <UserIcon className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Nouveaux</span>
            <span className="text-sm font-bold text-gray-800">3</span>
          </div>
          
          <div className="flex flex-col items-center p-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">Présents</span>
            <span className="text-sm font-bold text-gray-800">12</span>
          </div>
          
          <div className="flex flex-col items-center p-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-600">Absents</span>
            <span className="text-sm font-bold text-gray-800">2</span>
          </div>
          
          <div className="flex flex-col items-center p-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-2">
              <ClockIcon className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-gray-600">En Repos</span>
            <span className="text-sm font-bold text-gray-800">4</span>
          </div>
          
          <div className="flex flex-col items-center p-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-600">Ce mois</span>
            <span className="text-sm font-bold text-gray-800">21</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonnelStats;