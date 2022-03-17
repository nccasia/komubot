const mongoose = require('mongoose');

const msgdb = new mongoose.Schema(
  {
    channelId: { type: String, required: false },
    guildId: { type: String, required: false },
    deleted: { type: Boolean, required: false },
    id: { type: String, required: false, unique: true },
    createdTimestamp: { type: mongoose.Decimal128, required: false },
    type: { type: String, required: false },
    system: { type: Boolean, required: false },
    content: { type: String, required: false },
    author: { type: String, required: false },
    pinned: { type: Boolean, required: false },
    tts: { type: Boolean, required: false },
    nonce: { type: String, required: false },
    embeds: { type: Array, required: false },
    components: { type: Array, required: false },
    attachments: { type: Array, required: false },
    stickers: { type: Array, required: false },
    editedTimestamp: { type: mongoose.Decimal128, required: false },
    reactions: { type: Array, required: false },
    mentions: { type: Array, required: false },
    webhookId: { type: String, required: false },
    groupActivityApplication: { type: String, required: false },
    applicationId: { type: String, required: false },
    activity: { type: String, required: false },
    flags: { type: Number, required: false },
    reference: { type: String, required: false },
    interaction: { type: String, required: false },
  },
  { id: false }
);

module.exports = mongoose.model('komu_msg', msgdb);
