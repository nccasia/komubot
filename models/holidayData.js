const mongoose = require('mongoose');

const holidayDb = new mongoose.Schema({
  dateTime: { type: String, required: true },
  content: { type: String, required: true },
});

module.exports = mongoose.model('komu_holiday', holidayDb);
