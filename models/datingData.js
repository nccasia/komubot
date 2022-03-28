const mongoose = require('mongoose');

const datingdb = new mongoose.Schema({
  channelid: { type: String, required: true },
  userid: { type: String, required: true },
  email: { type: String, required: true },
  sex: { type: Number },
  loop: { type: Number },
  createdTimestamp: { type: mongoose.Decimal128, required: false },
});

module.exports = mongoose.model('komu_dating', datingdb);
