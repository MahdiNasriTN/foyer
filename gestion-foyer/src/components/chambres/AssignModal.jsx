import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { fetchAvailableStagiaires, fetchChambreOccupants } from '../../services/api';

const AssignModal = ({ isOpen, onClose, chambre, onAssign }) => {
  const [selectedOccupantIds, setSelectedOccupantIds] = useState([]);
  const [availableStagiaires, setAvailableStagiaires] = useState([]);
  const [currentOccupants, setCurrentOccupants] = useState([]);
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
          // Charger les occupants actuels de la chambre
          const occupantsResponse = await fetchChambreOccupants(chambre.id || chambre._id);
          const occupants = occupantsResponse?.data || [];
          setCurrentOccupants(occupants);
          
          // Présélectionner les occupants actuels
          setSelectedOccupantIds(occupants.map(o => o._id));
          
          // Charger uniquement les stagiaires sans chambre assignée
          const stagiaireResponse = await fetchAvailableStagiaires();
          
          // Vérifier la structure de la réponse et ajuster en conséquence
          let stagiaires = [];
          if (stagiaireResponse?.data?.stagiaires) {
            // Si les données sont dans data.stagiaires
            stagiaires = stagiaireResponse.data.stagiaires;
          } else if (stagiaireResponse?.data) {
            // Si les données sont directement dans data
            stagiaires = stagiaireResponse.data;
          } else {
            // Fallback pour tout autre format
            stagiaires = stagiaireResponse || [];
          }
          
          // Filtrer pour n'avoir que les stagiaires sans chambre
          // (Nous supposons que l'API fetchAvailableStagiaires renvoie déjà uniquement 
          // les stagiaires sans chambre assignée - sinon, ajustez ce code)
          
          // Créer la liste finale: occupants actuels + stagiaires sans chambre
          const availableForSelection = [
            ...occupants, // Inclure les occupants actuels de cette chambre
            ...stagiaires.filter(stagiaire => 
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
  const toggleOccupant = (stagiaireId) => {
    if (selectedOccupantIds.includes(stagiaireId)) {
      setSelectedOccupantIds(selectedOccupantIds.filter(id => id !== stagiaireId));
    } else {
      // Vérifier si l'ajout dépasse la capacité de la chambre
      if (selectedOccupantIds.length >= (chambre?.capacite || 1)) {
        alert(`Cette chambre ne peut pas accueillir plus de ${chambre.capacite} personnes.`);
        return;
      }
      setSelectedOccupantIds([...selectedOccupantIds, stagiaireId]);
    }
  };

  // Soumettre les occupants sélectionnés
  const handleSubmit = () => {
    onAssign(selectedOccupantIds);
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
                          className={`p-3 flex items-center hover:bg-gray-50 cursor-pointer ${
                            selectedOccupantIds.includes(stagiaire._id) ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => toggleOccupant(stagiaire._id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedOccupantIds.includes(stagiaire._id)}
                            onChange={() => {}} // Géré par le onClick du parent
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
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