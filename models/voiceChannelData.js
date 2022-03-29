const mongoose = require('mongoose');

const voiceChannelDb = new mongoose.Schema({
  id: { type: String, required: true },
  originalName: { type: String, required: true },
  newRoomName: { type: String, required: true },
  people: { type: Number, required: true, default: 0 },
  status: { type: String, required: true, default: 'start' },
  createdTimestamp: { type: mongoose.Decimal128, required: false },
});

module.exports = mongoose.model('komu_voicechannels', voiceChannelDb);
