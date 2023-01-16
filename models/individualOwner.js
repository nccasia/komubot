const mongoose = require('mongoose');

const individualOwner = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: false },
  username : { type: String, required: false },
  ownerId : { type: String, required: false }
});

module.exports = mongoose.model('komu_individual', individualOwner);
