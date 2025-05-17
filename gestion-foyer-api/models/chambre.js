const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Chambre:
 *       type: object
 *       required:
 *         - numero
 *         - capacite
 *         - batiment
 *         - etage
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *           description: ID auto-généré de la chambre
 *         numero:
 *           type: string
 *           description: Numéro de la chambre
 *         capacite:
 *           type: integer
 *           description: Capacité maximale de la chambre
 *           minimum: 1
 *         batiment:
 *           type: string
 *           description: Bâtiment où se trouve la chambre
 *         etage:
 *           type: integer
 *           description: Étage où se trouve la chambre
 *         type:
 *           type: string
 *           enum: [garcon, fille]
 *           description: Type de chambre (pour garçons ou filles)
 *         description:
 *           type: string
 *           description: Description ou notes sur la chambre
 *         occupants:
 *           type: array
 *           items:
 *             type: string
 *           description: Liste des IDs des stagiaires occupant la chambre
 *         status:
 *           type: string
 *           enum: [disponible, occupee, en_maintenance]
 *           description: État actuel de la chambre
 *         dateCreation:
 *           type: string
 *           format: date-time
 *           description: Date de création de l'enregistrement
 *       example:
 *         numero: "A-101"
 *         capacite: 2
 *         batiment: "Bâtiment A"
 *         etage: 1
 *         type: "garcon"
 *         description: "Chambre double avec balcon"
 *         status: "disponible"
 */
const chambreSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true
  },
  capacite: {
    type: Number,
    required: [true, 'Room capacity is required'],
    default: 2
  },
  nombreLits: {  // Ajout du nouveau champ
    type: Number,
    default: 2
  },
  etage: {
    type: Number,
    required: [true, 'Floor level is required']
  },
  type: {
    type: String,
    enum: ['simple', 'double', 'triple', 'quadruple', 'accessible', 'standard', 'luxe', 'suite', 'premium'],
    default: 'double'
  },
  statut: {
    type: String,
    enum: ['disponible', 'occupee', 'maintenance', 'libre', 'occupée'],
    default: 'disponible'
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Renommer en equipements pour correspondre au fronend ou accepter les deux noms
  amenities: {
    type: [String],
    default: []
  },
  equipements: {
    type: [String],
    default: []
  },
  gender: {
    type: String,
    enum: ['garcon', 'fille'],
    default: 'garcon'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for occupants
chambreSchema.virtual('occupants', {
  ref: 'Stagiaire',
  localField: '_id',
  foreignField: 'chambre'
});

// Virtual property for occupation count
chambreSchema.virtual('nombreOccupants').get(function() {
  return this.occupants ? this.occupants.length : 0;
});

// Modifier la méthode virtuelle tauxOccupation pour vérifier si occupants existe
chambreSchema.virtual('tauxOccupation').get(function() {
  if (!this.capacite) return 0;
  // Vérifier si this.occupants existe avant d'accéder à sa propriété length
  return (this.occupants && this.occupants.length ? this.occupants.length : 0) / this.capacite * 100;
});

// Method to check if room is available
chambreSchema.methods.isAvailable = function() {
  return this.statut === 'disponible' || this.statut === 'libre';
};

// Middleware pour mapper les statuts entre le frontend et le backend
chambreSchema.pre('save', function(next) {
  // Mapper les statuts
  if (this.statut === 'occupée') this.statut = 'occupee';
  if (this.statut === 'libre') this.statut = 'disponible';
  
  // Copier equipements vers amenities si nécessaire
  if (this.equipements && this.equipements.length > 0 && (!this.amenities || this.amenities.length === 0)) {
    this.amenities = this.equipements;
  }
  
  next();
});

// Middleware pour adapter les réponses à ce que le frontend attend
chambreSchema.post('find', function(docs) {
  if (!docs) return;
  docs.forEach(doc => {
    // Convertir le statut pour le frontend
    if (doc.statut === 'occupee') doc.statut = 'occupée';
    if (doc.statut === 'disponible') doc.statut = 'libre';
    
    // S'assurer que equipements est rempli
    if (!doc.equipements || doc.equipements.length === 0) {
      doc.equipements = doc.amenities || [];
    }
  });
});

chambreSchema.post('findOne', function(doc) {
  if (!doc) return;
  
  // Convertir le statut pour le frontend
  if (doc.statut === 'occupee') doc.statut = 'occupée';
  if (doc.statut === 'disponible') doc.statut = 'libre';
  
  // S'assurer que equipements est rempli
  if (!doc.equipements || doc.equipements.length === 0) {
    doc.equipements = doc.amenities || [];
  }
});

const Chambre = mongoose.model('Chambre', chambreSchema);

module.exports = Chambre;