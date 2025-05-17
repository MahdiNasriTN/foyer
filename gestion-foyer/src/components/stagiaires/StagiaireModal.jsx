import React, { useState, useEffect } from 'react';
import { XIcon } from '@heroicons/react/outline';

const StagiaireModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  stagiaire = null, 
  chambres = [],
  modalType = 'add' // 'add', 'edit', or 'delete'
}) => {
  const [formData, setFormData] = useState({
    id: '',
    nom: '',
    email: '',
    telephone: '',
    chambre: '',
    dateArrivee: new Date().toISOString().split('T')[0],
    dateDepart: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    entreprise: ''
  });
  const [errors, setErrors] = useState({});
  const [animateIn, setAnimateIn] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      // Reset form data when modal opens
      if (stagiaire && (modalType === 'edit' || modalType === 'delete')) {
        setFormData({
          id: stagiaire.id || '',
          nom: stagiaire.nom || '',
          email: stagiaire.email || '',
          telephone: stagiaire.telephone || '',
          chambre: stagiaire.chambre || '',
          dateArrivee: stagiaire.dateArrivee || new Date().toISOString().split('T')[0],
          dateDepart: stagiaire.dateDepart || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          entreprise: stagiaire.entreprise || ''
        });
      } else {
        setFormData({
          id: '',
          nom: '',
          email: '',
          telephone: '',
          chambre: '',
          dateArrivee: new Date().toISOString().split('T')[0],
          dateDepart: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          entreprise: ''
        });
      }
      
      // Animation d'entrée
      setTimeout(() => setAnimateIn(true), 10);
    } else {
      setAnimateIn(false);
    }
    
    setErrors({});
  }, [isOpen, stagiaire, modalType]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!formData.nom) newErrors.nom = 'Le nom est requis';
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (!formData.telephone) {
      newErrors.telephone = 'Le téléphone est requis';
    } else if (!/^\d{8,}$/.test(formData.telephone)) {
      newErrors.telephone = 'Minimum 8 chiffres requis';
    }
    
    if (!formData.entreprise) {
      newErrors.entreprise = 'L\'entreprise est requise';
    }
    
    if (!formData.dateArrivee) {
      newErrors.dateArrivee = 'La date d\'arrivée est requise';
    }
    
    if (!formData.dateDepart) {
      newErrors.dateDepart = 'La date de départ est requise';
    } else if (new Date(formData.dateDepart) <= new Date(formData.dateArrivee)) {
      newErrors.dateDepart = 'La date de départ doit être après la date d\'arrivée';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Skip validation for delete
    if (modalType === 'delete') {
      onSave(formData);
      return;
    }
    
    if (validateForm()) {
      onSave(formData);
    }
  };
  
  const handleCloseWithAnimation = () => {
    setAnimateIn(false);
    setTimeout(() => onClose(), 300); // Match the CSS transition duration
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900 transition-opacity duration-300 ${animateIn ? 'opacity-60' : 'opacity-0'}`}
        onClick={handleCloseWithAnimation}
      ></div>
      
      {/* Modal Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-md transition-all duration-300 relative
            ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}
          `}
        >
          {/* Close button */}
          <button
            onClick={handleCloseWithAnimation}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
          
          {/* Modal header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">
              {modalType === 'add' && 'Ajouter un stagiaire'}
              {modalType === 'edit' && 'Modifier un stagiaire'}
              {modalType === 'delete' && 'Supprimer le stagiaire'}
            </h3>
          </div>
          
          {/* Modal body */}
          <div className="px-6 py-4">
            {modalType === 'delete' ? (
              <div className="text-center py-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Confirmer la suppression
                </h3>
                <p className="text-gray-500 mb-6">
                  Êtes-vous sûr de vouloir supprimer le stagiaire <span className="font-medium text-gray-700">{formData.nom}</span> ? Cette action est irréversible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Nom */}
                  <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 ${
                        errors.nom ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                  
                  {/* Téléphone */}
                  <div>
                    <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 ${
                        errors.telephone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.telephone && <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>}
                  </div>
                  
                  {/* Entreprise */}
                  <div>
                    <label htmlFor="entreprise" className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                    <input
                      type="text"
                      id="entreprise"
                      name="entreprise"
                      value={formData.entreprise}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 ${
                        errors.entreprise ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.entreprise && <p className="mt-1 text-sm text-red-600">{errors.entreprise}</p>}
                  </div>
                  
                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="dateArrivee" className="block text-sm font-medium text-gray-700 mb-1">Date d'arrivée</label>
                      <input
                        type="date"
                        id="dateArrivee"
                        name="dateArrivee"
                        value={formData.dateArrivee}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 ${
                          errors.dateArrivee ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.dateArrivee && <p className="mt-1 text-sm text-red-600">{errors.dateArrivee}</p>}
                    </div>
                    <div>
                      <label htmlFor="dateDepart" className="block text-sm font-medium text-gray-700 mb-1">Date de départ</label>
                      <input
                        type="date"
                        id="dateDepart"
                        name="dateDepart"
                        value={formData.dateDepart}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 ${
                          errors.dateDepart ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.dateDepart && <p className="mt-1 text-sm text-red-600">{errors.dateDepart}</p>}
                    </div>
                  </div>
                  
                  {/* Chambre */}
                  <div>
                    <label htmlFor="chambre" className="block text-sm font-medium text-gray-700 mb-1">Chambre</label>
                    <select
                      id="chambre"
                      name="chambre"
                      value={formData.chambre}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                    >
                      <option value="">Non assignée</option>
                      {chambres.map((chambre) => (
                        <option key={chambre.numero} value={chambre.numero}>
                          Chambre {chambre.numero} ({chambre.occupants}/{chambre.capacite} occupants)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </form>
            )}
          </div>
          
          {/* Modal footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseWithAnimation}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              Annuler
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 
                ${modalType === 'delete' 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                  : 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500'}`}
            >
              {modalType === 'add' && 'Ajouter'}
              {modalType === 'edit' && 'Enregistrer'}
              {modalType === 'delete' && 'Supprimer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StagiaireModal;