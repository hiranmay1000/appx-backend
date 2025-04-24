const mongoose = require('mongoose');

const vaultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['folder', 'file'],
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'VaultItem', // Self-referencing for folder nesting
  },
  filePath: {
    type: String,
    default: null,
  },
  size: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('VaultItem', vaultSchema);
