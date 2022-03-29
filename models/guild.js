const mongoose = require('mongoose');
const rrDb = new mongoose.Schema({
  serverID: { type: String, required: true },
  description: { type: String, required: false },
  content: { type: String, required: true },
  reason: { type: String, required: true },
});

module.exports = mongoose.model('guild', rrDb);
