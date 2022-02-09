const mongoose = require('mongoose');

const tx8db = new mongoose.Schema({
  messageId: { type: String, required: true },
  userId: { type: String, required: true },
  tx8number: { type: Number, required: true },
  status: { type: String, required: true },
  createdTimestamp: { type: mongoose.Decimal128, required: true },
});

module.exports = mongoose.model('komu_tx8', tx8db);
