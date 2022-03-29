const mongoose = require('mongoose');

const bwlDb = new mongoose.Schema({
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
  guildId: { type: String, required: false },
  authorId: { type: String, required: true },
  links: { type: [String], required: true },
  createdTimestamp: { type: mongoose.Decimal128, required: true },
});

module.exports = mongoose.model('komu_bwl', bwlDb);
