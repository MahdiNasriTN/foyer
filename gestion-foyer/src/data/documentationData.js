import {
  LightBulbIcon,
  UserGroupIcon,
  CodeIcon,
  TerminalIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  SupportIcon,
  DownloadIcon,
  LightningBoltIcon,
  BookOpenIcon
} from '@heroicons/react/outline';
import React from 'react';

export const docSections = [
  {
    id: 'commencer',
    title: 'Pour Commencer',
    icon: <LightBulbIcon className="h-5 w-5" />,
    subsections: [
      { id: 'introduction', title: 'Introduction' },
      { id: 'fonctionnalites', title: 'Fonctionnalités Principales' },
      { id: 'architecture', title: 'Architecture du Système' },
    ]
  },
  {
    id: 'installation',
    title: 'Installation',
    icon: <DownloadIcon className="h-5 w-5" />,
    subsections: [
      { id: 'prerequis', title: 'Prérequis' },
      { id: 'instructions-installation', title: 'Instructions d\'Installation' },
      { id: 'options-configuration', title: 'Options de Configuration' },
      { id: 'docker', title: 'Installation avec Docker' },
    ]
  },
  {
    id: 'demarrage-rapide',
    title: 'Guide de Démarrage Rapide',
    icon: <LightningBoltIcon className="h-5 w-5" />,
    subsections: [
      { id: 'connexion', title: 'Connexion' },
      { id: 'tableau-de-bord', title: 'Explorer le Tableau de Bord' },
      { id: 'premier-stagiaire', title: 'Ajouter un Stagiaire' },
      { id: 'configurer-chambres', title: 'Configurer les Chambres' },
      { id: 'etapes-suivantes', title: 'Étapes Suivantes' },
    ]
  },
  {
    id: 'guide-utilisateur',
    title: 'Guide Utilisateur',
    icon: <UserGroupIcon className="h-5 w-5" />,
    subsections: [
      { id: 'tableau-de-bord', title: 'Tableau de Bord' },
      { id: 'stagiaires', title: 'Gestion des Stagiaires' },
      { id: 'personnel', title: 'Gestion du Personnel' },
      { id: 'chambres', title: 'Gestion des Chambres' },
      { id: 'cuisine', title: 'Gestion de la Cuisine' }
    ]
  },
  {
    id: 'reference-api',
    title: 'Référence API',
    icon: <CodeIcon className="h-5 w-5" />,
    subsections: [
      { id: 'authentication', title: 'Authentification' },
      { id: 'stagiaires-api', title: 'API Stagiaires' },
      { id: 'chambres-api', title: 'API Chambres' },
      { id: 'personnel-api', title: 'API Personnel' }
    ]
  },
  {
    id: 'developpement',  // Vérifiez que c'est exactement le même que dans le switch case
    title: 'Développement',
    icon: <TerminalIcon className="h-5 w-5" />,
    subsections: [
      { id: 'architecture', title: 'Architecture' },
      { id: 'frontend', title: 'Développement Frontend' },
      { id: 'backend', title: 'Développement Backend' },
      { id: 'base-de-donnees', title: 'Schéma de Base de Données' }
    ]
  },
  {
    id: 'securite',
    title: 'Sécurité',
    icon: <ShieldCheckIcon className="h-5 w-5" />,
    subsections: [
      { id: 'authentification', title: 'Authentification' },
      { id: 'autorisation', title: 'Autorisation' },
      { id: 'protection-donnees', title: 'Protection des Données' }
    ]
  },
  {
    id: 'deploiement',
    title: 'Déploiement',
    icon: <ChartBarIcon className="h-5 w-5" />,
    subsections: [
      { id: 'prerequis', title: 'Prérequis' },
      { id: 'production', title: 'Configuration de Production' },
      { id: 'ci-cd', title: 'Pipeline CI/CD' }
    ]
  },
  {
    id: 'support',
    title: 'Support',
    icon: <SupportIcon className="h-5 w-5" />,
    subsections: [
      { id: 'faq', title: 'FAQ' },
      { id: 'depannage', title: 'Dépannage' },
      { id: 'contact', title: 'Contacter le Support' }
    ]
  }
];