const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  content: { required: true, type: String },
  photo: { required: false, type: String },
  type: { required: false, type: String },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Student' },
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
