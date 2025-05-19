import React, { useState, useEffect } from 'react';
import { XIcon, ExclamationIcon, PlusIcon } from '@heroicons/react/outline';

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const TIME_SLOTS = Array.from({ length: 10 }, (_, i) => ({
  start: 8 + i,
  end: 9 + i,
  label: `${8 + i}:00 - ${9 + i}:00`
}));

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
    permissions: ['view'],
    schedule: {}
  });

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [shiftDetails, setShiftDetails] = useState({
    startTime: '',
    endTime: '',
    notes: ''
  });

  // Initialiser le formulaire avec les données de l'employé
  useEffect(() => {
    if (employee && modalType === 'edit') {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        telephone: employee.telephone || '',
        poste: employee.poste || '',
        departement: employee.departement || '',
        dateEmbauche: employee.dateEmbauche || '',
        statut: employee.statut || 'actif',
        adresse: employee.adresse || '',
        permissions: employee.permissions || ['view'],
        schedule: employee.schedule || {}
      });
    }
  }, [employee, modalType]);

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gérer les changements dans les checkboxes de permissions
  const handlePermissionChange = (permission) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permission) 
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      return { ...prev, permissions: newPermissions };
    });
  };

  // Schedule calendar functions
  const getShiftForTimeSlot = (day, hour) => {
    if (!formData.schedule[day]) return null;
    
    return formData.schedule[day].find(shift => {
      const startHour = parseInt(shift.startTime.split(':')[0]);
      const endHour = parseInt(shift.endTime.split(':')[0]);
      return hour >= startHour && hour < endHour;
    });
  };

  const handleCellClick = (day, hour) => {
    // If there's already a shift at this time, don't do anything
    if (getShiftForTimeSlot(day, hour)) return;

    setSelectedDay(day);
    setSelectedHour(hour);
    // Pre-set the start and end times based on the clicked cell
    setShiftDetails({
      startTime: `${hour}:00`,
      endTime: `${hour + 1}:00`,
      notes: ''
    });
    setIsAddingShift(true);
  };

  const handleSaveShift = () => {
    const newSchedule = { ...formData.schedule };
    
    if (!newSchedule[selectedDay]) {
      newSchedule[selectedDay] = [];
    }
    
    newSchedule[selectedDay].push({
      startTime: `${selectedHour}:00`,
      endTime: `${selectedHour + 1}:00`,
      notes: shiftDetails.notes
    });
    
    setFormData(prev => ({
      ...prev,
      schedule: newSchedule
    }));
    
    setIsAddingShift(false);
    setSelectedDay(null);
    setSelectedHour(null);
  };

  const handleDeleteShift = (day, shift) => {
    const newSchedule = { ...formData.schedule };
    newSchedule[day] = newSchedule[day].filter(s => 
      s.startTime !== shift.startTime || s.endTime !== shift.endTime
    );
    
    if (newSchedule[day].length === 0) {
      delete newSchedule[day];
    }
    
    setFormData(prev => ({
      ...prev,
      schedule: newSchedule
    }));
  };

  const formatTimeDisplay = (hour) => {
    return `${hour}:00`;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    const employeeData = {
      ...formData,
      nom: `${formData.firstName} ${formData.lastName}`
    };
    onSave(employeeData);
  };

  // Afficher la modal de confirmation de suppression
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

  // Afficher le formulaire d'ajout/édition d'employé
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full mx-auto my-8 p-0">
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
                Département
              </label>
              <select
                id="departement"
                name="departement"
                value={formData.departement}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Sélectionner un département</option>
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes('view')}
                    onChange={() => handlePermissionChange('view')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Lecture</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes('edit')}
                    onChange={() => handlePermissionChange('edit')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Modification</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes('delete')}
                    onChange={() => handlePermissionChange('delete')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Suppression</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Schedule Calendar Section - REVERSED LAYOUT */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Planning de travail</h3>
            
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                          Jour
                        </th>
                        {TIME_SLOTS.map(timeSlot => (
                          <th key={timeSlot.start} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {timeSlot.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {DAYS.map(day => (
                        <tr key={day} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                            {day}
                          </td>
                          {TIME_SLOTS.map(timeSlot => {
                            const shift = getShiftForTimeSlot(day, timeSlot.start);
                            
                            return (
                              <td 
                                key={`${day}-${timeSlot.start}`} 
                                className={`px-1 py-1 text-sm text-center border border-gray-100 relative cursor-pointer h-12
                                  ${shift ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                                onClick={() => !shift && handleCellClick(day, timeSlot.start)}
                              >
                                {shift ? (
                                  <div className="flex flex-col h-full relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-50 rounded shadow-sm"></div>
                                    <div className="relative p-1.5 flex flex-col h-full z-10">
                                      <div className="text-xs font-medium text-blue-700 mb-0.5 truncate">
                                        {timeSlot.label}
                                      </div>
                                      <div className="text-xs text-gray-600 flex-1 overflow-hidden text-left leading-tight">
                                        {shift.notes || "Tâche assignée"}
                                      </div>
                                      <button
                                        className="absolute top-0.5 right-0.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteShift(day, shift);
                                        }}
                                      >
                                        <XIcon className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-full group">
                                    <div className="h-7 w-7 rounded-full bg-gray-50 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 group-hover:bg-gray-100 group-hover:shadow-sm">
                                      <PlusIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                                    </div>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Cliquez sur une cellule pour ajouter un créneau de travail
            </p>
          </div>
          
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

      {/* Add Shift Modal */}
      {isAddingShift && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg">
              <h3 className="text-lg font-medium text-white">
                Ajouter une tâche
              </h3>
              <div className="text-sm text-blue-100">
                {selectedDay} • {selectedHour}:00 - {selectedHour + 1}:00
              </div>
              <button 
                onClick={() => setIsAddingShift(false)}
                className="text-white hover:text-blue-100"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Description de la tâche
                </label>
                <textarea
                  id="notes"
                  rows="5"
                  value={shiftDetails.notes}
                  onChange={(e) => setShiftDetails({...shiftDetails, notes: e.target.value})}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Saisir les détails de cette tâche..."
                ></textarea>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setIsAddingShift(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveShift}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelModal;