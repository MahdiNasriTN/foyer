import React from 'react';
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  AcademicCapIcon, 
  ClipboardListIcon,
  InformationCircleIcon
} from '@heroicons/react/outline';

import AlertBox from '../common/AlertBox';
import FeatureCard from '../common/FeatureCard';
import SystemDiagram from '../common/SystemDiagram';

const Introduction = ({ colorMode }) => {
  // Configuration pour le diagramme du système
  const systemLayers = [
    { 
      name: 'Frontend React.js (Interface Utilisateur)', 
      lightBg: 'bg-blue-600', 
      darkBg: 'bg-blue-900' 
    },
    { name: 'API REST / GraphQL' },
    { 
      name: 'Backend Express.js (Logique Métier)', 
      lightBg: 'bg-indigo-600', 
      darkBg: 'bg-indigo-900' 
    },
    { name: 'Couche d\'Abstraction de Base de Données' },
    { 
      name: 'MongoDB (Stockage de Données)', 
      lightBg: 'bg-green-600', 
      darkBg: 'bg-green-900' 
    }
  ];

  const systemDescription = 
    "Le Gestionnaire de Foyer utilise une pile moderne avec React.js pour le frontend, Express.js pour l'API backend, " +
    "et MongoDB pour le stockage des données. L'architecture suit un modèle de conception RESTful pour une séparation " +
    "claire des préoccupations et une évolutivité.";

  return (
    <section id="introduction" className="mb-16">
      <h2 className={`text-2xl font-bold mb-6 pb-2 border-b ${
        colorMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>Introduction</h2>
      
      <AlertBox 
        type="info"
        title="Aperçu de la Documentation"
        colorMode={colorMode}
      >
        <p>
          Cette documentation fournit des informations complètes sur l'application Gestionnaire de Foyer,
          y compris les guides d'installation, de configuration et d'utilisation pour les administrateurs et les utilisateurs.
        </p>
      </AlertBox>
      
      <p className="mb-4">
        Le <strong>Gestionnaire de Foyer</strong> est une solution complète pour la gestion des foyers d'étudiants 
        et des résidences. Il simplifie la gestion des résidents, des chambres, du personnel
        et des services de restauration dans une interface unifiée.
      </p>
      
      <p className="mb-4">
        Cette application est conçue pour aider les administrateurs à gérer efficacement tous les aspects des 
        opérations de foyer, du suivi des informations des résidents et des attributions de chambres à 
        la gestion des horaires du personnel et des tâches de cuisine.
      </p>
      
      <h3 className="text-xl font-semibold mt-8 mb-4">Fonctionnalités Principales</h3>
      
      <div className={`grid md:grid-cols-2 gap-4 ${
        colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        <FeatureCard
          icon={<UserGroupIcon className="h-5 w-5" />}
          title="Gestion des Stagiaires"
          description="Suivi complet des informations des résidents, des paiements et de l'historique"
          colorMode={colorMode}
          iconBgColor={colorMode === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'}
          iconTextColor={colorMode === 'dark' ? 'text-blue-400' : 'text-blue-600'}
        />
        
        <FeatureCard
          icon={<DocumentTextIcon className="h-5 w-5" />}
          title="Gestion des Chambres"
          description="Attribution efficace des chambres, suivi de l'état et maintenance"
          colorMode={colorMode}
          iconBgColor={colorMode === 'dark' ? 'bg-green-900/50' : 'bg-green-100'}
          iconTextColor={colorMode === 'dark' ? 'text-green-400' : 'text-green-600'}
        />
        
        <FeatureCard
          icon={<AcademicCapIcon className="h-5 w-5" />}
          title="Gestion du Personnel"
          description="Dossiers du personnel, planification et suivi des performances"
          colorMode={colorMode}
          iconBgColor={colorMode === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'}
          iconTextColor={colorMode === 'dark' ? 'text-purple-400' : 'text-purple-600'}
        />
        
        <FeatureCard
          icon={<ClipboardListIcon className="h-5 w-5" />}
          title="Gestion de la Cuisine"
          description="Planification des repas, inventaire et attribution des tâches"
          colorMode={colorMode}
          iconBgColor={colorMode === 'dark' ? 'bg-amber-900/50' : 'bg-amber-100'}
          iconTextColor={colorMode === 'dark' ? 'text-amber-400' : 'text-amber-600'}
        />
      </div>
      
      <h3 className="text-xl font-semibold mt-8 mb-4">Architecture du Système</h3>
      
      <SystemDiagram 
        layers={systemLayers}
        description={systemDescription}
        colorMode={colorMode}
      />
    </section>
  );
};

export default Introduction;