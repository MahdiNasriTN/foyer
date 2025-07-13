import React, { useState, useEffect, useMemo } from 'react';
import PersonnelHeader from '../components/personnel/PersonnelHeader';
import PersonnelList from '../components/personnel/PersonnelList';
import PersonnelProfile from '../components/personnel/PersonnelProfile';
import PersonnelModal from '../components/personnel/PersonnelModal';
import PersonnelStats from '../components/personnel/PersonnelStats';
import PersonnelFilters from '../components/personnel/PersonnelFilters';
import PersonnelSchedule from '../components/personnel/PersonnelSchedule';
// Import PersonnelExport
import PersonnelExport from '../components/personnel/PersonnelExport';

// Import des services API
import { 
  getAllPersonnel, 
  getPersonnelById, 
  createPersonnel, 
  updatePersonnel, 
  deletePersonnel,
  getPersonnelStats,
  updatePersonnelSchedule
} from '../services/personnelService';

// Import des icônes
import { XIcon, ExclamationIcon, CheckIcon, CalendarIcon } from '@heroicons/react/outline';
import { usePermissions } from '../hooks/usePermissions';

const Personnel = () => {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('nom');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewProfileId, setViewProfileId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [animation, setAnimation] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    role: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    activeRate: 0,
    departments: {}
  });
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedEmployeeForSchedule, setSelectedEmployeeForSchedule] = useState(null);
  // State pour le modal d'export
  const [showExport, setShowExport] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const permissions = usePermissions();

  // Chargement du personnel
  const loadPersonnel = async (customFilters = null) => {
    setLoading(true);
    setError(null);
    try {
      // Use the provided filters or current filters state
      const filtersToUse = customFilters || filters;
      
      const apiFilters = {
        status: filtersToUse.status !== 'all' ? filtersToUse.status : undefined,
        department: filtersToUse.department !== 'all' ? filtersToUse.department : undefined,
        role: filtersToUse.role !== 'all' ? filtersToUse.role : undefined,
        startDate: filtersToUse.startDate || undefined,
        endDate: filtersToUse.endDate || undefined,
        search: searchTerm || filtersToUse.search || undefined
      };

      console.log('loadPersonnel - sending filters:', apiFilters); // Debug log

      const response = await getAllPersonnel(apiFilters);
      
      console.log('loadPersonnel - received response:', response); // Debug log
      
      // FIXED: Use the correct response structure
      // The updated service returns { personnel: [...], totalPages: ..., etc }
      const personnelData = response.personnel || []; // Get the personnel array
    
      // Transformation des données pour la cohérence avec notre frontend
      const formattedPersonnel = personnelData.map(emp => ({
        ...emp,
        id: emp._id,
        nom: `${emp.firstName} ${emp.lastName}`
      }));
    
      setPersonnel(formattedPersonnel);
    } catch (error) {
      console.error('Error loading personnel:', error);
      setError(error.message || "Impossible de charger les données du personnel");
      setPersonnel([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Chargement des statistiques
  const loadStats = async () => {
    try {
      const response = await getPersonnelStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Chargement initial
  useEffect(() => {
    // Load with initial filters
    loadPersonnel(filters);
    loadStats();
  }, []); // Only run on mount

  // Recharger le personnel lorsque les filtres changent
  useEffect(() => {
    // Only reload if filters have actually changed and are not the initial state
    if (filters.status !== 'all' || filters.department !== 'all' || filters.role !== 'all' || 
        filters.startDate || filters.endDate || searchTerm) {
      loadPersonnel();
    }
  }, [searchTerm]); // Only watch searchTerm changes here

  // Fonction pour basculer le tri des données
  const toggleSort = (column) => {
    const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newSortOrder);
  };

  // Helper function
  const getEmployeeById = (id, personnelList) => {
    return personnelList.find(employee => employee.id === id) || null;
  };

  // Vérifier si un employé est actif
  const isEmployeeActif = (employee) => {
    return employee.statut === 'actif';
  };

  // Appliquer les filtres
  const handleApplyFilters = (newFilters) => {
    console.log('Personnel - Received filters:', newFilters);
    
    // Merge filters properly
    const completeFilters = {
      status: newFilters.status || 'all',
      department: newFilters.department || 'all',
      role: newFilters.role || 'all',
      startDate: newFilters.startDate || '',
      endDate: newFilters.endDate || '',
      search: newFilters.search || searchTerm // Preserve search term
    };
    
    console.log('Personnel - Complete filters being set:', completeFilters);
    
    setFilters(completeFilters);
    setCurrentPage(1); // Reset to first page when filters change
    
    // Load personnel with new filters
    loadPersonnel(completeFilters);
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    const resetFilters = {
      status: 'all',
      department: 'all',
      role: 'all',
      dateRange: 'all',
      startDate: '',
      endDate: '',
      search: ''
    };
    
    setFilters(resetFilters);
    setSearchTerm('');
    setSelectedFilter('all');
    setCurrentPage(1);
    
    // Load personnel with reset filters
    loadPersonnel(resetFilters);
  };

  // Filtrage et tri des données du personnel
  const currentEmployees = useMemo(() => {
    let result = [...personnel];

    // Tri des données
    if (sortBy) {
      result.sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [personnel, sortBy, sortOrder]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(currentEmployees.length / itemsPerPage));
  
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentEmployees.slice(start, start + itemsPerPage);
  }, [currentEmployees, currentPage]);

  // Gérer l'ajout d'un nouvel employé
  const handleAddEmployee = () => {
    setCurrentEmployee(null);
    setIsAddingEmployee(true);
  };

  // Gérer l'édition d'un employé
  const handleEdit = (employee) => {
    setCurrentEmployee(employee);
    setIsAddingEmployee(true);
  };

  // Gérer l'annulation de l'ajout/édition
  const handleCancelAdd = () => {
    setIsAddingEmployee(false);
    setCurrentEmployee(null);
  };

  // Gérer la sauvegarde d'un employé (nouveau ou édité)
  const handleSaveEmployee = async (employeeData) => {
    setLoading(true);
    try {
      if (currentEmployee) {
        // Édition d'un employé existant
        await updatePersonnel(currentEmployee.id, employeeData);
        setNotification({
          show: true,
          message: 'Employé mis à jour avec succès',
          type: 'success'
        });
      } else {
        // Création d'un nouvel employé
        await createPersonnel(employeeData);
        setNotification({
          show: true,
          message: 'Nouvel employé ajouté avec succès',
          type: 'success'
        });
      }
      
      // Recharger les données
      await loadPersonnel();
      await loadStats();
    } catch (error) {
      setNotification({
        show: true,
        message: error.message || "Une erreur s'est produite",
        type: 'error'
      });
    } finally {
      setLoading(false);
      setIsAddingEmployee(false);
      setCurrentEmployee(null);
    }
  };

  // Gérer la suppression d'un employé
  const handleDeleteEmployee = async (id) => {
    setLoading(true);
    try {
      await deletePersonnel(id);
      
      // Recharger les données
      await loadPersonnel();
      await loadStats();
      
      setNotification({
        show: true,
        message: 'Employé supprimé avec succès',
        type: 'success'
      });
    } catch (error) {
      setNotification({
        show: true,
        message: error.message || "Une erreur s'est produite lors de la suppression",
        type: 'error'
      });
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  // Ouvrir la modal de confirmation de suppression
  const handleOpenDeleteModal = (id) => {
    setCurrentEmployee(getEmployeeById(id, personnel));
    setModalType('delete');
    setModalOpen(true);
  };

  // Gérer l'affichage du profil d'un employé
  const handleViewProfile = async (id) => {
    setLoading(true);
    setAnimation(true);
    try {
      const response = await getPersonnelById(id);
      const employee = {
        ...response.data,
        id: response.data._id,
        nom: `${response.data.firstName} ${response.data.lastName}`
      };
      
      setCurrentEmployee(employee);
      
      setTimeout(() => {
        setViewProfileId(id);
        setAnimation(false);
        setLoading(false);
      }, 300);
    } catch (error) {
      setNotification({
        show: true,
        message: "Impossible de charger le profil de l'employé",
        type: 'error'
      });
      setLoading(false);
      setAnimation(false);
    }
  };

  // Ouvrir le planning d'un employé
  const handleOpenSchedule = (employee) => {
    setSelectedEmployeeForSchedule(employee);
    setShowSchedule(true);
  };

  // Sauvegarder le planning d'un employé
  const handleSaveSchedule = async (employeeId, scheduleData) => {
    try {
      setLoading(true);
      
      // Call the API to save the schedule
      await updatePersonnelSchedule(employeeId, scheduleData);
      
      // Update local state
      const updatedEmployees = personnel.map(emp => 
        emp.id === employeeId ? { ...emp, schedule: scheduleData } : emp
      );
      
      setPersonnel(updatedEmployees);
      setShowSchedule(false);
      
      setNotification({
        show: true,
        message: 'Planning enregistré avec succès',
        type: 'success'
      });
      
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error saving schedule:', error);
      setNotification({
        show: true,
        message: 'Erreur lors de l\'enregistrement du planning',
        type: 'error'
      });
      
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Cacher la notification après 3 secondes
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Update the handleSearchChange function
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    
    // Update filters with new search term
    const filtersWithSearch = {
      ...filters,
      search: newSearchTerm
    };
    
    setFilters(filtersWithSearch);
    setCurrentPage(1); // Reset to first page
    
    // Debounce the search to avoid too many API calls
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      loadPersonnel(filtersWithSearch);
    }, 500); // 500ms delay
    
    setSearchTimeout(timeout);
  };

  // Add export handler function
  const handleExport = () => {
    setShowExport(true);
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg flex items-center">
            <svg className="animate-spin h-6 w-6 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Chargement...
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
          <p className="font-medium">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      {isAddingEmployee && !viewProfileId ? (
        <PersonnelModal
          isOpen={true}
          onClose={handleCancelAdd}
          onSave={handleSaveEmployee}
          employee={currentEmployee}
        />
      ) : viewProfileId ? (
        <PersonnelProfile
          employee={currentEmployee || getEmployeeById(viewProfileId)}
          animation={animation}
          onBack={() => setViewProfileId(null)}
          onEdit={() => handleEdit(currentEmployee || getEmployeeById(viewProfileId))}
          onDelete={() => handleOpenDeleteModal(viewProfileId)}
        />
      ) : (
        <>
          <PersonnelHeader 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange} // Use the new function
            onToggleStats={() => setIsStatsOpen(!isStatsOpen)}
            isStatsOpen={isStatsOpen}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAddNew={permissions.canCreate ? handleAddEmployee : undefined} // Pass undefined if no permission
            onExport={handleExport}  // Add this line
            totalCount={personnel.length}
          />

          {isStatsOpen && (
            <div className="p-4 bg-white rounded-lg shadow-md">
              <PersonnelStats stats={stats} />
            </div>
          )}

          <PersonnelFilters 
            filters={filters}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
          />

          <PersonnelList 
            personnel={paginatedEmployees}
            currentPage={currentPage}
            totalPages={totalPages}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onView={handleViewProfile}
            onEdit={permissions.canEdit ? handleEdit : undefined} // Pass undefined if no permission
            onDelete={permissions.canDelete ? handleOpenDeleteModal : undefined} // Pass undefined if no permission
            onSort={toggleSort}
            onChangePage={setCurrentPage}
            selectedFilter={selectedFilter}
            onChangeFilter={setSelectedFilter}
            viewMode={viewMode}
          />
        </>
      )}

      {modalOpen && modalType === 'delete' && currentEmployee && (
        <PersonnelModal
          isOpen={true}
          modalType="delete"
          onClose={() => setModalOpen(false)}
          onConfirm={() => handleDeleteEmployee(currentEmployee.id)}
          employee={currentEmployee}
        />
      )}

      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-500 ease-in-out ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 
          notification.type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' : 
          'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' && (
              <CheckIcon className="h-5 w-5 mr-2 text-green-500" />
            )}
            {notification.type === 'error' && (
              <ExclamationIcon className="h-5 w-5 mr-2 text-red-500" />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      {showSchedule && selectedEmployeeForSchedule && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 w-full max-w-7xl">
            <PersonnelSchedule
              employeeId={selectedEmployeeForSchedule.id}
              initialSchedule={selectedEmployeeForSchedule.schedule || {}}
              onSave={handleSaveSchedule}
              onClose={() => setShowSchedule(false)}
            />
          </div>
        </div>
      )}

      {showExport && (
        <PersonnelExport
          isOpen={showExport}
          onClose={() => setShowExport(false)}
          currentFilters={filters}
        />
      )}
    </div>
  );
};

export default Personnel;