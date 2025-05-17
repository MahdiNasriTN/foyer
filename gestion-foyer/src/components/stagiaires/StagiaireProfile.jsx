import React from 'react';
import { 
  ArrowNarrowLeftIcon,
  PencilAltIcon,
  TrashIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  OfficeBuildingIcon,
  LocationMarkerIcon,
  BriefcaseIcon,
  CheckCircleIcon
} from '@heroicons/react/outline';
import { UserCircleIcon, StatusOnlineIcon, StatusOfflineIcon } from '@heroicons/react/solid';

const StagiaireProfile = ({ stagiaire, chambre, animation, onBack, onEdit, onDelete }) => {
  // Vérifier si le stagiaire est actif (stage en cours)
  const isStagiaireActif = () => {
    const now = new Date();
    const arrivee = new Date(stagiaire.dateArrivee);
    const depart = new Date(stagiaire.dateDepart);
    return now >= arrivee && now <= depart;
  };

  // Remplacer cette fonction qui cause l'erreur
  const getDisplayableChambre = (chambre) => {
    if (!chambre) return "Pas de chambre assignée";
    
    if (typeof chambre === 'object') {
      return chambre.numero ? `Chambre ${chambre.numero}` : "Pas de chambre assignée";
    }
    
    return `Chambre ${chambre}`;
  };
  
  return (
    <div className={`transition-all duration-500 ${animation ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      <div className="bg-gradient-to-br from-slate-100 to-cyan-50 rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-200">
        <div className="relative h-40 bg-gradient-to-r from-cyan-600 to-blue-600">
          {/* Pattern de fond */}
          <div className="absolute inset-0 opacity-20" 
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 2 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")" }}></div>
          
          {/* Bouton retour */}
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 bg-white/70 hover:bg-white/90 text-gray-700 p-2 rounded-full transition-all duration-200 backdrop-blur-sm group shadow-sm"
          >
            <ArrowNarrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
          </button>
          
          {/* Badge rôle */}
          <div className="absolute top-4 right-4 px-3 py-1 bg-white/70 backdrop-blur-md rounded-full text-xs font-medium text-gray-700 border border-white/20 shadow-sm">
            <div className="flex items-center">
              <BriefcaseIcon className="h-3.5 w-3.5 mr-1.5 text-cyan-600" />
              <span>Stagiaire</span>
            </div>
          </div>
          
          {/* Silhouette de l'avatar */}
          <div className="absolute -bottom-16 left-8">
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 border-4 border-white flex items-center justify-center shadow-xl">
              {stagiaire.avatar ? (
                <img src={stagiaire.avatar} alt={stagiaire.nom} className="w-full h-full rounded-full object-cover" />
              ) : (
                <UserCircleIcon className="w-full h-full text-white/90" />
              )}
              <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                {isStagiaireActif() ? (
                  <StatusOnlineIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <StatusOfflineIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-20 px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{stagiaire.nom}</h2>
              <p className="text-cyan-600 flex items-center mt-1">
                <BriefcaseIcon className="h-4 w-4 mr-1.5" />
                <span>{stagiaire.entreprise}</span>
              </p>
              <p className="text-gray-600 flex items-center mt-1">
                <LocationMarkerIcon className="h-4 w-4 mr-1.5" />
                <span>
                  {getDisplayableChambre(chambre)}
                </span>
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex gap-2">
              <button 
                onClick={() => onEdit(stagiaire)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition-all flex items-center shadow-sm"
              >
                <PencilAltIcon className="h-4 w-4 mr-2" />
                <span>Modifier</span>
              </button>
              <button 
                onClick={() => onDelete(stagiaire.id)}
                className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-lg transition-all flex items-center"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>
          
          {/* Badge de statut */}
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
            ${isStagiaireActif() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
            <div className={`w-2 h-2 rounded-full mr-1.5 ${isStagiaireActif() ? 'bg-green-500' : 'bg-gray-500'}`}></div>
            {isStagiaireActif() ? 'Stage en cours' : 'Stage terminé ou à venir'}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-cyan-600" />
                <span>Informations Personnelles</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mt-0.5">
                    <MailIcon className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-800">{stagiaire.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mt-0.5">
                    <PhoneIcon className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Téléphone</p>
                    <p className="text-gray-800">{stagiaire.telephone}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mt-0.5">
                    <CalendarIcon className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Période de stage</p>
                    <p className="text-gray-800">
                      Du {new Date(stagiaire.dateArrivee).toLocaleDateString('fr-FR')} au {new Date(stagiaire.dateDepart).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mt-0.5">
                    <BriefcaseIcon className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Entreprise</p>
                    <p className="text-gray-800">{stagiaire.entreprise}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <OfficeBuildingIcon className="h-5 w-5 mr-2 text-cyan-600" />
                <span>Chambre</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mt-0.5">
                    <LocationMarkerIcon className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Numéro</p>
                    <p className="text-gray-800">{getDisplayableChambre(chambre)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mt-0.5">
                    <CheckCircleIcon className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Capacité</p>
                    <p className="text-gray-800">{chambre.capacite}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StagiaireProfile;