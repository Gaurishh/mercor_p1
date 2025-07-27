const mongoose = require('mongoose');

const ScreenshotSchema = new mongoose.Schema({
  timeLogId: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeLog', required: true },
  imageUrl: { type: String, required: true },
  permissionGranted: { type: Boolean, required: true },
  timestamp: { type: Date, required: true }
});

module.exports = mongoose.model('Screenshot', ScreenshotSchema); 