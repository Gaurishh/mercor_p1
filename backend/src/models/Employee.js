const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  taskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  isActive: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  ipAddress: { type: String, default: null }, // Store employee's current IP
  lastLoginAt: { type: Date, default: null } // Track when IP was last updated
});

module.exports = mongoose.model('Employee', EmployeeSchema);