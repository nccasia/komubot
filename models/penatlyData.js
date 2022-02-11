const mongoose = require('mongoose');

const penatlydb = new mongoose.Schema({
  user_id: { type: String, require: true },
  username: { type: String, require: true },
  ammount: { type: Number, require: true },
  reason: { type: String },
  createdTimestamp: { type: mongoose.Decimal128, required: true },
  is_reject: { type: Boolean },
  channel_id: { type: String, require: true },
  delete: { type: Boolean, require: true },
});

module.exports = mongoose.model('komu_penatly', penatlydb);
