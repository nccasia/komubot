const mongoose = require('mongoose');

const questiondb = new mongoose.Schema({
  title: String,
  options: [String],
  correct: String,
  role: String,
  isVerify: Boolean,
  accept: Boolean,
  author_email: String,
  topic: String,
});

module.exports = mongoose.model('komu_question', questiondb);
