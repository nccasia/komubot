const mongoose = require('mongoose');

const elsaDailydb = new mongoose.Schema({
     userid: { type: String, required: true },
     email: { type: String, required: true },
     daily: { type: String, required: true },
     attachment: {type: Boolean, defaul: false},
     createdAt: { type: Date, default: Date.now },
     channelid: { type: String, required: true }
})
const elsaDailyData = module.exports = mongoose.model('komu_elsaDaily', elsaDailydb)