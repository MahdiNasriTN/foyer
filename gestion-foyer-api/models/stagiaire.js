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
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  identifier: {
    type: String,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Already unique
    lowercase: true,
    trim: true,
    index: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  cycle: {
    type: String,
    enum: ['sep', 'nov', 'fev', 'externe'],
    required: function() {
      return this.type !== 'externe';
    }
  },
  sessionYear: {
    type: String,
    required: function() {
      return this.type !== 'externe';
    }
  },
  telephone: {
    type: String,
    unique: true, // NEW: Make telephone unique
    sparse: true, // Allow null values but ensure uniqueness when present
    index: true
  },
  phoneNumber: {
    type: String,
    unique: true, // NEW: Make phoneNumber unique
    sparse: true,
    index: true
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
    type: String,
    unique: true,
    sparse: true,
    index: true,
    trim: true,
    validate: {
      validator: function(v) {
        // If CIN is provided, it must be exactly 8 digits
        if (!v) return true; // Allow empty/null values
        return /^[0-9]{8}$/.test(v);
      },
      message: 'Le numéro CIN doit contenir exactement 8 chiffres'
    },
    maxlength: [8, 'Le numéro CIN ne peut pas dépasser 8 caractères'],
    minlength: [8, 'Le numéro CIN doit contenir exactement 8 chiffres']
  },
  cinPlace: {
    type: String,
    trim: true
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
  groupNumber: {
    type: String,
    trim: true
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
  // Add the accommodation card field
  carteHebergement: {
    type: String,
    enum: ['oui', 'non'],
    default: 'non'
  },
  // Add the restauration card field for external stagiaires
  carteRestauration: {
    type: String,
    enum: ['oui', 'non'],
    default: 'non',
    required: function() {
      return this.type === 'externe';
    }
  },
  chambre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chambre'
  },
  payment: {
    restauration: {
      enabled: { type: Boolean, default: false },
      status: { type: String, enum: ['payé', 'dispensé'], default: 'payé' },
      semester1Price: { type: Number, default: 0 },
      semester2Price: { type: Number, default: 0 },
      semester3Price: { type: Number, default: 0 }
    },
    restaurationFoyer: {
      enabled: { type: Boolean, default: false },
      status: { type: String, enum: ['payé', 'dispensé'], default: 'payé' },
      semester1Price: { type: Number, default: 0 },
      semester2Price: { type: Number, default: 0 },
      semester3Price: { type: Number, default: 0 }
    },
    inscription: {
      enabled: { type: Boolean, default: false },
      status: { type: String, enum: ['payé', 'dispensé'], default: 'payé' },
      annualPrice: { type: Number, default: 0 }
    },
    totalAmount: { type: Number, default: 0 },
    lastUpdated: { type: Date }
  },
}, {
  timestamps: true
});

// NEW: Add compound indexes for logical uniqueness
stagiaireSchema.index({ firstName: 1, lastName: 1, dateOfBirth: 1 }, { 
  unique: true, 
  sparse: true,
  name: 'unique_person_birthdate'
});

stagiaireSchema.index({ assignedCenter: 1, groupNumber: 1, sessionYear: 1 }, { 
  unique: true, 
  sparse: true,
  name: 'unique_group_assignment'
});

// Enhanced pre-save validation
stagiaireSchema.pre('save', async function(next) {
  try {
    // Generate identifier if it doesn't exist
    if (!this.identifier) {
      const cycle = this.cycle ? this.cycle.toLowerCase() : 'sep';
      const year = this.sessionYear 
        ? this.sessionYear.toString().substring(2) 
        : new Date().getFullYear().toString().substring(2);
      
      const counter = await Counter.findOneAndUpdate(
        { name: 'stagiaireCounter' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      
      this.identifier = `${cycle}${year}-${counter.value}`;
    }
    
    // Enhanced CIN validation
    if (this.cinNumber) {
      // Clean and validate CIN
      this.cinNumber = this.cinNumber.replace(/\s+/g, '').trim();
      
      // Strict CIN validation: exactly 8 digits
      const cinRegex = /^[0-9]{8}$/;
      if (!cinRegex.test(this.cinNumber)) {
        return next(new Error('Le numéro CIN doit contenir exactement 8 chiffres'));
      }
      
      // Check for duplicate CIN (excluding current document)
      const existingCIN = await this.constructor.findOne({
        cinNumber: this.cinNumber,
        _id: { $ne: this._id }
      });
      
      if (existingCIN) {
        return next(new Error('Ce numéro CIN existe déjà dans le système'));
      }
    }
    
    // Validate and clean phone numbers
    if (this.telephone) {
      this.telephone = this.telephone.replace(/\s+/g, '').trim();
      const phoneRegex = /^(\+216|0)?[2-9][0-9]{7}$/;
      if (!phoneRegex.test(this.telephone)) {
        return next(new Error('Format de téléphone invalide'));
      }
    }
    
    if (this.phoneNumber) {
      this.phoneNumber = this.phoneNumber.replace(/\s+/g, '').trim();
      const phoneRegex = /^(\+216|0)?[2-9][0-9]{7}$/;
      if (!phoneRegex.test(this.phoneNumber)) {
        return next(new Error('Format de numéro de téléphone invalide'));
      }
    }
    
    // Validate dates logic
    if (this.dateArrivee && this.dateDepart && this.dateArrivee >= this.dateDepart) {
      return next(new Error('La date de départ doit être postérieure à la date d\'arrivée'));
    }
    
    if (this.trainingPeriodFrom && this.trainingPeriodTo && this.trainingPeriodFrom >= this.trainingPeriodTo) {
      return next(new Error('La date de fin de formation doit être postérieure à la date de début'));
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

// Add a pre-save middleware to calculate total amount - UPDATED for combined structure
stagiaireSchema.pre('save', function(next) {
  if (this.payment) {
    let total = 0;
    
    // Calculate restauration total for external stagiaires
    if (this.type === 'externe' && this.payment.restauration && this.payment.restauration.enabled && this.payment.restauration.status === 'payé') {
      total += (this.payment.restauration.semester1Price || 0) + 
               (this.payment.restauration.semester2Price || 0) + 
               (this.payment.restauration.semester3Price || 0);
    }
    
    // Calculate restaurationFoyer total for internal stagiaires (combined restauration & foyer)
    if (this.type === 'interne' && this.payment.restaurationFoyer && this.payment.restaurationFoyer.enabled && this.payment.restaurationFoyer.status === 'payé') {
      total += (this.payment.restaurationFoyer.semester1Price || 0) + 
               (this.payment.restaurationFoyer.semester2Price || 0) + 
               (this.payment.restaurationFoyer.semester3Price || 0);
    }
    
    // Calculate inscription total (annual) - only for internal stagiaires
    if (this.type === 'interne' && this.payment.inscription && this.payment.inscription.enabled && this.payment.inscription.status === 'payé') {
      total += (this.payment.inscription.annualPrice || 0);
    }
    
    this.payment.totalAmount = total;
    this.payment.lastUpdated = new Date();
  }
  
  next();
});

const Stagiaire = mongoose.model('Stagiaire', stagiaireSchema);

module.exports = Stagiaire;