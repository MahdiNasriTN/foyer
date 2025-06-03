const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Load the User model directly to avoid circular dependencies
const { User } = require('../models/User');

// Create interface for command line input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gestion_foyer');


    // Get input from CLI or use defaults
    const useDefaults = await question('Utiliser les valeurs par défaut? (O/n): ');
    
    let firstName, lastName, email, password, role, telephone;

    if (useDefaults.toLowerCase() !== 'n') {
      // Use default values
      firstName = 'Admin';
      lastName = 'System';
      email = 'admin@gestion-foyer.ma';
      // Generate a secure random password
      password = uuidv4().substring(0, 8);
      role = 'admin';
      telephone = '';
    } else {
      // Get custom values
      firstName = await question('Prénom: ');
      lastName = await question('Nom: ');
      email = await question('Email: ');
      password = await question('Mot de passe: ');
      
      const roleChoice = await question('Rôle (1: admin, 2: superadmin): ');
      role = roleChoice === '2' ? 'superadmin' : 'admin';
      
      telephone = await question('Téléphone (optionnel): ');
    }

    // Check if admin already exists with this email
    const adminExists = await User.findOne({ email });
    
    if (adminExists) {
      
      const updateUser = await question('Voulez-vous mettre à jour cet utilisateur? (o/N): ');
      
      if (updateUser.toLowerCase() === 'o') {
        // Update existing user
        adminExists.firstName = firstName;
        adminExists.lastName = lastName;
        adminExists.role = role;
        
        if (telephone) {
          adminExists.telephone = telephone;
        }
        
        // Only update password if provided in custom mode
        if (useDefaults.toLowerCase() === 'n' && password) {
          adminExists.password = password;
        }
        
        await adminExists.save();
      }
    } else {
      // Create new admin user
      const admin = await User.create({
        firstName,
        lastName,
        email,
        password,
        role,
        telephone,
        lastLogin: {
          timestamp: new Date(),
          device: 'CLI Script',
          browser: 'Admin Script',
          location: 'Local Server',
          ip: '127.0.0.1'
        }
      });
      
      
      // Save this info to a file for reference
      const fs = require('fs');
      const path = require('path');
      const infoPath = path.join(__dirname, 'admin-credentials.txt');
      
      fs.writeFileSync(
        infoPath,
        `GESTION FOYER - IDENTIFIANTS ADMINISTRATEUR\n` +
        `=============================================\n` +
        `Créé le: ${new Date().toLocaleString('fr-FR')}\n` +
        `Nom: ${admin.firstName} ${admin.lastName}\n` +
        `Email: ${admin.email}\n` +
        `Mot de passe: ${password}\n` +
        `Rôle: ${admin.role}\n` +
        `=============================================\n` +
        `IMPORTANT: Conservez ces informations en lieu sûr et\n` +
        `modifiez ce mot de passe après votre première connexion.`
      );
      
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '\n❌ Erreur lors de la création de l\'administrateur:');
    console.error(error);
  } finally {
    // Close the connection
    rl.close();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
};

// Handle the readline interface closing
rl.on('close', () => {
  process.exit(0);
});

// Run the function
createAdmin();