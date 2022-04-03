const mongoose = require('mongoose');

const companyTripDb = new mongoose.Schema({
  year: { type: String, required: true },
  fullName: { type: String, required: true },
  userId: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  office: { type: String, required: true },
  role: { type: String },
  kingOfRoom: { type: String },
  room: { type: String },
});

module.exports = mongoose.model('komu_companytrip', companyTripDb);
