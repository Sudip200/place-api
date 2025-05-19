const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  message: String,
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

module.exports = mongoose.model('CollegeMessage', MessageSchema);
