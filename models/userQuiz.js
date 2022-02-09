const mongoose = require('mongoose');

const userquizdb = new mongoose.Schema({
  userid: { type: String, require: true },
  quizid: { type: mongoose.Types.ObjectId, require: true },
  correct: { type: Boolean, require: true },
  answer: { type: Number },
});

module.exports = mongoose.model('komu_userquiz', userquizdb);
