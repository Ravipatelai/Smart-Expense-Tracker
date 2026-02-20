const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  source: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['recurring', 'one-time'],
    required: true
  },
  frequency: {
    type: String,
    enum: ['monthly', 'weekly', 'yearly', null],
    default: null
  },
  date: {
    type: Date,
    required: true
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);
