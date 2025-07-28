const express = require('express');
const multer = require('multer');
const fs = require('fs');
const Screenshot = require('../models/Screenshot');
const { uploadToCloudinary, cloudinary } = require('../utils/cloudinary');
const EmployeeScreenshotService = require('../utils/employeeScreenshotService');

const router = express.Router();
const employeeScreenshotService = new EmployeeScreenshotService();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// GET /api/screenshots - Get all screenshots for employee
router.get('/', async (req, res) => {
  try {
    const { employeeId } = req.query;
    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID required' });
    }
    
    const screenshots = await Screenshot.find({ employeeId })
      .sort({ createdAt: -1 });
    res.json(screenshots);
  } catch (err) {
    console.error('Error fetching screenshots:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/screenshots/remote-take - Take screenshot via employee's Electron app
router.post('/remote-take', async (req, res) => {
  try {
    const { 
      employeeId, 
      timeLogId = null
    } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID required' });
    }

    // console.log(`Taking remote screenshot for employee: ${employeeId}`);

    // Take screenshot via employee's Electron app
    const screenshotResult = await employeeScreenshotService.takeScreenshot(employeeId, timeLogId);

    if (!screenshotResult.success) {
      return res.status(404).json({ 
        success: false, 
        error: screenshotResult.error 
      });
    }

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(screenshotResult.filepath, {
      public_id: `mercor_p1_screenshots/${employeeId}_${Date.now()}_admin`,
      tags: ['screenshot', `employee-${employeeId}`, 'admin-request']
    });

    if (!cloudinaryResult.success) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to upload to cloud storage' 
      });
    }

    // Save metadata to MongoDB
    const metadata = {
      employeeId: employeeId,
      filename: screenshotResult.filename,
      localPath: screenshotResult.filepath,
      cloudUrl: cloudinaryResult.url,
      cloudinaryId: cloudinaryResult.publicId,
      fileSize: cloudinaryResult.size,
      timeLogId: timeLogId,
      metadata: {
        width: screenshotResult.width || 1920,
        height: screenshotResult.height || 1080,
        format: screenshotResult.format || 'png',
        quality: screenshotResult.quality || 80,
        compressionRatio: screenshotResult.fileSize ? (cloudinaryResult.size / screenshotResult.fileSize).toFixed(2) : null,
        adminRequest: true
      }
    };

    const screenshot = new Screenshot(metadata);
    await screenshot.save();

    // Clean up local file
    try {
      fs.unlinkSync(screenshotResult.filepath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup local file:', cleanupError);
    }

    res.json({
      success: true,
      screenshot: screenshot,
      originalSize: screenshotResult.fileSize,
      compressedSize: cloudinaryResult.size,
      compressionRatio: screenshotResult.fileSize ? ((screenshotResult.fileSize - cloudinaryResult.size) / screenshotResult.fileSize * 100).toFixed(1) : 0
    });

  } catch (err) {
    console.error('Error taking remote screenshot:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Server error' 
    });
  }
});

// POST /api/screenshots/upload - Upload file to Cloudinary (existing endpoint)
router.post('/upload', async (req, res) => {
  try {
    const { filePath, employeeId, filename } = req.body;
    
    if (!filePath || !employeeId) {
      return res.status(400).json({ error: 'File path and employee ID required' });
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(filePath, {
      public_id: `mercor_p1_screenshots/${employeeId}_${Date.now()}`,
      tags: ['screenshot', `employee-${employeeId}`]
    });
    
    if (!cloudinaryResult.success) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to upload to cloud storage' 
      });
    }
    
    res.json({
      success: true,
      url: cloudinaryResult.url,
      publicId: cloudinaryResult.publicId,
      size: cloudinaryResult.size,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      format: cloudinaryResult.format
    });
    
  } catch (err) {
    console.error('Error uploading screenshot:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Server error' 
    });
  }
});

// POST /api/screenshots - Save screenshot metadata (existing endpoint)
router.post('/', async (req, res) => {
  try {
    const screenshot = new Screenshot(req.body);
    await screenshot.save();
    res.status(201).json(screenshot);
  } catch (err) {
    console.error('Error saving screenshot:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/screenshots/permission-denied - Record permission denied (existing endpoint)
router.post('/permission-denied', async (req, res) => {
  try {
    const { employeeId, timeLogId } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID required' });
    }
    
    // Create a record of permission denied
    const metadata = {
      employeeId: employeeId,
      filename: 'permission_denied.txt',
      localPath: 'N/A',
      cloudUrl: 'N/A',
      cloudinaryId: 'N/A',
      fileSize: 0,
      timeLogId: timeLogId,
      permissionGranted: false,
      metadata: {
        error: 'Screenshot permission denied by Windows',
        timestamp: new Date().toISOString()
      }
    };
    
    const screenshot = new Screenshot(metadata);
    await screenshot.save();
    
    res.json({ success: true, message: 'Permission denied recorded' });
  } catch (err) {
    console.error('Error recording permission denied:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 