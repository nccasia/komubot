const mongoose = require('mongoose');

const voiceDb = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
});

module.exports = mongoose.model('komu_voices', voiceDb);
