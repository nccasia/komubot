const mongoose = require('mongoose');

const womendayDb = new mongoose.Schema({
  userid: { type: String, require: true },
  win: { type: Boolean, require: true },
  gift: { type: String, require: true },
});

module.exports = mongoose.model('komu_women_day', womendayDb);
