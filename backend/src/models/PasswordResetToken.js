const mongoose = require('mongoose');

const PasswordResetTokenSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 } // Expires in 1 hour
});

module.exports = mongoose.model('PasswordResetToken', PasswordResetTokenSchema); 