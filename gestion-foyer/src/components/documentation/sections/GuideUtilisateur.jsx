import React from 'react';
import { 
  UserIcon, 
  ViewGridIcon, 
  UserGroupIcon, 
  HomeIcon, 
  CogIcon,
  ClipboardListIcon,
  DocumentReportIcon,
  CurrencyDollarIcon,
  PhotographIcon,
  InformationCircleIcon
} from '@heroicons/react/outline';

import AlertBox from '../common/AlertBox';
import CodeBlock from '../common/CodeBlock';

const GuideUtilisateur = ({ colorMode }) => {
  return (
    <section id="guide-utilisateur" className="mb-16">
      <h2 className={`text-2xl font-bold mb-6 pb-2 border-b ${
        colorMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>Guide Utilisateur</h2>
      
      <p className="mb-6">
        Ce guide détaille les fonctionnalités principales de l'application Gestionnaire de Foyer et explique 
        comment les utiliser efficacement pour la gestion quotidienne de votre établissement.
      </p>
      
      <AlertBox
        type="info"
        title="Remarque sur les permissions"
        colorMode={colorMode}
      >
        <p>
          Certaines fonctionnalités décrites dans ce guide peuvent ne pas être accessibles selon votre niveau de permission.
          Les administrateurs ont accès à toutes les fonctionnalités, tandis que les autres utilisateurs ont un accès limité
          selon leur rôle.
        </p>
      </AlertBox>
      
      {/* Section: Tableau de Bord */}
      <div id="tableau-de-bord" className="mb-12">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <ViewGridIcon className={`h-6 w-6 mr-2 ${
            colorMode === 'dark' ? 'text-blue-400' : 'text-blue-600'
          }`} />
          Tableau de Bord
        </h3>
        
        <p className="mb-4">
          Le tableau de bord est la page d'accueil de l'application après la connexion. Il fournit une vue d'ensemble
          de l'état actuel du foyer avec des indicateurs clés et des informations résumées.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className={`font-medium mb-3 pb-1 border-b ${
              colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
            }`}>Composants du Tableau de Bord</h4>
            <ul className={`list-disc pl-5 space-y-2 ${
              colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>
                <span className="font-medium">Statistiques générales</span>: Nombre total de stagiaires et étudiants, 
                taux d'occupation, chambres disponibles
              </li>
              <li>
                <span className="font-medium">Activités récentes</span>: Derniers stagiaires ajoutés, modifications de chambres
              </li>
              <li>
                <span className="font-medium">Accès rapide</span>: Liens vers les fonctionnalités les plus utilisées
              </li>
            </ul>
          </div>
          
          <div className={`rounded-lg overflow-hidden ${
            colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <div className="aspect-w-16 aspect-h-9">
              <div className="flex items-center justify-center h-full">
                <div className={`text-center ${
                  colorMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <PhotographIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aperçu du tableau de bord</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section: Gestion des Stagiaires */}
      <div id="stagiaires" className="mb-12">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <UserGroupIcon className={`h-6 w-6 mr-2 ${
            colorMode === 'dark' ? 'text-green-400' : 'text-green-600'
          }`} />
          Gestion des Stagiaires
        </h3>
        
        <p className="mb-4">
          Le module de gestion des stagiaires permet de suivre toutes les informations relatives aux résidents du foyer,
          y compris leurs données personnelles et les attributions de chambres.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${
            colorMode === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
          }`}>
            <h4 className="font-medium mb-2">Ajout d'un Stagiaire</h4>
            <p className="text-sm mb-3">Pour ajouter un nouveau stagiaire:</p>
            <ol className="text-sm list-decimal pl-4 space-y-1">
              <li>Accédez à "Stagiaires" dans le menu principal</li>
              <li>Cliquez sur "+ Ajouter un Stagiaire"</li>
              <li>Choisissez entre stagiaire interne ou externe</li>
              <li>Remplissez le formulaire avec les informations requises</li>
              <li>Ajoutez une photo si nécessaire</li>
              <li>Cliquez sur "Enregistrer"</li>
            </ol>
          </div>
          
          <div className={`p-4 rounded-lg ${
            colorMode === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
          }`}>
            <h4 className="font-medium mb-2">Gestion des Stagiaires</h4>
            <p className="text-sm mb-3">Actions disponibles:</p>
            <ul className="text-sm list-disc pl-4 space-y-1">
              <li>Voir le profil d'un stagiaire</li>
              <li>Modifier les informations</li>
              <li>Supprimer un stagiaire</li>
              <li>Filtrer par différents critères (nom, chambre, etc.)</li>
              <li>Changer l'affichage (liste ou grille)</li>
              <li>Consulter les statistiques des stagiaires</li>
            </ul>
          </div>
        </div>
        
        <h4 className="font-medium mb-3">Types de Stagiaires</h4>
        <div className="mb-6 grid md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${
            colorMode === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h5 className="text-sm font-medium mb-2">Stagiaires Internes</h5>
            <p className="text-xs mb-2">
              Les stagiaires internes résident au foyer et ont une chambre assignée. Le formulaire d'ajout contient:
            </p>
            <ul className="text-xs list-disc pl-4">
              <li>Informations personnelles (nom, prénom, date de naissance)</li>
              <li>Coordonnées (téléphone, email)</li>
              <li>Détails de formation</li>
              <li>Informations familiales</li>
              <li>Période de séjour</li>
            </ul>
          </div>
          
          <div className={`p-4 rounded-lg ${
            colorMode === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h5 className="text-sm font-medium mb-2">Stagiaires Externes</h5>
            <p className="text-xs mb-2">
              Les stagiaires externes ne résident pas au foyer mais sont enregistrés dans le système. Le formulaire inclut:
            </p>
            <ul className="text-xs list-disc pl-4">
              <li>Informations personnelles de base</li>
              <li>Centre de formation assigné</li>
              <li>Spécialisation</li>
              <li>Numéro de groupe</li>
              <li>Période de formation</li>
            </ul>
          </div>
        </div>
        
        <AlertBox
          type="info"
          title="Recherche de Stagiaires"
          colorMode={colorMode}
        >
          <p>
            Utilisez la barre de recherche en haut de la liste des stagiaires pour trouver rapidement un stagiaire 
            par son nom, prénom ou numéro de chambre. Les filtres avancés vous permettent de préciser 
            davantage votre recherche.
          </p>
        </AlertBox>
      </div>
      
      {/* Section: Étudiants */}
      <div id="etudiants" className="mb-12">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <UserIcon className={`h-6 w-6 mr-2 ${
            colorMode === 'dark' ? 'text-blue-400' : 'text-blue-600'
          }`} />
          Gestion des Étudiants
        </h3>
        
        <p className="mb-4">
          La gestion des étudiants est similaire à celle des stagiaires mais adaptée au contexte académique.
          Cette section vous permet de gérer les informations des étudiants résidant au foyer.
        </p>
        
        <div className={`p-4 rounded-lg mb-6 ${
          colorMode === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <h4 className="font-medium mb-2">Interface de Gestion</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium mb-2">Fonctionnalités principales</h5>
              <ul className="text-sm list-disc pl-4 space-y-1">
                <li>Liste des étudiants avec filtrage</li>
                <li>Vue en grille ou en liste</li>
                <li>Ajout d'un nouvel étudiant</li>
                <li>Modification et suppression</li>
                <li>Consultation de profil détaillé</li>
                <li>Statistiques générales</li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium mb-2">Informations gérées</h5>
              <ul className="text-sm list-disc pl-4 space-y-1">
                <li>Données personnelles</li>
                <li>Coordonnées</li>
                <li>Établissement et filière d'études</li>
                <li>Chambre assignée</li>
                <li>Date d'arrivée et de départ</li>
                <li>Informations sur les parents</li>
              </ul>
            </div>
          </div>
        </div>
        
        <h4 className="font-medium mb-3">Gestion du Profil Étudiant</h4>
        <p className="mb-3">
          En accédant au profil d'un étudiant, vous pourrez:
        </p>
        
        <ol className={`list-decimal pl-6 mb-6 ${
          colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <li className="mb-1">Consulter l'ensemble des informations personnelles</li>
          <li className="mb-1">Voir la chambre assignée et l'historique des attributions</li>
          <li className="mb-1">Gérer les documents administratifs</li>
          <li className="mb-1">Suivre les absences et présences</li>
          <li>Noter des informations particulières concernant l'étudiant</li>
        </ol>
      </div>
      
      {/* Section: Gestion des Chambres */}
      <div id="chambres" className="mb-12">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <HomeIcon className={`h-6 w-6 mr-2 ${
            colorMode === 'dark' ? 'text-amber-400' : 'text-amber-600'
          }`} />
          Gestion des Chambres
        </h3>
        
        <p className="mb-4">
          Le module de gestion des chambres vous permet de configurer et suivre toutes les chambres de votre établissement,
          leur état, leur capacité, et les équipements disponibles.
        </p>
        
        <div className={`mb-6 rounded-lg overflow-hidden ${
          colorMode === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className={`p-4 ${
            colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <h4 className="font-medium">États des chambres</h4>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                    <span className="font-medium">Disponible</span>
                    <span className="ml-2 text-sm opacity-75">- Prête à être attribuée</span>
                  </li>
                  <li className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                    <span className="font-medium">Occupée</span>
                    <span className="ml-2 text-sm opacity-75">- Actuellement attribuée</span>
                  </li>
                </ul>
              </div>
              <div>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                    <span className="font-medium">En maintenance</span>
                    <span className="ml-2 text-sm opacity-75">- Temporairement indisponible</span>
                  </li>
                  <li className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-gray-500 mr-2"></span>
                    <span className="font-medium">Hors service</span>
                    <span className="ml-2 text-sm opacity-75">- Indisponible long terme</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <h4 className="font-medium mb-3">Gestion des Chambres</h4>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h5 className={`text-sm font-medium mb-2 pb-1 border-b ${
              colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
            }`}>Ajout d'une Chambre</h5>
            <ol className={`list-decimal pl-5 space-y-1 text-sm ${
              colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>Accédez à "Chambres" dans le menu principal</li>
              <li>Cliquez sur le bouton "Ajouter une Chambre"</li>
              <li>Renseignez le numéro et l'étage</li>
              <li>Définissez la capacité (nombre de lits)</li>
              <li>Sélectionnez les équipements disponibles</li>
              <li>Ajoutez une description si nécessaire</li>
              <li>Cliquez sur "Enregistrer"</li>
            </ol>
          </div>
          
          <div>
            <h5 className={`text-sm font-medium mb-2 pb-1 border-b ${
              colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
            }`}>Fonctionnalités</h5>
            <ul className={`list-disc pl-5 space-y-1 text-sm ${
              colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li>Vue en liste ou en grille des chambres</li>
              <li>Filtrage par statut, étage, équipements</li>
              <li>Recherche rapide par numéro</li>
              <li>Modification des informations</li>
              <li>Changement de statut (maintenance, etc.)</li>
              <li>Consultation des détails et de l'historique</li>
            </ul>
          </div>
        </div>
        
        <AlertBox
          type="info"
          title="Attribution de Chambres"
          colorMode={colorMode}
        >
          <p>
            Pour attribuer une chambre à un stagiaire ou un étudiant, vous pouvez soit:
            <br />• Aller dans le profil du résident et utiliser l'option "Attribuer une chambre"
            <br />• Depuis la liste des chambres, sélectionner une chambre disponible et cliquer sur "Attribuer"
          </p>
        </AlertBox>
      </div>
      
      {/* Cuisine section - simplified */}
      <div id="cuisine" className="mb-12">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <ClipboardListIcon className={`h-6 w-6 mr-2 ${
            colorMode === 'dark' ? 'text-red-400' : 'text-red-600'
          }`} />
          Gestion de la Cuisine
        </h3>
        
        <p className="mb-4">
          Le module de gestion de la cuisine permet de planifier les repas, gérer les stocks d'ingrédients,
          et suivre les préférences alimentaires des résidents.
        </p>
        
        <div className={`p-4 rounded-lg mb-6 ${
          colorMode === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
        }`}>
          <h4 className="font-medium mb-3">Fonctionnalités principales</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium mb-2">Planification des menus</h5>
              <ul className="text-sm list-disc pl-4 space-y-1">
                <li>Création de menus quotidiens</li>
                <li>Planification hebdomadaire</li>
                <li>Gestion des repas spéciaux</li>
                <li>Rotation des menus</li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium mb-2">Gestion des stocks</h5>
              <ul className="text-sm list-disc pl-4 space-y-1">
                <li>Suivi des niveaux d'inventaire</li>
                <li>Génération de listes d'achats</li>
                <li>Enregistrement des livraisons</li>
                <li>Alertes de stock bas</li>
              </ul>
            </div>
          </div>
        </div>
        
        <AlertBox
          type="info"
          title="Préférences alimentaires"
          colorMode={colorMode}
        >
          <p>
            Le système vous permet d'enregistrer les préférences alimentaires et les allergies des résidents,
            afin de pouvoir adapter les menus en conséquence et garantir la sécurité alimentaire de tous.
          </p>
        </AlertBox>
      </div>
      
      <div className={`rounded-lg ${
        colorMode === 'dark' ? 'bg-blue-900/20 border border-blue-800/50' : 'bg-blue-50 border border-blue-200'
      } p-4 mt-8`}>
        <h4 className="font-medium mb-2 flex items-center">
          <InformationCircleIcon className="h-5 w-5 mr-2" />
          Besoin d'aide supplémentaire?
        </h4>
        <p className="text-sm mb-3">
          Cette documentation couvre les fonctionnalités principales du système.
          Pour plus d'informations ou une assistance personnalisée:
        </p>
        <ul className="text-sm space-y-1 pl-6 list-disc">
          <li>Consultez les autres sections de la documentation</li>
          <li>Utilisez l'aide contextuelle dans l'application (icônes "?")</li>
          <li>Contactez votre administrateur système</li>
        </ul>
      </div>
    </section>
  );
};

export default GuideUtilisateur;