const mongoose = require('mongoose');

const CompanyDetailsSchema = new mongoose.Schema({
  state: { type: String, required: true },
  city: { type: String, required: true },
  description: { type: String, required: true },
  mobile: { type: Number, required: true },
  logo: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
});

module.exports = mongoose.model('CompanyDetails', CompanyDetailsSchema);
