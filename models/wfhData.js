const mongoose = require('mongoose');


const wfhdb = new mongoose.Schema({
     userid: { type: String, required: true },
     messageid: { type: String, required: true },
     wfhMsg: { type: String, required: true },
     createdAt: { type: Date, default: Date.now },
     complain: { type: Boolean, required: false },
     pmconfirm: { type: Boolean, required: false },
     status: { type: String, required: false },
     data: { type: String, required: false },
})
const wfhData = module.exports = mongoose.model('komu_wfh', wfhdb)