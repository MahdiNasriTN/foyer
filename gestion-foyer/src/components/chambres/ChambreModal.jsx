import React, { useState, useEffect } from 'react';
import { XIcon, PlusSmIcon, MinusSmIcon } from '@heroicons/react/outline';

const equipementsOptions = [
  'Climatisation', 'Bureau', 'Salle de bain privée', 'Balcon', 'Wifi', 'TV', 'Réfrigérateur'
];

const ChambreModal = ({ isOpen, onClose, chambre, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    numero: '',
    capacite: 1,
    nombreLits: 1,
    etage: 1,
    equipements: [],
    occupants: [],
    statut: 'libre',
    gender: 'garcon'
  });
  
  // Function to determine floor based on room number
  const getFloorFromRoomNumber = (roomNumber) => {
    if (!roomNumber) return 1;
    
    // Extract numeric part from room number (handle formats like "A-101", "101", etc.)
    const numericPart = roomNumber.replace(/[^0-9]/g, '');
    const number = parseInt(numericPart);
    
    if (isNaN(number)) return 1;
    
    if (number >= 100 && number <= 199) return 1;
    if (number >= 200 && number <= 299) return 2;
    if (number >= 300 && number <= 399) return 3;
    if (number >= 400 && number <= 499) return 4;
    
    // Default to floor 1 for any other numbers
    return 1;
  };
  
  useEffect(() => {
    if (chambre) {
      setFormData({
        id: chambre.id || '',
        numero: chambre.numero || '',
        capacite: chambre.capacite || 1,
        nombreLits: chambre.nombreLits || chambre.capacite || 1,
        etage: chambre.etage || getFloorFromRoomNumber(chambre.numero) || 1,
        equipements: chambre.equipements || [],
        occupants: chambre.occupants || [],
        statut: chambre.statut || 'libre',
        gender: chambre.gender || 'garcon'
      });
    } else {
      // Reset form for new chambre
      setFormData({
        id: '',
        numero: '',
        capacite: 1,
        nombreLits: 1,
        etage: 1,
        equipements: [],
        occupants: [],
        statut: 'libre',
        gender: 'garcon'
      });
    }
  }, [chambre]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'numero') {
      // Auto-calculate floor when room number changes
      const newFloor = getFloorFromRoomNumber(value);
      setFormData({
        ...formData,
        [name]: value,
        etage: newFloor
      });
    } else if (name === 'capacite') {
      // Auto-sync number of beds with capacity
      setFormData({
        ...formData,
        [name]: parseInt(value),
        nombreLits: parseInt(value) // Sync beds with capacity
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleCapaciteChange = (delta) => {
    const newCapacity = Math.max(1, formData.capacite + delta);
    setFormData(prev => ({
      ...prev,
      capacite: newCapacity,
      nombreLits: newCapacity // Auto-sync beds with capacity
    }));
  };
  
  const toggleEquipement = (equipement) => {
    setFormData(prev => {
      if (prev.equipements.includes(equipement)) {
        return {
          ...prev,
          equipements: prev.equipements.filter(e => e !== equipement)
        };
      } else {
        return {
          ...prev,
          equipements: [...prev.equipements, equipement]
        };
      }
    });
  };

  const handleNombreLitsChange = (delta) => {
    setFormData(prev => ({
      ...prev,
      nombreLits: Math.max(1, prev.nombreLits + delta)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      equipements: formData.equipements,
      statut: formData.statut === 'occupée' ? 'occupee' : 'disponible',
      gender: formData.gender,
      etage: formData.etage // Ensure floor is included
    };
    
    onSave(submitData);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="absolute right-4 top-4">
            <button
              type="button"
              className="text-gray-400 bg-white rounded-full p-1 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="bg-primary text-white px-6 py-5">
            <h3 className="text-lg leading-6 font-medium">
              {formData.id ? 'Modifier la Chambre' : 'Ajouter une Chambre'}
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              {formData.id ? 'Modifiez les informations de la chambre' : 'Créez une nouvelle chambre dans le foyer'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="numero" className="block text-sm font-medium text-gray-700">
                  Numéro de Chambre *
                </label>
                <input
                  type="text"
                  name="numero"
                  id="numero"
                  required
                  value={formData.numero}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Ex: 101, 205, 303"
                />
              </div>
              
              <div>
                <label htmlFor="etage" className="block text-sm font-medium text-gray-700">
                  Étage (Auto-calculé)
                </label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    name="etage"
                    id="etage"
                    value={formData.etage}
                    readOnly
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 bg-gray-50 cursor-not-allowed focus:outline-none sm:text-sm rounded-md"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Étage déterminé automatiquement par le numéro de chambre
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="capacite" className="block text-sm font-medium text-gray-700">
                  Capacité (occupants)
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <button
                    type="button"
                    className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-gray-50 text-sm font-medium text-gray-500 hover:bg-gray-100"
                    onClick={() => handleCapaciteChange(-1)}
                  >
                    <MinusSmIcon className="h-5 w-5" />
                  </button>
                  <input
                    type="number"
                    name="capacite"
                    id="capacite"
                    min="1"
                    max="10"
                    value={formData.capacite}
                    onChange={handleChange}
                    className="flex-1 min-w-0 block w-full px-3 py-2 border border-l-0 border-r-0 border-gray-300 text-center sm:text-sm"
                    readOnly
                  />
                  <button
                    type="button"
                    className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-gray-50 text-sm font-medium text-gray-500 hover:bg-gray-100"
                    onClick={() => handleCapaciteChange(1)}
                  >
                    <PlusSmIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="nombreLits" className="block text-sm font-medium text-gray-700">
                  Nombre de lits (Auto-synchronisé)
                </label>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    name="nombreLits"
                    id="nombreLits"
                    value={formData.nombreLits}
                    readOnly
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 bg-gray-50 cursor-not-allowed focus:outline-none sm:text-sm rounded-md"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Nombre de lits = capacité de la chambre
                </p>
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Genre de chambre *
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="garcon">👦 Garçons</option>
                <option value="fille">👧 Filles</option>
              </select>
              
              {/* Warning for occupied rooms when changing gender */}
              {formData.id && formData.occupants && formData.occupants.length > 0 && (
                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-2">
                      <p className="text-xs text-yellow-700">
                        ⚠️ Cette chambre a {formData.occupants.length} occupant(s). Changer le genre pourrait affecter les assignations actuelles.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Équipements
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {equipementsOptions.map(equip => (
                  <button
                    key={equip}
                    type="button"
                    onClick={() => toggleEquipement(equip)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm ${
                      formData.equipements.includes(equip)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {equip}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                onClick={onClose}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {formData.id ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChambreModal;