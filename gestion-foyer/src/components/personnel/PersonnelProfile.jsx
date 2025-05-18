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
  BriefcaseIcon,
  LocationMarkerIcon,
  CheckCircleIcon,
  ExclamationIcon,
  KeyIcon,
  ShieldCheckIcon
} from '@heroicons/react/outline';
import { UserCircleIcon } from '@heroicons/react/solid';

const PersonnelProfile = ({ employee, animation, onBack, onEdit, onDelete }) => {
  return (
    <div className={`transition-all duration-500 ${animation ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-blue-600">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <rect width="1" height="10" fill="white" fillOpacity="0.1" />
                <rect width="10" height="1" fill="white" fillOpacity="0.1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
          </div>
          
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 bg-white/70 hover:bg-white text-gray-700 p-2 rounded-full backdrop-blur-sm shadow-sm"
          >
            <ArrowNarrowLeftIcon className="h-5 w-5" />
          </button>
          
          <div className="absolute top-4 right-4 flex space-x-2">
            <button 
              onClick={() => onEdit(employee)}
              className="bg-white/70 hover:bg-white/90 text-gray-700 p-2 rounded-full transition-all duration-200 backdrop-blur-sm shadow-sm"
            >
              <PencilAltIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={() => onDelete(employee.id)}
              className="bg-white/70 hover:bg-white/90 text-red-600 p-2 rounded-full transition-all duration-200 backdrop-blur-sm shadow-sm"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="absolute -bottom-16 left-8">
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-white flex items-center justify-center shadow-xl">
              {employee.avatar ? (
                <img src={employee.avatar} alt={employee.nom} className="w-full h-full rounded-full object-cover" />
              ) : (
                <UserCircleIcon className="w-full h-full text-white/90" />
              )}
              <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                {employee.statut === 'actif' ? (
                  <div className="h-4 w-4 rounded-full bg-green-500"></div>
                ) : (
                  <div className="h-4 w-4 rounded-full bg-gray-400"></div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-20 px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{employee.nom}</h2>
              <p className="text-blue-600 flex items-center mt-1">
                <BriefcaseIcon className="h-4 w-4 mr-1.5" />
                <span>{employee.poste}</span>
              </p>
              <p className="text-gray-500 flex items-center mt-1">
                <OfficeBuildingIcon className="h-4 w-4 mr-1.5" />
                <span>{employee.departement}</span>
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              {employee.statut === 'actif' ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Actif
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                  <ExclamationIcon className="h-4 w-4 mr-1" />
                  Inactif
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                <span>Informations Personnelles</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                    <MailIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-800">{employee.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                    <PhoneIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Téléphone</p>
                    <p className="text-gray-800">{employee.telephone}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                    <LocationMarkerIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Adresse</p>
                    <p className="text-gray-800">{employee.adresse}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Date d'embauche</p>
                    <p className="text-gray-800">{new Date(employee.dateEmbauche).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-500" />
                <span>Informations Professionnelles</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                    <BriefcaseIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Poste</p>
                    <p className="text-gray-800">{employee.poste}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                    <OfficeBuildingIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Département</p>
                    <p className="text-gray-800">{employee.departement}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                    <KeyIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Rôle</p>
                    <p className="text-gray-800">
                      {employee.role === 'admin' ? 'Administrateur' : 
                       employee.role === 'manager' ? 'Gestionnaire' : 'Employé'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Permissions</p>
                    <div className="mt-1 space-x-1">
                      {employee.permissions?.includes('view') && (
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-xs">Lecture</span>
                      )}
                      {employee.permissions?.includes('edit') && (
                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">Modification</span>
                      )}
                      {employee.permissions?.includes('delete') && (
                        <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">Suppression</span>
                      )}
                      {employee.permissions?.includes('approve') && (
                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Approbation</span>
                      )}
                    </div>
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

export default PersonnelProfile;