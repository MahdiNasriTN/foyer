import React from 'react';
import {
  CodeIcon,
  DatabaseIcon,
  UserIcon,
  HomeIcon,
  AnnotationIcon,
  ServerIcon,
  ShieldCheckIcon,
  ExclamationIcon
} from '@heroicons/react/outline';

import AlertBox from '../common/AlertBox';
import CodeBlock from '../common/CodeBlock';

const ReferenceAPI = ({ colorMode }) => {
  return (
    <section id="reference-api" className="mb-16">
      <h2 className={`text-2xl font-bold mb-6 pb-2 border-b ${
        colorMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>Référence API</h2>
      
      <p className="mb-6">
        Cette section décrit les endpoints API disponibles pour l'intégration avec d'autres systèmes.
        L'API Gestionnaire de Foyer utilise REST et renvoie des données au format JSON.
      </p>
      
      <AlertBox
        type="info"
        title="Base URL"
        colorMode={colorMode}
      >
        <p>
          Toutes les URL d'API doivent être préfixées avec la base URL: <code>https://api.ges-foyer.com/api/v1</code> ou 
          <code>http://localhost:5000/api/v1</code> pour les environnements de développement.
        </p>
      </AlertBox>
      
      {/* Authentication */}
      <div id="authentication" className="mb-12">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <ShieldCheckIcon className={`h-6 w-6 mr-2 ${
            colorMode === 'dark' ? 'text-blue-400' : 'text-blue-600'
          }`} />
          Authentification
        </h3>
        
        <p className="mb-4">
          L'API utilise JSON Web Tokens (JWT) pour l'authentification. Pour accéder aux endpoints protégés,
          vous devez d'abord obtenir un token via l'endpoint de connexion.
        </p>
        
        <div className="mb-6">
          <h4 className={`font-medium mb-3 pb-1 border-b ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>Connexion</h4>
          
          <div className={`mb-4 grid grid-cols-4 p-2 rounded-t-lg ${
            colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="font-medium">POST</div>
            <div className="col-span-3 font-mono text-sm">/auth/login</div>
          </div>
          
          <h5 className="font-medium mb-2">Corps de la requête</h5>
          <CodeBlock
            language="json"
            colorMode={colorMode}
          >{`{
  "email": "utilisateur@example.com",
  "password": "motdepasse"
}`}</CodeBlock>
          
          <h5 className="font-medium mt-4 mb-2">Réponse réussie (200 OK)</h5>
          <CodeBlock
            language="json"
            colorMode={colorMode}
          >{`{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "5f7b2c9b4e4e7e001c123456",
    "name": "Nom Utilisateur",
    "email": "utilisateur@example.com",
    "role": "administrateur"
  }
}`}</CodeBlock>
          
          <h5 className="font-medium mt-4 mb-2">Utilisation du Token</h5>
          <p className="mb-2">
            Pour les requêtes authentifiées, incluez le token dans l'en-tête HTTP:
          </p>
          <CodeBlock
            language="text"
            colorMode={colorMode}
          >{`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}</CodeBlock>
        </div>
        
        <AlertBox
          type="warning"
          title="Sécurité"
          colorMode={colorMode}
        >
          <p>
            Les tokens JWT ont une durée de validité de 24 heures. Après expiration, vous devrez
            vous reconnecter pour obtenir un nouveau token.
          </p>
        </AlertBox>
      </div>
      
      {/* Stagiaires API */}
      <div id="stagiaires-api" className="mb-12">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <UserIcon className={`h-6 w-6 mr-2 ${
            colorMode === 'dark' ? 'text-green-400' : 'text-green-600'
          }`} />
          API Stagiaires
        </h3>
        
        <p className="mb-4">
          Ces endpoints permettent de gérer les stagiaires dans le système.
        </p>
        
        <div className="mb-8">
          <h4 className={`font-medium mb-3 pb-1 border-b ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>Obtenir tous les stagiaires</h4>
          
          <div className={`mb-4 grid grid-cols-4 p-2 rounded-t-lg ${
            colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="font-medium">GET</div>
            <div className="col-span-3 font-mono text-sm">/stagiaires</div>
          </div>
          
          <h5 className="font-medium mb-2">Paramètres de requête</h5>
          <div className={`mb-4 rounded-lg overflow-hidden border ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>
            <table className="min-w-full divide-y divide-gray-300">
              <thead className={`${
                colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Paramètre</th>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Type</th>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 px-4 text-sm font-mono">page</td>
                  <td className="py-2 px-4 text-sm">Nombre</td>
                  <td className="py-2 px-4 text-sm">Numéro de page (défaut: 1)</td>
                </tr>
                <tr className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <td className="py-2 px-4 text-sm font-mono">limit</td>
                  <td className="py-2 px-4 text-sm">Nombre</td>
                  <td className="py-2 px-4 text-sm">Nombre de résultats par page (défaut: 10, max: 100)</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-sm font-mono">search</td>
                  <td className="py-2 px-4 text-sm">Chaîne</td>
                  <td className="py-2 px-4 text-sm">Recherche par nom, prénom ou identifiant</td>
                </tr>
                <tr className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <td className="py-2 px-4 text-sm font-mono">type</td>
                  <td className="py-2 px-4 text-sm">Chaîne</td>
                  <td className="py-2 px-4 text-sm">"interne" ou "externe" pour filtrer par type</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h5 className="font-medium mt-4 mb-2">Exemple de réponse</h5>
          <CodeBlock
            language="json"
            colorMode={colorMode}
          >{`{
  "success": true,
  "count": 50,
  "pagination": {
    "current": 1,
    "total": 5,
    "next": 2,
    "prev": null
  },
  "data": [
    {
      "id": "609a1c7b2e943c001c739a31",
      "nom": "Dupont",
      "prenom": "Jean",
      "dateNaissance": "1998-05-12T00:00:00.000Z",
      "email": "jean.dupont@example.com",
      "telephone": "+33612345678",
      "type": "interne",
      "chambre": "103",
      "centreFormation": "Centre Technique Paris",
      "dateDebut": "2023-09-01T00:00:00.000Z",
      "dateFin": "2024-06-30T00:00:00.000Z"
    },
    // ... autres stagiaires
  ]
}`}</CodeBlock>
        </div>
        
        <div className="mb-8">
          <h4 className={`font-medium mb-3 pb-1 border-b ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>Obtenir un stagiaire spécifique</h4>
          
          <div className={`mb-4 grid grid-cols-4 p-2 rounded-t-lg ${
            colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="font-medium">GET</div>
            <div className="col-span-3 font-mono text-sm">/stagiaires/:id</div>
          </div>
          
          <h5 className="font-medium mb-2">Paramètres de chemin</h5>
          <div className={`mb-4 rounded-lg overflow-hidden border ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>
            <table className="min-w-full divide-y divide-gray-300">
              <thead className={`${
                colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Paramètre</th>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Type</th>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 text-sm font-mono">id</td>
                  <td className="py-2 px-4 text-sm">String</td>
                  <td className="py-2 px-4 text-sm">ID unique du stagiaire</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h5 className="font-medium mt-4 mb-2">Exemple de réponse</h5>
          <CodeBlock
            language="json"
            colorMode={colorMode}
          >{`{
  "success": true,
  "data": {
    "id": "609a1c7b2e943c001c739a31",
    "nom": "Dupont",
    "prenom": "Jean",
    "dateNaissance": "1998-05-12T00:00:00.000Z",
    "email": "jean.dupont@example.com",
    "telephone": "+33612345678",
    "adresse": {
      "rue": "15 Rue des Lilas",
      "ville": "Paris",
      "codePostal": "75020",
      "pays": "France"
    },
    "type": "interne",
    "chambre": {
      "id": "60a1b7c2d8e9f0001c123456",
      "numero": "103",
      "etage": 1
    },
    "centreFormation": "Centre Technique Paris",
    "formation": "Développement Web",
    "dateDebut": "2023-09-01T00:00:00.000Z",
    "dateFin": "2024-06-30T00:00:00.000Z",
    "infosSante": {
      "allergies": ["arachides"],
      "maladies": [],
      "medicaments": []
    },
    "contactUrgence": {
      "nom": "Dupont Marie",
      "telephone": "+33687654321",
      "relation": "Mère"
    }
  }
}`}</CodeBlock>
        </div>
        
        <div className="mb-8">
          <h4 className={`font-medium mb-3 pb-1 border-b ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>Créer un stagiaire</h4>
          
          <div className={`mb-4 grid grid-cols-4 p-2 rounded-t-lg ${
            colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="font-medium">POST</div>
            <div className="col-span-3 font-mono text-sm">/stagiaires</div>
          </div>
          
          <h5 className="font-medium mb-2">Corps de la requête</h5>
          <p className="text-sm mb-2">
            Les champs obligatoires sont marqués d'un astérisque (*).
          </p>
          <CodeBlock
            language="json"
            colorMode={colorMode}
          >{`{
  "nom": "Dupont", *
  "prenom": "Jean", *
  "dateNaissance": "1998-05-12", *
  "email": "jean.dupont@example.com",
  "telephone": "+33612345678", *
  "adresse": {
    "rue": "15 Rue des Lilas",
    "ville": "Paris",
    "codePostal": "75020",
    "pays": "France"
  },
  "type": "interne", *
  "chambre": "103",  // Requis si type est "interne"
  "centreFormation": "Centre Technique Paris", *
  "formation": "Développement Web", *
  "dateDebut": "2023-09-01", *
  "dateFin": "2024-06-30", *
  "infosSante": {
    "allergies": ["arachides"],
    "maladies": [],
    "medicaments": []
  },
  "contactUrgence": {
    "nom": "Dupont Marie",
    "telephone": "+33687654321",
    "relation": "Mère"
  }
}`}</CodeBlock>

          <h5 className="font-medium mt-4 mb-2">Réponse réussie (201 Created)</h5>
          <CodeBlock
            language="json"
            colorMode={colorMode}
          >{`{
  "success": true,
  "data": {
    "id": "609a1c7b2e943c001c739a31",
    "nom": "Dupont",
    "prenom": "Jean",
    // ... autres données du stagiaire créé
  }
}`}</CodeBlock>
        </div>
        
        <AlertBox
          type="info"
          title="Autres endpoints disponibles"
          colorMode={colorMode}
        >
          <p>
            Les endpoints suivants sont également disponibles:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
            <li><code>PUT /stagiaires/:id</code> - Mettre à jour un stagiaire</li>
            <li><code>DELETE /stagiaires/:id</code> - Supprimer un stagiaire</li>
            <li><code>GET /stagiaires/stats</code> - Obtenir des statistiques sur les stagiaires</li>
            <li><code>POST /stagiaires/import</code> - Importer plusieurs stagiaires (CSV, Excel)</li>
          </ul>
        </AlertBox>
      </div>
      
      {/* Chambres API */}
      <div id="chambres-api" className="mb-12">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <HomeIcon className={`h-6 w-6 mr-2 ${
            colorMode === 'dark' ? 'text-amber-400' : 'text-amber-600'
          }`} />
          API Chambres
        </h3>
        
        <p className="mb-4">
          Ces endpoints permettent de gérer les chambres dans le système.
        </p>
        
        <div className="mb-8">
          <h4 className={`font-medium mb-3 pb-1 border-b ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>Obtenir toutes les chambres</h4>
          
          <div className={`mb-4 grid grid-cols-4 p-2 rounded-t-lg ${
            colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="font-medium">GET</div>
            <div className="col-span-3 font-mono text-sm">/chambres</div>
          </div>
          
          <h5 className="font-medium mb-2">Paramètres de requête</h5>
          <div className={`mb-4 rounded-lg overflow-hidden border ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>
            <table className="min-w-full divide-y divide-gray-300">
              <thead className={`${
                colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Paramètre</th>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Type</th>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 px-4 text-sm font-mono">etage</td>
                  <td className="py-2 px-4 text-sm">Nombre</td>
                  <td className="py-2 px-4 text-sm">Filtrer par étage</td>
                </tr>
                <tr className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <td className="py-2 px-4 text-sm font-mono">status</td>
                  <td className="py-2 px-4 text-sm">String</td>
                  <td className="py-2 px-4 text-sm">Filtrer par statut (disponible, occupee, maintenance, horsservice)</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-sm font-mono">capacite</td>
                  <td className="py-2 px-4 text-sm">Nombre</td>
                  <td className="py-2 px-4 text-sm">Filtrer par capacité (nombre de lits)</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h5 className="font-medium mt-4 mb-2">Exemple de réponse</h5>
          <CodeBlock
            language="json"
            colorMode={colorMode}
          >{`{
  "success": true,
  "count": 30,
  "data": [
    {
      "id": "60a1b7c2d8e9f0001c123456",
      "numero": "101",
      "etage": 1,
      "capacite": 2,
      "status": "occupee",
      "equipements": ["bureau", "armoire", "etagere", "wifi"],
      "occupants": [
        {
          "id": "609a1c7b2e943c001c739a31",
          "nom": "Dupont",
          "prenom": "Jean"
        }
      ]
    },
    {
      "id": "60a1b7c2d8e9f0001c123457",
      "numero": "102",
      "etage": 1,
      "capacite": 1,
      "status": "disponible",
      "equipements": ["bureau", "armoire", "etagere", "wifi"],
      "occupants": []
    }
    // ... autres chambres
  ]
}`}</CodeBlock>
        </div>
        
        <div className="mb-8">
          <h4 className={`font-medium mb-3 pb-1 border-b ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>Attribuer une chambre</h4>
          
          <div className={`mb-4 grid grid-cols-4 p-2 rounded-t-lg ${
            colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="font-medium">POST</div>
            <div className="col-span-3 font-mono text-sm">/chambres/:id/attribuer</div>
          </div>
          
          <h5 className="font-medium mb-2">Paramètres de chemin</h5>
          <div className={`mb-4 rounded-lg overflow-hidden border ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>
            <table className="min-w-full divide-y divide-gray-300">
              <thead className={`${
                colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Paramètre</th>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Type</th>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 text-sm font-mono">id</td>
                  <td className="py-2 px-4 text-sm">String</td>
                  <td className="py-2 px-4 text-sm">ID unique de la chambre</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h5 className="font-medium mb-2">Corps de la requête</h5>
          <CodeBlock
            language="json"
            colorMode={colorMode}
          >{`{
  "stagiaireId": "609a1c7b2e943c001c739a31",
  "dateDebut": "2023-10-01",
  "dateFin": "2024-06-30",
  "notes": "Clé remise le 01/10/2023"
}`}</CodeBlock>

          <h5 className="font-medium mt-4 mb-2">Réponse réussie (200 OK)</h5>
          <CodeBlock
            language="json"
            colorMode={colorMode}
          >{`{
  "success": true,
  "message": "Chambre attribuée avec succès",
  "data": {
    "id": "60a1b7c2d8e9f0001c123456",
    "numero": "101",
    "status": "occupee",
    "occupants": [
      {
        "id": "609a1c7b2e943c001c739a31",
        "nom": "Dupont",
        "prenom": "Jean",
        "dateDebut": "2023-10-01T00:00:00.000Z",
        "dateFin": "2024-06-30T00:00:00.000Z"
      }
    ]
  }
}`}</CodeBlock>
        </div>
        
        <AlertBox
          type="warning"
          title="Vérifications lors de l'attribution"
          colorMode={colorMode}
        >
          <p>
            Lors de l'attribution d'une chambre, le système vérifie:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
            <li>Que la chambre est disponible ou n'a pas atteint sa capacité maximale</li>
            <li>Que le stagiaire est de type "interne"</li>
            <li>Que le stagiaire n'est pas déjà assigné à une autre chambre pour la même période</li>
          </ul>
        </AlertBox>
      </div>
      
      {/* Personnel API */}
      <div id="personnel-api" className="mb-12">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <UserIcon className={`h-6 w-6 mr-2 ${
            colorMode === 'dark' ? 'text-purple-400' : 'text-purple-600'
          }`} />
          API Personnel
        </h3>
        
        <p className="mb-4">
          Ces endpoints permettent de gérer les membres du personnel dans le système.
        </p>
        
        <div className="mb-8">
          <h4 className={`font-medium mb-3 pb-1 border-b ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>Obtenir tous les membres du personnel</h4>
          
          <div className={`mb-4 grid grid-cols-4 p-2 rounded-t-lg ${
            colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="font-medium">GET</div>
            <div className="col-span-3 font-mono text-sm">/personnel</div>
          </div>
          
          <h5 className="font-medium mb-2">Paramètres de requête</h5>
          <div className={`mb-4 rounded-lg overflow-hidden border ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>
            <table className="min-w-full divide-y divide-gray-300">
              <thead className={`${
                colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Paramètre</th>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Type</th>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 px-4 text-sm font-mono">status</td>
                  <td className="py-2 px-4 text-sm">String</td>
                  <td className="py-2 px-4 text-sm">Filtrer par statut (actif, inactif, all)</td>
                </tr>
                <tr className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <td className="py-2 px-4 text-sm font-mono">department</td>
                  <td className="py-2 px-4 text-sm">String</td>
                  <td className="py-2 px-4 text-sm">Filtrer par département (Administration, Ressources Humaines, etc.)</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-sm font-mono">role</td>
                  <td className="py-2 px-4 text-sm">String</td>
                  <td className="py-2 px-4 text-sm">Filtrer par rôle (admin, manager, employee)</td>
                </tr>
                <tr className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <td className="py-2 px-4 text-sm font-mono">search</td>
                  <td className="py-2 px-4 text-sm">String</td>
                  <td className="py-2 px-4 text-sm">Recherche par nom, prénom, email ou poste</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-sm font-mono">startDate</td>
                  <td className="py-2 px-4 text-sm">Date</td>
                  <td className="py-2 px-4 text-sm">Date d'embauche minimale (format YYYY-MM-DD)</td>
                </tr>
                <tr className={`${colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <td className="py-2 px-4 text-sm font-mono">endDate</td>
                  <td className="py-2 px-4 text-sm">Date</td>
                  <td className="py-2 px-4 text-sm">Date d'embauche maximale (format YYYY-MM-DD)</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h5 className="font-medium mt-4 mb-2">Exemple de réponse</h5>
          <CodeBlock
            language="json"
            colorMode={colorMode}
          >{`{
  "status": "success",
  "results": 3,
  "data": [
    {
      "_id": "60e8a1b2c3d4e5f6a7b8c9d0",
      "firstName": "Martin",
      "lastName": "Dupont",
      "email": "martin.dupont@example.com",
      "telephone": "+216 55 123 456",
      "poste": "Directeur",
      "departement": "Administration",
      "dateEmbauche": "2020-01-15T00:00:00.000Z",
      "statut": "actif",
      "role": "admin",
      "permissions": ["view", "edit", "delete", "approve"],
      "createdAt": "2023-01-01T10:30:00.000Z",
      "updatedAt": "2023-01-01T10:30:00.000Z"
    },
    {
      "_id": "60e8a1b2c3d4e5f6a7b8c9d1",
      "firstName": "Sophie",
      "lastName": "Leclerc",
      "email": "sophie.leclerc@example.com",
      "telephone": "+216 55 789 012",
      "poste": "Responsable RH",
      "departement": "Ressources Humaines",
      "dateEmbauche": "2021-03-10T00:00:00.000Z",
      "statut": "actif",
      "role": "manager",
      "permissions": ["view", "edit"],
      "createdAt": "2023-01-02T14:20:00.000Z",
      "updatedAt": "2023-01-02T14:20:00.000Z"
    }
    // ... autres membres du personnel
  ]
}`}</CodeBlock>
        </div>
        
        <div className="mb-8">
          <h4 className={`font-medium mb-3 pb-1 border-b ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>Obtenir un membre du personnel par ID</h4>
          
          <div className={`mb-4 grid grid-cols-4 p-2 rounded-t-lg ${
            colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="font-medium">GET</div>
            <div className="col-span-3 font-mono text-sm">/personnel/:id</div>
          </div>
          
          <h5 className="font-medium mb-2">Paramètres de chemin</h5>
          <div className={`mb-4 rounded-lg overflow-hidden border ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>
            <table className="min-w-full divide-y divide-gray-300">
              <thead className={`${
                colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Paramètre</th>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Type</th>
                  <th scope="col" className="py-2 px-4 text-left text-sm font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 text-sm font-mono">id</td>
                  <td className="py-2 px-4 text-sm">String</td>
                  <td className="py-2 px-4 text-sm">ID unique du membre du personnel</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h5 className="font-medium mt-4 mb-2">Exemple de réponse</h5>
          <CodeBlock
            language="json"
            colorMode={colorMode}
          >{`{
  "status": "success",
  "data": {
    "_id": "60e8a1b2c3d4e5f6a7b8c9d0",
    "firstName": "Martin",
    "lastName": "Dupont",
    "email": "martin.dupont@example.com",
    "telephone": "+216 55 123 456",
    "poste": "Directeur",
    "departement": "Administration",
    "dateEmbauche": "2020-01-15T00:00:00.000Z",
    "statut": "actif",
    "adresse": "123 Rue de la Paix, Tunis",
    "role": "admin",
    "permissions": ["view", "edit", "delete", "approve"],
    "createdAt": "2023-01-01T10:30:00.000Z",
    "updatedAt": "2023-01-01T10:30:00.000Z"
  }
}`}</CodeBlock>
        </div>
        
        <div className="mb-8">
          <h4 className={`font-medium mb-3 pb-1 border-b ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>Créer un membre du personnel</h4>
          
          <div className={`mb-4 grid grid-cols-4 p-2 rounded-t-lg ${
            colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="font-medium">POST</div>
            <div className="col-span-3 font-mono text-sm">/personnel</div>
          </div>
          
          <h5 className="font-medium mb-2">Corps de la requête</h5>
          <p className="text-sm mb-2">
            Les champs obligatoires sont marqués d'un astérisque (*).
          </p>
          <CodeBlock
            language="json"
            colorMode={colorMode}
          >{`{
  "firstName": "Nouveau", *
  "lastName": "Employé", *
  "email": "nouveau.employe@example.com", *
  "telephone": "+216 55 111 222",
  "poste": "Assistant RH", *
  "departement": "Ressources Humaines", *
  "dateEmbauche": "2023-05-01", *
  "statut": "actif",
  "adresse": "45 Avenue Habib Bourguiba, Tunis",
  "role": "employee",
  "permissions": ["view", "edit"]
}`}</CodeBlock>

          <h5 className="font-medium mt-4 mb-2">Réponse réussie (201 Created)</h5>
          <CodeBlock
            language="json"
            colorMode={colorMode}
          >{`{
  "status": "success",
  "data": {
    "_id": "60e8a1b2c3d4e5f6a7b8c9d2",
    "firstName": "Nouveau",
    "lastName": "Employé",
    "email": "nouveau.employe@example.com",
    "telephone": "+216 55 111 222",
    "poste": "Assistant RH",
    "departement": "Ressources Humaines",
    "dateEmbauche": "2023-05-01T00:00:00.000Z",
    "statut": "actif",
    "adresse": "45 Avenue Habib Bourguiba, Tunis",
    "role": "employee",
    "permissions": ["view", "edit"],
    "createdAt": "2023-05-12T09:45:00.000Z",
    "updatedAt": "2023-05-12T09:45:00.000Z"
  }
}`}</CodeBlock>
        </div>
        
        <div className="mb-8">
          <h4 className={`font-medium mb-3 pb-1 border-b ${
            colorMode === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}>Statistiques du personnel</h4>
          
          <div className={`mb-4 grid grid-cols-4 p-2 rounded-t-lg ${
            colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="font-medium">GET</div>
            <div className="col-span-3 font-mono text-sm">/personnel/stats</div>
          </div>
          
          <h5 className="font-medium mt-4 mb-2">Exemple de réponse</h5>
          <CodeBlock
            language="json"
            colorMode={colorMode}
          >{`{
  "status": "success",
  "data": {
    "total": 15,
    "active": 12,
    "inactive": 3,
    "activeRate": 80,
    "departments": {
      "Administration": 3,
      "Ressources Humaines": 2,
      "Sécurité": 4,
      "Restauration": 3,
      "Technique": 2,
      "Hébergement": 1
    },
    "roles": {
      "admin": 1,
      "manager": 3,
      "employee": 11
    }
  }
}`}</CodeBlock>
        </div>
        
        <AlertBox
          type="info"
          title="Autres endpoints disponibles"
          colorMode={colorMode}
        >
          <p>
            Les endpoints suivants sont également disponibles:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
            <li><code>PUT /personnel/:id</code> - Mettre à jour un membre du personnel</li>
            <li><code>DELETE /personnel/:id</code> - Supprimer un membre du personnel</li>
          </ul>
        </AlertBox>
      </div>
      
      
    </section>
  );
};

export default ReferenceAPI;