const express = require('express');
const TimeLog = require('../models/TimeLog');

const router = express.Router();

// POST / - Clock-in
router.post('/', async (req, res) => {
  try {
    const { employeeId, taskIds } = req.body;
    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId is required' });
    }
    const timeLog = new TimeLog({
      employeeId,
      taskIds: taskIds || [],
      clockIn: Date.now(),
      clockOut: null,
      screenshotIds: []
    });
    await timeLog.save();
    res.status(201).json({ _id: timeLog._id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /:_id/clockout - Clock-out
router.patch('/:_id/clockout', async (req, res) => {
  try {
    const timeLog = await TimeLog.findByIdAndUpdate(
      req.params._id,
      { clockOut: Date.now() },
      { new: true }
    );
    if (!timeLog) return res.status(404).json({ error: 'TimeLog not found' });
    res.json(timeLog);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 