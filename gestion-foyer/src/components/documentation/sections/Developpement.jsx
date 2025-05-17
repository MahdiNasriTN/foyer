import React from 'react';
import CodeBlock from '../common/CodeBlock';
import AlertBox from '../common/AlertBox';

const Developpement = ({ colorMode }) => {
  return (
    <section id="developpement" className="mb-16">
      <h2 className={`text-2xl font-bold mb-6 pb-2 border-b ${
        colorMode === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>Développement</h2>
      
      {/* Architecture */}
      <div id="architecture" className="mb-12">
        <h3 className="text-xl font-semibold mb-4">Architecture</h3>
        
        <p className="mb-4">
          Le système de Gestion de Foyer est basé sur une architecture moderne MERN Stack:
        </p>
        
        <ul className="list-disc pl-5 mb-6 space-y-2">
          <li><strong>MongoDB</strong> - Base de données NoSQL flexible et scalable</li>
          <li><strong>Express.js</strong> - Framework backend pour Node.js</li>
          <li><strong>React</strong> - Bibliothèque frontend pour construire l'interface utilisateur</li>
          <li><strong>Node.js</strong> - Environnement d'exécution JavaScript côté serveur</li>
        </ul>
        
        <h4 className="text-lg font-medium mb-3">Structure du Projet</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h5 className="font-medium mb-2">Frontend (React)</h5>
            <CodeBlock
              language="text"
              colorMode={colorMode}
            >{`ges_foyer/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── documentation/
│   │   └── layout/
│   ├── contexts/
│   ├── data/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   ├── App.js
│   └── index.js
└── package.json`}</CodeBlock>
          </div>
          
          <div>
            <h5 className="font-medium mb-2">Backend (Express)</h5>
            <CodeBlock
              language="text"
              colorMode={colorMode}
            >{`gestion_foyer_api/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── .env
├── app.js
└── package.json`}</CodeBlock>
          </div>
        </div>
        
        <h4 className="text-lg font-medium mb-3">Flux de Données</h4>
        
        <p className="mb-4">
          L'application suit une architecture client-serveur classique:
        </p>
        
        <div className={`p-4 rounded-lg mb-6 ${
          colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Le client (React) envoie des requêtes HTTP à l'API REST</li>
            <li>Le serveur (Express) traite les requêtes et interagit avec la base de données</li>
            <li>La base de données (MongoDB) stocke et récupère les données</li>
            <li>Le serveur renvoie des réponses JSON au client</li>
            <li>Le client met à jour l'interface utilisateur en fonction des données reçues</li>
          </ol>
        </div>
      </div>
      
      {/* Développement Frontend */}
      <div id="frontend" className="mb-12">
        <h3 className="text-xl font-semibold mb-4">Développement Frontend</h3>
        
        <p className="mb-4">
          L'interface utilisateur est développée avec React et utilise une combinaison de bibliothèques modernes.
        </p>
        
        <h4 className="text-lg font-medium mb-3">Technologies Principales</h4>
        
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ${
          colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <div className={`p-4 rounded-lg ${
            colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <h5 className="font-medium mb-2">UI & Styling</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>React 18</li>
              <li>Tailwind CSS</li>
              <li>Heroicons</li>
              <li>react-transition-group</li>
            </ul>
          </div>
          
          <div className={`p-4 rounded-lg ${
            colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <h5 className="font-medium mb-2">Fonctionnalités</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>React Router v6</li>
              <li>React Context API</li>
              <li>Custom Hooks</li>
              <li>Axios pour les requêtes HTTP</li>
            </ul>
          </div>
        </div>
        
        <h4 className="text-lg font-medium mb-3">Structure des Composants</h4>
        
        <p className="mb-4">
          L'application est organisée en composants réutilisables:
        </p>
        
        <ul className="list-disc pl-5 mb-6 space-y-2">
          <li><strong>Composants de mise en page</strong> - Header, Sidebar, Footer</li>
          <li><strong>Composants communs</strong> - Button, Card, Table, Modal, AlertBox</li>
          <li><strong>Pages</strong> - Dashboard, Stagiaires, Chambres, Personnel, Settings</li>
          <li><strong>Contextes</strong> - AuthContext, ThemeContext, SidebarContext</li>
        </ul>
        
        <h4 className="text-lg font-medium mb-3">Exemple de Composant</h4>
        
        <CodeBlock
          language="jsx"
          colorMode={colorMode}
        >{`import React from 'react';
import { UserIcon } from '@heroicons/react/outline';

const StatCard = ({ title, value, icon, color, change, changeType, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={\`
        bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300
        hover:shadow-xl hover:scale-[1.02] cursor-pointer relative group
      \`}
    >
      {/* Barre supérieure colorée */}
      <div className={\`h-1 w-full \${color.barColor}\`}></div>
      
      <div className="p-6">
        <div className="flex items-center">
          <div className={\`rounded-lg p-3 \${color.bgColor}\`}>
            {icon}
          </div>
          <div className="ml-4 flex-grow">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              {change && (
                <span className={\`
                  text-xs font-medium px-2 py-1 rounded-full flex items-center
                  \${changeType === 'increase' ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'}
                \`}>
                  {changeType === 'increase' ? '↑' : '↓'} {change}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;`}</CodeBlock>
        
        <h4 className="text-lg font-medium mt-6 mb-3">Routes</h4>
        
        <p className="mb-4">
          Les routes principales de l'application sont définies comme suit:
        </p>
        
        <CodeBlock
          language="jsx"
          colorMode={colorMode}
        >{`import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Pages et Layouts
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StagiairesList from './pages/stagiaires/StagiairesList';
import StagiaireDetails from './pages/stagiaires/StagiaireDetails';
// ... autres imports

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  // Redirection si non connecté
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="stagiaires" element={<StagiairesList />} />
        <Route path="stagiaires/:id" element={<StagiaireDetails />} />
        <Route path="chambres" element={<ChambresPage />} />
        <Route path="personnel" element={<PersonnelPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="documentation/*" element={<Documentation />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};`}</CodeBlock>
      </div>
      
      {/* Développement Backend */}
      <div id="backend" className="mb-12">
        <h3 className="text-xl font-semibold mb-4">Développement Backend</h3>
        
        <p className="mb-4">
          Le backend est développé avec Node.js et Express, fournissant une API RESTful.
        </p>
        
        <h4 className="text-lg font-medium mb-3">Technologies Principales</h4>
        
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ${
          colorMode === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <div className={`p-4 rounded-lg ${
            colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <h5 className="font-medium mb-2">Core & Database</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>Node.js</li>
              <li>Express.js</li>
              <li>MongoDB</li>
              <li>Mongoose</li>
            </ul>
          </div>
          
          <div className={`p-4 rounded-lg ${
            colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <h5 className="font-medium mb-2">Sécurité & Utils</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>JWT (jsonwebtoken)</li>
              <li>bcrypt</li>
              <li>cors</li>
              <li>dotenv</li>
            </ul>
          </div>
        </div>
        
        <h4 className="text-lg font-medium mb-3">Architecture MVC</h4>
        
        <p className="mb-4">
          Le backend suit une architecture Model-View-Controller (sans View car c'est une API):
        </p>
        
        <div className={`p-4 rounded-lg mb-6 ${
          colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Models</strong> - Définition des schémas Mongoose et logique métier</li>
            <li><strong>Controllers</strong> - Traitement des requêtes et envoi des réponses</li>
            <li><strong>Routes</strong> - Définition des endpoints API et liaison aux controllers</li>
            <li><strong>Middleware</strong> - Fonctions intermédiaires pour l'authentification, la validation, etc.</li>
          </ul>
        </div>
        
        <h4 className="text-lg font-medium mb-3">Exemple de Modèle</h4>
        
        <CodeBlock
          language="javascript"
          colorMode={colorMode}
        >{`const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Veuillez fournir un nom'],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, 'Veuillez fournir un prénom'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Veuillez fournir un email'],
    unique: true,
    lowercase: true,
    match: [
      /^\\w+([.-]?\\w+)*@\\w+([.-]?\\w+)*(\\.\\w{2,3})+$/,
      'Veuillez fournir un email valide'
    ]
  },
  password: {
    type: String,
    required: [true, 'Veuillez fournir un mot de passe'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super-admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware de pré-sauvegarde pour hacher le mot de passe
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer un JWT
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

module.exports = mongoose.model('User', userSchema);`}</CodeBlock>
        
        <h4 className="text-lg font-medium mt-6 mb-3">Exemple de Contrôleur</h4>
        
        <CodeBlock
          language="javascript"
          colorMode={colorMode}
        >{`const Stagiaire = require('../models/stagiaire');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Obtenir tous les stagiaires
// @route   GET /api/v1/stagiaires
// @access  Private
exports.getStagiaires = asyncHandler(async (req, res, next) => {
  // Copie de req.query pour ajouter la pagination et le filtrage
  const reqQuery = { ...req.query };
  
  // Champs à exclure
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);
  
  // Création de la chaîne de requête
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\\b(gt|gte|lt|lte|in)\\b/g, match => \`$\${match}\`);
  
  // Recherche de base
  let query = Stagiaire.find(JSON.parse(queryStr));
  
  // Sélection de champs
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }
  
  // Tri
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Stagiaire.countDocuments();
  
  query = query.skip(startIndex).limit(limit);
  
  // Exécution de la requête
  const stagiaires = await query;
  
  // Pagination result
  const pagination = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  
  res.status(200).json({
    success: true,
    count: stagiaires.length,
    pagination,
    data: stagiaires
  });
});

// @desc    Obtenir un stagiaire par ID
// @route   GET /api/v1/stagiaires/:id
// @access  Private
exports.getStagiaire = asyncHandler(async (req, res, next) => {
  const stagiaire = await Stagiaire.findById(req.params.id);
  
  if (!stagiaire) {
    return next(
      new ErrorResponse(\`Stagiaire non trouvé avec l'id \${req.params.id}\`, 404)
    );
  }
  
  res.status(200).json({
    success: true,
    data: stagiaire
  });
});`}</CodeBlock>
        
        <AlertBox
          type="info"
          title="API RESTful"
          colorMode={colorMode}
        >
          <p>
            L'API suit les principes REST avec des endpoints cohérents et des méthodes HTTP standard:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
            <li><code>GET /api/v1/stagiaires</code> - Récupérer tous les stagiaires</li>
            <li><code>GET /api/v1/stagiaires/:id</code> - Récupérer un stagiaire spécifique</li>
            <li><code>POST /api/v1/stagiaires</code> - Créer un nouveau stagiaire</li>
            <li><code>PUT /api/v1/stagiaires/:id</code> - Mettre à jour un stagiaire</li>
            <li><code>DELETE /api/v1/stagiaires/:id</code> - Supprimer un stagiaire</li>
          </ul>
        </AlertBox>
      </div>
      
      {/* Schéma de Base de Données */}
      <div id="base-de-donnees" className="mb-12">
        <h3 className="text-xl font-semibold mb-4">Schéma de Base de Données</h3>
        
        <p className="mb-4">
          La base de données MongoDB est structurée autour de plusieurs collections principales qui représentent les entités du système.
        </p>
        
        <h4 className="text-lg font-medium mb-3">Modèles Principaux</h4>
        
        <div className="mb-6">
          <h5 className="font-medium mb-2">Stagiaire</h5>
          <CodeBlock
            language="javascript"
            colorMode={colorMode}
          >{`{
  nom: String,               // Nom de famille du stagiaire
  prenom: String,            // Prénom du stagiaire
  dateNaissance: Date,       // Date de naissance
  sexe: String,              // "M" ou "F"
  email: String,             // Email de contact
  telephone: String,         // Numéro de téléphone
  adresse: {                 // Adresse structurée
    rue: String,
    ville: String,
    codePostal: String,
    pays: String
  },
  type: String,              // "interne" ou "externe"
  chambre: {                 // Référence à la chambre (pour les internes)
    type: ObjectId,
    ref: 'Chambre'
  },
  centreFormation: String,   // Centre de formation
  formation: String,         // Type de formation suivie
  dateDebut: Date,           // Date de début de la formation
  dateFin: Date,             // Date de fin de la formation
  infosSante: {              // Informations sanitaires
    allergies: [String],
    maladies: [String],
    medicaments: [String]
  },
  contactUrgence: {          // Contact en cas d'urgence
    nom: String,
    telephone: String,
    relation: String
  },
  status: String,            // État du stagiaire: "actif", "inactif", "suspendu"
  createdAt: Date,           // Date de création de l'enregistrement
  updatedAt: Date            // Date de dernière mise à jour
}`}</CodeBlock>
        </div>
        
        <div className="mb-6">
          <h5 className="font-medium mb-2">Chambre</h5>
          <CodeBlock
            language="javascript"
            colorMode={colorMode}
          >{`{
  numero: String,            // Numéro de la chambre (unique)
  etage: Number,             // Étage où se situe la chambre
  capacite: Number,          // Nombre de places disponibles
  type: String,              // "simple", "double", "triple"...
  equipements: [String],     // Liste des équipements
  status: String,            // "disponible", "occupee", "maintenance", "horsservice"
  occupants: [{              // Liste des stagiaires occupant la chambre
    type: ObjectId,
    ref: 'Stagiaire'
  }],
  batiment: String,          // Bâtiment où se trouve la chambre
  dateControle: Date,        // Date du dernier contrôle
  remarques: String,         // Remarques sur l'état de la chambre
  createdAt: Date,           // Date de création de l'enregistrement
  updatedAt: Date            // Date de dernière mise à jour
}`}</CodeBlock>
        </div>
        
        <div className="mb-6">
          <h5 className="font-medium mb-2">Personnel</h5>
          <CodeBlock
            language="javascript"
            colorMode={colorMode}
          >{`{
  firstName: String,         // Prénom
  lastName: String,          // Nom de famille
  email: String,             // Email professionnel
  telephone: String,         // Numéro de téléphone
  poste: String,             // Intitulé du poste
  departement: String,       // Département ou service
  dateEmbauche: Date,        // Date d'embauche
  statut: String,            // "actif" ou "inactif"
  adresse: String,           // Adresse personnelle
  role: String,              // "admin", "manager", "employee"
  permissions: [String],     // Permissions spécifiques
  createdAt: Date,           // Date de création de l'enregistrement
  updatedAt: Date            // Date de dernière mise à jour
}`}</CodeBlock>
        </div>
        
        <h4 className="text-lg font-medium mb-3">Relations Entre les Modèles</h4>
        
        <p className="mb-4">
          Les principales relations entre les collections sont:
        </p>
        
        <div className={`p-4 rounded-lg mb-6 ${
          colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Stagiaire → Chambre</strong>: Un stagiaire (interne) est affecté à une chambre</li>
            <li><strong>Chambre → Stagiaires</strong>: Une chambre peut accueillir plusieurs stagiaires (selon sa capacité)</li>
            <li><strong>User → Personnel</strong>: Un utilisateur du système peut être associé à un membre du personnel</li>
          </ul>
        </div>
        
        <AlertBox
          type="warning"
          title="Validation des Données"
          colorMode={colorMode}
        >
          <p>
            Mongoose est utilisé pour appliquer la validation des données avant leur insertion dans la base de données.
            Chaque schéma inclut des règles de validation pour garantir l'intégrité des données.
          </p>
        </AlertBox>
      </div>
    </section>
  );
};

export default Developpement;