const mongoose = require('mongoose');

const mentionedDb = new mongoose.Schema({
  messageId: { type: String, required: false },
  authorId: { type: String, required: false },
  channelId: { type: String, required: false },
  mentionUserId: { type: String, required: false },
  createdTimestamp: { type: mongoose.Decimal128, required: false },
  noti: { type: Boolean, required: false },
  confirm: { type: Boolean, required: false },
  punish: { type: Boolean, required: false },
  reactionTimestamp: {
    type: mongoose.Decimal128,
    required: false,
    default: null,
  },
});

module.exports = mongoose.model('komu_mentioned', mentionedDb);
