const mongoose = require('mongoose');
require('dotenv').config();
const Personnel = require('../models/personnel');

const personnelData = [
  {
    firstName: 'Martin',
    lastName: 'Dupont',
    email: 'martin.dupont@example.com',
    telephone: '+216 55 123 456',
    poste: 'Directeur',
    departement: 'Administration',
    dateEmbauche: '2020-01-15',
    statut: 'actif',
    adresse: '123 Rue de la Paix, Tunis',
    role: 'admin',
    permissions: ['view', 'edit', 'delete', 'approve']
  },
  {
    firstName: 'Sophie',
    lastName: 'Leclerc',
    email: 'sophie.leclerc@example.com',
    telephone: '+216 55 789 012',
    poste: 'Responsable RH',
    departement: 'Ressources Humaines',
    dateEmbauche: '2021-03-10',
    statut: 'actif',
    adresse: '45 Avenue Habib Bourguiba, Tunis',
    role: 'manager',
    permissions: ['view', 'edit']
  },
  // Ajoutez d'autres employés ici
];

const seedPersonnel = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gestion_foyer');
    console.log('Connected to MongoDB');
    
    // Suppression des données existantes
    await Personnel.deleteMany({});
    console.log('Existing personnel data cleared');
    
    // Insertion des nouvelles données
    await Personnel.insertMany(personnelData);
    console.log(`${personnelData.length} personnel records inserted`);
    
    // Déconnexion
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    
    console.log('Personnel seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding personnel data:', error);
    process.exit(1);
  }
};

seedPersonnel();