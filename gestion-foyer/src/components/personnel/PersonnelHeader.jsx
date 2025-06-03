// filepath: c:\Users\MahdiNasri\Desktop\ges_foyer\ges_foyer\src\components\personnel\PersonnelHeader.jsx
import React from 'react';
import { 
  SearchIcon, 
  PlusIcon,
  ViewListIcon,
  ViewGridIcon,
  ChartPieIcon
} from '@heroicons/react/outline';
import { usePermissions } from '../../hooks/usePermissions';

const PersonnelHeader = ({ 
  searchTerm, 
  onSearchChange, 
  onToggleStats, 
  isStatsOpen,
  viewMode, 
  onViewModeChange,
  onAddNew,
  totalCount
}) => {
  const permissions = usePermissions();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-800">Personnel</h2>
        <span className="ml-2 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
          {totalCount} employés
        </span>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative">
          <input 
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
          />
          <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        
        <div className="flex items-center gap-2">
          {/* View mode toggles - always available */}
          <button 
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <ViewListIcon className="h-5 w-5" />
          </button>
          <button 
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <ViewGridIcon className="h-5 w-5" />
          </button>
          <button 
            onClick={onToggleStats}
            className={`p-2 rounded-lg ${isStatsOpen ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <ChartPieIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Add button - only show if user can create */}
        {permissions.canCreate && (
          <button 
            onClick={onAddNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Ajouter</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PersonnelHeader;