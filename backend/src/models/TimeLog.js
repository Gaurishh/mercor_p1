const mongoose = require('mongoose');

const TimeLogSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  clockIn: { type: Date, required: true },
  clockOut: { type: Date, default: null },
  screenshotIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Screenshot' }],
  taskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
});

module.exports = mongoose.model('TimeLog', TimeLogSchema); 