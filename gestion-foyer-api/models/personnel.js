const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Personnel:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - fonction
 *         - dateEmbauche
 *       properties:
 *         _id:
 *           type: string
 *           description: ID auto-généré du membre du personnel
 *         firstName:
 *           type: string
 *           description: Prénom du membre du personnel
 *         lastName:
 *           type: string
 *           description: Nom du membre du personnel
 *         email:
 *           type: string
 *           format: email
 *           description: Email du membre du personnel
 *         telephone:
 *           type: string
 *           description: Numéro de téléphone
 *         fonction:
 *           type: string
 *           enum: [surveillant, cuisinier, agent_entretien, gestionnaire, administrateur, autre]
 *           description: Fonction/Poste occupé
 *         departement:
 *           type: string
 *           enum: [administration, surveillance, restauration, entretien, autre]
 *           description: Département ou service
 *         dateEmbauche:
 *           type: string
 *           format: date
 *           description: Date d'embauche
 *         dateFinContrat:
 *           type: string
 *           format: date
 *           description: Date de fin de contrat (si applicable)
 *         adresse:
 *           type: string
 *           description: Adresse du membre du personnel
 *         estActif:
 *           type: boolean
 *           description: Statut actif ou inactif du membre du personnel
 *         horairesTravail:
 *           type: object
 *           properties:
 *             debut:
 *               type: string
 *               example: "08:00"
 *             fin:
 *               type: string
 *               example: "17:00"
 *             joursRepos:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche]
 *       example:
 *         firstName: "Jean"
 *         lastName: "Dupont"
 *         email: "jean.dupont@example.com"
 *         telephone: "+216 55 123 456"
 *         fonction: "surveillant"
 *         departement: "surveillance"
 *         dateEmbauche: "2022-09-01"
 *         estActif: true
 */
const personnelSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis']
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Veuillez fournir un email valide']
  },
  telephone: {
    type: String,
    trim: true
  },
  poste: {
    type: String,
    required: [true, 'Le poste est requis']
  },
  departement: {
    type: String,
    required: [true, 'Le département est requis'],
    enum: ['Administration', 'Ressources Humaines', 'Sécurité', 'Restauration', 'Technique', 'Hébergement']
  },
  dateEmbauche: {
    type: Date,
    required: [true, 'La date d\'embauche est requise']
  },
  statut: {
    type: String,
    enum: ['actif', 'inactif'],
    default: 'actif'
  },
  adresse: {
    type: String
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee'
  },
  permissions: {
    type: [String],
    enum: ['view', 'edit', 'delete', 'approve'],
    default: ['view']
  },
  avatar: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property for full name
personnelSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

const Personnel = mongoose.model('Personnel', personnelSchema);

module.exports = Personnel;