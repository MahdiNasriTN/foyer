import React, { useState, useRef, useEffect } from 'react';
import { createExternStagiaire, updateStagiaire } from '../../services/api';

const AddExternIntern = ({ onCancel, onSave, initialData = null, isEditing = false }) => {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(initialData?.profilePhoto || null);
  const [dragActive, setDragActive] = useState(false);
  const [animatePhoto, setAnimatePhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState(initialData || {
    firstName: '',
    lastName: '',
    cinNumber: '',
    dateOfBirth: '',
    placeOfBirth: '',
    assignedCenter: '',
    specialization: '',
    groupNumber: '',
    trainingPeriodFrom: '',
    trainingPeriodTo: '',
    email: '',
    phoneNumber: '',
    profilePhoto: null,
  });

  // Animation d'entrée pour la photo
  useEffect(() => {
    setTimeout(() => setAnimatePhoto(true), 300);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Gestionnaires pour la photo de profil
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };
  
  const handleFileUpload = (file) => {
    if (file && file.type.substring(0, 5) === "image") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData(prev => ({
          ...prev,
          profilePhoto: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };
  
  const removeImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({
      ...prev,
      profilePhoto: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;

      // Ajouter les champs sexe et email requis par le modèle MongoDB
      const submissionData = {
        ...formData,
        sexe: formData.sexe || 'garcon', // Valeur par défaut
        email: formData.email || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@example.com`,
        dateArrivee: formData.trainingPeriodFrom,
        dateDepart: formData.trainingPeriodTo,
        entreprise: formData.assignedCenter
      };

      if (isEditing) {
        response = await updateStagiaire(initialData._id, submissionData);
      } else {
        response = await createExternStagiaire(submissionData);
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

  // Updated styling classes with new premium color scheme
  const inputClass = "mt-1 block w-full px-4 py-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none transition-all duration-200 ease-in-out";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sectionHeaderClass = "text-xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-indigo-200 flex items-center gap-2";
  const sectionClass = "bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8";

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50/50 shadow-xl rounded-2xl p-8 max-w-full mx-auto my-4 w-[98%]">
      <h2 className="text-4xl font-bold text-indigo-900 mb-10 text-center flex items-center justify-center">
        <span className="bg-indigo-100 p-3 rounded-full mr-4 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
          </svg>
        </span>
        <span className="bg-gradient-to-r from-indigo-700 to-purple-700 text-transparent bg-clip-text">
          Ajouter un Stagiaire Externe
        </span>
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photo de profil - SECTION PREMIUM */}
        <div className={`${sectionClass} relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/50`}>
          {/* Éléments décoratifs de fond */}
          <div className="absolute w-64 h-64 rounded-full bg-indigo-50 -top-20 -right-20 opacity-50"></div>
          <div className="absolute w-40 h-40 rounded-full bg-purple-50 -bottom-10 -left-10 opacity-50"></div>
          
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
                  ${dragActive ? 'ring-4 ring-indigo-500/50 scale-[1.02]' : 'hover:scale-[1.01]'}
                  ${previewImage ? '' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-300'}
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
                          className="px-3 py-2 bg-white text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors shadow-lg"
                        >
                          Modifier
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage();
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
                    <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <h4 className="text-indigo-800 font-bold mb-1">Ajouter une photo</h4>
                    <p className="text-indigo-600/70 mb-4 text-sm">Glisser & déposer ou cliquer pour sélectionner</p>
                    <span className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors inline-flex items-center shadow-md">
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
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-xs text-white px-2 py-1 rounded-full shadow-lg">
                PHOTO
              </div>
            </div>
            
            {/* Conseils et informations */}
            <div className={`
              flex-1 space-y-4 transition-all duration-500 ease-out transform
              ${animatePhoto ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
              delay-100
            `}>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100 shadow-inner">
                <h4 className="text-indigo-800 font-bold flex items-center gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Conseils pour une photo parfaite
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-indigo-800">Utilisez une photo professionnelle récente</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-indigo-800">Assurez-vous que votre visage est bien visible</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-indigo-800">Choisissez un fond neutre et bien éclairé</span>
                  </li>
                </ul>
              </div>
              
              {/* Formats acceptés */}
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-md">
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
        <div className={`${sectionClass} bg-gradient-to-br from-white to-indigo-50/30`}>
          <h3 className={sectionHeaderClass}>
            <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-lg">👤</span>
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
                required
                className={inputClass}
              />
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
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className={inputClass}
              />
            </div>
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
          </div>
        </div>

        {/* Training Information Section */}
        <div className={`${sectionClass} bg-gradient-to-br from-white to-indigo-50/30`}>
          <h3 className={sectionHeaderClass}>
            <span className="bg-purple-100 text-purple-700 p-1.5 rounded-lg">🎓</span>
            Informations de Formation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="assignedCenter" className={labelClass}>
                Centre assigné
              </label>
              <input
                type="text"
                id="assignedCenter"
                name="assignedCenter"
                value={formData.assignedCenter}
                onChange={handleChange}
                placeholder="Centre assigné"
                required
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
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="groupNumber" className={labelClass}>
                Numéro de groupe
              </label>
              <input
                type="text"
                id="groupNumber"
                name="groupNumber"
                value={formData.groupNumber}
                onChange={handleChange}
                placeholder="Numéro de groupe"
                required
                className={inputClass}
              />
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
                required
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
                required
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Buttons with premium styling */}
        <div className="flex justify-between items-center pt-6 border-t-2 border-indigo-100">
          <button
            type="button"
            onClick={onCancel}
            className="group px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all flex items-center shadow-sm hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Annuler
          </button>
          
          <button
            type="submit"
            className="group px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isEditing ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExternIntern;