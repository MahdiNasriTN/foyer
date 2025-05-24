const mongoose = require('mongoose');

// Check if model exists before creating
const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', 
  new mongoose.Schema({
    type: {
      type: String,
      required: [true, 'Schedule type is required'],
      enum: ['general', 'personal'],
      default: 'general'
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {}
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  })
);

module.exports = Schedule;