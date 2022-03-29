const mongoose = require('mongoose');

const checkCameraDb = new mongoose.Schema({
  userId: { type: String, required: false },
  channelId: { type: String, required: false },
  enableCamera: { type: Boolean, required: false },
  createdTimestamp: { type: mongoose.Decimal128, required: false },
});

module.exports = mongoose.model('komu_check_camera', checkCameraDb);
