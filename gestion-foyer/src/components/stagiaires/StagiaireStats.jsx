import React from 'react';
import { 
  UserGroupIcon, 
  StatusOnlineIcon, 
  OfficeBuildingIcon, 
  ClockIcon 
} from '@heroicons/react/outline';

const StagiaireStats = ({ stats }) => {
  const getPercentageColor = (value) => {
    if (value < 30) return 'text-red-500';
    if (value < 70) return 'text-amber-500';
    return 'text-green-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
            <UserGroupIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">Total des stagiaires</h2>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
            <StatusOnlineIcon className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">Stagiaires actifs</h2>
            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            <p className="text-sm text-gray-500 mt-1">
              <span className={getPercentageColor(stats.activeRate)}>
                {stats.activeRate}%
              </span> du total
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
            <OfficeBuildingIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">Avec chambre</h2>
            <p className="text-2xl font-bold text-gray-900">{stats.withRoom}</p>
            <p className="text-sm text-gray-500 mt-1">
              <span className={getPercentageColor(stats.occupancyRate)}>
                {stats.occupancyRate}%
              </span> des stagiaires
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-amber-100 rounded-lg p-3">
            <ClockIcon className="h-6 w-6 text-amber-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">Durée moyenne</h2>
            <p className="text-2xl font-bold text-gray-900">{stats.averageDuration}</p>
            <p className="text-sm text-gray-500 mt-1">jours par stagiaire</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StagiaireStats;