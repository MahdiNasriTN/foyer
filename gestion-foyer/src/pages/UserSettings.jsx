import React, { useState, useEffect, useRef } from 'react';
import { getUserProfile, updateUserProfile, updateUserAvatar } from '../services/userService';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  UserIcon, 
  MailIcon, 
  PhoneIcon, 
  LockClosedIcon,
  BadgeCheckIcon,
  OfficeBuildingIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeOffIcon,
  SaveIcon,
  RefreshIcon,
  UsersIcon,
  CameraIcon
} from '@heroicons/react/outline';
import { motion, AnimatePresence } from 'framer-motion';
import AdminsList from '../components/admin/AdminsList';
import AdminModal from '../components/admin/AdminModal';
import { 
  createAdmin, 
  updateAdmin, 
  deleteAdmin 
} from '../services/adminService';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

const UserSettings = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    role: '',
    departement: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [activeSection, setActiveSection] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');
  const [avatarColor, setAvatarColor] = useState('#4F46E5');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminModalType, setAdminModalType] = useState('edit'); // 'edit', 'add', or 'delete'

  // Add these states for admin management
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);

  // Add to the state variables
  const [avatar, setAvatar] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Add this to your imports
  const [lastLoginInfo, setLastLoginInfo] = useState({
    timestamp: null,
    device: 'Unknown',
    browser: 'Unknown',
    location: 'Unknown'
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await getUserProfile();
        const user = response.data.user;
        
        if (!user) {
          throw new Error('User data not found');
        }

        // Set avatar if it exists
        if (user.avatar) {
          setAvatar(user.avatar);
        }
        
        // Set last login info if available
        if (user.lastLogin) {
          setLastLoginInfo({
            timestamp: new Date(user.lastLogin.timestamp),
            device: user.lastLogin.device || 'Windows PC',
            browser: user.lastLogin.browser || 'Chrome',
            location: user.lastLogin.location || 'Rabat, Maroc'
          });
        }

        setUserData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          telephone: user.telephone || '',
          role: user.role || '',
          departement: user.departement || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Generate a consistent color based on user email
        const hash = user.email.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        const hue = hash % 360;
        setAvatarColor(`hsl(${hue}, 70%, 50%)`);
      } catch (err) {
        setError('Impossible de charger les informations utilisateur');
        console.error(err);
        setNotification({ 
          show: true, 
          message: 'Erreur lors du chargement des données utilisateur', 
          type: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    // Password strength checker
    if (userData.newPassword) {
      let strength = 0;
      const feedback = [];
      
      if (userData.newPassword.length >= 8) {
        strength += 1;
      } else {
        feedback.push('Au moins 8 caractères');
      }
      
      if (/[A-Z]/.test(userData.newPassword)) {
        strength += 1;
      } else {
        feedback.push('Au moins une majuscule');
      }
      
      if (/[a-z]/.test(userData.newPassword)) {
        strength += 1;
      } else {
        feedback.push('Au moins une minuscule');
      }
      
      if (/[0-9]/.test(userData.newPassword)) {
        strength += 1;
      } else {
        feedback.push('Au moins un chiffre');
      }
      
      if (/[^A-Za-z0-9]/.test(userData.newPassword)) {
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
  }, [userData.newPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (userData.newPassword && userData.newPassword !== userData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setNotification({ 
        show: true, 
        message: 'Les mots de passe ne correspondent pas', 
        type: 'error' 
      });
      return;
    }
    
    // Validate password strength if changing password
    if (userData.newPassword && passwordStrength < 3) {
      setError('Le mot de passe n\'est pas assez fort');
      setNotification({ 
        show: true, 
        message: 'Veuillez choisir un mot de passe plus sécurisé', 
        type: 'error' 
      });
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Create an object with only the fields that should be sent to the API
      const dataToSubmit = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        telephone: userData.telephone
      };
      
      // Only include password fields if the user is changing their password
      if (userData.currentPassword && userData.newPassword) {
        dataToSubmit.currentPassword = userData.currentPassword;
        dataToSubmit.newPassword = userData.newPassword;
      }
      
      await updateUserProfile(dataToSubmit);
      
      // Reset password fields
      setUserData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setNotification({
        show: true,
        message: 'Vos paramètres ont été mis à jour avec succès',
        type: 'success'
      });
      
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 5000);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la mise à jour de votre profil');
      setNotification({ 
        show: true, 
        message: err.message || 'Une erreur est survenue', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleColor = (role) => {
    switch(role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'staff':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddAdmin = () => {
    setSelectedAdmin(null);
    setAdminModalType('add');
    setShowAdminModal(true);
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setAdminModalType('edit');
    setShowAdminModal(true);
  };

  const handleDeleteAdmin = (admin) => {
    setSelectedAdmin(admin);
    setAdminModalType('delete');
    setShowAdminModal(true);
  };

  const handleSaveAdmin = async (adminData) => {
    setAdminLoading(true);
    setAdminError(null);
    
    try {
      // Handle different modal actions
      if (adminModalType === 'delete') {
        await deleteAdmin(adminData.id);
        setNotification({
          show: true,
          message: `L'administrateur ${adminData.firstName} ${adminData.lastName} a été supprimé avec succès`,
          type: 'success'
        });
      } else if (adminModalType === 'edit') {
        await updateAdmin(adminData.id, adminData);
        setNotification({
          show: true,
          message: `L'administrateur ${adminData.firstName} ${adminData.lastName} a été mis à jour avec succès`,
          type: 'success'
        });
      } else {
        await createAdmin(adminData);
        setNotification({
          show: true,
          message: `L'administrateur ${adminData.firstName} ${adminData.lastName} a été ajouté avec succès`,
          type: 'success'
        });
      }
      
      setShowAdminModal(false);
      
      // Refresh the admin list by forcing a reload of the AdminsList component
      // We'll do this by key change in the AdminsList component
    } catch (error) {
      console.error("Error handling admin:", error);
      setAdminError(error.response?.data?.message || "Une erreur s'est produite");
      setNotification({
        show: true,
        message: error.response?.data?.message || "Une erreur s'est produite lors de l'opération",
        type: 'error'
      });
    } finally {
      setAdminLoading(false);
    }
  };

  // Use the key prop to force refresh when operations complete
  const [adminListKey, setAdminListKey] = useState(0);
  
  // Add this effect to refresh the AdminsList after any operation
  useEffect(() => {
    if (!showAdminModal && !adminLoading) {
      setAdminListKey(prev => prev + 1);
    }
  }, [showAdminModal, adminLoading]);

  // Add this function to handle avatar file selection
  const handleAvatarChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setNotification({
        show: true,
        message: 'Veuillez sélectionner un fichier image valide',
        type: 'error'
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setNotification({
        show: true,
        message: 'L\'image doit être inférieure à 2 Mo',
        type: 'error'
      });
      return;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload the file
    try {
      setUploadingAvatar(true);
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await updateUserAvatar(formData);
      
      if (response.data.avatar) {
        setAvatar(response.data.avatar);
      }
      
      setNotification({
        show: true,
        message: 'Photo de profil mise à jour avec succès',
        type: 'success'
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setNotification({
        show: true,
        message: 'Erreur lors du téléchargement de la photo de profil',
        type: 'error'
      });
      // Revert to previous avatar if available
      if (userData.avatar) {
        setAvatar(userData.avatar);
      } else {
        setAvatar(null);
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Add this function to open the file dialog
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-4 text-lg text-gray-600">Chargement de votre profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto py-6 px-4">
        {/* Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center ${
                notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                {notification.type === 'success' ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-red-500 mr-3" />
                )}
                <p className={`font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.message}
                </p>
                <button
                  onClick={() => setNotification({ show: false, message: '', type: 'success' })}
                  className="ml-6 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page header */}
        <div className="mb-8">
          <div className="w-full mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header with premium gradient background - updated to match other pages */}
              <div className="bg-gradient-to-br from-slate-900 to-blue-900 px-6 py-16 sm:px-10 relative">
                <div className="absolute inset-0 bg-grid-white/[0.1] bg-[length:20px_20px]"></div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="relative flex flex-col sm:flex-row items-center">
                  <div className="flex-shrink-0 mb-4 sm:mb-0">
                    <div className="relative group">
                      <div 
                        className="h-24 w-24 rounded-full bg-white shadow-xl ring-4 ring-white/10 overflow-hidden flex items-center justify-center relative"
                      >
                        {avatar ? (
                          <img 
                            src={avatar} 
                            alt={`${userData.firstName} ${userData.lastName}`} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className="h-full w-full flex items-center justify-center"
                            style={{ backgroundColor: avatarColor }}
                          >
                            <span className="text-4xl font-bold text-white">
                              {getInitials()}
                            </span>
                          </div>
                        )}
                        
                        {/* Upload overlay */}
                        <div 
                          onClick={triggerFileInput}
                          className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 flex items-center justify-center transition-all duration-200 cursor-pointer"
                        >
                          <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                            <CameraIcon className="h-8 w-8 text-white" />
                            <span className="text-xs text-white mt-1 text-center block">
                              {uploadingAvatar ? 'Chargement...' : 'Changer'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        disabled={uploadingAvatar}
                      />
                    </div>
                  </div>
                  <div className="sm:ml-6 text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                      {userData.firstName} {userData.lastName}
                    </h1>
                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center text-sm">
                      <div className="flex items-center justify-center sm:justify-start text-blue-200">
                        <MailIcon className="mr-1.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span>{userData.email}</span>
                      </div>
                      <span className="hidden sm:inline mx-2 text-white/70">•</span>
                      <div className="flex items-center justify-center sm:justify-start mt-1 sm:mt-0 text-blue-200">
                        <PhoneIcon className="mr-1.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span>{userData.telephone || 'Non spécifié'}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white`}>
                        <BadgeCheckIcon className="h-3 w-3 mr-1" />
                        {userData.role}
                      </span>
                      {userData.departement && (
                        <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                          <OfficeBuildingIcon className="h-3 w-3 mr-1" />
                          {userData.departement}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation tabs - add premium styling */}
              <div className="px-6 py-6 sm:px-10">
                <div className="border-b border-gray-200">
                  <div className="flex space-x-8">
                    <button
                      className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                        activeSection === 'personal'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveSection('personal')}
                    >
                      <UserIcon
                        className={`-ml-0.5 mr-2 h-5 w-5 ${activeSection === 'personal' ? 'text-blue-500' : 'text-gray-400'}`}
                      />
                      <span>Informations personnelles</span>
                    </button>
                    <button
                      className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                        activeSection === 'security'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveSection('security')}
                    >
                      <ShieldCheckIcon
                        className={`-ml-0.5 mr-2 h-5 w-5 ${activeSection === 'security' ? 'text-blue-500' : 'text-gray-400'}`}
                      />
                      <span>Sécurité</span>
                    </button>
                    {/* Only show the admins tab for users with admin role */}
                    {userData.role === 'superadmin' && (
                      <button
                        className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                          activeSection === 'admins'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveSection('admins')}
                      >
                        <UsersIcon
                          className={`-ml-0.5 mr-2 h-5 w-5 ${activeSection === 'superadmin' ? 'text-blue-500' : 'text-gray-400'}`}
                        />
                        <span>Gestion des administrateurs</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-8">
                  <AnimatePresence mode="wait">
                    {activeSection === 'personal' && (
                      <motion.div
                        key="personal"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                      >
                        <div className="space-y-8">
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                              <UserIcon className="h-5 w-5 mr-2 text-indigo-500" />
                              Informations personnelles
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                              Gérez vos informations personnelles et comment nous pouvons vous contacter.
                            </p>
                          </div>

                          {/* Avatar upload section - New addition */}
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-4 border-b border-gray-200">
                              <h3 className="text-base font-medium text-gray-900">Photo de profil</h3>
                              <p className="text-sm text-gray-500 mt-1">Votre photo de profil est visible par les autres utilisateurs.</p>
                            </div>
                            
                            <div className="px-8 py-6">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="relative">
                                    <div 
                                      className="h-24 w-24 rounded-full bg-white shadow-xl ring-4 ring-white/10 overflow-hidden flex items-center justify-center relative"
                                    >
                                      {avatar ? (
                                        <img 
                                          src={avatar} 
                                          alt={`${userData.firstName} ${userData.lastName}`} 
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div
                                          className="h-full w-full flex items-center justify-center"
                                          style={{ backgroundColor: avatarColor }}
                                        >
                                          <span className="text-4xl font-bold text-white">
                                            {getInitials()}
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Upload overlay */}
                                      <div 
                                        onClick={triggerFileInput}
                                        className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 flex items-center justify-center transition-all duration-200 cursor-pointer"
                                      >
                                        <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                                          <CameraIcon className="h-8 w-8 text-white" />
                                          <span className="text-xs text-white mt-1 text-center block">
                                            {uploadingAvatar ? 'Chargement...' : 'Changer'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Hidden file input */}
                                    <input
                                      type="file"
                                      ref={fileInputRef}
                                      className="hidden"
                                      accept="image/*"
                                      onChange={handleAvatarChange}
                                      disabled={uploadingAvatar}
                                    />
                                  </div>
                                </div>
                                
                                <div className="ml-4">
                                  <p className="text-sm font-medium text-gray-900">Modifier la photo de profil</p>
                                  <p className="text-xs text-gray-500">Formats acceptés: JPG, PNG, GIF. Taille maximale: 2 Mo.</p>
                                  
                                  <div className="mt-2 flex items-center">
                                    <button
                                      type="button"
                                      onClick={triggerFileInput}
                                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                      <CameraIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                      Modifier la photo
                                    </button>
                                    
                                    {/* Hidden file input for avatar upload */}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleAvatarChange}
                                      className="hidden"
                                      ref={fileInputRef}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Basic information card - wider grid */}
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-4 border-b border-gray-200">
                              <h3 className="text-base font-medium text-gray-900">Informations de base</h3>
                              <p className="text-sm text-gray-500 mt-1">Ces informations sont visibles par les autres utilisateurs</p>
                            </div>
                            
                            <div className="px-8 py-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8">
                                {/* First name - Enhanced */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                      Prénom
                                    </label>
                                    <span className="text-xs text-indigo-500">Obligatoire</span>
                                  </div>
                                  <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                      <UserIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                      type="text"
                                      id="firstName"
                                      name="firstName"
                                      autoComplete="given-name"
                                      value={userData.firstName}
                                      onChange={handleChange}
                                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all duration-200 group-hover:border-indigo-300"
                                      required
                                      placeholder="Votre prénom"
                                    />
                                    <div className="absolute inset-0 rounded-lg shadow-sm pointer-events-none transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 ring-1 ring-indigo-300"></div>
                                  </div>
                                  <p className="text-xs text-gray-500">Votre prénom tel qu'il apparaît sur vos documents officiels</p>
                                </div>

                                {/* Last name - Enhanced */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                      Nom
                                    </label>
                                    <span className="text-xs text-indigo-500">Obligatoire</span>
                                  </div>
                                  <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                      <UserIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                      type="text"
                                      id="lastName"
                                      name="lastName"
                                      autoComplete="family-name"
                                      value={userData.lastName}
                                      onChange={handleChange}
                                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all duration-200 group-hover:border-indigo-300"
                                      required
                                      placeholder="Votre nom de famille"
                                    />
                                    <div className="absolute inset-0 rounded-lg shadow-sm pointer-events-none transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 ring-1 ring-indigo-300"></div>
                                  </div>
                                  <p className="text-xs text-gray-500">Votre nom tel qu'il apparaît sur vos documents officiels</p>
                                </div>
                                
                              </div>
                            </div>
                          </div>

                          {/* Contact information card - wider grid */}
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-4 border-b border-gray-200">
                              <h3 className="text-base font-medium text-gray-900">Coordonnées</h3>
                              <p className="text-sm text-gray-500 mt-1">Comment pouvons-nous vous contacter</p>
                            </div>
                            
                            <div className="px-8 py-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8">
                                {/* Email - Enhanced */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                      Adresse email
                                    </label>
                                    <span className="text-xs text-indigo-500">Obligatoire</span>
                                  </div>
                                  <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                      <MailIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                      type="email"
                                      id="email"
                                      name="email"
                                      autoComplete="email"
                                      value={userData.email}
                                      onChange={handleChange}
                                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 group-hover:border-indigo-300"
                                      required
                                      placeholder="exemple@domaine.com"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                      <BadgeCheckIcon className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div className="absolute inset-0 rounded-lg shadow-sm pointer-events-none transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 ring-1 ring-indigo-300"></div>
                                  </div>
                                  <p className="text-xs text-gray-500 flex items-center">
                                    <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" /> 
                                    Adresse email vérifiée
                                  </p>
                                </div>

                                {/* Phone number - Enhanced */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
                                      Téléphone
                                    </label>
                                    <span className="text-xs text-gray-500">Optionnel</span>
                                  </div>
                                  <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                                      <span className="text-gray-500 border-r border-gray-300 pr-2">+216</span>
                                    </div>
                                    <input
                                      type="tel"
                                      id="telephone"
                                      name="telephone"
                                      autoComplete="tel"
                                      value={userData.telephone}
                                      onChange={handleChange}
                                      className="block w-full pl-24 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 group-hover:border-indigo-300"
                                      placeholder="2X XXX XXX"
                                    />
                                    <div className="absolute inset-0 rounded-lg shadow-sm pointer-events-none transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 ring-1 ring-indigo-300"></div>
                                  </div>
                                  <p className="text-xs text-gray-500">Nous utiliserons ce numéro pour les notifications de sécurité</p>
                                </div>

                              </div>
                              
                             
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}

                    {activeSection === 'security' && (
                      <motion.div
                        key="security"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                      >
                        <div className="space-y-8">
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                              <LockClosedIcon className="h-5 w-5 mr-2 text-indigo-500" />
                              Sécurité du compte
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                              Gérez votre mot de passe et la sécurité de votre compte.
                            </p>
                          </div>

                          {/* Change password */}
                          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Changer votre mot de passe</h3>
                            
                            <div className="space-y-6">
                              {/* Current Password */}
                              <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                  Mot de passe actuel
                                </label>
                                <div className="relative">
                                  <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={userData.currentPassword}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  />
                                  <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  >
                                    {showCurrentPassword ? (
                                      <EyeOffIcon className="h-5 w-5 text-gray-400" />
                                    ) : (
                                      <EyeIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                  </button>
                                  </div>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                  Requis pour changer votre mot de passe
                                </p>
                              </div>
                              
                              {/* New Password */}
                              <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                  Nouveau mot de passe
                                </label>
                                <div className="relative">
                                  <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    name="newPassword"
                                    value={userData.newPassword}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  />
                                  <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                  >
                                    {showNewPassword ? (
                                      <EyeOffIcon className="h-5 w-5 text-gray-400" />
                                    ) : (
                                      <EyeIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                  </button>
                                  </div>

                                  {/* Password strength */}
                                  {userData.newPassword && (
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
                              </div>
                              
                              {/* Confirm Password */}
                              <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                  Confirmation du mot de passe
                                </label>
                                <div className="relative">
                                  <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={userData.confirmPassword}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  />
                                  <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  >
                                    {showConfirmPassword ? (
                                      <EyeOffIcon className="h-5 w-5 text-gray-400" />
                                    ) : (
                                      <EyeIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                  </button>
                                  </div>
                                  
                                  {/* Password match indicator */}
                                  {userData.newPassword && userData.confirmPassword && (
                                    <div className="mt-1 flex items-center">
                                      {userData.newPassword === userData.confirmPassword ? (
                                        <>
                                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                                          <p className="text-xs text-green-600">Les mots de passe correspondent</p>
                                        </>
                                      ) : (
                                        <>
                                          <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                                          <p className="text-xs text-red-600">Les mots de passe ne correspondent pas</p>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            
                            <p className="mt-4 text-sm text-gray-500">
                              Laissez ces champs vides si vous ne souhaitez pas modifier votre mot de passe.
                            </p>
                          </div>
                        
                      </motion.div>
                    )}

                    {activeSection === 'admins' && (
                      <motion.div
                        key="admins"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                      >
                        <div className="space-y-8">
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                              <UsersIcon className="h-5 w-5 mr-2 text-indigo-500" />
                              Gestion des administrateurs
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                              Créez et gérez les comptes administrateurs de la plateforme.
                            </p>
                          </div>

                          <AdminsList 
                            key={adminListKey}
                            onEdit={handleEditAdmin}
                            onDelete={handleDeleteAdmin}
                            onAddNew={handleAddAdmin}
                          />
                          
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-4 border-b border-gray-200">
                              <h3 className="text-base font-medium text-gray-900">Informations importantes</h3>
                            </div>
                            
                            <div className="px-8 py-6">
                              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                                <div className="flex">
                                  <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">Informations de sécurité</h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                      <ul className="list-disc pl-5 space-y-1">
                                        <li>Les comptes administrateurs ont accès à des fonctionnalités sensibles.</li>
                                        <li>Assurez-vous de créer des mots de passe forts et uniques.</li>
                                        <li>Limitez les permissions à ce qui est nécessaire pour chaque administrateur.</li>
                                        <li>Les journaux d'audit enregistrent toutes les actions des administrateurs.</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form actions */}
                  <div className="mt-8 pt-5 border-t border-gray-200">
                    <div className="flex items-center justify-end">
                      {activeSection === 'security' && (
                        <button
                          type="button"
                          onClick={() => setActiveSection('personal')}
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-4"
                        >
                          Précédent
                        </button>
                      )}
                      
                      {activeSection === 'personal' && (
                        <button
                          type="button"
                          onClick={() => setActiveSection('security')}
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-4"
                        >
                          Suivant
                        </button>
                      )}
                      
                      <button
                        type="submit"
                        disabled={saving}
                        className={`inline-flex justify-center items-center py-3 px-8 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          saving 
                            ? 'bg-indigo-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                        }`}
                      >
                        {saving ? (
                          <>
                            <RefreshIcon className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <SaveIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                            Enregistrer les modifications
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Admin modal - Add this at the end of the component */}
        {showAdminModal && (
          <AdminModal
            isOpen={showAdminModal}
            onClose={() => setShowAdminModal(false)}
            onSave={handleSaveAdmin}
            admin={selectedAdmin}
            modalType={adminModalType}
            loading={adminLoading}
            error={adminError}
          />
        )}
      </div>
    </div>
  );
};

export default UserSettings;