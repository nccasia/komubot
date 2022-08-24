const mongoose = require('mongoose');

const orderDb = new mongoose.Schema({
  channelId: { type: String, required: true },
  userId: { type: String, required: true },
  menu: { type: String, required: true },
  username: { type: String, required: true },
  isCancel: { type: Boolean, required: true },
  createdTimestamp: { type: mongoose.Decimal128, required: false },
});

module.exports = mongoose.model('komu_order', orderDb);
