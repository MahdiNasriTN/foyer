import React from 'react';
import { ShieldCheckIcon, LockClosedIcon, ExclamationIcon } from '@heroicons/react/outline';
import AlertBox from '../common/AlertBox';

const Securite = ({ colorMode }) => {
  return (
    <section id="securite" className="mb-16 relative">
      {/* Badge "En développement" */}
      <div className="absolute -top-6 right-0">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
          ${colorMode === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
          <span className="animate-pulse mr-1.5">
            <ExclamationIcon className="h-4 w-4" />
          </span>
          En développement
        </span>
      </div>

      <h2 className={`text-2xl font-bold mb-6 pb-2 border-b ${
        colorMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>Sécurité</h2>
      
      <div className={`relative rounded-xl overflow-hidden ${
        colorMode === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
      } mb-8`}>
        <div className="absolute inset-0 bg-grid-primary-500/[0.05] [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-center mb-4">
            <ShieldCheckIcon className={`h-16 w-16 ${
              colorMode === 'dark' ? 'text-blue-400' : 'text-blue-500'
            }`} />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-center">Cette section sera bientôt disponible</h3>
          <p className="mb-4 text-center">
            Notre équipe travaille actuellement sur la documentation complète des pratiques de sécurité 
            pour le système de Gestion de Foyer.
          </p>
          
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 ${
            colorMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <div className={`p-4 rounded-lg transition-all duration-300 hover:scale-105 ${
              colorMode === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white hover:shadow-md'
            }`}>
              <div className="flex justify-center mb-2">
                <LockClosedIcon className={`h-8 w-8 ${
                  colorMode === 'dark' ? 'text-blue-400' : 'text-blue-500'
                }`} />
              </div>
              <h4 className="font-medium text-center mb-2">Authentification</h4>
              <p className="text-sm text-center">
                Pratiques sécurisées d'authentification et gestion des sessions
              </p>
            </div>
            <div className={`p-4 rounded-lg transition-all duration-300 hover:scale-105 ${
              colorMode === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white hover:shadow-md'
            }`}>
              <div className="flex justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${
                  colorMode === 'dark' ? 'text-blue-400' : 'text-blue-500'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-medium text-center mb-2">Protection des données</h4>
              <p className="text-sm text-center">
                Cryptage et sécurisation des données sensibles
              </p>
            </div>
            <div className={`p-4 rounded-lg transition-all duration-300 hover:scale-105 ${
              colorMode === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white hover:shadow-md'
            }`}>
              <div className="flex justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${
                  colorMode === 'dark' ? 'text-blue-400' : 'text-blue-500'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h4 className="font-medium text-center mb-2">Audit et conformité</h4>
              <p className="text-sm text-center">
                Journalisation et traçabilité des actions
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <AlertBox
        type="info"
        title="Notification de disponibilité"
        colorMode={colorMode}
      >
        <p>
          Cette section sera mise à jour prochainement avec des informations détaillées sur les pratiques de sécurité. 
          En attendant, n'hésitez pas à contacter l'équipe technique pour toute question spécifique concernant la sécurité.
        </p>
      </AlertBox>
    </section>
  );
};

export default Securite;