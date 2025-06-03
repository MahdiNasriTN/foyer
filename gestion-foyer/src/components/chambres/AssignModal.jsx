import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { fetchAvailableStagiaires, fetchChambreOccupants, fetchAllOccupiedRooms } from '../../services/api';

const AssignModal = ({ isOpen, onClose, chambre, onAssign }) => {
  const [selectedOccupantIds, setSelectedOccupantIds] = useState([]);
  const [availableStagiaires, setAvailableStagiaires] = useState([]);
  const [currentOccupants, setCurrentOccupants] = useState([]);
  const [occupiedRoomsMap, setOccupiedRoomsMap] = useState({}); // Map of occupantId -> roomInfo
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les stagiaires disponibles et les occupants actuels
  useEffect(() => {
    if (isOpen && chambre) {
      setIsLoading(true);
      setError(null);

      // Fonction pour charger les données
      const loadData = async () => {
        try {
          // 1. Charger les occupants actuels de la chambre
          const occupantsResponse = await fetchChambreOccupants(chambre.id || chambre._id);
          const occupants = occupantsResponse?.data || [];
          setCurrentOccupants(occupants);
          
          
          // Présélectionner les occupants actuels - make sure to convert to string IDs
          const occupantIds = occupants.map(o => o._id).filter(Boolean);
          setSelectedOccupantIds(occupantIds);
          
          
          // 2. Charger tous les stagiaires (y compris ceux assignés à d'autres chambres)
          const stagiaireResponse = await fetchAvailableStagiaires();

          // Vérifier la structure de la réponse et ajuster en conséquence
          let stagiaires = [];
          if (stagiaireResponse?.data?.stagiaires) {
            stagiaires = stagiaireResponse.data.stagiaires;
          } else if (stagiaireResponse?.data) {
            stagiaires = stagiaireResponse.data;
          } else {
            stagiaires = stagiaireResponse || [];
          }

          // 3. Charger les informations sur toutes les chambres occupées
          const occupiedRoomsResponse = await fetchAllOccupiedRooms();
          const occupiedRooms = occupiedRoomsResponse?.data || [];

          // 4. Construire un mapping des occupants vers leurs chambres actuelles
          // (sauf pour les occupants de la chambre actuelle)
          const occupantsMap = {};
          occupiedRooms.forEach(room => {
            // Ignorer la chambre en cours de modification
            if (room._id === chambre.id || room._id === chambre._id) return;

            // Pour chaque occupant, stocker la chambre où il réside
            (room.occupants || []).forEach(occupantId => {
              occupantsMap[occupantId] = {
                roomId: room._id,
                roomNumber: room.numero
              };
            });
          });

          // Stocker ce mapping
          setOccupiedRoomsMap(occupantsMap);

          // 5. Ajouter l'information de logement aux stagiaires
          const stagiairesFull = stagiaires.map(stagiaire => ({
            ...stagiaire,
            currentRoom: occupantsMap[stagiaire._id] || null
          }));

          // 6. Créer la liste finale disponible pour cette chambre
          const availableForSelection = [
            ...occupants, // Inclure les occupants actuels de cette chambre
            ...stagiairesFull.filter(stagiaire =>
              // Exclure ceux qui sont déjà occupants de cette chambre pour éviter les doublons
              !occupants.some(occupant => occupant._id === stagiaire._id)
            )
          ];

          setAvailableStagiaires(availableForSelection);
        } catch (err) {
          console.error('Error loading data for assignment modal:', err);
          setError('Impossible de charger les données des stagiaires.');
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }
  }, [isOpen, chambre]);

  // Réinitialiser tout à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setSelectedOccupantIds([]);
      setSearchTerm('');
      setError(null);
    }
  }, [isOpen]);

  // Gérer la sélection/désélection d'un occupant
  // Update your toggleOccupant function
const toggleOccupant = (stagiaireId) => {
  
  // Convert to strings for comparison
  const idToToggle = String(stagiaireId);
  const currentSelected = selectedOccupantIds.map(id => String(id));
  
  const isSelected = currentSelected.includes(idToToggle);
  
  // Check if occupant is in another room
  const roomInfo = occupiedRoomsMap[idToToggle];
  
  // If resident is in another room and not already selected, don't allow selection
  // But don't show an alert - just return without doing anything
  if (roomInfo && !isSelected) {
    return; // Exit without doing anything
  }
  
  // Only continue if it's not already in another room
  if (isSelected) {
    setSelectedOccupantIds(prev => prev.filter(id => String(id) !== idToToggle));
  } else {
    // Check capacity first
    if (currentSelected.length >= (chambre?.capacite || 1)) {
      alert(`Cette chambre ne peut pas accueillir plus de ${chambre.capacite} personnes.`);
      return;
    }
    setSelectedOccupantIds(prev => [...prev, idToToggle]);
  }
};

  // Soumettre les occupants sélectionnés
  // Replace the handleSubmit function as well:
  const handleSubmit = () => {
    
    // Convert all IDs to strings for consistent comparison
    const selectedIds = selectedOccupantIds.map(id => String(id));
    const currentIds = currentOccupants.map(o => String(o._id));
    

    const removedIds = currentIds.filter(id => !selectedIds.includes(id));

    // Check for conflicts
    const conflictingOccupants = selectedIds
      .filter(id => occupiedRoomsMap[id] && 
             // Important: Exclude occupants already in THIS room from conflict check
             String(occupiedRoomsMap[id].roomId) !== String(chambre.id || chambre._id))
      .map(id => {
        const stagiaire = availableStagiaires.find(s => String(s._id) === id);
        return {
          id,
          name: `${stagiaire?.firstName || ''} ${stagiaire?.lastName || ''}`.trim() || 'Occupant inconnu',
          roomNumber: occupiedRoomsMap[id].roomNumber
        };
      });
    
    if (conflictingOccupants.length > 0) {
      const message = conflictingOccupants.length === 1
        ? `Le résident ${conflictingOccupants[0].name} est déjà assigné à la chambre ${conflictingOccupants[0].roomNumber}.`
        : `${conflictingOccupants.length} résidents sont déjà assignés à d'autres chambres.`;
      
      alert(`${message} Veuillez d'abord les retirer de leurs chambres actuelles.`);
      return;
    }
    
    
    // Submit changes - this will handle both adding new occupants and removing unchecked ones
    onAssign(selectedIds);
  };

  // Filtrage des stagiaires par terme de recherche
  const filteredStagiaires = searchTerm
    ? availableStagiaires.filter(stagiaire =>
      `${stagiaire.firstName} ${stagiaire.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stagiaire.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stagiaire.phoneNumber?.includes(searchTerm)
    )
    : availableStagiaires;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Assigner des résidents à la chambre {chambre?.numero}
            </Dialog.Title>

            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Cette chambre peut accueillir jusqu'à {chambre?.capacite || '?'} personnes.
                {selectedOccupantIds.length > 0 && ` ${selectedOccupantIds.length} sur ${chambre?.capacite || '?'} places sont actuellement attribuées.`}
              </p>
            </div>

            {isLoading ? (
              <div className="my-8 flex justify-center">
                <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
              </div>
            ) : error ? (
              <div className="my-4 p-3 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            ) : (
              <>
                <div className="mt-4 mb-3">
                  <input
                    type="text"
                    placeholder="Rechercher un stagiaire..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  <ul className="divide-y divide-gray-200">
                    {filteredStagiaires.length === 0 ? (
                      <li className="p-4 text-center text-gray-500">
                        Aucun stagiaire disponible trouvé
                      </li>
                    ) : (
                      filteredStagiaires.map((stagiaire) => (
                        <li
                          key={stagiaire._id}
                          className={`p-3 flex items-center ${
                            occupiedRoomsMap[stagiaire._id] && !currentOccupants.some(o => o._id === stagiaire._id)
                              ? 'bg-amber-50/50 opacity-70 cursor-not-allowed' // Unselectable style
                              : selectedOccupantIds.includes(stagiaire._id) 
                                ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer' 
                                : 'hover:bg-gray-50 cursor-pointer'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Only allow toggling if not in another room
                            if (!occupiedRoomsMap[stagiaire._id] || currentOccupants.some(o => o._id === stagiaire._id)) {
                              toggleOccupant(stagiaire._id);
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedOccupantIds.includes(stagiaire._id)}
                            onChange={() => {}} // Handled by the onClick of the parent
                            className={`h-4 w-4 rounded border-gray-300 ${
                              occupiedRoomsMap[stagiaire._id] && !currentOccupants.some(o => o._id === stagiaire._id)
                                ? 'opacity-50 cursor-not-allowed'
                                : 'text-blue-600'
                            }`}
                            disabled={!!occupiedRoomsMap[stagiaire._id] && !currentOccupants.some(o => o._id === stagiaire._id)}
                          />

                          <div className="ml-3 flex-1">
                            <div className="flex items-center">
                              {stagiaire.profilePhoto ? (
                                <img
                                  src={stagiaire.profilePhoto}
                                  alt={stagiaire.firstName}
                                  className="w-8 h-8 object-cover rounded-full mr-3"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                                  {stagiaire.firstName?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {stagiaire.firstName} {stagiaire.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {stagiaire.email || 'Pas d\'email'} • {stagiaire.phoneNumber || 'Pas de téléphone'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {currentOccupants.some(o => o._id === stagiaire._id) && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                              Occupant actuel
                            </span>
                          )}

                          {occupiedRoomsMap[stagiaire._id] && !currentOccupants.some(o => o._id === stagiaire._id) && (
                            <div className="ml-2 flex items-center">
                              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-4 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Assigné chambre {occupiedRoomsMap[stagiaire._id].roomNumber}
                              </span>
                            </div>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={onClose}
              >
                Annuler
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                Assigner
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default AssignModal;