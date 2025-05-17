import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, ArrowLeftIcon } from '@heroicons/react/outline';

const DocFooter = ({ colorMode, activeSection, docSections }) => {
  // Trouver l'index de la section active
  const currentIndex = docSections.findIndex(section => section.id === activeSection);
  
  // Déterminer les sections précédente et suivante
  const prevSection = currentIndex > 0 ? docSections[currentIndex - 1] : null;
  const nextSection = currentIndex < docSections.length - 1 ? docSections[currentIndex + 1] : null;

  return (
    <>
      {/* Pied de page avec liens de navigation */}
      <div className={`mt-16 pt-6 border-t ${
        colorMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          {prevSection && (
            <div className="flex items-center mb-4 sm:mb-0">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              <Link 
                to={`/documentation/${prevSection.id}`} 
                className={`text-sm ${
                  colorMode === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                Précédent: {prevSection.title}
              </Link>
            </div>
          )}
          
          {nextSection && (
            <div className="flex items-center">
              <Link 
                to={`/documentation/${nextSection.id}`} 
                className={`text-sm ${
                  colorMode === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                Suivant: {nextSection.title}
              </Link>
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </div>
          )}
        </div>
      </div>
      
      {/* Informations de dernière mise à jour */}
      <div className={`mt-8 text-xs text-center ${
        colorMode === 'dark' ? 'text-gray-500' : 'text-gray-400'
      }`}>
        Dernière mise à jour le 15 mai 2025 • <a 
          href="https://github.com/yourusername/ges_foyer/commits/main/docs" 
          className="hover:underline"
        >
          Voir les changements
        </a>
      </div>
    </>
  );
};

export default DocFooter;