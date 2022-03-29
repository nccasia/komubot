const mongoose = require('mongoose');

const uploadFileDb = new mongoose.Schema({
  filePath: { type: String, required: true },
  fileName: { type: String, required: true },
  createdTimestamp: { type: mongoose.Decimal128, required: false },
  episode: { type: Number, require: 'true', unique: true },
});

module.exports = mongoose.model('komu_uploadFile', uploadFileDb);
