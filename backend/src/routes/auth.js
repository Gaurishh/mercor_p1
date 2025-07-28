const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Employee = require('../models/Employee');
const VerificationToken = require('../models/VerificationToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const { sendEmail } = require('../utils/mailer');
const { getPasswordResetEmail } = require('../utils/emailTemplates');
const crypto = require('crypto');

// Store activation tokens in memory (in production, use Redis or database)
const activationTokens = new Map();

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, gender, email, password, isAdmin, isActive } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !gender || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create employee
    const employee = new Employee({
      firstName,
      lastName,
      gender,
      email,
      passwordHash,
      isAdmin: isAdmin || false,
      isActive: isActive !== undefined ? isActive : true,
      emailVerified: false
    });

    await employee.save();

    // Generate verification token using crypto
    const token = crypto.randomBytes(32).toString('hex');
    const emailVerificationToken = new VerificationToken({
      employeeId: employee._id,
      token
    });

    await emailVerificationToken.save();

    // Send verification email
    const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';
    const verificationLink = `${WEB_URL}/verify-email/${token}`;
    const emailHtml = `
      <h2>Welcome to Mercor Time Tracker!</h2>
      <p>Hi ${firstName},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${verificationLink}</p>
      <p>This link will expire in 24 hours.</p>
    `;

    await sendEmail(email, 'Verify Your Email', emailHtml);

    // Return success response (without sensitive data)
    res.status(201).json({
      message: 'Employee created successfully. Please check your email for verification.',
      employee: {
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        isAdmin: employee.isAdmin,
        isActive: employee.isActive,
        emailVerified: employee.emailVerified
      }
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find employee by email
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if employee is active
    if (!employee.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, employee.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!employee.emailVerified) {
      return res.status(401).json({ error: 'Please verify your email before signing in' });
    }

    // Return success response (you can add JWT here later)
    res.json({
      message: 'Sign in successful',
      employee: {
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        isAdmin: employee.isAdmin,
        isActive: employee.isActive,
        emailVerified: employee.emailVerified
      }
    });

  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/verify-email/:token
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find verification token
    const verificationToken = await VerificationToken.findOne({ token });
    if (!verificationToken) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Find employee
    const employee = await Employee.findById(verificationToken.employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Update employee email verification status
    employee.emailVerified = true;
    await employee.save();

    // Delete verification token
    await VerificationToken.findByIdAndDelete(verificationToken._id);

    res.json({
      message: 'Email verified successfully',
      employee: {
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        isAdmin: employee.isAdmin,
        isActive: employee.isActive,
        emailVerified: employee.emailVerified
      }
    });

  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  // Always return success message to prevent email enumeration
  const genericMsg = { message: 'If an account with that email exists, a password reset link has been sent.' };
  try {
    if (!email) return res.status(200).json(genericMsg);
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(200).json(genericMsg);

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    // Remove any existing reset tokens for this user
    await PasswordResetToken.deleteMany({ employeeId: employee._id });
    // Save new token
    const resetToken = new PasswordResetToken({
      employeeId: employee._id,
      token
    });
    await resetToken.save();
    
    // Send password reset email
    const emailHtml = getPasswordResetEmail(employee.firstName, token);
    await sendEmail(email, 'Reset Your Password', emailHtml);
    
    return res.status(200).json(genericMsg);
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(200).json(genericMsg);
  }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;
  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'Both newPassword and confirmPassword are required.' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }
  try {
    // Find reset token
    const resetToken = await PasswordResetToken.findOne({ token });
    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }
    // Find employee
    const employee = await Employee.findById(resetToken.employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    employee.passwordHash = passwordHash;
    await employee.save();
    // Delete used token
    await PasswordResetToken.findByIdAndDelete(resetToken._id);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/send-activation-email
router.post('/send-activation-email', async (req, res) => {
  try {
    const { email, fullName, token } = req.body;
    
    if (!email || !fullName || !token) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Store the activation token
    activationTokens.set(token, { email, fullName, createdAt: Date.now() });

    // Send activation email
    const activationLink = `${WEB_URL}/activate?token=${token}`;
    const emailHtml = `
      <h2>Welcome to Mercor Time Tracker!</h2>
      <p>Hi ${fullName},</p>
      <p>You have been invited to join Mercor Time Tracker. Please click the link below to complete your account setup:</p>
      <a href="${activationLink}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">Complete Account Setup</a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${activationLink}</p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>Mercor Team</p>
    `;

    await sendEmail(email, 'Complete Your Account Setup - Mercor Time Tracker', emailHtml);

    res.json({ message: 'Activation email sent successfully' });

  } catch (err) {
    console.error('Send activation email error:', err);
    res.status(500).json({ error: 'Failed to send activation email' });
  }
});

// GET /api/auth/verify-activation-token/:token
router.get('/verify-activation-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const tokenData = activationTokens.get(token);
    if (!tokenData) {
      return res.json({ valid: false });
    }

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - tokenData.createdAt;
    if (tokenAge > 24 * 60 * 60 * 1000) {
      activationTokens.delete(token);
      return res.json({ valid: false });
    }

    res.json({ valid: true, email: tokenData.email, fullName: tokenData.fullName });

  } catch (err) {
    console.error('Verify activation token error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/activate-account/:token
router.post('/activate-account/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password, gender } = req.body;
    
    if (!password || !gender) {
      return res.status(400).json({ error: 'Password and gender are required' });
    }

    const tokenData = activationTokens.get(token);
    if (!tokenData) {
      return res.status(400).json({ error: 'Invalid or expired activation token' });
    }

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - tokenData.createdAt;
    if (tokenAge > 24 * 60 * 60 * 1000) {
      activationTokens.delete(token);
      return res.status(400).json({ error: 'Activation token has expired' });
    }

    // Find or create employee
    let employee = await Employee.findOne({ email: tokenData.email });
    
    if (!employee) {
      // Create new employee
      const [firstName, ...lastNameParts] = tokenData.fullName.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      const passwordHash = await bcrypt.hash(password, 10);
      employee = new Employee({
        firstName,
        lastName,
        email: tokenData.email,
        gender,
        passwordHash,
        isActive: true,
        emailVerified: true
      });
    } else {
      // Update existing employee
      const passwordHash = await bcrypt.hash(password, 10);
      employee.passwordHash = passwordHash;
      employee.gender = gender;
      employee.emailVerified = true;
      employee.isActive = true;
    }

    await employee.save();

    // Remove the activation token
    activationTokens.delete(token);

    res.json({ 
      message: 'Account activated successfully',
      employee: {
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        isAdmin: employee.isAdmin,
        isActive: employee.isActive,
        emailVerified: employee.emailVerified
      }
    });

  } catch (err) {
    console.error('Activate account error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 