import React, { useState, useEffect } from 'react';
import { XIcon, ExclamationIcon, EyeIcon, EyeOffIcon } from '@heroicons/react/outline';

const AdminModal = ({ isOpen, onClose, onSave, admin, modalType = 'edit', loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    permissions: ['view'],
    status: 'active',
    role: 'admin' // Default to admin
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (admin && modalType === 'edit') {
      setFormData({
      id: admin.id || admin._id, // Ensure we capture the ID correctly
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      email: admin.email || '',
      password: '',
      confirmPassword: '',
      permissions: admin.permissions || ['view'],
      status: admin.status || 'active',
      role: admin.role || 'admin'
    });
    } else {
      // Reset form for new admin
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        permissions: ['view'],
        status: 'active',
        role: 'admin' // Default to admin
      });
    }
  }, [admin, modalType]);

  useEffect(() => {
    // Password strength checker
    if (formData.password) {
      let strength = 0;
      const feedback = [];
      
      if (formData.password.length >= 8) {
        strength += 1;
      } else {
        feedback.push('Au moins 8 caractères');
      }
      
      if (/[A-Z]/.test(formData.password)) {
        strength += 1;
      } else {
        feedback.push('Au moins une majuscule');
      }
      
      if (/[a-z]/.test(formData.password)) {
        strength += 1;
      } else {
        feedback.push('Au moins une minuscule');
      }
      
      if (/[0-9]/.test(formData.password)) {
        strength += 1;
      } else {
        feedback.push('Au moins un chiffre');
      }
      
      if (/[^A-Za-z0-9]/.test(formData.password)) {
        strength += 1;
      } else {
        feedback.push('Au moins un caractère spécial');
      }
      
      setPasswordStrength(strength);
      setPasswordFeedback(feedback.join(' • '));
    } else {
      setPasswordStrength(0);
      setPasswordFeedback('');
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permission) 
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      return { ...prev, permissions: newPermissions };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    // Password validation for new admin
    if (modalType === 'add') {
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (passwordStrength < 3) {
        newErrors.password = 'Le mot de passe n\'est pas assez fort';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    } else if (formData.password) {
      // For edit mode, only validate if password is provided
      if (passwordStrength < 3) {
        newErrors.password = 'Le mot de passe n\'est pas assez fort';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If loading, prevent multiple submissions
    if (loading) return;
    
    if (validateForm()) {
      // If valid, prepare data for submission
      const adminData = {
        ...formData,
        // If editing and password is empty, don't send it
        ...(modalType === 'edit' && !formData.password && { password: undefined, confirmPassword: undefined })
      };
      
      onSave(adminData);
    }
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
                Êtes-vous sûr de vouloir supprimer le compte administrateur <span className="font-medium text-gray-800">{admin?.firstName} {admin?.lastName}</span> ? Cette action ne peut pas être annulée.
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
              onClick={() => onSave(admin)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit or Add admin form
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-br from-slate-900 to-blue-900 text-white">
          <h3 className="text-lg font-medium">
            {modalType === 'edit' ? 'Modifier un administrateur' : 'Ajouter un administrateur'}
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
              <div className="flex">
                <ExclamationIcon className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`mt-1 block w-full border ${errors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>
            
            {/* Last name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`mt-1 block w-full border ${errors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
            
            {/* Email */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe {modalType === 'add' && <span className="text-red-500">*</span>}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full ${
                        passwordStrength < 2 ? 'bg-red-500' :
                        passwordStrength < 4 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} style={{ width: `${passwordStrength * 20}%` }}></div>
                    </div>
                    <span className="ml-2 text-xs font-medium text-gray-500">
                      {passwordStrength < 2 ? 'Faible' :
                       passwordStrength < 4 ? 'Moyen' :
                       'Fort'}
                    </span>
                  </div>
                  {passwordFeedback && (
                    <p className="mt-1 text-xs text-gray-500">
                      {passwordFeedback}
                    </p>
                  )}
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              {modalType === 'edit' && (
                <p className="mt-1 text-xs text-gray-500">
                  Laissez vide pour ne pas modifier le mot de passe.
                </p>
              )}
            </div>
            
            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe {modalType === 'add' && <span className="text-red-500">*</span>}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Statut
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            
            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Rôle
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
                <option value="superadmin">Super Administrateur</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Les super administrateurs ont accès à toutes les fonctionnalités.
              </p>
            </div>
            
            {/* Permissions */}
            <div className={`md:col-span-2 ${formData.role === 'user' ? 'opacity-50' : ''}`}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes('view')}
                      onChange={() => handlePermissionChange('view')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled // View is always enabled
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Lecture (contenu, statistiques)
                    </span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes('edit')}
                      onChange={() => handlePermissionChange('edit')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={formData.role === 'superadmin'} // Superadmin always has all permissions
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Modification (données, informations)
                    </span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes('create')}
                      onChange={() => handlePermissionChange('create')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={formData.role === 'superadmin'}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Création (nouveaux comptes, données)
                    </span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes('delete')}
                      onChange={() => handlePermissionChange('delete')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={formData.role === 'superadmin'}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Suppression (comptes, données)
                    </span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes('approve')}
                      onChange={() => handlePermissionChange('approve')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={formData.role === 'superadmin'}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Approbation (demandes, inscriptions)
                    </span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes('export')}
                      onChange={() => handlePermissionChange('export')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={formData.role === 'superadmin'}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Export (statistiques, rapports)
                    </span>
                  </label>
                </div>
              </div>
              {formData.role === 'superadmin' ? (
                <p className="mt-2 text-xs text-indigo-600 font-medium">
                  Les super administrateurs ont automatiquement toutes les permissions.
                </p>
              ) : formData.role === 'user' ? (
                <p className="mt-2 text-xs text-gray-500">
                  Les utilisateurs réguliers n'ont que des permissions de base.
                </p>
              ) : (
                <p className="mt-2 text-xs text-gray-500">
                  Permission de lecture toujours accordée par défaut.
                </p>
              )}
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
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-br from-slate-800 to-blue-800 hover:from-slate-900 hover:to-blue-900 text-white rounded-md flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {modalType === 'edit' ? 'Enregistrement...' : modalType === 'add' ? 'Création...' : 'Suppression...'}
                </>
              ) : (
                <>{modalType === 'edit' ? 'Enregistrer les modifications' : modalType === 'add' ? 'Ajouter' : 'Supprimer'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;