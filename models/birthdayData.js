const mongoose = require('mongoose');

const birthdayDb = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
});

module.exports = mongoose.model('komu_birthdays', birthdayDb);
