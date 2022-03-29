const mongoose = require('mongoose');

const leaveDb = new mongoose.Schema({
  channelId: { type: String, required: true },
  userId: { type: String, required: true },
  reason: { type: String, required: true },
  minute: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('komu_leave', leaveDb);
