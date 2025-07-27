const mongoose = require('mongoose');

const VerificationTokenSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 24 * 60 * 60 } // Expires in 24 hours
});

module.exports = mongoose.model('VerificationToken', VerificationTokenSchema); 