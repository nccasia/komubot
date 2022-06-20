const mongoose = require('mongoose');

const checklistData = new mongoose.Schema({
  id: { type: Number, required: true },
  subcategory: { type: String, required: true },
  category: { type: [String], required: true },
});

module.exports = mongoose.model('komu_checklist', checklistData);
