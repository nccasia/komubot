const mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

const trackerSpentTimeDb = new mongoose.Schema({
  email: { type: String, required: true },
  spent_time: { type: Double, required: true },
  date: { type: String, required: true },
  wfh: { type: Boolean, required: true },
});

module.exports = mongoose.model(
  'komu_tracker_spent_time',
  trackerSpentTimeDb,
  'komu_tracker_spent_time'
);
