const mongoose = require('mongoose');


const keepdb = new mongoose.Schema({
     userid: { type: String, required: false },
     note: { type: String, required: false },
     createdAt: { type: Date, default: Date.now },
     status: { type: String, required: false }
})
const keepData = module.exports = mongoose.model('komu_keep', keepdb)