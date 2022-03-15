const mongoose = require('mongoose');

const timeVoiceAlonedb = new mongoose.Schema({
  channelId: { type: String, required: true },
  status: { type: Boolean, required: true },
  start_time: { type: mongoose.Decimal128, required: true },
});

module.exports = mongoose.model('komu_timeVoiceAlone', timeVoiceAlonedb);
