const mongoose = require('mongoose');

const channelDb = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: false },
  type: { type: String, required: true },
  nsfw: { type: Boolean, required: false },
  rawPosition: { type: Number, required: false },
  lastMessageId: { type: String, required: false },
  rateLimitPerUser: { type: Number, required: false },
  parentId: { type: String, required: false },
});

module.exports = mongoose.model('komu_channel', channelDb);
