const mongoose = require('mongoose');

const userQuizDb = new mongoose.Schema({
  userid: { type: String, require: true },
  quizid: { type: mongoose.Types.ObjectId, require: true },
  correct: { type: Boolean },
  answer: { type: Number },
  createAt: { type: Date, default: Date.now },
  updateAt: { type: Date },
});

module.exports = mongoose.model('komu_userquiz', userQuizDb);
