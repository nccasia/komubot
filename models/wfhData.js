const mongoose = require('mongoose');

const wfhDb = new mongoose.Schema({
  userid: { type: String, required: true },
  messageid: { type: String, required: false },
  wfhMsg: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  complain: { type: Boolean, required: false },
  pmconfirm: { type: Boolean, required: false },
  status: { type: String, required: false },
  data: { type: String, required: false },
  type: { type: String, default: 'wfh' },
});

module.exports = mongoose.model('komu_wfh', wfhDb);
