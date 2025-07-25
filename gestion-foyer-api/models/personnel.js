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
  identifier: {
    type: String,
    required: true,
    unique: true, // Already unique
    trim: true,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  nom: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // Already unique
    trim: true,
    lowercase: true,
    index: true
  },
  telephone: {
    type: String,
    required: true,
    unique: true, // NEW: Make telephone unique
    trim: true,
    index: true
  },
  poste: {
    type: String,
    required: true,
    trim: true
  },
  departement: {
    type: String,
    required: true,
    enum: ['Administration', 'Ressources Humaines', 'Sécurité', 'Restauration', 'Technique', 'Hébergement']
  },
  dateEmbauche: {
    type: Date,
    required: true
  },
  statut: {
    type: String,
    enum: ['actif', 'inactif'],
    default: 'actif'
  },
  adresse: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// NEW: Add compound indexes for logical uniqueness
personnelSchema.index({ firstName: 1, lastName: 1, dateEmbauche: 1 }, { 
  unique: true, 
  name: 'unique_person_hire_date'
});

// NEW: Enhanced pre-save validation
personnelSchema.pre('save', async function(next) {
  try {
    // Generate identifier if new
    if (this.isNew && !this.identifier) {
      const currentYear = new Date().getFullYear();
      let isUnique = false;
      let identifier;
      
      while (!isUnique) {
        const randomNumber = Math.floor(Math.random() * 9000) + 1000;
        identifier = `EMP${currentYear}${randomNumber}`;
        
        const existingEmployee = await this.constructor.findOne({ identifier });
        if (!existingEmployee) {
          isUnique = true;
        }
      }
      
      this.identifier = identifier;
    }
    
    // Auto-generate nom field
    if (this.firstName && this.lastName) {
      this.nom = `${this.firstName} ${this.lastName}`;
    }
    
    // NEW: Validate and clean telephone
    if (this.telephone) {
      this.telephone = this.telephone.replace(/\s+/g, '').trim();
      const phoneRegex = /^(\+216|0)?[2-9][0-9]{7}$/;
      if (!phoneRegex.test(this.telephone)) {
        return next(new Error('Format de téléphone invalide'));
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Check if model already exists to prevent overwrite error
const Personnel = mongoose.models.Personnel || mongoose.model('Personnel', personnelSchema);

module.exports = Personnel;