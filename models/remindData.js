const mongoose = require('mongoose');

const remindDb = new mongoose.Schema({
  channelId: { type: String, required: true },
  mentionUserId: { type: String, required: true },
  authorId: { type: String, required: true },
  content: { type: String, required: true },
  cancel: { type: Boolean, required: false },
  createdTimestamp: { type: mongoose.Decimal128, required: false },
});

module.exports = mongoose.model('komu_remind', remindDb);
