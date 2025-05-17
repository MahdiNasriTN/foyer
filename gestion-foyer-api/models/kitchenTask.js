const mongoose = require('mongoose');

const kitchenTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required']
  },
  description: {
    type: String
  },
  date: {
    type: Date,
    required: [true, 'Task date is required']
  },
  heureDebut: {
    type: String
  },
  heureFin: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  stagiaireId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stagiaire',
    required: [true, 'Stagiaire ID is required for kitchen task']
  },
  // For association with a stagiaire
  stagiaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stagiaire'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  timestamps: true
});

const KitchenTask = mongoose.model('KitchenTask', kitchenTaskSchema);

module.exports = KitchenTask;