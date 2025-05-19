const mongoose = require('mongoose');

const CollegeDetailsSchema = new mongoose.Schema({
  state: { type: String, required: true },
  city: { type: String, required: true },
  description: { type: String, required: true },
  mobile: { type: Number, required: true },
  logo: { type: String, required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
});

module.exports = mongoose.model('CollegeDetails', CollegeDetailsSchema);
