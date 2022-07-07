const mongoose = require('mongoose');

const subcategoryData = new mongoose.Schema({
  id: { type: Number, required: true },
  checklistId: { type: Number, required: true },
  title: { type: String, required: true },
});

module.exports = mongoose.model('komu_subcategorys', subcategoryData);
