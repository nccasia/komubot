const mongoose = require('mongoose');

const bwlreactdb = new mongoose.Schema({
     channelId: { type: String, required: true },
     messageId: { type: String, required: true },
     guildId: { type: String, required: true },
     authorId: {type: String, required: true },
     emoji: { type: String, required: true },
     count: { type: Number, required: true },
     createdTimestamp: { type: mongoose.Decimal128, required: true }
})

const bwlReactData = module.exports = mongoose.model('komu_bwlreaction', bwlreactdb)