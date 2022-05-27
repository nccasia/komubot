const mongoose = require('mongoose');

const openTalkDb = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  date: { type: mongoose.Decimal128, required: false },
});

module.exports = mongoose.model('komu_opentalk', openTalkDb);
