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
    statut: 'libre'
  });
  
  useEffect(() => {
    if (chambre) {
      setFormData({
        id: chambre.id || '',
        numero: chambre.numero || '',
        capacite: chambre.capacite || 1,
        nombreLits: chambre.nombreLits || chambre.capacite || 1,
        etage: chambre.etage || 1,
        equipements: chambre.equipements || [],
        occupants: chambre.occupants || [],
        statut: chambre.statut || 'libre'
      });
    }
  }, [chambre]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleCapaciteChange = (delta) => {
    setFormData(prev => ({
      ...prev,
      capacite: Math.max(1, prev.capacite + delta)
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
                  placeholder="Ex: A-101"
                />
              </div>
              
              <div>
                <label htmlFor="etage" className="block text-sm font-medium text-gray-700">
                  Étage
                </label>
                <select
                  id="etage"
                  name="etage"
                  value={formData.etage}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value={1}>Étage 1</option>
                  <option value={2}>Étage 2</option>
                  <option value={3}>Étage 3</option>
                  <option value={4}>Étage 4</option>
                </select>
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
                  Nombre de lits
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <button
                    type="button"
                    className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-gray-50 text-sm font-medium text-gray-500 hover:bg-gray-100"
                    onClick={() => handleNombreLitsChange(-1)}
                  >
                    <MinusSmIcon className="h-5 w-5" />
                  </button>
                  <input
                    type="number"
                    name="nombreLits"
                    id="nombreLits"
                    min="1"
                    max="10"
                    value={formData.nombreLits}
                    onChange={handleChange}
                    className="flex-1 min-w-0 block w-full px-3 py-2 border border-l-0 border-r-0 border-gray-300 text-center sm:text-sm"
                    readOnly
                  />
                  <button
                    type="button"
                    className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-gray-50 text-sm font-medium text-gray-500 hover:bg-gray-100"
                    onClick={() => handleNombreLitsChange(1)}
                  >
                    <PlusSmIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
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