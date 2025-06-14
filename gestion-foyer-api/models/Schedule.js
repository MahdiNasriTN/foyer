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
    enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
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
  timestamps: true
});

// Compound index for efficient queries (simplified)
scheduleSchema.index({ personnelId: 1, day: 1 }, { unique: true });

// Validation for time logic
scheduleSchema.pre('save', function(next) {
  if (!this.isDayOff && this.startTime >= this.endTime) {
    return next(new Error('L\'heure de fin doit être après l\'heure de début'));
  }
  next();
});

// Check if model exists before creating
const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;