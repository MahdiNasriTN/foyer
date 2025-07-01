import React, { useState, useMemo, useEffect, useCallback } from 'react';
// Remplacer les imports de mocks par des appels API
import { fetchStagiaires, deleteStagiaire, createInternStagiaire, createExternStagiaire, updateStagiaire, exportStagiaires, exportStagiaire } from '../services/api';
import { mockChambres, mockStagiaires } from '../utils/mockData'; // Garder les chambres mockées pour le moment
import { saveAs } from 'file-saver';
import axios from 'axios'; // Make sure this is imported
import { usePermissions } from '../hooks/usePermissions';

// Importation des composants
import StagiairesList from '../components/stagiaires/StagiairesList';
import StagiaireProfile from '../components/stagiaires/StagiaireProfile';
import StagiaireStats from '../components/stagiaires/StagiaireStats';
import StagiaireHeader from '../components/stagiaires/StagiaireHeader';
import StagiaireModal from '../components/stagiaires/StagiaireModal';
import AddIntern from '../components/stagiaires/AddIntern';
import AddExternIntern from '../components/stagiaires/AddExternIntern';

// Assurez-vous d'exporter cette fonction helper et de l'utiliser dans StagiairesList
export const getDisplayableChambre = (chambre) => {
  if (!chambre) return "Non assignée";

  if (typeof chambre === 'object') {
    return chambre.numero ? `N°${chambre.numero}` : "Non assignée";
  }

  return chambre.toString();
};

const Stagiaires = () => {
  const [stagiaires, setStagiaires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredStagiaires, setFilteredStagiaires] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentStagiaire, setCurrentStagiaire] = useState(null);
  const [viewProfileId, setViewProfileId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nom');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('list');
  const [animation, setAnimation] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [chambresDisponibles, setChambresDisponibles] = useState([]);
  const [isAddingIntern, setIsAddingIntern] = useState(false);
  const [isAddingExtern, setIsAddingExtern] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: ''
  });
  // État pour les filtres
  const [filters, setFilters] = useState({
    status: 'all',
    room: 'all',
    gender: 'all',
    session: 'all',
    year: 'all',
    startDate: '',
    endDate: '',
    specificRoom: '',
    // NEW: Separate payment filters
    hebergementPaymentStatus: '',
    inscriptionPaymentStatus: '',
    hebergementTrimester1: false,
    hebergementTrimester2: false,
    hebergementTrimester3: false
  });
  // Add a new state for debouncing
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Create a debounced search handler using useCallback
  const debouncedSearch = useCallback(
    (searchValue) => {
      // Clear any existing timeout
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout);
      }

      // Set a new timeout
      window.searchTimeout = setTimeout(() => {
        setDebouncedSearchTerm(searchValue);
        // Load stagiaires with search parameter
        const searchParams = {
          ...filters,
          search: searchValue
        };
        loadStagiaires(searchParams);
      }, 1000); // 1 second delay
    },
    [filters]
  );

  // Charger la liste des stagiaires depuis l'API
  // Update your loadStagiaires function
  const loadStagiaires = async (filterParams = filters) => {
    setLoading(true);
    setError(null);
    try {
      // Make sure to include search term if it exists
      const searchParams = {
        ...filterParams,
        search: debouncedSearchTerm || filterParams.search
      };

      const response = await fetchStagiaires(searchParams);

      // Rest of your function remains the same
      let stagiairesList = [];

      if (response.data && response.data.data && response.data.data.stagiaires) {
        stagiairesList = response.data.data.stagiaires;
      } else if (response.data && response.data.stagiaires) {
        stagiairesList = response.data.stagiaires;
      } else if (response.data && Array.isArray(response.data)) {
        stagiairesList = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        stagiairesList = response.data.data;
      } else {
        stagiairesList = [];
      }

      const processedStagiaires = stagiairesList.map(stagiaire => ({
        ...stagiaire,
        id: stagiaire._id || stagiaire.id
      }));

      setStagiaires(processedStagiaires);
      setFilteredStagiaires(processedStagiaires);
    } catch (err) {
      console.error("Erreur lors du chargement des stagiaires:", err);
      setError("Impossible de charger les stagiaires. Veuillez réessayer.");
      setStagiaires([]);
      setFilteredStagiaires([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStagiaires();
  }, []);

  // Préparation des chambres disponibles
  useEffect(() => {
    // Calculer les occupants actuels par chambre
    const occupationMap = mockChambres.reduce((acc, chambre) => {
      acc[chambre.numero] = { ...chambre, occupants: 0 };
      return acc;
    }, {});

    // Compter les occupants actuels (étudiants et stagiaires)
    [...stagiaires, ...mockStagiaires].forEach(occupant => {
      if (occupant.chambre && occupationMap[occupant.chambre]) {
        occupationMap[occupant.chambre].occupants += 1;
      }
    });

    // Convertir en tableau et filtrer les chambres qui ne sont pas pleines
    const chambres = Object.values(occupationMap).filter(
      chambre => chambre.occupants < chambre.capacite
    );

    setChambresDisponibles(chambres);
  }, [stagiaires]);

  // Animation de transition
  useEffect(() => {
    setAnimation(true);
    const timeout = setTimeout(() => setAnimation(false), 500);
    return () => clearTimeout(timeout);
  }, [viewMode, viewProfileId]);

  // Vérifie si un stagiaire est actif (période actuelle)
  const isStagiaireActif = (stagiaire) => {
    const now = new Date();
    const arrivee = new Date(stagiaire.dateArrivee);
    const depart = new Date(stagiaire.dateDepart);
    return now >= arrivee && now <= depart;
  };

  // Filtrage et tri des stagiaires
  useEffect(() => {
    let result = [...stagiaires];

    if (searchTerm) {
      result = filterStagiaires(result, searchTerm);
    }

    // Filtrage par statut et chambre
    if (selectedFilter === 'active') {
      result = result.filter(stagiaire => isStagiaireActif(stagiaire));
    } else if (selectedFilter === 'inactive') {
      result = result.filter(stagiaire => !isStagiaireActif(stagiaire));
    } else if (selectedFilter === 'withRoom') {
      result = result.filter(stagiaire => stagiaire.chambre);
    } else if (selectedFilter === 'withoutRoom') {
      result = result.filter(stagiaire => !stagiaire.chambre);
    }

    // Tri
    result.sort((a, b) => {
      let aValue = a[sortBy] || ''; // Add default empty string
      let bValue = b[sortBy] || ''; // Add default empty string

      if (sortBy === 'dateArrivee') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredStagiaires(result);
    setCurrentPage(1); // Retour à la première page après filtrage
  }, [stagiaires, searchTerm, sortBy, sortOrder, selectedFilter]);

  // Pagination
  const currentStagiaires = useMemo(() => {
    // Vérifier si filteredStagiaires est bien un tableau
    if (!Array.isArray(filteredStagiaires)) {
      console.warn('filteredStagiaires is not an array:', filteredStagiaires);
      return [];
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStagiaires.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStagiaires, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredStagiaires.length / itemsPerPage));

  // Statistiques
  const stats = useMemo(() => {
    const totalStagiaires = stagiaires.length;
    const withRoom = stagiaires.filter(s => s.chambre).length;
    const withoutRoom = totalStagiaires - withRoom;
    const active = stagiaires.filter(s => isStagiaireActif(s)).length;

    // Calcul de la durée moyenne des stages en jours
    const averageDuration = stagiaires.length > 0 ? Math.round(
      stagiaires.reduce((acc, s) => {
        const start = new Date(s.dateArrivee);
        const end = new Date(s.dateDepart);
        const duration = (end - start) / (1000 * 60 * 60 * 24); // en jours
        return acc + duration;
      }, 0) / stagiaires.length
    ) : 0;

    return {
      total: totalStagiaires,
      withRoom,
      withoutRoom,
      active,
      inactive: totalStagiaires - active,
      occupancyRate: totalStagiaires ? Math.round((withRoom / totalStagiaires) * 100) : 0,
      activeRate: totalStagiaires ? Math.round((active / totalStagiaires) * 100) : 0,
      averageDuration
    };
  }, [stagiaires]);

  // Handlers pour les modals
  const handleOpenAddModal = () => {
    setModalType('add');
    setCurrentStagiaire(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (stagiaire) => {
    setModalType('edit');
    setCurrentStagiaire(stagiaire);
    setModalOpen(true);
  };

  const handleOpenDeleteModal = (id) => {
    // No need to set modal state - the StagiairesList component handles its own modal
    // Just ensure we're passing the right delete handler function to StagiairesList
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSaveStagiaire = (formData) => {
    if (modalType === 'delete') {
      // Supprimer stagiaire
      setStagiaires(stagiaires.filter(s => s.id !== formData.id));
      if (viewProfileId === formData.id) {
        setViewProfileId(null);
      }
    } else if (modalType === 'edit') {
      // Modifier stagiaire existant
      setStagiaires(stagiaires.map(s =>
        s.id === formData.id ? { ...formData } : s
      ));
    } else {
      // Ajouter nouveau stagiaire
      const newId = Math.max(...stagiaires.map(s => s.id), 0) + 1;
      setStagiaires([...stagiaires, { ...formData, id: newId }]);
    }

    setModalOpen(false);
  };

  const handleViewProfile = (id) => {
    setViewProfileId(id);
  };

  const getStagiaireById = (id) => {
    return stagiaires.find(stagiaire => stagiaire.id === id);
  };

  const getChambreInfo = (chambreNumero) => {
    return mockChambres.find(c => c.numero === chambreNumero) || { numero: 'Non assignée', capacite: 0 };
  };

  // Fonction pour obtenir les informations de chambre à afficher de manière sécurisée
  const getDisplayableChambre = (chambre) => {
    if (!chambre) return "Non assignée";

    if (typeof chambre === 'object') {
      return chambre.numero ? `N°${chambre.numero}` : "Non assignée";
    }

    return chambre.toString();
  };

  // Toggles du tri
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Fonction pour gérer l'ajout d'un stagiaire interne
  const handleAddIntern = () => {
    setIsAddingIntern(true);
    setIsAddingExtern(false);
  };

  // Fonction pour gérer l'ajout d'un stagiaire externe
  const handleAddExtern = () => {
    setIsAddingExtern(true);
    setIsAddingIntern(false);
  };



  // Fonction pour sauvegarder un nouveau stagiaire interne
  const handleSaveIntern = async (stagiaireData) => {
    setLoading(true);
    try {
      // Le stagiaire a déjà été sauvegardé dans l'API par le composant AddIntern
      // Recharger la liste complète
      await loadStagiaires();

      // Réinitialiser les états
      setIsAddingIntern(false);
      setCurrentStagiaire(null);

      setNotification({
        show: true,
        message: currentStagiaire ? 'Stagiaire mis à jour avec succès' : 'Stagiaire ajouté avec succès',
        type: 'success'
      });

      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (err) {
      console.error("Erreur:", err);
      setNotification({
        show: true,
        message: "Une erreur s'est produite",
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour sauvegarder un nouveau stagiaire externe
  const handleSaveExtern = async (stagiaireData) => {
    // Même logique que handleSaveIntern
    setLoading(true);
    try {
      await loadStagiaires();

      setIsAddingExtern(false);
      setCurrentStagiaire(null);

      setNotification({
        show: true,
        message: currentStagiaire ? 'Stagiaire externe mis à jour avec succès' : 'Stagiaire externe ajouté avec succès',
        type: 'success'
      });

      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (err) {
      console.error("Erreur:", err);
      setNotification({
        show: true,
        message: "Une erreur s'est produite",
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer l'édition
  const handleEdit = (stagiaire) => {
    setCurrentStagiaire(stagiaire);

    // Rediriger vers le formulaire approprié selon le type
    if (stagiaire.type === 'externe') {
      setIsAddingExtern(true);
      setIsAddingIntern(false);
    } else {
      setIsAddingIntern(true);
      setIsAddingExtern(false);
    }

    // Désactiver l'affichage du profil si actif
    setViewProfileId(null);
  };

  // Fonction pour annuler l'ajout
  const handleCancelAdd = () => {
    setIsAddingIntern(false);
    setIsAddingExtern(false);
    setCurrentStagiaire(null);
  };

  // Ajoutez ces fonctions dans votre composant Stagiaires
  const handleAddExternIntern = (externData) => {
    // Créer un nouvel objet stagiaire externe avec les données du formulaire
    const newStagiaire = {
      id: Math.max(0, ...stagiaires.map(s => s.id)) + 1, // Générer un nouvel ID
      nom: `${externData.firstName} ${externData.lastName}`,
      firstName: externData.firstName,
      lastName: externData.lastName,
      chambre: null, // Généralement pas de chambre assignée immédiatement
      telephone: externData.phoneNumber || '',
      email: externData.email || `${externData.firstName.toLowerCase()}.${externData.lastName.toLowerCase()}@example.com`,
      dateArrivee: externData.trainingPeriodFrom,
      dateDepart: externData.trainingPeriodTo,
      entreprise: externData.assignedCenter,
      type: 'externe', // Marquer comme stagiaire externe
      avatar: externData.profilePhoto,
      cinNumber: externData.cinNumber,
      dateOfBirth: externData.dateOfBirth,
      placeOfBirth: externData.placeOfBirth,
      assignedCenter: externData.assignedCenter,
      specialization: externData.specialization,
      groupNumber: externData.groupNumber,
      trainingPeriodFrom: externData.trainingPeriodFrom,
      trainingPeriodTo: externData.trainingPeriodTo
    };

    // Ajouter le nouveau stagiaire externe à la liste
    setStagiaires(prevStagiaires => [...prevStagiaires, newStagiaire]);
    setModalOpen(false);


  };

  const handleUpdateStagiaire = (updatedData) => {
    // Vérifier si c'est un stagiaire interne ou externe
    const isIntern = currentStagiaire.type === 'interne';

    // Mettre à jour le stagiaire avec les nouvelles données
    const updatedStagiaire = {
      ...currentStagiaire,
      nom: `${updatedData.firstName} ${updatedData.lastName}`,
      firstName: updatedData.firstName,
      lastName: updatedData.lastName,
      email: updatedData.email || currentStagiaire.email,
      telephone: updatedData.phoneNumber || updatedData.fatherPhone || currentStagiaire.telephone,
      dateArrivee: updatedData.trainingPeriodFrom,
      dateDepart: updatedData.trainingPeriodTo,
      avatar: updatedData.profilePhoto,
      // Données communes pour les deux types
      cinNumber: updatedData.cinNumber,
      dateOfBirth: updatedData.dateOfBirth,
      placeOfBirth: updatedData.placeOfBirth,
      specialization: updatedData.specialization,

      // Si c'est un stagiaire interne, mettre à jour les champs spécifiques
      ...(isIntern ? {
        nationality: updatedData.nationality,
        currentSituation: updatedData.currentSituation,
        cinPlace: updatedData.cinPlace,
        cinDate: updatedData.cinDate,
        phoneNumber: updatedData.phoneNumber,
        sendingAddress: updatedData.sendingAddress,
        city: updatedData.city,
        postalCode: updatedData.postalCode,
        centerName: updatedData.centerName,
        cycle: updatedData.cycle,
        fatherFirstName: updatedData.fatherFirstName,
        fatherLastName: updatedData.fatherLastName,
        fatherPhone: updatedData.fatherPhone,
        fatherJob: updatedData.fatherJob,
        fatherJobPlace: updatedData.fatherJobPlace,
        motherFirstName: updatedData.motherFirstName,
        motherLastName: updatedData.motherLastName,
        motherPhone: updatedData.motherPhone,
        motherJob: updatedData.motherJob,
        motherJobPlace: updatedData.motherJobPlace,
        numberOfBrothers: updatedData.numberOfBrothers,
        numberOfSisters: updatedData.numberOfSisters,
        hobby: updatedData.hobby,
        entreprise: updatedData.centerName,
      } : {
        // Si c'est un stagiaire externe, mettre à jour les champs spécifiques
        assignedCenter: updatedData.assignedCenter,
        groupNumber: updatedData.groupNumber,
        entreprise: updatedData.assignedCenter,
      }),
    };

    // Mettre à jour la liste des stagiaires
    setStagiaires(prevStagiaires =>
      prevStagiaires.map(stagiaire =>
        stagiaire.id === currentStagiaire.id ? updatedStagiaire : stagiaire
      )
    );

    setModalOpen(false);

  };

  // Gérer la suppression d'un stagiaire
  const handleDeleteStagiaire = async (id) => {
    setLoading(true);
    try {
      // Make the API request to delete the stagiaire
      await deleteStagiaire(id);

      // On success, reload the list
      await loadStagiaires();

      // If we're viewing the deleted stagiaire, go back to list
      if (viewProfileId === id) {
        setViewProfileId(null);
      }

      // Show success notification
      setNotification({
        show: true,
        message: 'Stagiaire supprimé avec succès',
        type: 'success'
      });

      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);

      return true; // Indicate success
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);

      // Show error notification
      setNotification({
        show: true,
        message: "Erreur lors de la suppression: " + (err.message || "Une erreur s'est produite"),
        type: 'error'
      });

      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour appliquer les filtres
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    loadStagiaires(newFilters);
  };

  // Fonction pour réinitialiser les filtres
  const handleResetFilters = () => {
    const resetFilters = {
      status: 'all',
      room: 'all',
      gender: 'all',
      session: 'all',
      year: 'all',
      startDate: '',
      endDate: '',
      specificRoom: '',
      // NEW: Reset separate payment filters
      hebergementPaymentStatus: '',
      inscriptionPaymentStatus: '',
      hebergementTrimester1: false,
      hebergementTrimester2: false,
      hebergementTrimester3: false
    };
    setFilters(resetFilters);
    loadStagiaires(resetFilters);
  };

  // Find your search function in Stagiaires.jsx, it likely looks something like this:
  const filterStagiaires = (stagiaires, searchTerm) => {
    if (!searchTerm) return stagiaires;

    const term = searchTerm.toLowerCase();

    return stagiaires.filter(stagiaire => {
      // Add null checks to every property you're searching through
      return (
        // Name fields
        (stagiaire.firstName?.toLowerCase() || '').includes(term) ||
        (stagiaire.lastName?.toLowerCase() || '').includes(term) ||
        ((stagiaire.firstName + ' ' + stagiaire.lastName)?.toLowerCase() || '').includes(term) ||

        // ID and email
        (stagiaire.identifier?.toLowerCase() || '').includes(term) ||
        (stagiaire.email?.toLowerCase() || '').includes(term) ||

        // Other fields like room, enterprise, etc.
        (stagiaire.entreprise?.toLowerCase() || '').includes(term) ||
        (stagiaire.specificRoom?.toLowerCase() || '').includes(term) ||
        (stagiaire.chambre?.toString().toLowerCase() || '').includes(term) ||

        // Type of stagiaire
        (stagiaire.type?.toLowerCase() || '').includes(term)
      );
    });
  };

  // Update your searchTerm state handler
  const handleSearchChange = (value) => {
    // Update local search term immediately for UI feedback
    setSearchTerm(value);

    // Call the debounced search function which will make the API request
    // after the specified delay (1 second)
    debouncedSearch(value);
  };

  useEffect(() => {
    return () => {
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout);
      }
    };
  }, []);

  const handleExport = async (count) => {
  setLoading(true);
  try {
    const exportParams = {
      ...filters,
      limit: count === 'all' ? undefined : count,
      format: 'xlsx'
    };

    // Make sure exportStagiaires uses responseType: 'blob'
    const response = await exportStagiaires(exportParams);

    const date = new Date().toISOString().split('T')[0];
    const fileName = `stagiaires_export_${date}.xlsx`;

    // Save the blob directly
    saveAs(response.data, fileName);

    setNotification({
      show: true,
      message: `Export de ${count === 'all' ? 'tous les' : count} stagiaires réussi`,
      type: 'success'
    });

    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  } catch (err) {
    console.error("Erreur lors de l'export:", err);
    setNotification({
      show: true,
      message: "Erreur lors de l'export: " + (err.message || "Une erreur s'est produite"),
      type: 'error'
    });
  } finally {
    setLoading(false);
  }
};

  // Update the handleExportSingle function to use your API service
  const handleExportSingle = async (stagiaire) => {
  setLoading(true);
  try {
    // This will trigger the download directly
    await exportStagiaire(stagiaire._id);

    setNotification({
      show: true,
      message: `Export du stagiaire ${stagiaire.firstName} ${stagiaire.lastName} réussi`,
      type: 'success'
    });

    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  } catch (err) {
    console.error("Erreur lors de l'export:", err);
    setNotification({
      show: true,
      message: "Erreur lors de l'export: " + (err.message || "Une erreur s'est produite"),
      type: 'error'
    });
  } finally {
    setLoading(false);
  }
};

  const permissions = usePermissions();

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

      {isAddingIntern && !viewProfileId ? (
        <AddIntern
          onCancel={handleCancelAdd}
          onSave={handleSaveIntern}
          initialData={currentStagiaire} // Passer les données existantes pour l'édition
          isEditing={currentStagiaire !== null} // Indiquer si c'est une édition
        />
      ) : isAddingExtern && !viewProfileId ? (
        <AddExternIntern
          onCancel={handleCancelAdd}
          onSave={handleSaveExtern}
          initialData={currentStagiaire} // Passer les données existantes pour l'édition
          isEditing={currentStagiaire !== null} // Indiquer si c'est une édition
        />
      ) : viewProfileId ? (
        // Dans la partie qui passe les props à StagiaireProfile
        <StagiaireProfile
          stagiaire={getStagiaireById(viewProfileId)}
          chambre={getDisplayableChambre(getStagiaireById(viewProfileId)?.chambre)}
          animation={animation}
          onBack={() => setViewProfileId(null)}
          onEdit={() => handleEdit(getStagiaireById(viewProfileId))}
          onDelete={() => handleOpenDeleteModal(viewProfileId)}
        />
      ) : (
        <>
          <StagiaireHeader
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onToggleStats={() => setIsStatsOpen(!isStatsOpen)}
            isStatsOpen={isStatsOpen}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAddNew={permissions.canCreate ? handleAddIntern : null} // Pass null instead of undefined
            onAddExtern={permissions.canCreate ? handleAddExtern : null} // Pass null instead of undefined
            totalCount={stagiaires.length}
            onExport={handleExport}
          />

          {isStatsOpen && (
            <div className="p-4 bg-white rounded-lg shadow-md">
              <StagiaireStats stats={stats} />
            </div>
          )}

          <StagiairesList
            stagiaires={currentStagiaires}
            currentPage={currentPage}
            totalPages={totalPages}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onView={handleViewProfile}
            onEdit={permissions.canEdit ? handleEdit : null} // Pass null instead of undefined
            onDelete={permissions.canDelete ? handleDeleteStagiaire : null} // Pass null instead of undefined
            onSort={toggleSort}
            onChangePage={setCurrentPage}
            selectedFilter={selectedFilter}
            onChangeFilter={setSelectedFilter}
            viewMode={viewMode}
            filters={filters}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            getDisplayableChambre={getDisplayableChambre}
            onExportSingle={handleExportSingle}
            onShowNotification={setNotification}
          />
        </>
      )}

      {/* Modal pour ajouter, modifier ou supprimer un stagiaire */}
      {modalOpen && modalType === 'delete' && (
        <StagiaireModal
          onClose={() => setModalOpen(false)}
          title="Supprimer un stagiaire"
        >
          {/* Contenu pour la suppression */}
        </StagiaireModal>
      )}

      {/* Notifications */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-500 ease-in-out ${notification.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' :
          notification.type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' :
            'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
          }`}>
          <div className="flex items-center">
            {notification.type === 'success' && (
              <svg className="h-6 w-6 text-green-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {notification.type === 'error' && (
              <svg className="h-6 w-6 text-red-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stagiaires;