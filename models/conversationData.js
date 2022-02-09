const mongoose = require('mongoose');

const conversationdb = new mongoose.Schema({
  channelId: { type: String, required: true },
  authorId: { type: String, required: true },
  generated_responses: { type: [String], required: false },
  past_user_inputs: { type: [String], required: false },
  createdTimestamp: { type: mongoose.Decimal128, required: true },
  updatedTimestamp: { type: mongoose.Decimal128, required: false },
});

module.exports = mongoose.model('komu_conversation', conversationdb);
