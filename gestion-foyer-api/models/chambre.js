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
    unique: true, // Already unique
    trim: true,
    index: true
  },
  capacite: {
    type: Number,
    required: [true, 'Room capacity is required'],
    default: 2,
    min: [1, 'Capacity must be at least 1'],
    max: [6, 'Capacity cannot exceed 6']
  },
  nombreLits: {
    type: Number,
    default: 2,
    min: [1, 'Number of beds must be at least 1'],
    max: [6, 'Number of beds cannot exceed 6']
  },
  etage: {
    type: Number,
    required: [true, 'Floor level is required'],
    min: [1, 'Floor must be at least 1'],
    max: [10, 'Floor cannot exceed 10']
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
  amenities: {
    type: [String],
    default: []
  },
  equipements: {
    type: [String],
    default: []
  },
  occupants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Stagiaire',
    default: []
  },
  // Enhanced gender field with better validation
  gender: {
    type: String,
    enum: {
      values: ['garcon', 'fille', 'mixte'],
      message: 'Le genre doit être "garcon", "fille" ou "mixte"'
    },
    required: [true, 'Le genre de la chambre est requis'],
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

// NEW: Add compound index for floor-number uniqueness
chambreSchema.index({ etage: 1, numero: 1 }, { 
  unique: true, 
  name: 'unique_floor_room_number'
});

// Virtual property for occupation count
chambreSchema.virtual('nombreOccupants').get(function() {
  return this.occupants ? this.occupants.length : 0;
});

// Virtual property for occupation rate
chambreSchema.virtual('tauxOccupation').get(function() {
  if (!this.capacite) return 0;
  return (this.occupants && this.occupants.length ? this.occupants.length : 0) / this.capacite * 100;
});

// Method to check if room is available
chambreSchema.methods.isAvailable = function() {
  return this.statut === 'libre' || this.statut === 'disponible';
};

// Method to check if room has space
chambreSchema.methods.hasSpace = function() {
  const currentOccupants = this.occupants ? this.occupants.length : 0;
  return currentOccupants < this.capacite;
};

// Method to check gender compatibility
chambreSchema.methods.isGenderCompatible = function(stagiaireGender) {
  return this.gender === 'mixte' || this.gender === stagiaireGender;
};

// NEW: Enhanced pre-save validation
chambreSchema.pre('save', function(next) {
  // Validate room number format
  if (this.numero) {
    this.numero = this.numero.trim().toUpperCase();
    
    // Basic room number validation (adjust as needed)
    const roomRegex = /^[A-Z]?[0-9]{3}[A-Z]?$/;
    if (!roomRegex.test(this.numero)) {
      return next(new Error('Format de numéro de chambre invalide (ex: 101, A101, 101A)'));
    }
  }
  
  // Sync beds with capacity
  if (this.capacite && (!this.nombreLits || this.nombreLits !== this.capacite)) {
    this.nombreLits = this.capacite;
  }
  
  // Validate capacity vs occupants
  const occupantCount = this.occupants ? this.occupants.length : 0;
  if (occupantCount > this.capacite) {
    return next(new Error(`Le nombre d'occupants (${occupantCount}) ne peut pas dépasser la capacité (${this.capacite})`));
  }
  
  // Auto-calculate floor from room number
  if (this.numero) {
    const numericPart = this.numero.replace(/[^0-9]/g, '');
    const number = parseInt(numericPart);
    
    if (!isNaN(number)) {
      if (number >= 100 && number <= 199) this.etage = 1;
      else if (number >= 200 && number <= 299) this.etage = 2;
      else if (number >= 300 && number <= 399) this.etage = 3;
      else if (number >= 400 && number <= 499) this.etage = 4;
      else this.etage = 1;
    }
  }
  
  // Update status based on occupancy
  const occupants = this.occupants ? this.occupants.length : 0;
  if (occupants === 0) {
    this.statut = 'disponible';
  } else if (occupants >= this.capacite) {
    this.statut = 'occupee';
  } else {
    this.statut = 'occupee';
  }
  
  next();
});

// Middleware to update room status based on occupancy
chambreSchema.pre('save', function(next) {
  // Map status values
  if (this.statut === 'occupée') this.statut = 'occupee';
  if (this.statut === 'libre') this.statut = 'disponible';
  
  // Update status based on occupancy
  const occupantCount = this.occupants ? this.occupants.length : 0;
  if (occupantCount === 0) {
    this.statut = 'disponible';
  } else if (occupantCount >= this.capacite) {
    this.statut = 'occupee';
  } else {
    this.statut = 'occupee'; // Partially occupied
  }
  
  // Copy equipements to amenities if needed
  if (this.equipements && this.equipements.length > 0 && (!this.amenities || this.amenities.length === 0)) {
    this.amenities = this.equipements;
  }
  
  next();
});

// Middleware to auto-calculate floor and sync beds with capacity
chambreSchema.pre('save', function(next) {
  // Auto-calculate floor based on room number
  if (this.numero) {
    const numericPart = this.numero.replace(/[^0-9]/g, '');
    const number = parseInt(numericPart);
    
    if (!isNaN(number)) {
      if (number >= 100 && number <= 199) this.etage = 1;
      else if (number >= 200 && number <= 299) this.etage = 2;
      else if (number >= 300 && number <= 399) this.etage = 3;
      else if (number >= 400 && number <= 499) this.etage = 4;
      else this.etage = 1; // Default to floor 1
    }
  }
  
  // Auto-sync number of beds with capacity
  if (this.capacite && (!this.nombreLits || this.nombreLits !== this.capacite)) {
    this.nombreLits = this.capacite;
  }
  
  // Map status values
  if (this.statut === 'occupée') this.statut = 'occupee';
  if (this.statut === 'libre') this.statut = 'disponible';
  
  // Update status based on occupancy
  const occupantCount = this.occupants ? this.occupants.length : 0;
  if (occupantCount === 0) {
    this.statut = 'disponible';
  } else if (occupantCount >= this.capacite) {
    this.statut = 'occupee';
  } else {
    this.statut = 'occupee'; // Partially occupied
  }
  
  // Copy equipements to amenities if needed
  if (this.equipements && this.equipements.length > 0 && (!this.amenities || this.amenities.length === 0)) {
    this.amenities = this.equipements;
  }
  
  next();
});

// Post-processing for frontend compatibility
chambreSchema.post('find', function(docs) {
  if (!docs) return;
  docs.forEach(doc => {
    if (doc.statut === 'occupee') doc.statut = 'occupée';
    if (doc.statut === 'disponible') doc.statut = 'libre';
    
    if (!doc.equipements || doc.equipements.length === 0) {
      doc.equipements = doc.amenities || [];
    }
  });
});

chambreSchema.post('findOne', function(doc) {
  if (!doc) return;
  
  if (doc.statut === 'occupee') doc.statut = 'occupée';
  if (doc.statut === 'disponible') doc.statut = 'libre';
  
  if (!doc.equipements || doc.equipements.length === 0) {
    doc.equipements = doc.amenities || [];
  }
});

// Index for better performance
chambreSchema.index({ gender: 1, statut: 1 });
chambreSchema.index({ etage: 1, gender: 1 });

const Chambre = mongoose.model('Chambre', chambreSchema);

module.exports = Chambre;