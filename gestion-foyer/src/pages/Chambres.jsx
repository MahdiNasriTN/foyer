import React, { useState, useEffect } from 'react';
import { mockEtudiants, mockStagiaires } from '../utils/mockData'; // Nous allons toujours utiliser les données simulées pour les occupants pour l'instant
import {
    PlusIcon,
    UserGroupIcon,
    ChartPieIcon,
    ViewGridIcon,
    ViewListIcon,
    AdjustmentsIcon,
    SearchIcon
} from '@heroicons/react/outline';
import ChambreModal from '../components/chambres/ChambreModal';
import AssignModal from '../components/chambres/AssignModal';
import ChambreCard from '../components/chambres/ChambreCard';
import ChambreStats from '../components/chambres/ChambreStats';
import { 
    fetchChambres, 
    createChambre, 
    updateChambre, 
    deleteChambre, 
    assignOccupantsToRoom 
} from '../services/api';
import DeleteChambreModal from '../components/chambres/DeleteChambreModal';

const Chambres = () => {
    // États
    const [chambres, setChambres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentChambre, setCurrentChambre] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [sortOption, setSortOption] = useState('numero');
    const [filterEtage, setFilterEtage] = useState('all');
    const [notification, setNotification] = useState({
        show: false, 
        message: '', 
        type: ''
    });
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [chambreToDelete, setChambreToDelete] = useState(null);

    // Charger les chambres depuis l'API
    const loadChambres = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters = {
                status: filterStatus !== 'all' ? filterStatus : null,
                etage: filterEtage !== 'all' ? filterEtage : null,
                search: searchTerm || null,
                sortBy: sortOption,
                sortOrder: 'asc'
            };
            
            const response = await fetchChambres(filters);
            
            // Traiter la réponse pour assurer la compatibilité avec notre format
            const processedChambres = response.data.data.map(chambre => ({
                ...chambre,
                id: chambre._id || chambre.id,
                // Adapter les champs pour correspondre à notre modèle frontend si nécessaire
                statut: chambre.statut || 'libre',
                occupants: chambre.occupants || [],
                nombreLits: chambre.nombreLits || chambre.capacite // Fallback sur capacité si non défini
            }));
            
            setChambres(processedChambres);
        } catch (err) {
            console.error('Erreur lors du chargement des chambres:', err);
            setError('Impossible de charger les chambres.');
            setChambres([]);
        } finally {
            setLoading(false);
        }
    };

    // Charger les chambres au premier rendu et lorsque les filtres changent
    useEffect(() => {
        loadChambres();
    }, [filterStatus, filterEtage, sortOption]); // searchTerm est géré séparément avec un délai

    // Effet pour gérer la recherche avec un délai
    useEffect(() => {
        const searchTimer = setTimeout(() => {
            loadChambres();
        }, 500); // Attendre 500ms après la dernière frappe
        
        return () => clearTimeout(searchTimer);
    }, [searchTerm]);

    const handleOpenModal = (chambre = null) => {
        setCurrentChambre(chambre || {
            numero: '',
            capacite: 1,
            statut: 'libre',
            occupants: [],
            etage: 1,
            type: 'standard',
            equipements: []
        });
        setModalOpen(true);
    };

    const handleOpenAssignModal = (chambre) => {
        setCurrentChambre(chambre);
        setShowAssignModal(true);
    };

    const handleOpenDeleteModal = (chambre) => {
        setChambreToDelete(chambre);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await deleteChambre(chambreToDelete.id);
            setNotification({
                show: true,
                message: 'Chambre supprimée avec succès',
                type: 'success'
            });
            // Recharger les chambres après la suppression
            loadChambres();
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            setError('Erreur lors de la suppression de la chambre.');
            setNotification({
                show: true,
                message: 'Erreur lors de la suppression de la chambre',
                type: 'error'
            });
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setChambreToDelete(null);
        }
    };
    
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setChambreToDelete(null);
    };

    const handleSaveChambre = async (chambreData) => {
        setLoading(true);
        try {
            if (chambreData.id) {
                // Mise à jour d'une chambre existante
                await updateChambre(chambreData.id, chambreData);
                setNotification({
                    show: true,
                    message: 'Chambre mise à jour avec succès',
                    type: 'success'
                });
            } else {
                // Création d'une nouvelle chambre
                await createChambre(chambreData);
                setNotification({
                    show: true,
                    message: 'Chambre ajoutée avec succès',
                    type: 'success'
                });
            }
            // Recharger les chambres après modification
            loadChambres();
            setModalOpen(false);
        } catch (err) {
            console.error('Erreur lors de la sauvegarde:', err);
            setError('Erreur lors de la sauvegarde de la chambre.');
            setNotification({
                show: true,
                message: 'Erreur lors de la sauvegarde de la chambre',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAssignOccupants = async (occupantIds) => {
        setLoading(true);
        try {
            await assignOccupantsToRoom(currentChambre.id || currentChambre._id, occupantIds);
            setNotification({
                show: true,
                message: 'Occupants assignés avec succès',
                type: 'success'
            });
            // Recharger les chambres après l'assignation
            loadChambres();
            // Incrémenter le compteur de rafraîchissement
            setRefreshTrigger(prev => prev + 1);
            setShowAssignModal(false);
        } catch (err) {
            console.error('Erreur lors de l\'assignation des occupants:', err);
            setError('Erreur lors de l\'assignation des occupants.');
            setNotification({
                show: true,
                message: 'Erreur lors de l\'assignation des occupants',
                type: 'error'
            });
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

    // Calculer les statistiques à partir des chambres chargées
    const stats = {
        total: chambres.length,
        occupees: chambres.filter(c => c.statut === 'occupée').length,
        libres: chambres.filter(c => c.statut === 'libre').length,
        tauxOccupation: chambres.length > 0
            ? Math.round((chambres.filter(c => c.statut === 'occupée').length / chambres.length) * 100)
            : 0,
        totalLits: chambres.reduce((sum, chambre) => sum + (chambre.nombreLits || chambre.capacite), 0),
        parEtage: [1, 2, 3, 4].map(etage => ({
            etage: etage,
            total: chambres.filter(c => parseInt(c.etage) === etage).length,
            occupees: chambres.filter(c => parseInt(c.etage) === etage && c.statut === 'occupée').length
        }))
    };

    // Filtrage côté client (en complément du filtrage côté serveur)
    const filteredChambres = chambres;

    // Le reste de votre code JSX reste inchangé...
    return (
        <div className="space-y-8 pb-8">
            {/* Notification */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
                    notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                } text-white`}>
                    {notification.message}
                </div>
            )}
            
            {/* En-tête et contrôles principaux */}
            <div className="relative">
                {/* Header premium avec glassmorphism et design élégant */}
                {/* Header minimaliste premium avec Tailwind CSS */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-blue-900 shadow-xl">
                    {/* Effets visuels subtils */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 opacity-5 mix-blend-overlay"
                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")" }}>
                        </div>

                        {/* Cercles lumineux */}
                        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"></div>
                        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl"></div>
                    </div>

                    {/* Contenu principal */}
                    <div className="relative z-10 px-6 py-8 md:px-10 md:py-12">
                        <div className="max-w-7xl mx-auto">
                            {/* Badge flottant discret */}
                            <div className="inline-flex items-center px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 shadow-sm mb-6">
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse mr-2"></span>
                                <span className="text-xs font-medium text-white/90">Gestion des chambres</span>
                            </div>

                            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                                {/* Titre et description */}
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                        Chambres du Foyer
                                        <span className="text-sm font-normal text-blue-200/80 ml-3">
                                            {filteredChambres.length} unités
                                        </span>
                                    </h1>
                                    <div className="mt-2 h-1 w-16 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
                                    <p className="mt-4 text-blue-100/80 max-w-2xl text-sm md:text-base">
                                        Gérez efficacement l'attribution et l'occupation des chambres dans votre établissement
                                    </p>
                                </div>

                                {/* Actions principales */}
                                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                                    <button
                                        onClick={() => setIsStatsOpen(!isStatsOpen)}
                                        className="inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium shadow-sm bg-white/10 text-white border border-white/10 hover:bg-white/20 transition-all backdrop-blur-sm"
                                    >
                                        <ChartPieIcon className="h-4 w-4 mr-2 text-blue-300" aria-hidden="true" />
                                        {isStatsOpen ? 'Masquer' : 'Statistiques'}
                                    </button>

                                    <button
                                        onClick={() => handleOpenModal()}
                                        className="inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium shadow-sm bg-cyan-500 text-white hover:bg-cyan-600 transition-all"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
                                        Ajouter
                                    </button>
                                </div>
                            </div>

                            {/* Statistiques avec transition élégante */}
                            <div className={`mt-8 transition-all duration-300 ease-in-out overflow-hidden ${isStatsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                {isStatsOpen && (
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 shadow-inner shadow-white/5">
                                        <ChambreStats stats={stats} />
                                    </div>
                                )}
                            </div>

                            {/* Recherche et filtres */}
                            <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                                <div className="p-4 md:p-5">
                                    <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                                        {/* Recherche */}
                                        <div className="relative flex-grow">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <SearchIcon className="h-5 w-5 text-blue-300/70" aria-hidden="true" />
                                            </div>
                                            <input
                                                type="text"
                                                className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-blue-200/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                                                placeholder="Rechercher une chambre..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>

                                        {/* Filtres compacts */}
                                        <div className="flex flex-wrap gap-2">
                                            {/* Status */}
                                            <div className="inline-flex overflow-hidden rounded-lg bg-white/5 border border-white/10">
                                                {['all', 'libre', 'occupée'].map((status, i) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => setFilterStatus(status)}
                                                        className={`px-3 py-2 text-sm relative ${filterStatus === status
                                                                ? 'text-white'
                                                                : 'text-blue-200/70 hover:text-blue-100'
                                                            } ${i > 0 ? 'border-l border-white/10' : ''}`}
                                                    >
                                                        {filterStatus === status && (
                                                            <span className="absolute inset-0 bg-cyan-500/20 border-y border-cyan-400/30"></span>
                                                        )}
                                                        <div className="relative flex items-center">
                                                            {status !== 'all' && (
                                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'occupée' ? 'bg-green-400' : 'bg-amber-400'
                                                                    }`}></span>
                                                            )}
                                                            {status === 'all' ? 'Toutes' : status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Vue */}
                                            <div className="inline-flex overflow-hidden rounded-lg bg-white/5 border border-white/10">
                                                <button
                                                    onClick={() => setViewMode('grid')}
                                                    className={`p-2 relative ${viewMode === 'grid' ? 'text-white' : 'text-blue-200/70 hover:text-blue-100'}`}
                                                    title="Vue en grille"
                                                >
                                                    {viewMode === 'grid' && (
                                                        <span className="absolute inset-0 bg-cyan-500/20 border-y border-cyan-400/30"></span>
                                                    )}
                                                    <ViewGridIcon className="h-5 w-5 relative z-10" />
                                                </button>

                                                <span className="w-px bg-white/10"></span>

                                                <button
                                                    onClick={() => setViewMode('list')}
                                                    className={`p-2 relative ${viewMode === 'list' ? 'text-white' : 'text-blue-200/70 hover:text-blue-100'}`}
                                                    title="Vue en liste"
                                                >
                                                    {viewMode === 'list' && (
                                                        <span className="absolute inset-0 bg-cyan-500/20 border-y border-cyan-400/30"></span>
                                                    )}
                                                    <ViewListIcon className="h-5 w-5 relative z-10" />
                                                </button>
                                            </div>

                                            {/* Tri */}
                                            <div className="relative">
                                                <button
                                                    className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-blue-200/70 hover:text-blue-100"
                                                >
                                                    <AdjustmentsIcon className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Trier</span>
                                                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>

                                                <div className="absolute right-0 mt-1 w-48 rounded-lg border border-white/10 bg-slate-800/95 shadow-lg backdrop-blur-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-30">
                                                    <div className="py-1">
                                                        {[
                                                            { id: 'numero', label: 'Numéro' },
                                                            { id: 'capacite', label: 'Capacité' },
                                                            { id: 'statut', label: 'Statut' },
                                                            { id: 'etage', label: 'Étage' }
                                                        ].map((option) => (
                                                            <button
                                                                key={option.id}
                                                                onClick={() => setSortOption(option.id)}
                                                                className={`flex w-full items-center px-3 py-2 text-sm ${sortOption === option.id
                                                                        ? 'bg-cyan-500/20 text-white'
                                                                        : 'text-blue-100/80 hover:bg-slate-700/70'
                                                                    }`}
                                                            >
                                                                {option.label}
                                                                {sortOption === option.id && (
                                                                    <svg className="ml-auto h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 010 1.414l-8 8a1 1 01-1.414 0l-4-4a1 1 010-1.414z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Filtres par étage */}
                                            <div className="inline-flex overflow-hidden rounded-lg bg-white/5 border border-white/10 ml-2">
                                                <button
                                                    onClick={() => setFilterEtage('all')}
                                                    className={`px-3 py-2 text-sm relative ${filterEtage === 'all'
                                                        ? 'text-white'
                                                        : 'text-blue-200/70 hover:text-blue-100'}`}
                                                >
                                                    {filterEtage === 'all' && (
                                                        <span className="absolute inset-0 bg-cyan-500/20 border-y border-cyan-400/30"></span>
                                                    )}
                                                    <span className="relative z-10">Tous étages</span>
                                                </button>
                                                {[1, 2, 3, 4].map((etage) => (
                                                    <button
                                                        key={etage}
                                                        onClick={() => setFilterEtage(etage)}
                                                        className={`px-3 py-2 text-sm relative ${filterEtage === etage
                                                            ? 'text-white'
                                                            : 'text-blue-200/70 hover:text-blue-100'
                                                            } border-l border-white/10`}
                                                    >
                                                        {filterEtage === etage && (
                                                            <span className="absolute inset-0 bg-cyan-500/20 border-y border-cyan-400/30"></span>
                                                        )}
                                                        <span className="relative z-10">Étage {etage}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filtres actifs */}
                                    {(filterStatus !== 'all' || searchTerm || filterEtage !== 'all') && (
                                        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
                                            <span className="text-xs text-blue-200/60">Filtres actifs:</span>

                                            {filterStatus !== 'all' && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-slate-700/50 text-blue-100 border border-white/5">
                                                    {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                                                    <button
                                                        onClick={() => setFilterStatus('all')}
                                                        className="ml-1.5 text-blue-300/70 hover:text-blue-200"
                                                    >
                                                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 011.414 0L10 8.586l4.293-4.293a1 1 111.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            )}

                                            {searchTerm && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-slate-700/50 text-blue-100 border border-white/5">
                                                    Recherche: {searchTerm}
                                                    <button
                                                        onClick={() => setSearchTerm('')}
                                                        className="ml-1.5 text-blue-300/70 hover:text-blue-200"
                                                    >
                                                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 011.414 0L10 8.586l4.293-4.293a1 1 111.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            )}

                                            {/* Nouveau: Filtre par étage */}
                                            {filterEtage !== 'all' && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-slate-700/50 text-blue-100 border border-white/5">
                                                    Étage {filterEtage}
                                                    <button
                                                        onClick={() => setFilterEtage('all')}
                                                        className="ml-1.5 text-blue-300/70 hover:text-blue-200"
                                                    >
                                                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 011.414 0L10 8.586l4.293-4.293a1 1 111.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            )}

                                            <span className="ml-auto text-xs py-1 px-2.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
                                                {filteredChambres.length} résultat{filteredChambres.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section principale avec les chambres */}
            <div className="px-4 sm:px-6 lg:px-8">
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredChambres.map((chambre) => (
                            <ChambreCard
                                key={chambre.id}
                                chambre={chambre}
                                onEdit={() => handleOpenModal(chambre)}
                                onDelete={() => handleOpenDeleteModal(chambre)}
                                onAssign={() => handleOpenAssignModal(chambre)}
                                residents={[...mockEtudiants, ...mockStagiaires]}
                                refreshTrigger={refreshTrigger}
                            />
                        ))}

                        {/* Carte d'ajout */}
                        <div
                            onClick={() => handleOpenModal()}
                            className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 hover:border-primary/30 hover:text-primary transition-all group h-full min-h-[220px]"
                        >
                            <div className="h-14 w-14 rounded-full bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-all duration-300">
                                <PlusIcon className="h-8 w-8" />
                            </div>
                            <p className="text-center font-medium">Ajouter une chambre</p>
                            <p className="text-xs text-center mt-1 max-w-[180px]">
                                Cliquez pour ajouter une nouvelle chambre au foyer
                            </p>
                        </div>

                        {/* Message si aucun résultat */}
                        {filteredChambres.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                                <UserGroupIcon className="h-16 w-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium">Aucune chambre trouvée</h3>
                                <p className="text-sm">Modifiez vos filtres ou ajoutez une nouvelle chambre</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Numéro
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Capacité
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Occupants
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredChambres.map((chambre, idx) => (
                                    <tr
                                        key={chambre.id}
                                        className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                                    {chambre.numero.substring(0, 2)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{chambre.numero}</div>
                                                    <div className="text-xs text-gray-500">Étage {chambre.etage || '1'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {chambre.capacite} {chambre.capacite > 1 ? 'personnes' : 'personne'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${chambre.statut === 'occupée'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                <span
                                                    className={`w-2 h-2 rounded-full mr-1.5 ${chambre.statut === 'occupée' ? 'bg-green-500' : 'bg-yellow-500'
                                                        }`}
                                                />
                                                {chambre.statut}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {chambre.occupants && chambre.occupants.length > 0 ? (
                                                <div className="flex -space-x-1 overflow-hidden">
                                                    {chambre.occupants.map((id, idx) => {
                                                        const occupant = [...mockEtudiants, ...mockStagiaires].find(p => p.id === id);
                                                        return (
                                                            <div
                                                                key={id}
                                                                className={`h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white z-${20 - idx}`}
                                                                title={occupant?.nom || 'Occupant'}
                                                            >
                                                                <span className="text-xs font-medium text-gray-600">
                                                                    {occupant?.nom.charAt(0) || '?'}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                    <div className="flex items-center ml-2 text-xs text-gray-500">
                                                        {`${chambre.occupants.length}/${chambre.capacite}`}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Non occupée</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenAssignModal(chambre)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    title="Assigner des résidents"
                                                >
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(chambre)}
                                                    className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleOpenDeleteModal(chambre)}
                                                    className="text-red-600 hover:text-red-900 transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 00-1-1h-4a1 1 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredChambres.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-500">Aucune chambre trouvée</h3>
                                            <p className="text-sm text-gray-400 mt-1">Modifiez vos filtres ou ajoutez une nouvelle chambre</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ChambreModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                chambre={currentChambre}
                onSave={handleSaveChambre}
            />

            <AssignModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                chambre={currentChambre}
                onAssign={handleAssignOccupants}
            />

            <DeleteChambreModal
                isOpen={showDeleteModal}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                chambre={chambreToDelete}
            />

            <style jsx>{`
        .btn {
          @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200;
        }
        
        .btn-white {
          @apply bg-white text-primary hover:bg-blue-50;
        }
        
        .btn-translucent {
          @apply bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30;
        }
      `}</style>

            {/* Affichage du chargement */}
            {loading && (
                <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                        <p>Chargement en cours...</p>
                    </div>
                </div>
            )}
            
            {/* Affichage des erreurs */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                    <p className="font-bold">Erreur</p>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default Chambres;