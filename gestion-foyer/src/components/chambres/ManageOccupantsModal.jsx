import React from 'react';
import { Dialog } from '@headlessui/react';

const ManageOccupantsModal = ({ isOpen, onClose, chambre, residents, onRemoveOccupant }) => {
  if (!chambre) return null;

  const occupants = chambre.occupants?.map(id => residents.find(r => r.id === id)).filter(Boolean) || [];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-lg w-full rounded-xl bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Gérer les occupants de la chambre {chambre.numero}
            </Dialog.Title>
            
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Cette chambre peut accueillir jusqu'à {chambre.capacite || '?'} personnes.
                Actuellement {occupants.length} sur {chambre.capacite || '?'} places sont attribuées.
              </p>
            </div>

            {occupants.length === 0 ? (
              <div className="my-8 text-center py-8 bg-gray-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="mt-3 text-sm text-gray-500">Aucun occupant dans cette chambre</p>
              </div>
            ) : (
              <div className="mt-6 divide-y divide-gray-200">
                {occupants.map(occupant => (
                  <div key={occupant.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      {occupant.profilePhoto ? (
                        <img 
                          src={occupant.profilePhoto} 
                          alt={occupant.prenom || occupant.firstName} 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800">
                          {(occupant.prenom || occupant.firstName || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {occupant.prenom || occupant.firstName} {occupant.nom || occupant.lastName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {occupant.email || 'Pas d\'email'} • {occupant.telephone || occupant.phoneNumber || 'Pas de téléphone'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveOccupant(occupant.id)}
                      className="ml-4 flex items-center px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 00-1-1h-4a1 1 00-1 1v3M4 7h16" />
                      </svg>
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => onClose()}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  // You can add the "Assign" action here to open the AssignModal
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Assigner des résidents
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default ManageOccupantsModal;