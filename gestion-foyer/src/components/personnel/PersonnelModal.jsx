import React, { useState, useEffect } from 'react';
import { XIcon, ExclamationIcon } from '@heroicons/react/outline';

const PersonnelModal = ({ isOpen, onClose, onSave, onConfirm, employee, modalType = 'edit' }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    poste: '',
    departement: '',
    dateEmbauche: '',
    statut: 'actif',
    adresse: '',
    identifier: '' // Removed permissions field
  });

  // Initialize form with employee data
  useEffect(() => {
    if (employee && modalType === 'edit') {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        telephone: employee.telephone || '',
        poste: employee.poste || '',
        departement: employee.departement || '',
        dateEmbauche: employee.dateEmbauche ? employee.dateEmbauche.split('T')[0] : '', // Format date for input
        statut: employee.statut || 'actif',
        adresse: employee.adresse || '',
        identifier: employee.identifier || '' // Removed permissions
      });
    } else if (modalType === 'add') {
      // Generate auto identifier for new employee, but allow it to be changed
      const currentYear = new Date().getFullYear();
      const randomNumber = Math.floor(Math.random() * 9000) + 1000; // 4-digit random number
      const autoIdentifier = `EMP${currentYear}${randomNumber}`;
      
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        telephone: '',
        poste: '',
        departement: '',
        dateEmbauche: '',
        statut: 'actif',
        adresse: '',
        identifier: autoIdentifier // Removed permissions
      });
    }
  }, [employee, modalType]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const employeeData = {
      ...formData,
      nom: `${formData.firstName} ${formData.lastName}`
    };
    onSave(employeeData);
  };

  // Show delete confirmation modal
  if (modalType === 'delete') {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Confirmer la suppression</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="p-5">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <ExclamationIcon className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-gray-600">
                Êtes-vous sûr de vouloir supprimer l'employé <span className="font-medium text-gray-800">{employee?.nom}</span> ? Cette action ne peut pas être annulée.
              </p>
            </div>
          </div>
          <div className="p-5 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show add/edit employee form
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {employee ? 'Modifier un employé' : 'Ajouter un employé'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            
            {/* UPDATED: Identifier field - now editable */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Identifiant
              </label>
              <input
                type="text"
                name="identifier"
                id="identifier"
                value={formData.identifier}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                placeholder="EMP20241234"
                // Removed readOnly restriction
              />
              <p className="mt-1 text-xs text-gray-500">
                Identifiant unique (format suggéré: EMP + année + 4 chiffres)
              </p>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="tel"
                name="telephone"
                id="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="poste" className="block text-sm font-medium text-gray-700">
                Poste
              </label>
              <input
                type="text"
                name="poste"
                id="poste"
                value={formData.poste}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="departement" className="block text-sm font-medium text-gray-700">
                Bâtiment
              </label>
              <select
                id="departement"
                name="departement"
                value={formData.departement}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Sélectionner un Bâtiment</option>
                <option value="Administration">Administration</option>
                <option value="Ressources Humaines">Ressources Humaines</option>
                <option value="Sécurité">Sécurité</option>
                <option value="Restauration">Restauration</option>
                <option value="Technique">Technique</option>
                <option value="Hébergement">Hébergement</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dateEmbauche" className="block text-sm font-medium text-gray-700">
                Date d'embauche
              </label>
              <input
                type="date"
                name="dateEmbauche"
                id="dateEmbauche"
                value={formData.dateEmbauche}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="statut" className="block text-sm font-medium text-gray-700">
                Statut
              </label>
              <select
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">
                Adresse
              </label>
              <input
                type="text"
                name="adresse"
                id="adresse"
                value={formData.adresse}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          {/* Footer buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonnelModal;