const express = require('express');
const multer = require('multer');
const path = require('path');
const Screenshot = require('../models/Screenshot');
const TimeLog = require('../models/TimeLog');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST / - Upload screenshot
router.post('/', upload.single('screenshot'), async (req, res) => {
  try {
    const { timeLogId, permissionGranted } = req.body;
    if (!req.file || !timeLogId || permissionGranted === undefined) {
      return res.status(400).json({ error: 'Missing required fields or file' });
    }
    // Find timelog by _id
    const timeLog = await TimeLog.findById(timeLogId);
    if (!timeLog) {
      return res.status(404).json({ error: 'TimeLog not found' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    const screenshot = new Screenshot({
      timeLogId: timeLog._id,
      imageUrl,
      permissionGranted: permissionGranted === 'true' || permissionGranted === true,
      timestamp: Date.now()
    });
    await screenshot.save();
    await TimeLog.findByIdAndUpdate(timeLog._id, { $push: { screenshotIds: screenshot._id } });
    res.status(201).json(screenshot);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 