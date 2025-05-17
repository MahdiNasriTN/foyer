import React from 'react';
import { SupportIcon, MailIcon, ChatAlt2Icon, QuestionMarkCircleIcon, ExclamationIcon } from '@heroicons/react/outline';
import AlertBox from '../common/AlertBox';

const Support = ({ colorMode }) => {
  return (
    <section id="support" className="mb-16 relative">
      {/* Badge "À venir" */}
      <div className="absolute -top-6 right-0">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
          ${colorMode === 'dark' ? 'bg-teal-900 text-teal-200' : 'bg-teal-100 text-teal-800'}`}>
          <ExclamationIcon className="h-4 w-4 mr-1.5 animate-bounce" />
          À venir
        </span>
      </div>

      <h2 className={`text-2xl font-bold mb-6 pb-2 border-b ${
        colorMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>Support</h2>
      
      <div className={`relative overflow-hidden rounded-xl ${
        colorMode === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
      } mb-8`}>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900/20 to-transparent"></div>
        </div>
        
        <div className="relative p-6">
          <div className="flex justify-center mb-4">
            <SupportIcon className={`h-16 w-16 ${
              colorMode === 'dark' ? 'text-teal-400' : 'text-teal-500'
            }`} />
          </div>
          
          <h3 className="text-xl font-semibold text-center mb-3">Centre de support en construction</h3>
          
          <p className="mb-8 text-center max-w-2xl mx-auto">
            Notre équipe travaille activement sur une documentation complète pour le support. Cette section
            contiendra des ressources détaillées pour résoudre les problèmes courants, des guides de dépannage
            et les moyens de contacter notre équipe de support.
          </p>
          
          <div className={`p-6 rounded-lg border-2 border-dashed mb-8 text-center ${
            colorMode === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-600'
          }`}>
            <h4 className="font-medium mb-3">En attendant, contactez-nous directement</h4>
            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8">
              <div className="flex items-center justify-center">
                <MailIcon className={`h-5 w-5 mr-2 ${
                  colorMode === 'dark' ? 'text-teal-400' : 'text-teal-500'
                }`} />
                <span>support@ges-foyer.com</span>
              </div>
              <div className="flex items-center justify-center">
                <ChatAlt2Icon className={`h-5 w-5 mr-2 ${
                  colorMode === 'dark' ? 'text-teal-400' : 'text-teal-500'
                }`} />
                <span>Live Chat (9h-17h)</span>
              </div>
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${
                  colorMode === 'dark' ? 'text-teal-400' : 'text-teal-500'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+216 71 123 456</span>
              </div>
            </div>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${
            colorMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <div className={`p-5 rounded-lg text-center transition-all duration-300 hover:scale-105 ${
              colorMode === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white hover:shadow-md'
            }`}>
              <div className="inline-flex items-center justify-center p-3 rounded-full mb-4 bg-opacity-10 bg-teal-500">
                <QuestionMarkCircleIcon className={`h-8 w-8 ${
                  colorMode === 'dark' ? 'text-teal-400' : 'text-teal-500'
                }`} />
              </div>
              <h4 className="font-medium mb-2">FAQ</h4>
              <p className="text-sm">
                Questions fréquemment posées avec leurs réponses détaillées.
              </p>
            </div>
            
            <div className={`p-5 rounded-lg text-center transition-all duration-300 hover:scale-105 ${
              colorMode === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white hover:shadow-md'
            }`}>
              <div className="inline-flex items-center justify-center p-3 rounded-full mb-4 bg-opacity-10 bg-teal-500">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${
                  colorMode === 'dark' ? 'text-teal-400' : 'text-teal-500'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h4 className="font-medium mb-2">Dépannage</h4>
              <p className="text-sm">
                Guides pour résoudre les problèmes techniques courants.
              </p>
            </div>
            
            <div className={`p-5 rounded-lg text-center transition-all duration-300 hover:scale-105 ${
              colorMode === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white hover:shadow-md'
            }`}>
              <div className="inline-flex items-center justify-center p-3 rounded-full mb-4 bg-opacity-10 bg-teal-500">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${
                  colorMode === 'dark' ? 'text-teal-400' : 'text-teal-500'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-medium mb-2">Signalement de bug</h4>
              <p className="text-sm">
                Procédure pour signaler et suivre les problèmes techniques.
              </p>
            </div>
          </div>
          
          <div className={`mt-12 p-6 rounded-lg ${
            colorMode === 'dark' ? 'bg-gray-700/50' : 'bg-white'
          } text-center`}>
            <h4 className="font-medium mb-4">Prochainement disponible</h4>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((dot) => (
                <div key={dot} className={`h-2 w-2 rounded-full ${
                  colorMode === 'dark' ? 'bg-teal-400' : 'bg-teal-500'
                } animate-pulse`} style={{ animationDelay: `${dot * 0.15}s` }}></div>
              ))}
            </div>
            <p className="text-sm">
              Base de connaissances, tickets de support, et tableau de bord d'assistance
            </p>
          </div>
        </div>
      </div>
      
      <AlertBox
        type="info"
        title="En cours de développement"
        colorMode={colorMode}
      >
        <p>
          Pendant que nous développons cette section, vous pouvez consulter notre 
          <a href="#" className={`ml-1 font-medium ${
            colorMode === 'dark' ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'
          }`}>documentation provisoire</a> ou nous contacter directement pour toute assistance.
        </p>
      </AlertBox>
    </section>
  );
};

export default Support;