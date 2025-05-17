import React from 'react';
import { ServerIcon, CloudIcon, ClockIcon, ExclamationIcon, TrendingUpIcon } from '@heroicons/react/outline';
import AlertBox from '../common/AlertBox';

const Deploiement = ({ colorMode }) => {
  return (
    <section id="deploiement" className="mb-16 relative">
      {/* Badge "Coming Soon" */}
      <div className="absolute -top-6 right-0">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
          ${colorMode === 'dark' ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'}`}>
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500 mr-2"></span>
          Coming Soon
        </span>
      </div>

      <h2 className={`text-2xl font-bold mb-6 pb-2 border-b ${
        colorMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>Déploiement</h2>
      
      <div className={`relative rounded-xl overflow-hidden ${
        colorMode === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
      } mb-8`}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-center mb-4">
            <ServerIcon className={`h-16 w-16 ${
              colorMode === 'dark' ? 'text-indigo-400' : 'text-indigo-500'
            }`} />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-center">Guide de déploiement en préparation</h3>
          <p className="mb-4 text-center max-w-2xl mx-auto">
            Nous finalisons la documentation détaillée pour le déploiement du système de Gestion de Foyer 
            dans différents environnements. Cette section couvrira le déploiement sur des serveurs locaux,
            des services cloud, et les meilleures pratiques de configuration.
          </p>
          
          <div className="relative mt-12 mb-8">
            <div className={`h-1 ${
              colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            } rounded-full w-full absolute top-1/2 transform -translate-y-1/2`}></div>
            
            <div className="relative flex justify-between">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  colorMode === 'dark' ? 'bg-indigo-700' : 'bg-indigo-500'
                } z-10`}>
                  <span className="text-white font-medium">1</span>
                </div>
                <span className={`text-sm font-medium mt-2 ${
                  colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Préparation</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  colorMode === 'dark' ? 'bg-indigo-700' : 'bg-indigo-500'
                } z-10`}>
                  <span className="text-white font-medium">2</span>
                </div>
                <span className={`text-sm font-medium mt-2 ${
                  colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Installation</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  colorMode === 'dark' ? 'bg-indigo-700' : 'bg-indigo-500'
                } z-10`}>
                  <span className="text-white font-medium">3</span>
                </div>
                <span className={`text-sm font-medium mt-2 ${
                  colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Configuration</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  colorMode === 'dark' ? 'bg-indigo-700' : 'bg-indigo-500'
                } z-10`}>
                  <span className="text-white font-medium">4</span>
                </div>
                <span className={`text-sm font-medium mt-2 ${
                  colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Mise en ligne</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  colorMode === 'dark' ? 'bg-indigo-700' : 'bg-indigo-500'
                } z-10`}>
                  <span className="text-white font-medium">5</span>
                </div>
                <span className={`text-sm font-medium mt-2 ${
                  colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Maintenance</span>
              </div>
            </div>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 ${
            colorMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <div className={`p-5 rounded-lg flex items-start transition-all duration-300 hover:scale-105 ${
              colorMode === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white hover:shadow-md'
            }`}>
              <CloudIcon className={`h-10 w-10 mr-4 flex-shrink-0 ${
                colorMode === 'dark' ? 'text-indigo-400' : 'text-indigo-500'
              }`} />
              <div>
                <h4 className="font-medium mb-2">Déploiement Cloud</h4>
                <p className="text-sm">
                  Instructions de déploiement sur AWS, Azure, Google Cloud et d'autres plateformes cloud populaires.
                </p>
              </div>
            </div>
            
            <div className={`p-5 rounded-lg flex items-start transition-all duration-300 hover:scale-105 ${
              colorMode === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white hover:shadow-md'
            }`}>
              <ServerIcon className={`h-10 w-10 mr-4 flex-shrink-0 ${
                colorMode === 'dark' ? 'text-indigo-400' : 'text-indigo-500'
              }`} />
              <div>
                <h4 className="font-medium mb-2">Serveur On-Premise</h4>
                <p className="text-sm">
                  Configuration sur des serveurs locaux avec Linux (Ubuntu, CentOS) ou Windows Server.
                </p>
              </div>
            </div>
            
            <div className={`p-5 rounded-lg flex items-start transition-all duration-300 hover:scale-105 ${
              colorMode === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white hover:shadow-md'
            }`}>
              <ClockIcon className={`h-10 w-10 mr-4 flex-shrink-0 ${
                colorMode === 'dark' ? 'text-indigo-400' : 'text-indigo-500'
              }`} />
              <div>
                <h4 className="font-medium mb-2">Déploiement Continu</h4>
                <p className="text-sm">
                  Mise en place de CI/CD avec GitHub Actions, Jenkins ou GitLab CI pour des déploiements automatisés.
                </p>
              </div>
            </div>
            
            <div className={`p-5 rounded-lg flex items-start transition-all duration-300 hover:scale-105 ${
              colorMode === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white hover:shadow-md'
            }`}>
              <TrendingUpIcon className={`h-10 w-10 mr-4 flex-shrink-0 ${
                colorMode === 'dark' ? 'text-indigo-400' : 'text-indigo-500'
              }`} />
              <div>
                <h4 className="font-medium mb-2">Mise à l'échelle</h4>
                <p className="text-sm">
                  Stratégies pour la mise à l'échelle de l'application avec la croissance de votre organisation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AlertBox
        type="warning"
        title="En cours de rédaction"
        colorMode={colorMode}
      >
        <p>
          Le guide de déploiement complet sera disponible dans la prochaine mise à jour de la documentation.
          Pour des besoins de déploiement urgents, veuillez contacter notre équipe DevOps à <span className="font-medium">devops@ges-foyer.com</span>.
        </p>
      </AlertBox>
    </section>
  );
};

export default Deploiement;