const express = require('express');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');

const router = express.Router();

// POST / - Create new employee
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, gender, password } = req.body;
    console.log('Received employee data:', { firstName, lastName, email, gender, password: '***' });
    
    if (!firstName || !lastName || !email || !gender || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const employee = new Employee({
      firstName,
      lastName,
      email,
      gender,
      passwordHash
    });
    await employee.save();
    const { passwordHash: _, ...employeeObj } = employee.toObject();
    res.status(201).json(employeeObj);
  } catch (err) {
    console.error('Employee creation error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET / - Fetch all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().select('-passwordHash');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /:_id - Fetch employee by _id
router.get('/:_id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params._id).select('-passwordHash');
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /:_id - Update employee by _id
router.put('/:_id', async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.password) {
      update.passwordHash = await bcrypt.hash(update.password, 10);
      delete update.password;
    }
    const employee = await Employee.findByIdAndUpdate(
      req.params._id,
      update,
      { new: true }
    ).select('-passwordHash');
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 