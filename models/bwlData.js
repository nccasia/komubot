const mongoose = require('mongoose');


const bwldb = new mongoose.Schema({
     channelId: { type: String, required: true },
     messageId: { type: String, required: true },
     guildId: { type: String, required: true },
     authorId: {type: String, required: true },
     links: { type: [String], required: true },
     createdTimestamp: { type: mongoose.Decimal128, required: true }
})

const bwlData = module.exports = mongoose.model('komu_bwl', bwldb)
