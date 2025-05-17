const mongoose = require('mongoose');

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
  nom: {
    type: String
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

// Virtual property for full name
stagiaireSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

const Stagiaire = mongoose.model('Stagiaire', stagiaireSchema);

module.exports = Stagiaire;