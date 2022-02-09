const mongoose = require('mongoose');

const birthdaydb = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
});

module.exports = mongoose.model('komu_birthdays', birthdaydb);
