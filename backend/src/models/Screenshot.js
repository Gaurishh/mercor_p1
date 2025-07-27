const mongoose = require('mongoose');

const screenshotSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  localPath: {
    type: String,
    required: true
  },
  cloudUrl: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  metadata: {
    width: Number,
    height: Number,
    format: String,
    quality: Number,
    compressionRatio: Number
  },
  permissionGranted: {
    type: Boolean,
    default: true
  },
  timeLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeLog',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Screenshot', screenshotSchema); 