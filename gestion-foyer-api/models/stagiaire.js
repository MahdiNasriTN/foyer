const mongoose = require('mongoose');

// Create a separate model for the counter
const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, default: 1000 }
});

const Counter = mongoose.model('Counter', CounterSchema);

/**
 * @swagger
 * components:
 *   schemas:
 *     Stagiaire:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - sexe
 *         - dateArrivee
 *       properties:
 *         _id:
 *           type: string
 *           description: ID auto-généré du stagiaire
 *         firstName:
 *           type: string
 *           description: Prénom du stagiaire
 *         lastName:
 *           type: string
 *           description: Nom du stagiaire
 *         email:
 *           type: string
 *           format: email
 *           description: Email du stagiaire
 *         telephone:
 *           type: string
 *           description: Numéro de téléphone
 *         phoneNumber:
 *           type: string
 *           description: Autre numéro de téléphone
 *         sexe:
 *           type: string
 *           enum: [garcon, fille]
 *           description: Genre du stagiaire
 *         dateArrivee:
 *           type: string
 *           format: date
 *           description: Date d'arrivée au foyer
 *         dateDepart:
 *           type: string
 *           format: date
 *           description: Date de départ prévue
 *         type:
 *           type: string
 *           enum: [interne, externe]
 *           description: Type de stagiaire
 *         chambre:
 *           type: string
 *           description: ID de la chambre assignée
 *       example:
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         telephone: "+216 55 123 456"
 *         sexe: garcon
 *         dateArrivee: "2023-09-01"
 *         dateDepart: "2024-06-30"
 *         type: interne
 */
const stagiaireSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required']
  },
  identifier: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  cycle: {
    type: String,
    enum: ['sep', 'nov', 'fev'],
    required: [true, 'Cycle is required']
  },
  sessionYear: {
    type: String,
    required: [true, 'Session year is required']
  },
  telephone: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  sexe: {
    type: String,
    enum: ['garcon', 'fille'],
    required: [true, 'Gender is required']
  },
  dateArrivee: {
    type: Date,
    required: [true, 'Arrival date is required']
  },
  dateDepart: {
    type: Date
  },
  trainingPeriodFrom: {
    type: Date
  },
  trainingPeriodTo: {
    type: Date
  },
  entreprise: {
    type: String
  },
  type: {
    type: String,
    enum: ['interne', 'externe'],
    default: 'interne'
  },
  cinNumber: {
    type: String
  },
  cinPlace: {
    type: String
  },
  cinDate: {
    type: Date
  },
  dateOfBirth: {
    type: Date
  },
  placeOfBirth: {
    type: String
  },
  nationality: {
    type: String
  },
  currentSituation: {
    type: String
  },
  sendingAddress: {
    type: String
  },
  city: {
    type: String
  },
  postalCode: {
    type: String
  },
  centerName: {
    type: String
  },
  assignedCenter: {
    type: String
  },
  specialization: {
    type: String
  },
  cycle: {
    type: String
  },
  groupNumber: {
    type: String
  },
  profilePhoto: {
    type: String
  },
  fatherFirstName: {
    type: String
  },
  fatherLastName: {
    type: String
  },
  fatherPhone: {
    type: String
  },
  fatherJob: {
    type: String
  },
  fatherJobPlace: {
    type: String
  },
  motherFirstName: {
    type: String
  },
  motherLastName: {
    type: String
  },
  motherPhone: {
    type: String
  },
  motherJob: {
    type: String
  },
  motherJobPlace: {
    type: String
  },
  numberOfBrothers: {
    type: Number
  },
  numberOfSisters: {
    type: Number
  },
  hobby: {
    type: String
  },
  // Reference to Chambre
  chambre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chambre'
  }
}, {
  timestamps: true
});

// Modify pre-save middleware to use cycle instead of session
stagiaireSchema.pre('save', async function(next) {
  try {
    // Only generate identifier if it doesn't exist
    if (!this.identifier) {
      // Make sure cycle is lowercase and has a default if undefined
      const cycle = this.cycle ? this.cycle.toLowerCase() : 'sep';
      
      // Make sure sessionYear has a default if undefined
      const year = this.sessionYear 
        ? this.sessionYear.toString().substring(2) 
        : new Date().getFullYear().toString().substring(2);
      
      // Find the counter document or create it if it doesn't exist
      const counter = await Counter.findOneAndUpdate(
        { name: 'stagiaireCounter' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      
      // Generate the identifier with session prefix, year, and counter value
      this.identifier = `${cycle}${year}-${counter.value}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Add virtual for full name
stagiaireSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

const Stagiaire = mongoose.model('Stagiaire', stagiaireSchema);

module.exports = Stagiaire;