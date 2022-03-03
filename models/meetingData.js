const mongoose = require('mongoose');

const meetingdb = new mongoose.Schema({
  channelId: { type: String, required: false },
  createdTimestamp: { type: mongoose.Decimal128, required: false },
  task: { type: String, required: false },
  repeat: { type: String, required: false },
});

module.exports = mongoose.model('komu_meeting', meetingdb);
