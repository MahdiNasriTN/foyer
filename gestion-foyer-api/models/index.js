// Replace your Sequelize-based index.js with this Mongoose-based one
const mongoose = require('mongoose');

// Import all models
const User = require('./user');
const Stagiaire = require('./stagiaire');
const Chambre = require('./chambre');
const KitchenTask = require('./kitchenTask');

// Export all models
module.exports = {
  User,
  Stagiaire,
  Chambre,
  KitchenTask
};