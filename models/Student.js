const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  profile: { required: true, type: String },
  name: { required: true, type: String },
  open: { required: false, type: String },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  skill: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  mobile: { type: Number, required: false },
  description: { type: String, required: false },
  resume: { required: true, type: String }
});

module.exports = mongoose.model('Student', StudentSchema);
