const mongoose = require('mongoose');

const keepDb = new mongoose.Schema({
  userid: { type: String, required: false },
  note: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, required: false },
});

module.exports = mongoose.model('komu_keep', keepDb);
