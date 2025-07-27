const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  employeeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null }
});

module.exports = mongoose.model('Task', TaskSchema); 