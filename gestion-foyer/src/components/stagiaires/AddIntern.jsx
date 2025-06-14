import React, { useState, useRef, useEffect } from 'react';
import { createInternStagiaire, updateStagiaire } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

const AddIntern = ({ onCancel, onSave, initialData = null, isEditing = false }) => {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(initialData?.profilePhoto || null);
  const [dragActive, setDragActive] = useState(false);
  const [animatePhoto, setAnimatePhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const permissions = usePermissions();

  const [formData, setFormData] = useState(initialData || {
    firstName: '',
    lastName: '',
    cinNumber: '',
    cinPlace: '',
    cinDate: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    currentSituation: '',
    phoneNumber: '',
    sendingAddress: '',
    city: '',
    postalCode: '',
    centerName: '',
    specialization: '',
    cycle: '',
    sessionYear: new Date().getFullYear().toString(),
    email: '',
    sexe: 'garcon',
    fatherFirstName: '',
    fatherLastName: '',
    fatherPhone: '',
    fatherJob: '',
    fatherJobPlace: '',
    motherFirstName: '',
    motherLastName: '',
    motherPhone: '',
    motherJob: '',
    motherJobPlace: '',
    numberOfBrothers: 0,
    numberOfSisters: 0,
    hobby: '',
    trainingPeriodFrom: '',
    trainingPeriodTo: '',
    profilePhoto: null,
    // Add accommodation card field
    carteHebergement: 'non', // Default to 'non'

    // Payment fields
    restauration: false,
    foyer: false,
    inscription: false,
    restaurationStatus: 'payé',
    foyerStatus: 'payé',
    inscriptionStatus: 'payé',
    restaurationSemester1: '',
    restaurationSemester2: '',
    restaurationSemester3: '',
    foyerSemester1: '',
    foyerSemester2: '',
    foyerSemester3: '',
    inscriptionSemester1: '',
    inscriptionSemester2: '',
    inscriptionSemester3: '',
  });

  // Animation d'entrée pour la photo
  useEffect(() => {
    setTimeout(() => setAnimatePhoto(true), 300);
  }, []);

  // Add this helper function to format dates for HTML inputs
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  // Update the useEffect to handle all data initialization for editing
  useEffect(() => {
    if (isEditing && initialData) {
      // Set all form data including dates
      setFormData(prevData => ({
        ...prevData,
        ...initialData,
        // Format dates for HTML date inputs
        dateOfBirth: formatDateForInput(initialData.dateOfBirth),
        cinDate: formatDateForInput(initialData.cinDate),
        dateArrivee: formatDateForInput(initialData.dateArrivee),
        dateDepart: formatDateForInput(initialData.dateDepart),
        trainingPeriodFrom: formatDateForInput(initialData.trainingPeriodFrom),
        trainingPeriodTo: formatDateForInput(initialData.trainingPeriodTo),
        
        // Handle payment data if it exists in the new structure
        ...(initialData.payment && {
          restauration: initialData.payment.restaurationFoyer?.enabled || false,
          foyer: initialData.payment.restaurationFoyer?.enabled || false,
          inscription: initialData.payment.inscription?.enabled || false,
          restaurationStatus: initialData.payment.restaurationFoyer?.status || 'payé',
          foyerStatus: initialData.payment.restaurationFoyer?.status || 'payé',
          inscriptionStatus: initialData.payment.inscription?.status || 'payé',
          restaurationSemester1: initialData.payment.restaurationFoyer?.semester1Price ? initialData.payment.restaurationFoyer.semester1Price.toString() : '',
          restaurationSemester2: initialData.payment.restaurationFoyer?.semester2Price ? initialData.payment.restaurationFoyer.semester2Price.toString() : '',
          restaurationSemester3: initialData.payment.restaurationFoyer?.semester3Price ? initialData.payment.restaurationFoyer.semester3Price.toString() : '',
          foyerSemester1: initialData.payment.restaurationFoyer?.semester1Price ? initialData.payment.restaurationFoyer.semester1Price.toString() : '',
          foyerSemester2: initialData.payment.restaurationFoyer?.semester2Price ? initialData.payment.restaurationFoyer.semester2Price.toString() : '',
          foyerSemester3: initialData.payment.restaurationFoyer?.semester3Price ? initialData.payment.restaurationFoyer.semester3Price.toString() : '',
          inscriptionAnnual: initialData.payment.inscription?.annualPrice ? initialData.payment.inscription.annualPrice.toString() : ''
        })
      }));
    }
  }, [isEditing, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: value === '' ? '' : Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.match('image.*')) {
      alert('Veuillez sélectionner une image valide.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target.result;
      setPreviewImage(base64Image);
      setFormData({ ...formData, profilePhoto: base64Image });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setPreviewImage(null);
    setFormData({ ...formData, profilePhoto: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;

      // Prepare submission data with proper gender handling
      const submissionData = {
        ...formData,
        sexe: formData.sexe || 'garcon', // Ensure gender is always set
        email: formData.email || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@example.com`,
        dateArrivee: formData.trainingPeriodFrom,
        dateDepart: formData.trainingPeriodTo,
        entreprise: formData.centerName,
        type: 'interne' // Ensure type is set for internal stagiaires
      };

      if (isEditing) {
        response = await updateStagiaire(initialData._id, submissionData);
      } else {
        response = await createInternStagiaire(submissionData);
      }

      setLoading(false);
      // Passer les données de la réponse au composant parent
      onSave(response.data.stagiaire);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Une erreur s'est produite lors de l'enregistrement.");
      console.error("Erreur lors de l'enregistrement:", err);
    }
  };

  const fillTestData = () => {
    const testData = {
      firstName: 'Mahdi',
      lastName: 'Nasri',
      cinNumber: '09876543',
      cinPlace: 'Tunis',
      cinDate: '2020-05-15',
      dateOfBirth: '1998-03-12',
      placeOfBirth: 'Sousse',
      nationality: 'Tunisienne',
      currentSituation: 'Stagiaire',
      phoneNumber: '55123456',
      sendingAddress: '25 Rue Ibn Khaldoun',
      city: 'Tunis',
      postalCode: '1002',
      centerName: 'Institut Supérieur d\'Informatique',
      specialization: 'Développement Web',
      cycle: 'sep',
      sessionYear: new Date().getFullYear().toString(),
      email: 'mahdi.nasri@example.com',
      sexe: 'garcon',
      carteHebergement: 'oui', // Add to test data
      fatherFirstName: 'Ahmed',
      fatherLastName: 'Nasri',
      fatherPhone: '98765432',
      fatherJob: 'Ingénieur',
      fatherJobPlace: 'Société ABC',
      motherFirstName: 'Fatima',
      motherLastName: 'Nasri',
      motherPhone: '55667788',
      motherJob: 'Médecin',
      motherJobPlace: 'Hôpital X',
      numberOfBrothers: 1,
      numberOfSisters: 2,
      hobby: 'Football, Lecture, Voyages',
      trainingPeriodFrom: '2023-09-01',
      trainingPeriodTo: '2024-06-30',
      restauration: true,
      foyer: true,
      inscription: true,
      restaurationStatus: 'payé',
      foyerStatus: 'payé',
      inscriptionStatus: 'dispensé',
      restaurationSemester1: '120.00',
      restaurationSemester2: '120.00',
      restaurationSemester3: '120.00',
      foyerSemester1: '120.00',
      foyerSemester2: '120.00',
      foyerSemester3: '120.00',
      inscriptionSemester1: '',
      inscriptionSemester2: '',
      inscriptionSemester3: '',
    };

    setFormData(testData);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Generate options for 5 years back and 5 years forward
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
      years.push(
        <option key={year} value={year.toString()}>
          {year}
        </option>
      );
    }
    
    return years;
  };

  const inputClass = "mt-1 block w-full px-4 py-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all duration-200 ease-in-out";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sectionHeaderClass = "text-xl font-bold text-blue-700 mb-6 pb-2 border-b-2 border-blue-200 flex items-center gap-2";
  const sectionClass = "bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8";

  // Add this condition at the beginning of the component
  if (!permissions.canCreate && !initialData) {
    return (
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-full mx-auto my-4 w-[98%]">
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Accès Restreint</h3>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour ajouter des stagiaires.</p>
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!permissions.canEdit && initialData) {
    return (
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-full mx-auto my-4 w-[98%]">
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Mode Lecture Seule</h3>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour modifier les stagiaires.</p>
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 max-w-full mx-auto my-4 w-[98%]">
      {/* Back Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => {
            if (onCancel) {
              onCancel(); // Use the onCancel prop if provided
            } else {
              navigate('/stagiaires'); // Fallback to navigation
            }
          }}
          className="group inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux stagiaires
        </button>
      </div>

      <h2 className="text-4xl font-bold text-blue-800 mb-5 text-center">
        {isEditing ? 'Modifier un Stagiaire' : 'Ajouter un Stagiaire'}
      </h2>

      {/* Bouton de test pour remplir automatiquement le formulaire */}
      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={fillTestData}
          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors border border-indigo-200 flex items-center shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Remplir avec données test
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photo de profil - NOUVELLE SECTION PREMIUM */}
        <div className={`${sectionClass} relative overflow-hidden`}>
          {/* Éléments décoratifs de fond */}
          <div className="absolute w-64 h-64 rounded-full bg-blue-50 -top-20 -right-20 opacity-50"></div>
          <div className="absolute w-40 h-40 rounded-full bg-indigo-50 -bottom-10 -left-10 opacity-50"></div>

          <h3 className={sectionHeaderClass}>
            <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-lg">📷</span>
            Photo de Profil
          </h3>

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            {/* Zone de téléchargement premium */}
            <div
              className={`
                transition-all duration-500 ease-out transform
                ${animatePhoto ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
              `}
            >
              <div
                className={`
                  relative w-60 h-60 mx-auto overflow-hidden rounded-xl shadow-2xl
                  transition-all duration-300 ease-out cursor-pointer
                  ${dragActive ? 'ring-4 ring-blue-500/50 scale-[1.02]' : 'hover:scale-[1.01]'}
                  ${previewImage ? '' : 'bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-dashed border-blue-300'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={!previewImage ? triggerFileSelect : undefined}
              >
                {/* Fond avec effet de morphisme de verre quand pas d'image */}
                {!previewImage && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
                )}

                {/* Aperçu de l'image */}
                {previewImage ? (
                  <>
                    <img
                      src={previewImage}
                      alt="Aperçu"
                      className="h-full w-full object-cover transition-all duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                      <div className="space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerFileSelect();
                          }}
                          className="px-3 py-2 bg-white text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors shadow-lg"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(e);
                          }}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-lg"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 relative z-10">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <h4 className="text-blue-800 font-bold mb-1">Ajouter une photo</h4>
                    <p className="text-blue-600/70 mb-4 text-sm">Glisser & déposer ou cliquer pour sélectionner</p>
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Parcourir
                    </span>
                  </div>
                )}

                {/* Input file caché */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Badge premium de qualité d'image */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-xs text-white px-2 py-1 rounded-full shadow-lg">
                PHOTO
              </div>
            </div>

            {/* Conseils et informations */}
            <div className={`
              flex-1 space-y-4 transition-all duration-500 ease-out transform
              ${animatePhoto ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
              delay-100
            `}>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                <h4 className="text-blue-800 font-bold flex items-center gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Conseils pour une photo parfaite
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-blue-800">Utilisez une photo professionnelle récente</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-blue-800">Assurez-vous que votre visage est bien visible</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-blue-800">Choisissez un fond neutre et bien éclairé</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-blue-800">Évitez les filtres ou effets excessifs</span>
                  </li>
                </ul>
              </div>

              {/* Formats acceptés */}
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Formats acceptés :</span> JPG, PNG, WEBP
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Taille maximale :</span> 5 MB
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className={sectionClass}>
          <h3 className={sectionHeaderClass}>
            <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">👤</span>
            Informations Personnelles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="firstName" className={labelClass}>
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Prénom"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>
                Nom
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Nom"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="sexe" className={labelClass}>
                Genre *
              </label>
              <select
                id="sexe"
                name="sexe"
                value={formData.sexe}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="garcon">👦 Garçon</option>
                <option value="fille">👧 Fille</option>
              </select>
            </div>
            <div>
              <label htmlFor="dateOfBirth" className={labelClass}>
                Date de naissance
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="placeOfBirth" className={labelClass}>
                Lieu de naissance
              </label>
              <input
                type="text"
                id="placeOfBirth"
                name="placeOfBirth"
                value={formData.placeOfBirth}
                onChange={handleChange}
                placeholder="Lieu de naissance"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="nationality" className={labelClass}>
                Nationalité
              </label>
              <input
                type="text"
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="Nationalité"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="currentSituation" className={labelClass}>
                Situation actuelle
              </label>
              <select
                id="currentSituation"
                name="currentSituation"
                value={formData.currentSituation}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Sélectionnez une option</option>
                <option value="Célibataire">Célibataire</option>
                <option value="Marié">Marié</option>
              </select>
            </div>
          </div>
        </div>

        {/* CIN Information Section */}
        <div className={sectionClass}>
          <h3 className={sectionHeaderClass}>
            <span className="bg-purple-100 text-purple-700 p-1.5 rounded-lg">🆔</span>
            Informations CIN
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="cinNumber" className={labelClass}>
                Numéro CIN
              </label>
              <input
                type="text"
                id="cinNumber"
                name="cinNumber"
                value={formData.cinNumber}
                onChange={handleChange}
                placeholder="Numéro CIN"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="cinPlace" className={labelClass}>
                Lieu de délivrance
              </label>
              <input
                type="text"
                id="cinPlace"
                name="cinPlace"
                value={formData.cinPlace}
                onChange={handleChange}
                placeholder="Lieu de délivrance"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="cinDate" className={labelClass}>
                Date de délivrance
              </label>
              <input
                type="date"
                id="cinDate"
                name="cinDate"
                value={formData.cinDate}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className={sectionClass}>
          <h3 className={sectionHeaderClass}>
            <span className="bg-green-100 text-green-700 p-1.5 rounded-lg">📱</span>
            Informations de Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="phoneNumber" className={labelClass}>
                Numéro de téléphone
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Numéro de téléphone"
                required
                className={inputClass}
              />
            </div>

            {/* Ajout du champ email */}
            <div>
              <label htmlFor="email" className={labelClass}>
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="exemple@email.com"
                required
                className={inputClass}
              />
            </div>

            {/* Adresse complète - prend toute la ligne */}
            <div className="md:col-span-3 mt-4">
              <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                Adresse
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <label htmlFor="sendingAddress" className={labelClass}>
                    Adresse d'envoi
                  </label>
                  <input
                    type="text"
                    id="sendingAddress"
                    name="sendingAddress"
                    value={formData.sendingAddress}
                    onChange={handleChange}
                    placeholder="Rue, numéro, bâtiment..."
                    required
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="city" className={labelClass}>
                    Ville
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Ville"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className={labelClass}>
                    Code postal
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Code postal"
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Information Section */}
        <div className={sectionClass}>
          <h3 className={sectionHeaderClass}>
            <span className="bg-amber-100 text-amber-700 p-1.5 rounded-lg">🎓</span>
            Informations Éducatives
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="centerName" className={labelClass}>
                Nom du centre
              </label>
              <input
                type="text"
                id="centerName"
                name="centerName"
                value={formData.centerName}
                onChange={handleChange}
                placeholder="Nom du centre"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="specialization" className={labelClass}>
                Spécialisation
              </label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="Spécialisation"
                className={inputClass}
              />
            </div>

            {/* Replace the single cycle dropdown with a grid of two fields */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="cycle" className={labelClass}>
                  Session
                </label>
                <select
                  id="cycle"
                  name="cycle"
                  value={formData.cycle}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Sélectionnez une session</option>
                  <option value="sep">Septembre</option>
                  <option value="nov">Novembre</option>
                  <option value="fev">Février</option>
                </select>
              </div>
              <div>
                <label htmlFor="sessionYear" className={labelClass}>
                  Année de session
                </label>
                <select
                  id="sessionYear"
                  name="sessionYear"
                  value={formData.sessionYear}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Sélectionnez une année</option>
                  {generateYearOptions()}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="trainingPeriodFrom" className={labelClass}>
                Début de formation ou stage
              </label>
              <input
                type="date"
                id="trainingPeriodFrom"
                name="trainingPeriodFrom"
                value={formData.trainingPeriodFrom}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="trainingPeriodTo" className={labelClass}>
                Fin de formation ou stage
              </label>
              <input
                type="date"
                id="trainingPeriodTo"
                name="trainingPeriodTo"
                value={formData.trainingPeriodTo}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Father Information Section */}
        <div className={sectionClass}>
          <h3 className={sectionHeaderClass}>
            <span className="bg-red-100 text-red-700 p-1.5 rounded-lg">👨</span>
            Informations du Père
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="fatherFirstName" className={labelClass}>
                Prénom du père
              </label>
              <input
                type="text"
                id="fatherFirstName"
                name="fatherFirstName"
                value={formData.fatherFirstName}
                onChange={handleChange}
                placeholder="Prénom du père"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="fatherLastName" className={labelClass}>
                Nom du père
              </label>
              <input
                type="text"
                id="fatherLastName"
                name="fatherLastName"
                value={formData.fatherLastName}
                onChange={handleChange}
                placeholder="Nom du père"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="fatherPhone" className={labelClass}>
                Téléphone du père
              </label>
              <input
                type="text"
                id="fatherPhone"
                name="fatherPhone"
                value={formData.fatherPhone}
                onChange={handleChange}
                placeholder="Téléphone du père"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="fatherJob" className={labelClass}>
                Profession du père
              </label>
              <input
                type="text"
                id="fatherJob"
                name="fatherJob"
                value={formData.fatherJob}
                onChange={handleChange}
                placeholder="Profession du père"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="fatherJobPlace" className={labelClass}>
                Lieu de travail du père
              </label>
              <input
                type="text"
                id="fatherJobPlace"
                name="fatherJobPlace"
                value={formData.fatherJobPlace}
                onChange={handleChange}
                placeholder="Lieu de travail du père"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Mother Information Section */}
        <div className={sectionClass}>
          <h3 className={sectionHeaderClass}>
            <span className="bg-pink-100 text-pink-700 p-1.5 rounded-lg">👩</span>
            Informations de la Mère
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="motherFirstName" className={labelClass}>
                Prénom de la mère
              </label>
              <input
                type="text"
                id="motherFirstName"
                name="motherFirstName"
                value={formData.motherFirstName}
                onChange={handleChange}
                placeholder="Prénom de la mère"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="motherLastName" className={labelClass}>
                Nom de la mère
              </label>
              <input
                type="text"
                id="motherLastName"
                name="motherLastName"
                value={formData.motherLastName}
                onChange={handleChange}
                placeholder="Nom de la mère"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="motherPhone" className={labelClass}>
                Téléphone de la mère
              </label>
              <input
                type="text"
                id="motherPhone"
                name="motherPhone"
                value={formData.motherPhone}
                onChange={handleChange}
                placeholder="Téléphone de la mère"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="motherJob" className={labelClass}>
                Profession de la mère
              </label>
              <input
                type="text"
                id="motherJob"
                name="motherJob"
                value={formData.motherJob}
                onChange={handleChange}
                placeholder="Profession de la mère"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="motherJobPlace" className={labelClass}>
                Lieu de travail de la mère
              </label>
              <input
                type="text"
                id="motherJobPlace"
                name="motherJobPlace"
                value={formData.motherJobPlace}
                onChange={handleChange}
                placeholder="Lieu de travail de la mère"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Additional Information Section - Add Carte d'hébergement here */}
        <div className={sectionClass}>
          <h3 className={sectionHeaderClass}>
            <span className="bg-cyan-100 text-cyan-700 p-1.5 rounded-lg">➕</span>
            Informations Supplémentaires
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="numberOfBrothers" className={labelClass}>
                Nombre de frères
              </label>
              <input
                type="number"
                id="numberOfBrothers"
                name="numberOfBrothers"
                value={formData.numberOfBrothers}
                onChange={handleChange}
                min="0"
                placeholder="Nombre de frères"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="numberOfSisters" className={labelClass}>
                Nombre de sœurs
              </label>
              <input
                type="number"
                id="numberOfSisters"
                name="numberOfSisters"
                value={formData.numberOfSisters}
                onChange={handleChange}
                min="0"
                placeholder="Nombre de sœurs"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="hobby" className={labelClass}>
                Loisirs
              </label>
              <input
                type="text"
                id="hobby"
                name="hobby"
                value={formData.hobby}
                onChange={handleChange}
                placeholder="Loisirs"
                className={inputClass}
              />
            </div>
            
            {/* Add Carte d'hébergement field */}
            <div className="md:col-span-3 mt-6">
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                  🏠 Carte d'Hébergement
                </h4>
                <div className="flex items-center space-x-6">
                  <span className="text-sm font-medium text-gray-700">Le stagiaire a-t-il une carte d'hébergement ?</span>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="carteHebergement"
                        value="oui"
                        checked={formData.carteHebergement === 'oui'}
                        onChange={handleChange}
                        className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">✅ Oui</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="carteHebergement"
                        value="non"
                        checked={formData.carteHebergement === 'non'}
                        onChange={handleChange}
                        className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">❌ Non</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information Section */}
        <div className={sectionClass}>
          <h3 className={sectionHeaderClass}>
            <span className="bg-emerald-100 text-emerald-700 p-1.5 rounded-lg">💰</span>
            Informations de Paiement
          </h3>
          
          <div className="space-y-6">
            {/* Combined Restauration & Foyer - MERGED WITH SHARED VALUES */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="restaurationFoyer"
                  name="restaurationFoyer"
                  checked={formData.restauration || formData.foyer}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setFormData({
                      ...formData,
                      restauration: isChecked,
                      foyer: isChecked
                    });
                  }}
                  className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="restaurationFoyer" className="ml-3 text-lg font-medium text-gray-700">
                  Restauration & Foyer (Hébergement)
                </label>
              </div>
              
              {(formData.restauration || formData.foyer) && (
                <div className="ml-7 space-y-4">
                  {/* Combined Status Selection */}
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                      🍽️🏠 Restauration & Foyer
                    </h4>
                    
                    {/* Combined Status Selection */}
                    <div className="flex space-x-4 mb-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="restaurationStatus"
                          value="payé"
                          checked={formData.restaurationStatus === 'payé' && formData.foyerStatus === 'payé'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                restaurationStatus: 'payé',
                                foyerStatus: 'payé'
                              });
                            }
                          }}
                          className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Payé</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="restaurationStatus"
                          value="dispensé"
                          checked={formData.restaurationStatus === 'dispensé' && formData.foyerStatus === 'dispensé'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                restaurationStatus: 'dispensé',
                                foyerStatus: 'dispensé'
                              });
                            }
                          }}
                          className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Dispensé</span>
                      </label>
                    </div>
                    
                    {/* Shared Price Inputs - Single set for both Restauration & Foyer */}
                    {formData.restaurationStatus === 'payé' && formData.foyerStatus === 'payé' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label htmlFor="restaurationFoyerTrimestre1" className={labelClass}>
                              Trimestre 1 (DT)
                            </label>
                            <input
                              type="number"
                              id="restaurationFoyerTrimestre1"
                              name="restaurationSemester1"
                              value={formData.restaurationSemester1}
                              onChange={(e) => {
                                // Update both restauration and foyer with same value
                                setFormData({
                                  ...formData,
                                  restaurationSemester1: e.target.value,
                                  foyerSemester1: e.target.value
                                });
                              }}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label htmlFor="restaurationFoyerTrimestre2" className={labelClass}>
                              Trimestre 2 (DT)
                            </label>
                            <input
                              type="number"
                              id="restaurationFoyerTrimestre2"
                              name="restaurationSemester2"
                              value={formData.restaurationSemester2}
                              onChange={(e) => {
                                // Update both restauration and foyer with same value
                                setFormData({
                                  ...formData,
                                  restaurationSemester2: e.target.value,
                                  foyerSemester2: e.target.value
                                });
                              }}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label htmlFor="restaurationFoyerTrimestre3" className={labelClass}>
                              Trimestre 3 (DT)
                            </label>
                            <input
                              type="number"
                              id="restaurationFoyerTrimestre3"
                              name="restaurationSemester3"
                              value={formData.restaurationSemester3 || ''}
                              onChange={(e) => {
                                // Update both restauration and foyer with same value
                                setFormData({
                                  ...formData,
                                  restaurationSemester3: e.target.value,
                                  foyerSemester3: e.target.value
                                });
                              }}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className={inputClass}
                            />
                          </div>
                        </div>
                        
                        {/* Total Summary */}
                        <div className="bg-white p-3 rounded-md border border-gray-200 mt-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-emerald-700">Total Restauration & Foyer:</span>
                            <span className="font-bold text-emerald-800">
                              {((parseFloat(formData.restaurationSemester1) || 0) + 
                                (parseFloat(formData.restaurationSemester2) || 0) + 
                                (parseFloat(formData.restaurationSemester3) || 0)).toFixed(2)} DT
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Inscription - Annual Payment */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="inscription"
                  name="inscription"
                  checked={formData.inscription}
                  onChange={handleChange}
                  className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="inscription" className="ml-3 text-lg font-medium text-gray-700">
                  Inscription (Annuelle)
                </label>
              </div>
              
              {formData.inscription && (
                <div className="ml-7 space-y-4">
                  {/* Status Selection */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                      📋 Inscription Annuelle
                    </h4>
                    
                    <div className="flex space-x-4 mb-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="inscriptionStatus"
                          value="payé"
                          checked={formData.inscriptionStatus === 'payé'}
                          onChange={handleChange}
                          className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Payé</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="inscriptionStatus"
                          value="dispensé"
                          checked={formData.inscriptionStatus === 'dispensé'}
                          onChange={handleChange}
                          className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Dispensé</span>
                      </label>
                    </div>
                    
                    {/* Annual Price Input */}
                    {formData.inscriptionStatus === 'payé' && (
                      <div className="space-y-4">
                        <div className="max-w-xs">
                          <label htmlFor="inscriptionAnnual" className={labelClass}>
                            Montant Annuel (DT)
                          </label>
                          <input
                            type="number"
                            id="inscriptionAnnual"
                            name="inscriptionAnnual"
                            value={formData.inscriptionAnnual || ''}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className={inputClass}
                          />
                        </div>
                        
                        {/* Annual Total Summary */}
                        <div className="bg-white p-3 rounded-md border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-purple-700">Total Inscription Annuelle:</span>
                            <span className="font-bold text-purple-800">
                              {(parseFloat(formData.inscriptionAnnual) || 0).toFixed(2)} DT
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Summary - Updated for annual inscription */}
            {(formData.restauration || formData.foyer || formData.inscription) && (
              <div className="mt-6 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                <h4 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Résumé des Paiements
                </h4>
                <div className="space-y-3">
                  {(formData.restauration || formData.foyer) && (
                    <div className="flex justify-between items-center py-2 px-3 bg-white rounded-md border border-emerald-100">
                      <span className="text-sm font-medium text-gray-700">
                        🍽️🏠 Restauration & Foyer (Trimestres - {formData.restaurationStatus}):
                      </span>
                      <span className="font-semibold text-blue-700">
                        {formData.restaurationStatus === 'payé' 
                          ? `${((parseFloat(formData.restaurationSemester1) || 0) + 
                               (parseFloat(formData.restaurationSemester2) || 0) + 
                               (parseFloat(formData.restaurationSemester3) || 0)).toFixed(2)} DT`
                          : 'Dispensé'
                        }
                      </span>
                    </div>
                  )}
                  
                  {formData.inscription && (
                    <div className="flex justify-between items-center py-2 px-3 bg-white rounded-md border border-emerald-100">
                      <span className="text-sm font-medium text-gray-700">
                        📋 Inscription (Annuelle - {formData.inscriptionStatus}):
                      </span>
                      <span className="font-semibold text-purple-700">
                        {formData.inscriptionStatus === 'payé' 
                          ? `${(parseFloat(formData.inscriptionAnnual) || 0).toFixed(2)} DT`
                          : 'Dispensé'
                        }
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t border-emerald-200 pt-3 mt-3">
                    <div className="flex justify-between items-center py-2 px-3 bg-emerald-100 rounded-md">
                      <span className="font-bold text-emerald-800">Total à payer:</span>
                      <span className="font-bold text-lg text-emerald-800">
                        {(() => {
                          let total = 0;
                          // For combined restauration & foyer, only count once
                          if ((formData.restauration || formData.foyer) && formData.restaurationStatus === 'payé') {
                            total += (parseFloat(formData.restaurationSemester1) || 0) + 
                                    (parseFloat(formData.restaurationSemester2) || 0) + 
                                    (parseFloat(formData.restaurationSemester3) || 0);
                          }
                          // Annual inscription
                          if (formData.inscription && formData.inscriptionStatus === 'payé') {
                            total += (parseFloat(formData.inscriptionAnnual) || 0);
                          }
                          return `${total.toFixed(2)} DT`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buttons with premium styling */}
        <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="group px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all flex items-center shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Annuler
          </button>

          {/* Modifier le bouton de soumission pour montrer l'état de chargement */}
          <button
            type="submit"
            disabled={loading}
            className="group px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traitement en cours...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isEditing ? 'Mettre à jour' : 'Ajouter'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddIntern;