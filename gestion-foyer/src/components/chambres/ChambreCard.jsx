import React, { useState, useEffect, useRef } from 'react';
// Remplacer les icônes de react-icons/bi par les heroicons
import { UserIcon, HomeIcon } from '@heroicons/react/outline';
import { fetchChambreOccupants } from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';

const ChambreCard = ({ chambre, onAssign, onEdit, onDelete, refreshTrigger }) => {
  const permissions = usePermissions();
  const [occupants, setOccupants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Utiliser une référence pour suivre si les occupants ont déjà été chargés
  const occupantsLoaded = useRef(false);
  // Créer une ref pour stocker l'AbortController
  const abortControllerRef = useRef(null);

  // Charger les occupants de la chambre
  useEffect(() => {
    // Fonction pour charger les occupants
    const loadOccupants = async () => {
      // Annuler toute requête précédente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Créer un nouveau AbortController
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setIsLoading(true);
        const response = await fetchChambreOccupants(
          chambre.id || chambre._id, 
          controller.signal // Passer le signal
        );
        
        // Vérifier si la requête n'a pas été annulée avant de mettre à jour l'état
        if (!controller.signal.aborted) {
          setOccupants(response?.data || []);
          occupantsLoaded.current = true;
        }
      } catch (error) {
        // Ne rien faire si l'erreur est due à l'annulation
        if (error.name !== 'AbortError') {
          console.error("Erreur lors du chargement des occupants:", error);
          setOccupants([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    // Charger les occupants seulement si la chambre a un ID et que les données n'ont pas déjà été chargées
    // ou si refreshTrigger change
    if ((chambre.id || chambre._id) && (!occupantsLoaded.current || refreshTrigger)) {
      loadOccupants();
    }

    // Nettoyage : annuler toute requête en cours lorsque le composant est démonté
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [chambre.id, chambre._id, refreshTrigger]); // Dépendances minimales

  // Calculer les indicateurs d'occupation
  const occupancyRate = chambre.capacite ? (occupants.length / chambre.capacite) * 100 : 0;
  const getOccupancyColor = () => {
    if (occupancyRate === 100) return 'bg-red-100 text-red-800';
    if (occupancyRate > 70) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-5">
        {/* En-tête avec numéro et étage */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Chambre {chambre.numero}
            </h3>
            <p className="text-sm text-gray-500">Étage {chambre.etage}</p>
          </div>
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getOccupancyColor()}`}>
            {occupants.length}/{chambre.capacite} places
          </span>
        </div>

        {/* Informations sur la chambre */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center">
            <HomeIcon className="mr-1 h-4 w-4 text-gray-400" />
            <span>{chambre.type || "Standard"}</span>
          </div>
          <div className="flex items-center">
            <UserIcon className="mr-1 h-4 w-4 text-gray-400" />
            <span>{chambre.capacite} personne{chambre.capacite > 1 ? 's' : ''}</span>
          </div>
          {/* Ajout de l'affichage du nombre de lits */}
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{chambre.nombreLits} lit{chambre.nombreLits > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Liste des occupants */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Occupants:</h4>
          {isLoading ? (
            <div className="flex justify-center p-2">
              <div className="animate-spin h-5 w-5 border-t-2 border-blue-500 rounded-full"></div>
            </div>
          ) : occupants.length > 0 ? (
            <ul className="space-y-2">
              {occupants.map((occupant) => (
                <li key={occupant._id} className="flex items-center space-x-2 text-sm">
                  {occupant.profilePhoto ? (
                    <img src={occupant.profilePhoto} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs">
                      {occupant.firstName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span className="text-gray-700">
                    {occupant.firstName} {occupant.lastName}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">Aucun occupant</p>
          )}
        </div>

        {/* Actions sur la chambre - Updated with permissions */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end space-x-2">
          {/* View/Manage button - always available */}
          {/* Assign button - only show if user can assign (superadmin only) */}
          {permissions.superadmin && (
            <button
              onClick={() => onAssign(chambre)}
              className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
              title="Gérer les occupants"
            >
              Assigner
            </button>
          )}
          
          {/* Edit button - only show if user can edit */}
          {permissions.canEdit && (
            <button
              onClick={() => onEdit(chambre)}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              title="Modifier"
            >
              Modifier
            </button>
          )}
          
          {/* Delete button - only show if user can delete */}
          {permissions.canDelete && (
            <button
              onClick={() => onDelete(chambre)}
              className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100"
              title="Supprimer"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChambreCard;