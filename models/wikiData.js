const mongoose = require('mongoose');


const wikidb = new mongoose.Schema({
     name: { type: String, required: true },
     value: { type: String, required: false },     
     creator: { type: String, required: true },
     status: { type: String, required: false },
     createdate: { type: mongoose.Decimal128, required: false },
     note: { type: String, required: false },
})
const wikiData = module.exports = mongoose.model('komu_wiki', wikidb)