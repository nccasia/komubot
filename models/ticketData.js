const mongoose = require('mongoose');


const ticketdb = new mongoose.Schema({
     title: { type: String, required: true },
     desc: { type: String, required: false },
     asignee: { type: String, required: true },
     creator: { type: String, required: true },
     status: { type: String, required: false },
     createdate: { type: mongoose.Decimal128, required: false },
     note: { type: String, required: false },     
})
const ticketData = module.exports = mongoose.model('komu_ticket', ticketdb)