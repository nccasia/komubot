const mongoose = require('mongoose');

const joincallDb = new mongoose.Schema({
  channelId: { type: String, required: true },
  userid: { type: String, required: true },
  status: { type: String, required: true },
  start_time: { type: Date, default: Date.now },
  end_time: { type: Date, default: null },
});

module.exports = mongoose.model('komu_joincall', joincallDb);
