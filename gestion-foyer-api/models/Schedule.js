const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  personnelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel',
    required: true,
    index: true
  },
  day: {
    type: String,
    required: true,
    enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
    index: true
  },
  isDayOff: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Number,
    min: 0,
    max: 23,
    required: function() {
      return !this.isDayOff;
    }
  },
  endTime: {
    type: Number,
    min: 0,
    max: 23,
    required: function() {
      return !this.isDayOff;
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  tasks: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ENHANCED: Compound index for strict uniqueness
scheduleSchema.index({ personnelId: 1, day: 1 }, { 
  unique: true, 
  name: 'unique_personnel_day_schedule'
});

// Virtual for shift duration
scheduleSchema.virtual('duration').get(function() {
  if (this.isDayOff || !this.startTime || !this.endTime) {
    return 0;
  }
  return this.endTime - this.startTime;
});

// NEW: Enhanced pre-save validation
scheduleSchema.pre('save', function(next) {
  // Validate time logic
  if (!this.isDayOff && this.startTime !== undefined && this.endTime !== undefined) {
    if (this.startTime >= this.endTime) {
      return next(new Error('L\'heure de fin doit être supérieure à l\'heure de début'));
    }
    
    // Validate reasonable working hours
    if (this.endTime - this.startTime > 12) {
      return next(new Error('Une journée de travail ne peut pas dépasser 12 heures'));
    }
  }
  
  // Clear data for day off
  if (this.isDayOff) {
    this.startTime = undefined;
    this.endTime = undefined;
    this.tasks = [];
  }
  
  next();
});

module.exports = mongoose.model('Schedule', scheduleSchema);