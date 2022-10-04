const mongoose = require('mongoose');

const workoutDb = new mongoose.Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  attachment: { type: Boolean, defaul: false },
  status: { type: Boolean, defaul: false },
  createdTimestamp: { type: mongoose.Decimal128, required: true },
  channelId: { type: String, required: true },
});

module.exports = mongoose.model('komu_workoutDaily', workoutDb);
