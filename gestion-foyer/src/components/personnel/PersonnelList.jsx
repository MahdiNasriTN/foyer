import React from 'react';
import { 
  PencilAltIcon, 
  TrashIcon, 
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ExclamationIcon,
  OfficeBuildingIcon,
  BriefcaseIcon,
} from '@heroicons/react/outline';
import { usePermissions } from '../../hooks/usePermissions';

const PersonnelList = ({ 
  personnel, 
  currentPage, 
  totalPages, 
  sortBy, 
  sortOrder,
  onView,
  onEdit,
  onDelete,
  onSort,
  onChangePage,
  selectedFilter,
  onChangeFilter,
  viewMode = 'list'
}) => {
  const permissions = usePermissions();

  // Rendu de la table du personnel
  const renderPersonnelTable = () => (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <div className="pb-4 bg-white px-4 pt-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Liste du personnel</h3>
          </div>
          <div className="mt-3 md:mt-0 flex flex-wrap gap-2">
            <button 
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                selectedFilter === 'all' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => onChangeFilter('all')}
            >
              Tous
            </button>
            <button 
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                selectedFilter === 'active' ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => onChangeFilter('active')}
            >
              Actifs
            </button>
            <button 
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                selectedFilter === 'inactive' ? 'bg-amber-100 text-amber-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => onChangeFilter('inactive')}
            >
              Inactifs
            </button>
          </div>
        </div>
      </div>
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">
              <div className="flex items-center cursor-pointer" onClick={() => onSort('nom')}>
                Employé
                {sortBy === 'nom' && (
                  sortOrder === 'asc' ? 
                  <ChevronUpIcon className="w-4 h-4 ml-1" /> : 
                  <ChevronDownIcon className="w-4 h-4 ml-1" />
                )}
              </div>
            </th>
            <th scope="col" className="px-6 py-3">
              <div className="flex items-center cursor-pointer" onClick={() => onSort('poste')}>
                Poste
                {sortBy === 'poste' && (
                  sortOrder === 'asc' ? 
                  <ChevronUpIcon className="w-4 h-4 ml-1" /> : 
                  <ChevronDownIcon className="w-4 h-4 ml-1" />
                )}
              </div>
            </th>
            <th scope="col" className="px-6 py-3">
              <div className="flex items-center cursor-pointer" onClick={() => onSort('departement')}>
                Département
                {sortBy === 'departement' && (
                  sortOrder === 'asc' ? 
                  <ChevronUpIcon className="w-4 h-4 ml-1" /> : 
                  <ChevronDownIcon className="w-4 h-4 ml-1" />
                )}
              </div>
            </th>
            <th scope="col" className="px-6 py-3">
              <div className="flex items-center cursor-pointer" onClick={() => onSort('statut')}>
                Statut
                {sortBy === 'statut' && (
                  sortOrder === 'asc' ? 
                  <ChevronUpIcon className="w-4 h-4 ml-1" /> : 
                  <ChevronDownIcon className="w-4 h-4 ml-1" />
                )}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {personnel.map((employee, index) => (
            <tr key={employee.id} className={index % 2 === 0 ? 'bg-white border-b' : 'bg-gray-50 border-b'}>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {employee.avatar ? (
                      <img 
                        className="w-10 h-10 rounded-full" 
                        src={employee.avatar} 
                        alt={employee.nom} 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span 
                      className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onView(employee.id)}
                    >
                      {employee.nom}
                    </span>
                    <span className="text-xs text-gray-500">{employee.email}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <BriefcaseIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{employee.poste}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <OfficeBuildingIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{employee.departement}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                {employee.statut === 'actif' ? (
                  <span className="bg-green-100 text-green-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-full">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    Actif
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-full">
                    <ExclamationIcon className="w-3 h-3 mr-1" />
                    Inactif
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  
                  {/* Edit button - only show if user can edit */}
                  {permissions.canEdit && (
                    <button
                      onClick={() => onEdit && onEdit(employee)}
                      className="text-green-600 hover:text-green-800"
                      title="Modifier"
                    >
                      <PencilAltIcon className="h-4 w-4" />
                    </button>
                  )}
                  
                  {/* Delete button - only show if user can delete */}
                  {permissions.canDelete && (
                    <button
                      onClick={() => onDelete && onDelete(employee)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {personnel.length === 0 && (
        <div className="py-8 text-center text-gray-500 bg-white">
          Aucun employé ne correspond à vos critères de recherche.
        </div>
      )}
    </div>
  );

  // Rendu des cartes du personnel (mode grille)
  const renderPersonnelCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {personnel.map(employee => (
        <div key={employee.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h4 className="font-medium text-gray-800">{employee.nom}</h4>
            <span className="text-xs font-medium text-gray-500">#{employee.id}</span>
          </div>
          
          <div className="p-4 flex items-center">
            {employee.avatar ? (
              <img 
                src={employee.avatar} 
                alt={employee.nom} 
                className="w-16 h-16 rounded-full mr-4 object-cover border-2 border-gray-100" 
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            
            <div>
              <p className="text-gray-600 text-sm mb-1">
                <BriefcaseIcon className="w-4 h-4 inline mr-1" />
                {employee.poste}
              </p>
              <p className="text-gray-500 text-sm">
                <OfficeBuildingIcon className="w-4 h-4 inline mr-1" />
                {employee.departement}
              </p>
              <div className="mt-2">
                {employee.statut === 'actif' ? (
                  <span className="bg-green-100 text-green-800 text-xs font-medium inline-flex items-center px-2 py-0.5 rounded-full">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    Actif
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium inline-flex items-center px-2 py-0.5 rounded-full">
                    <ExclamationIcon className="w-3 h-3 mr-1" />
                    Inactif
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 flex justify-between">
            <button 
              onClick={() => onView(employee.id)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Voir profil
            </button>
            <div>
              <button 
                onClick={() => onEdit(employee)}
                className="text-blue-600 p-1 rounded hover:bg-blue-50 mr-1"
              >
                <PencilAltIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(employee.id)}
                className="text-red-600 p-1 rounded hover:bg-red-50"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {personnel.length === 0 && (
        <div className="col-span-full py-8 text-center text-gray-500">
          Aucun employé ne correspond à vos critères de recherche.
        </div>
      )}
    </div>
  );

  return (
    <div>
      {viewMode === 'list' ? renderPersonnelTable() : renderPersonnelCards()}
      
      {/* Pagination */}
      {personnel.length > 0 && (
        <div className="flex items-center justify-between mt-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">
            Affichage de <span className="font-medium">{personnel.length}</span> employés
          </div>
          
          <nav className="flex items-center space-x-2">
            <button 
              onClick={() => onChangePage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => onChangePage(page)}
                className={`h-8 w-8 rounded ${page === currentPage ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={() => onChangePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default PersonnelList;