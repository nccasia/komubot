const mongoose = require('mongoose');

const meetingDb = new mongoose.Schema({
  channelId: { type: String, required: false },
  createdTimestamp: { type: mongoose.Decimal128, required: false },
  task: { type: String, required: false },
  repeat: { type: String, required: false },
  repeatTime: { type: Number, required: false },
  cancel: { type: Boolean, default: false },
  reminder: { type: Boolean, default: false },
});

module.exports = mongoose.model('komu_meeting', meetingDb);
