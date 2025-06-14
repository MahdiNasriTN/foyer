import React, { useState, useEffect } from 'react';
import { 
  PencilAltIcon, 
  TrashIcon, 
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  FilterIcon,
  CheckCircleIcon,
  ExclamationIcon,
  MailIcon,
  PhoneIcon,
  ClockIcon,
  OfficeBuildingIcon,
  BriefcaseIcon,
  CalendarIcon,
  DownloadIcon // Import the download icon
} from '@heroicons/react/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import axios from 'axios';
import { usePermissions } from '../../hooks/usePermissions';

const StagiairesList = ({ 
  stagiaires, 
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
  viewMode = 'list',
  filters,
  onApplyFilters,
  onResetFilters,
  getDisplayableChambre, // This function might be the issue
  onExport,  
  onExportSingle,
  permissions // Add this prop
}) => {
  const { canEdit, canDelete } = usePermissions();
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeFilterTab, setActiveFilterTab] = useState('status');
  const [localFilters, setLocalFilters] = useState(filters);
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [stagiaireToDelete, setStagiaireToDelete] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false); // New state for export options

  // Update your state variables (keep only paymentStatusFilter, remove paymentTypeFilter)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  useEffect(() => {
    // Make sure the localFilters includes the year field
    setLocalFilters({
      ...filters,
      year: filters.year || 'all'
    });
  }, [filters]);

  const availableRooms = ['101', '102', '103', '104', '105']; // Example room numbers

  // Update your handleFilterChange function
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'paymentStatus') {
      setPaymentStatusFilter(value);
    } else {
      setLocalFilters((prevFilters) => ({
        ...prevFilters,
        [filterType]: value
      }));
    }
  };

  // Update your applyFilters function
  const applyFilters = () => {
    const filtersToApply = {
      ...localFilters,
      paymentStatus: paymentStatusFilter // Make sure this is included
    };
    
    onApplyFilters(filtersToApply);
  };

  // Update your resetFilters function
  const resetFilters = () => {
    setLocalFilters({
      status: 'all',
      room: 'all',
      specificRoom: '',
      gender: 'all',
      session: 'all',
      year: 'all',
      startDate: '',
      endDate: ''
    });
    setPaymentStatusFilter(''); // Reset payment filter
    onResetFilters();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    Object.values(localFilters).forEach((value) => {
      if (value && value !== 'all' && value !== '') count++;
    });
    // Add payment filter to count
    if (paymentStatusFilter && paymentStatusFilter !== '') count++;
    return count;
  };

  // Replace the getFilterCount function with this improved version:
  const getFilterCount = (filterType) => {
    return stagiaires.filter((stagiaire) => {
      if (filterType === 'active') return isStagiaireActif(stagiaire);
      if (filterType === 'inactive') return !isStagiaireActif(stagiaire);
      if (filterType === 'withRoom') {
        // Check if stagiaire has a room assigned
        const hasRoom = (stagiaire.chambreInfo && stagiaire.chambreInfo.numero) ||
                       stagiaire.chambreNumero ||
                       (stagiaire.chambre && stagiaire.chambre !== '' && 
                        ((typeof stagiaire.chambre === 'object' && stagiaire.chambre.numero) ||
                         (typeof stagiaire.chambre === 'string')));
        return hasRoom;
      }
      if (filterType === 'withoutRoom') {
        // Check if stagiaire does NOT have a room assigned
        const hasRoom = (stagiaire.chambreInfo && stagiaire.chambreInfo.numero) ||
                       stagiaire.chambreNumero ||
                       (stagiaire.chambre && stagiaire.chambre !== '' && 
                        ((typeof stagiaire.chambre === 'object' && stagiaire.chambre.numero) ||
                         (typeof stagiaire.chambre === 'string')));
        return !hasRoom;
      }
      return false;
    }).length;
  };

  // Indicateur de tri
  const SortIndicator = ({ field }) => {
    if (sortBy !== field) return null;
    
    return (
      <span className="ml-1 inline-flex items-center">
        {sortOrder === 'asc' ? (
          <ChevronUpIcon className="h-4 w-4 text-cyan-500" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-cyan-500" />
        )}
      </span>
    );
  };
  
  // Style pour les cellules d'en-tête de colonne
  const getHeaderCellClass = (field) => `
    py-4 px-6 text-left text-xs font-medium uppercase tracking-wider cursor-pointer
    transition-colors duration-200 select-none
    ${sortBy === field ? 'text-cyan-600' : 'text-gray-500'}
    hover:text-cyan-600
  `;

  // Style pour les lignes
  const getRowClass = (id) => `
    transition-all duration-300 group
    ${hoveredRow === id ? 'bg-blue-50' : 'hover:bg-blue-50/70'}
    ${id % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
  `;

  // Style pour les boutons d'action
  const getActionButtonClass = (color) => `
    p-1.5 rounded-lg transition-all duration-200
    ${color === 'blue' ? 'text-blue-600 hover:bg-blue-100' : ''}
    ${color === 'green' ? 'text-emerald-600 hover:bg-emerald-100' : ''}
    ${color === 'red' ? 'text-rose-600 hover:bg-rose-100' : ''}
    group-hover:scale-105
  `;

  // Calcule si un stagiaire est actif (période actuelle)
  const isStagiaireActif = (stagiaire) => {
    const now = new Date();
    const arrivee = new Date(stagiaire.dateArrivee);
    const depart = new Date(stagiaire.dateDepart);
    return now >= arrivee && now <= depart;
  };

  // Rendu de la vue en grille
  const renderStagiaireCards = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
        {stagiaires.map((stagiaire) => (
          <div 
            key={stagiaire._id || stagiaire.id}
            className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-all duration-300
              ${hoveredCard === (stagiaire._id || stagiaire.id) ? 'shadow-md transform scale-[1.02] border-cyan-200' : 'hover:shadow-md hover:border-blue-200'}
            `}
            onMouseEnter={() => setHoveredCard(stagiaire._id || stagiaire.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="p-1">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-cyan-200 border-2 border-white flex items-center justify-center shadow-sm mb-3">
                  {stagiaire.avatar ? (
                    <img src={stagiaire.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-medium text-cyan-600">
                      {stagiaire.nom ? stagiaire.nom.charAt(0) : (stagiaire.firstName ? stagiaire.firstName.charAt(0) : '?')}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-medium text-gray-800">{stagiaire.firstName} {stagiaire.lastName}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{stagiaire.email}</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                    ${stagiaire.type === 'externe' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {stagiaire.type === 'externe' ? 'Externe' : 'Interne'}
                  </span>
                </div>
                <div className="mt-2">
                  {isStagiaireActif(stagiaire) ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                      Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5"></span>
                      Inactif
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div className="text-sm text-gray-700 flex items-center">
                  <BriefcaseIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>Centre de formation</span>
                </div>
                <span className="font-medium text-gray-700 text-sm">{stagiaire.entreprise || stagiaire.centerName || stagiaire.assignedCenter || 'N/A'}</span>
              </div>

              {/* NEW: Session Information in Cards */}
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div className="text-sm text-gray-700 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>Session</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-medium text-gray-700 text-sm">{stagiaire.sessionYear || 'N/A'}</span>
                  {stagiaire.cycle && stagiaire.cycle !== 'externe' && (
                    <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      stagiaire.cycle === 'sep' ? 'bg-amber-100 text-amber-800' :
                      stagiaire.cycle === 'nov' ? 'bg-orange-100 text-orange-800' :
                      stagiaire.cycle === 'fev' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {stagiaire.cycle === 'sep' ? 'Septembre' :
                       stagiaire.cycle === 'nov' ? 'Novembre' :
                       stagiaire.cycle === 'fev' ? 'Février' :
                       stagiaire.cycle}
                    </span>
                  )}
                  {(stagiaire.type === 'externe' || stagiaire.cycle === 'externe') && (
                    <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Externe
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div className="text-sm text-gray-700 flex items-center">
                  <OfficeBuildingIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>Chambre</span>
                </div>
                {getDisplayableRoom(stagiaire) !== 'Non assignée' ? (
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium">
                    {getDisplayableRoom(stagiaire)}
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-medium">
                    Non assignée
                  </span>
                )}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                <div>
                  <div>Du {new Date(stagiaire.dateArrivee).toLocaleDateString('fr-FR')}</div>
                  <div>Au {new Date(stagiaire.dateDepart).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-t border-gray-100">
              <button 
                onClick={() => onView(stagiaire._id || stagiaire.id)}
                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <UserIcon className="h-3.5 w-3.5 mr-1" />
                Profil
              </button>

              <div className="flex gap-1">
                <button 
                  onClick={() => onEdit(stagiaire)} 
                  className={getActionButtonClass('green')}
                  title="Modifier"
                >
                  <PencilAltIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDeleteClick(stagiaire)} 
                  className={getActionButtonClass('red')}
                  title="Supprimer"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
                {/* New export button */}
                <button
                  onClick={() => onExportSingle(stagiaire)}
                  className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50"
                  title="Exporter"
                >
                  <DownloadIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Replace the getDisplayableRoom function with this improved version:

  const getDisplayableRoom = (stagiaire) => {
    // Check multiple possible room data sources
    if (stagiaire.chambreInfo && stagiaire.chambreInfo.numero) {
      return stagiaire.chambreInfo.numero;
    }
    
    if (stagiaire.chambreNumero) {
      return stagiaire.chambreNumero;
    }
    
    if (stagiaire.chambre) {
      if (typeof stagiaire.chambre === 'object' && stagiaire.chambre.numero) {
        return stagiaire.chambre.numero;
      }
      if (typeof stagiaire.chambre === 'string' && stagiaire.chambre !== '') {
        return stagiaire.chambre;
      }
    }
    
    return 'Non assignée';
  };

  // Rendu de la vue en liste
  const renderStagiairesTable = () => {
    return (
      <div className="relative overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th 
                className={getHeaderCellClass('nom')}
                onClick={() => onSort('nom')}
              >
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>Nom</span>
                  <SortIndicator field="nom" />
                </div>
              </th>
              <th 
                className={getHeaderCellClass('entreprise')}
                onClick={() => onSort('entreprise')}
              >
                <div className="flex items-center">
                  <BriefcaseIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>Centre de formation</span>
                  <SortIndicator field="entreprise" />
                </div>
              </th>
              {/* NEW: Session Column */}
              <th 
                className={getHeaderCellClass('session')}
                onClick={() => onSort('sessionYear')}
              >
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>Session</span>
                  <SortIndicator field="sessionYear" />
                </div>
              </th>
              <th 
                className={getHeaderCellClass('chambre')}
                onClick={() => onSort('chambre')}
              >
                <div className="flex items-center">
                  <OfficeBuildingIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>Chambre</span>
                  <SortIndicator field="chambre" />
                </div>
              </th>
              <th 
                className={getHeaderCellClass('dateArrivee')}
                onClick={() => onSort('dateArrivee')}
              >
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>Période</span>
                  <SortIndicator field="dateArrivee" />
                </div>
              </th>
              <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {stagiaires.map((stagiaire) => (
              <tr 
                key={stagiaire._id || stagiaire.id} 
                className={getRowClass(stagiaire._id || stagiaire.id)}
                onMouseEnter={() => setHoveredRow(stagiaire._id || stagiaire.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="py-3 px-6 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-50 to-cyan-100 border border-gray-200 flex items-center justify-center mr-3 shadow-sm">
                      {stagiaire.avatar ? (
                        <img src={stagiaire.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <span className="text-sm font-medium text-cyan-600">
                          {stagiaire.nom ? stagiaire.nom.charAt(0) : (stagiaire.firstName ? stagiaire.firstName.charAt(0) : '?')}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 group-hover:text-cyan-600 transition-colors">
                        {stagiaire.firstName} {stagiaire.lastName}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <span>{stagiaire.email}</span>
                        {/* Badge de type de stagiaire */}
                        <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium 
                          ${stagiaire.type === 'externe' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {stagiaire.type === 'externe' ? 'Externe' : 'Interne'}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="py-3 px-6 whitespace-nowrap">
                  <div className="flex items-center">
                    <BriefcaseIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-700">{stagiaire.entreprise || stagiaire.centerName || stagiaire.assignedCenter || 'N/A'}</span>
                  </div>
                </td>
                
                {/* NEW: Session Column */}
                <td className="py-3 px-6 whitespace-nowrap">
                  <div className="flex flex-col">
                    {/* Display session year */}
                    <div className="text-gray-700 flex items-center">
                      <span className="font-medium text-sm">{stagiaire.sessionYear || 'N/A'}</span>
                    </div>
                    
                    {/* Display session month/cycle with appropriate styling */}
                    {stagiaire.cycle && stagiaire.cycle !== 'externe' && (
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          stagiaire.cycle === 'sep' ? 'bg-amber-100 text-amber-800' :
                          stagiaire.cycle === 'nov' ? 'bg-orange-100 text-orange-800' :
                          stagiaire.cycle === 'fev' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {stagiaire.cycle === 'sep' ? '📚 Septembre' :
                           stagiaire.cycle === 'nov' ? '🍂 Novembre' :
                           stagiaire.cycle === 'fev' ? '❄️ Février' :
                           stagiaire.cycle}
                        </span>
                      </div>
                    )}
                    
                    {/* For external stagiaires */}
                    {(stagiaire.type === 'externe' || stagiaire.cycle === 'externe') && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          🏢 Externe
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="py-3 px-6 whitespace-nowrap">
                  {/* FIXED: Use getDisplayableRoom instead of getDisplayableChambre */}
                  {getDisplayableRoom(stagiaire) !== 'Non assignée' ? (
                    <div className="flex items-center">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium inline-flex items-center">
                        <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                        {getDisplayableRoom(stagiaire)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-medium inline-flex items-center">
                        <ExclamationIcon className="h-3.5 w-3.5 mr-1" />
                        Non assignée
                      </span>
                    </div>
                  )}
                </td>
                
                <td className="py-3 px-6 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-gray-700 flex items-center">
                      <span className="font-medium text-xs mr-2">Du</span>
                      {new Date(stagiaire.dateArrivee).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-gray-700 flex items-center mt-1">
                      <span className="font-medium text-xs mr-2">Au</span>
                      {new Date(stagiaire.dateDepart).toLocaleDateString('fr-FR')}
                    </div>
                    {isStagiaireActif(stagiaire) ? (
                      <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></div>
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5"></div>
                        Inactif
                      </span>
                    )}
                  </div>
                </td>
                
                {/* Actions column - add export icon */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    
                    {/* Edit button - only show if onEdit is provided */}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(stagiaire)}
                        className="text-green-600 hover:text-green-800"
                        title="Modifier"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Delete button - only show if onDelete is provided */}
                    {onDelete && (
                      <button
                        onClick={() => handleDeleteClick(stagiaire)}
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Export button - always available */}
                    <button
                      onClick={() => onExportSingle && onExportSingle(stagiaire)}
                      className="text-emerald-600 hover:text-emerald-800"
                      title="Exporter"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleDeleteClick = (stagiaire) => {
    setStagiaireToDelete(stagiaire);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (stagiaireToDelete) {
      try {
        // Get the ID to delete (handle MongoDB _id vs client-side id)
        const idToDelete = stagiaireToDelete._id || stagiaireToDelete.id;
        
        // Call the parent component's onDelete function
        // This will trigger the API request in the parent component
        await onDelete(idToDelete);
        
        // Show success notification if needed (can be handled in parent)
      } catch (error) {
        // Handle errors
        console.error('Erreur lors de la suppression du stagiaire:', error);
        // You might want to show an error message to the user here
      } finally {
        // Close the modal and reset state regardless of success/failure
        setDeleteModalOpen(false);
        setStagiaireToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setStagiaireToDelete(null);
  };

  // Add this method right after the component declaration, with your other helper methods
  const generateYearOptions = () => {
    const startYear = 2005;
    const endYear = 2050;
    const years = [];
    
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }
    
    return years;
  };

  // Replace the existing handleExport method with this one
  const handleExport = (count) => {
    setShowExportOptions(false);
    
    // Get the current filtered stagiaires
    const stagiairesList = stagiaires; // This contains the already filtered results
    
    // Determine how many to export
    let stagiaireToExport = [];
    
    if (count === 'all') {
      stagiaireToExport = stagiairesList;
    } else {
      stagiaireToExport = stagiairesList.slice(0, parseInt(count));
    }
    
    // Call the parent component's onExport function with the filtered data
    if (onExport) {
      onExport(stagiaireToExport, count);
    } else {
      console.error("onExport prop is not defined");
    }
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-xl border border-gray-200">
      {/* En-tête avec titre de section */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-100 text-cyan-600">
            <BriefcaseIcon className="h-4 w-4" />
          </span>
          Liste des stagiaires
        </h3>
        
        {/* Filtre et info de tri */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 hidden sm:block">
            <span className="text-gray-700 font-medium">{stagiaires.length}</span> résultats
            {sortBy && <span> • Trié par <span className="text-cyan-600 font-medium">{sortBy}</span></span>}
          </div>
          
          {/* Export button - adding this new button */}
          <div className="relative">
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center gap-1.5 bg-emerald-50 py-2 px-3.5 rounded-lg text-sm text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-sm hover:shadow-md"
            >
              <DownloadIcon className="h-4 w-4 text-emerald-600" />
              <span className="hidden sm:inline">Exporter</span>
            </button>
            
            {/* Export dropdown */}
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 uppercase px-3 py-2 flex items-center">
                    <span>Exporter les résultats filtrés</span>
                    {getActiveFilterCount() > 0 && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                        {getActiveFilterCount()} filtres
                      </span>
                    )}
                  </div>
                  
                  {/* Show available export options based on current results */}
                  {stagiaires.length >= 10 && (
                    <button 
                      onClick={() => handleExport(10)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-md w-full text-left"
                    >
                      10 premiers stagiaires
                    </button>
                  )}
                  
                  {stagiaires.length >= 20 && (
                    <button 
                      onClick={() => handleExport(20)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-md w-full text-left"
                    >
                      20 premiers stagiaires
                    </button>
                  )}
                  
                  {stagiaires.length >= 50 && (
                    <button 
                      onClick={() => handleExport(50)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-md w-full text-left"
                    >
                      50 premiers stagiaires
                    </button>
                  )}
                  
                  {stagiaires.length >= 200 && (
                    <button 
                      onClick={() => handleExport(200)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-md w-full text-left"
                    >
                      200 premiers stagiaires
                    </button>
                  )}
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  {/* Always show option to export all current results */}
                  <button 
                    onClick={() => handleExport('all')}
                    className="block px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-md w-full text-left flex items-center justify-between"
                  >
                    <span>Tous les résultats actuels</span>
                    <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                      {stagiaires.length}
                    </span>
                  </button>
                  
                  {/* Show message if no results */}
                  {stagiaires.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      Aucun stagiaire à exporter
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 bg-white py-2 px-3.5 rounded-lg text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
          >
            <FilterIcon className="h-4 w-4 text-cyan-500" />
            <span>{getActiveFilterCount() > 0 ? `Filtres (${getActiveFilterCount()})` : 'Filtrer'}</span>
            <ChevronDownIcon className={`h-4 w-4 opacity-50 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Affichez les filtres uniquement lorsque showFilters est true */}
      {showFilters && (
        <div className="border-b border-gray-200">
          {/* Filter Bar - Displayed at the top of the list */}
          <div className="p-4 bg-white border-b border-gray-200 flex flex-wrap gap-3">
            {/* Status Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="text-xs font-medium text-gray-500 uppercase flex items-center mr-2">
                <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                Statut:
              </div>
              <div className="flex gap-1.5">
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
                  className={`px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center ${
                    localFilters.status === 'active' 
                      ? 'bg-green-100 text-green-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFilterChange('status', 'active')}
                >
                  <div className={localFilters.status === 'active' ? "w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" : ""}></div>
                  Actifs <span className="ml-1 opacity-60">({getFilterCount('active')})</span>
                </button>
                <button
                  className={`px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center ${
                    localFilters.status === 'inactive' 
                      ? 'bg-gray-200 text-gray-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFilterChange('status', 'inactive')}
                >
                  <div className={localFilters.status === 'inactive' ? "w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5" : ""}></div>
                  Inactifs <span className="ml-1 opacity-60">({getFilterCount('inactive')})</span>
                </button>
              </div>
            </div>

            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>

            {/* Room Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="text-xs font-medium text-gray-500 uppercase flex items-center mr-2">
                <OfficeBuildingIcon className="h-3.5 w-3.5 mr-1" />
                Chambre:
              </div>
              <div className="flex gap-1.5 items-center flex-wrap">
                <button
                  className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                    localFilters.room === 'all' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFilterChange('room', 'all')}
                >
                  Toutes
                </button>
                <button
                  className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                    localFilters.room === 'withRoom' 
                      ? 'bg-emerald-100 text-emerald-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFilterChange('room', 'withRoom')}
                >
                  Avec chambre <span className="ml-1 opacity-60">({getFilterCount('withRoom')})</span>
                </button>
                <button
                  className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                    localFilters.room === 'withoutRoom' 
                      ? 'bg-amber-100 text-amber-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFilterChange('room', 'withoutRoom')}
                >
                  Sans chambre <span className="ml-1 opacity-60">({getFilterCount('withoutRoom')})</span>
                </button>
                
                {/* Room input field */}
                <div className="flex items-center ml-2">
                  <span className="text-xs text-gray-500 mr-1">N°:</span>
                  <input
                    type="text"
                    placeholder="Ex: 101"
                    value={localFilters.specificRoom}
                    onChange={(e) => handleFilterChange('specificRoom', e.target.value)}
                    className="w-16 h-7 text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>

            {/* Gender Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="text-xs font-medium text-gray-500 uppercase flex items-center mr-2">
                <UserIcon className="h-3.5 w-3.5 mr-1" />
                Sexe:
              </div>
              <div className="flex gap-1.5">
                <button
                  className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                    localFilters.gender === 'all' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFilterChange('gender', 'all')}
                >
                  Tous
                </button>
                <button
                  className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                    localFilters.gender === 'garcon' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFilterChange('gender', 'garcon')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  garcon
                </button>
                <button
                  className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                    localFilters.gender === 'fille' 
                      ? 'bg-pink-100 text-pink-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFilterChange('gender', 'fille')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  fille
                </button>
              </div>
            </div>

            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>

            {/* Session Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="text-xs font-medium text-gray-500 uppercase flex items-center mr-2">
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                Session:
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                    localFilters.session === 'all' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFilterChange('session', 'all')}
                >
                  Toutes
                </button>
                
                {/* Year selector - Make it more prominent */}
                <select
                  className="h-7 text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={localFilters.year || 'all'}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                >
                  <option value="all">Année: Toutes</option>
                  {generateYearOptions().map(year => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
                
                {/* Month Session Buttons - with clearer UI */}
                <div className="flex gap-1.5 mt-1 sm:mt-0">
                  <button
                    className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                      localFilters.session === 'septembre' 
                        ? 'bg-amber-100 text-amber-700 font-medium' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => handleFilterChange('session', 'septembre')}
                  >
                    <span className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Sep
                    </span>
                  </button>
                  <button
                    className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                      localFilters.session === 'novembre' 
                        ? 'bg-amber-100 text-amber-700 font-medium' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => handleFilterChange('session', 'novembre')}
                  >
                    <span className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Nov
                    </span>
                  </button>
                  <button
                    className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                      localFilters.session === 'fevrier' 
                        ? 'bg-amber-100 text-amber-700 font-medium' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => handleFilterChange('session', 'fevrier')}
                  >
                    <span className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Fév
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>

            {/* Payment Status Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="text-xs font-medium text-gray-500 uppercase flex items-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Paiement:
              </div>
              
              <div className="flex gap-1.5 flex-wrap">
                <button
                  className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                    paymentStatusFilter === '' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFilterChange('paymentStatus', '')}
                >
                  Tous
                </button>
                <button
                  className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                    paymentStatusFilter === 'paid' 
                      ? 'bg-green-100 text-green-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFilterChange('paymentStatus', 'paid')}
                >
                  💰 Payé
                </button>
                <button
                  className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                    paymentStatusFilter === 'unpaid' 
                      ? 'bg-red-100 text-red-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFilterChange('paymentStatus', 'unpaid')}
                >
                  ❌ Non payé
                </button>
                <button
                  className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                    paymentStatusFilter === 'exempt' 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleFilterChange('paymentStatus', 'exempt')}
                >
                  🎫 Dispensé
                </button>
                
                {/* Trimester Filter - NEW ADDITION */}
                {paymentStatusFilter && paymentStatusFilter !== '' && (
                  <div className="flex items-center ml-2 pl-2 border-l border-gray-300">
                    <span className="text-xs text-gray-500 mr-2">Trimestre:</span>
                    <div className="flex gap-1">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={localFilters.trimester1 || false}
                          onChange={(e) => handleFilterChange('trimester1', e.target.checked)}
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-1 text-xs text-gray-600">T1</span>
                      </label>
                      <label className="flex items-center ml-2">
                        <input
                          type="checkbox"
                          checked={localFilters.trimester2 || false}
                          onChange={(e) => handleFilterChange('trimester2', e.target.checked)}
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-1 text-xs text-gray-600">T2</span>
                      </label>
                      <label className="flex items-center ml-2">
                        <input
                          type="checkbox"
                          checked={localFilters.trimester3 || false}
                          onChange={(e) => handleFilterChange('trimester3', e.target.checked)}
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-1 text-xs text-gray-600">T3</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>

            {/* Date Filters Toggle Button - NEW ADDITION */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowDateFilters(!showDateFilters)}
                className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center ${
                  showDateFilters 
                    ? 'bg-indigo-100 text-indigo-700 font-medium border border-indigo-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                <span>Filtres par date</span>
                <ChevronDownIcon className={`h-3.5 w-3.5 ml-1 transition-transform ${showDateFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Show active date filters indicator */}
              {(localFilters.startDate || localFilters.endDate) && (
                <div className="flex items-center text-xs text-indigo-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1"></div>
                  <span>
                    {localFilters.startDate && localFilters.endDate 
                      ? 'Période active'
                      : localFilters.startDate 
                        ? 'Date début'
                        : 'Date fin'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bouton "Appliquer les filtres" en bas */}
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex justify-between">
            <button 
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-medium rounded-md shadow-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réinitialiser {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
            </button>
            <button 
              onClick={() => {
                applyFilters();
                setShowFilters(false); // Fermer la section des filtres après application
              }}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 shadow-sm flex items-center"
            >
              <FilterIcon className="h-4 w-4 mr-2" />
              Appliquer les filtres
            </button>
          </div>

          {/* Date Filters - Gardez cette section mais maintenant elle est liée à showDateFilters */}
          {showDateFilters && (
            <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100 rounded-b-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative group">
                  <div className="absolute -top-3 left-4 px-2 bg-white text-xs font-semibold text-blue-700 rounded-full border border-blue-200 shadow-sm flex items-center">
                    <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                    Date de début
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-blue-100 hover:border-blue-300 transition-all p-4 pt-5">
                    <div className="flex items-center mb-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Sélectionner</div>
                        <div className="text-sm font-medium text-gray-800">
                          {localFilters.startDate 
                            ? new Date(localFilters.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
                            : 'Pas de date sélectionnée'}
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input 
                        type="date"
                        className="block w-full pl-10 pr-3 py-2 text-xs border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-gray-50 hover:bg-white transition-colors"
                        value={localFilters.startDate || ''}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      />
                    </div>
                    {!localFilters.startDate && (
                      <div className="mt-3 flex">
                        <button
                          onClick={() => handleFilterChange('startDate', new Date().toISOString().split('T')[0])}
                          className="flex-1 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-l-md border border-gray-200 transition-colors"
                        >
                          Aujourd'hui
                        </button>
                        <button
                          onClick={() => {
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            handleFilterChange('startDate', yesterday.toISOString().split('T')[0]);
                          }}
                          className="flex-1 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-r-md border-t border-r border-b border-gray-200 transition-colors"
                        >
                          Hier
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="relative group">
                  <div className="absolute -top-3 left-4 px-2 bg-white text-xs font-semibold text-emerald-700 rounded-full border border-emerald-200 shadow-sm flex items-center">
                    <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                    Date de fin
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-emerald-100 hover:border-emerald-300 transition-all p-4 pt-5">
                    <div className="flex items-center mb-2">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Sélectionner</div>
                        <div className="text-sm font-medium text-gray-800">
                          {localFilters.endDate 
                            ? new Date(localFilters.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
                            : 'Pas de date sélectionnée'}
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input 
                        type="date"
                        className="block w-full pl-10 pr-3 py-2 text-xs border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-lg bg-gray-50 hover:bg-white transition-colors"
                        value={localFilters.endDate || ''}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      />
                    </div>
                    {!localFilters.endDate && (
                      <div className="mt-3 flex">
                        <button
                          onClick={() => {
                            const inOneMonth = new Date();
                            inOneMonth.setMonth(inOneMonth.getMonth() + 1);
                            handleFilterChange('endDate', inOneMonth.toISOString().split('T')[0]);
                          }}
                          className="flex-1 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-l-md border border-gray-200 transition-colors"
                        >
                          +1 mois
                        </button>
                        <button
                          onClick={() => {
                            const inThreeMonths = new Date();
                            inThreeMonths.setMonth(inThreeMonths.getMonth() + 3);
                            handleFilterChange('endDate', inThreeMonths.toISOString().split('T')[0]);
                          }}
                          className="flex-1 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-r-md border-t border-r border-b border-gray-200 transition-colors"
                        >
                          +3 mois
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Date range description */}
              {localFilters.startDate && localFilters.endDate && (
                <div className="mt-4 bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Période sélectionnée: 
                    <span className="font-medium ml-1">
                      {new Date(localFilters.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="mx-1">au</span>
                    <span className="font-medium">
                      {new Date(localFilters.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {(() => {
                      const start = new Date(localFilters.startDate);
                      const end = new Date(localFilters.endDate);
                      const diffTime = Math.abs(end - start);
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return <span className="ml-1 text-xs text-gray-500">({diffDays} jours)</span>;
                    })()}
                  </div>
                  <div>
                    <button 
                      onClick={() => {
                        handleFilterChange('startDate', '');
                        handleFilterChange('endDate', '');
                      }}
                      className="text-xs text-red-600 hover:text-red-800 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Effacer les dates
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mt-5 flex justify-end">
                <button 
                  onClick={applyFilters}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                >
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Appliquer les filtres
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Affichage dynamique en fonction du mode sélectionné */}
      {viewMode === 'list' ? renderStagiairesTable() : renderStagiaireCards()}
      
      {/* S'affiche si aucun stagiaire */}
      {stagiaires.length === 0 && (
        <div className="py-10 flex flex-col items-center justify-center text-gray-500">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <BriefcaseIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-600">Aucun stagiaire trouvé</h3>
          <p className="text-sm mt-1">Modifiez vos critères de recherche ou ajoutez un nouveau stagiaire</p>
        </div>
      )}

      {/* Pagination */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-500 order-2 sm:order-1">
          Affichage de <span className="font-medium text-gray-700">{stagiaires.length}</span> stagiaires sur <span className="font-medium text-gray-700">{totalPages * stagiaires.length}</span>
        </div>
        
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <button 
            onClick={() => onChangePage(1)} 
            disabled={currentPage === 1}
            className={`p-2 rounded-md border ${currentPage === 1 
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            title="Première page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={() => onChangePage(currentPage - 1)} 
            disabled={currentPage === 1}
            className={`p-2 rounded-md border ${currentPage === 1 
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            title="Page précédente"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Calcul pour afficher les pages autour de la page courante
              let pageNum = currentPage;
              if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <button 
                    key={pageNum} 
                    onClick={() => onChangePage(pageNum)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-colors
                      ${pageNum === currentPage 
                        ? 'bg-cyan-500 text-white border border-cyan-500' 
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
          </div>
          
          <button 
            onClick={() => onChangePage(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className={`p-2 rounded-md border ${currentPage === totalPages 
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            title="Page suivante"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          
          <button 
            onClick={() => onChangePage(totalPages)} 
            disabled={currentPage === totalPages}
            className={`p-2 rounded-md border ${currentPage === totalPages 
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            title="Dernière page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black opacity-30" onClick={cancelDelete}></div>
            
            {/* Modal */}
            <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl z-10">
              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <ExclamationIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Supprimer le stagiaire
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Êtes-vous sûr de vouloir supprimer ce stagiaire ? Cette action ne peut pas être annulée.
                    </p>
                    {stagiaireToDelete && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">
                          {stagiaireToDelete.firstName} {stagiaireToDelete.lastName}
                          {stagiaireToDelete.nom && <span> ({stagiaireToDelete.nom})</span>}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {stagiaireToDelete.email}
                        </p>
                        {stagiaireToDelete.identifier && (
                          <p className="text-xs bg-blue-50 text-blue-700 py-1 px-2 rounded mt-2 inline-block">
                            ID: {stagiaireToDelete.identifier}
                          </p>
                        )}

                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={cancelDelete}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                  onClick={confirmDelete}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StagiairesList;