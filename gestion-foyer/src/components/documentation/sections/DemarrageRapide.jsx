import React from 'react';
import AlertBox from '../common/AlertBox';
import { 
  PhotographIcon, 
  ChevronRightIcon,
  UserIcon,
  KeyIcon,
  ViewGridIcon,
  UserGroupIcon,
  HomeIcon,
  UserAddIcon
} from '@heroicons/react/outline';

const DemarrageRapide = ({ colorMode }) => {
  return (
    <section id="demarrage-rapide" className="mb-16">
      <h2 className={`text-2xl font-bold mb-6 pb-2 border-b ${
        colorMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>Guide de Démarrage Rapide</h2>
      
      <p className="mb-6">
        Après avoir installé l'application, suivez ces étapes pour commencer rapidement:
      </p>
      
      {/* IMPORTANT: J'ai ajouté un id pour l'ancre de la connexion */}
      <div id="connexion" className={`mb-8 rounded-lg overflow-hidden ${
        colorMode === 'dark' ? 'border border-gray-700' : 'border border-gray-200'
      }`}>
        {/* Étape 1 */}
        <div className={`px-6 py-4 ${
          colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-start">
            <div className={`p-2 rounded-full ${
              colorMode === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
            } mr-4`}>
              <span className="flex items-center justify-center w-6 h-6 font-semibold">1</span>
            </div>
            <div>
              <h3 className="text-lg font-medium">Connexion à l'Application</h3>
              <p className="mt-1 text-sm">
                Utilisez les identifiants administrateur par défaut pour vous connecter:
              </p>
              <div className="mt-3 space-y-2">
                <div className={`flex items-center p-2 rounded ${
                  colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <UserIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">admin@example.com</span>
                </div>
                <div className={`flex items-center p-2 rounded ${
                  colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <KeyIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="font-medium">Mot de passe:</span>
                  <span className="ml-2">admin123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Étape 2 - IMPORTANT: J'ai ajouté un id pour l'ancre du tableau de bord */}
        <div id="tableau-de-bord" className={`px-6 py-4 ${
          colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className="flex items-start">
            <div className={`p-2 rounded-full ${
              colorMode === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
            } mr-4`}>
              <span className="flex items-center justify-center w-6 h-6 font-semibold">2</span>
            </div>
            <div>
              <h3 className="text-lg font-medium">Explorer le Tableau de Bord</h3>
              <p className="mt-1">
                Le tableau de bord fournit une vue d'ensemble du système avec des indicateurs clés et des activités récentes.
              </p>
              <div className="mt-3 flex">
                <ViewGridIcon className="h-14 w-14 text-gray-400 mr-3" />
                <p className="text-sm">
                  Familiarisez-vous avec l'interface. Vous y trouverez des statistiques sur les chambres, 
                  les stagiaires, les taux d'occupation, ainsi que les activités récentes et les alertes
                  importantes nécessitant votre attention.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Étape 3 - IMPORTANT: J'ai ajouté un id pour l'ancre du premier stagiaire */}
        <div id="premier-stagiaire" className={`px-6 py-4 ${
          colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-start">
            <div className={`p-2 rounded-full ${
              colorMode === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
            } mr-4`}>
              <span className="flex items-center justify-center w-6 h-6 font-semibold">3</span>
            </div>
            <div>
              <h3 className="text-lg font-medium">Ajouter Votre Premier Stagiaire</h3>
              <p className="mt-1">
                Naviguez vers la section Stagiaires et cliquez sur le bouton "Ajouter" pour créer votre premier dossier de résident.
              </p>
              <div className="mt-3 flex items-center">
                <UserAddIcon className="h-12 w-12 text-gray-400 mr-3" />
                <div className="text-sm">
                  <p className="mb-2">Suivez ces étapes:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Cliquez sur "Stagiaires" dans le menu latéral</li>
                    <li>Cliquez sur le bouton "+ Ajouter un Stagiaire"</li>
                    <li>Remplissez le formulaire avec les informations requises</li>
                    <li>Cliquez sur "Enregistrer" pour créer le dossier</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Étape 4 - IMPORTANT: J'ai ajouté un id pour l'ancre des chambres */}
        <div id="configurer-chambres" className={`px-6 py-4 ${
          colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className="flex items-start">
            <div className={`p-2 rounded-full ${
              colorMode === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
            } mr-4`}>
              <span className="flex items-center justify-center w-6 h-6 font-semibold">4</span>
            </div>
            <div>
              <h3 className="text-lg font-medium">Configurer les Chambres</h3>
              <p className="mt-1">
                Allez dans la section Chambres pour ajouter et configurer les chambres de votre établissement.
              </p>
              <div className="mt-3 flex">
                <HomeIcon className="h-12 w-12 text-gray-400 mr-3" />
                <p className="text-sm">
                  Définissez les différentes chambres disponibles, leur capacité, leur état, et autres caractéristiques. 
                  Vous pourrez ensuite attribuer ces chambres aux stagiaires dans le système.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Étape 5 */}
        <div className={`px-6 py-4 ${
          colorMode === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-start">
            <div className={`p-2 rounded-full ${
              colorMode === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
            } mr-4`}>
              <span className="flex items-center justify-center w-6 h-6 font-semibold">5</span>
            </div>
            <div>
              <h3 className="text-lg font-medium">Ajouter du Personnel</h3>
              <p className="mt-1">
                Ajoutez des membres du personnel dans la section Personnel avec les rôles et permissions appropriés.
              </p>
              <div className="mt-3 flex">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mr-3" />
                <p className="text-sm">
                  Différents niveaux d'accès peuvent être attribués: administrateurs, gestionnaires, personnel de cuisine, 
                  agents d'entretien, etc. Chaque rôle aura des permissions spécifiques dans le système.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-4">Vidéo de Présentation Rapide</h3>
      
      <div className={`aspect-w-16 aspect-h-9 rounded-lg overflow-hidden ${
        colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
      } mb-8`}>
        {/* Remplacer par une vidéo réelle ou une capture d'écran */}
        <div className="flex items-center justify-center h-full">
          <div className={`text-center ${
            colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <PhotographIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Tutoriel vidéo à venir</p>
            <button className={`mt-4 px-4 py-2 rounded-lg ${
              colorMode === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
            }`}>
              Voir l'Aperçu
            </button>
          </div>
        </div>
      </div>
      
      {/* IMPORTANT: J'ai ajouté un id pour l'ancre des étapes suivantes */}
      <h3 id="etapes-suivantes" className="text-xl font-semibold mb-4">Étapes Suivantes</h3>
      
      <div className={`space-y-4 mb-8 ${
        colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        <div className="flex items-center">
          <ChevronRightIcon className="h-5 w-5 mr-2 text-blue-500" />
          <p>
            <span className="font-medium">Configurer les paramètres du système:</span> Personnalisez les paramètres généraux, les notifications et les règles métier dans la section Paramètres.
          </p>
        </div>
        <div className="flex items-center">
          <ChevronRightIcon className="h-5 w-5 mr-2 text-blue-500" />
          <p>
            <span className="font-medium">Configuration des repas:</span> Si votre foyer propose des services de restauration, configurez les menus et horaires dans la section Cuisine.
          </p>
        </div>
        <div className="flex items-center">
          <ChevronRightIcon className="h-5 w-5 mr-2 text-blue-500" />
          <p>
            <span className="font-medium">Personnalisation des rapports:</span> Créez des rapports personnalisés pour suivre les activités et performances du foyer.
          </p>
        </div>
      </div>
      
      <AlertBox
        type="warning"
        title="Note Importante"
        colorMode={colorMode}
      >
        <p>
          Assurez-vous de changer le mot de passe administrateur par défaut immédiatement après votre première connexion.
          Vous pouvez le faire depuis la section Paramètres - Sécurité - Modifier le mot de passe.
        </p>
      </AlertBox>
      
      <div className={`mt-8 p-4 rounded-lg ${
        colorMode === 'dark' ? 'bg-blue-900/20 border border-blue-800/50' : 'bg-blue-50 border border-blue-100'
      }`}>
        <h4 className="font-medium mb-2">Besoin d'aide pour démarrer?</h4>
        <p className="text-sm mb-3">
          Si vous rencontrez des difficultés ou avez des questions, plusieurs ressources sont disponibles:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Consultez notre <a href="#faq" className="text-blue-500 hover:underline">FAQ</a> pour les questions fréquentes</li>
          <li>Rejoignez notre <a href="#" className="text-blue-500 hover:underline">forum communautaire</a></li>
          <li>Contactez le <a href="#contact" className="text-blue-500 hover:underline">support technique</a> si nécessaire</li>
        </ul>
      </div>
    </section>
  );
};

export default DemarrageRapide;