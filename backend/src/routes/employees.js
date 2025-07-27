const express = require('express');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const Task = require('../models/Task');
const Screenshot = require('../models/Screenshot');
const Project = require('../models/Project');
const TimeLog = require('../models/TimeLog');

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

// GET /working-status - Get working status for all employees
router.get('/working-status', async (req, res) => {
  try {
    // console.log('Working status endpoint called');
    
    // Get all employees
    const employees = await Employee.find().select('_id');
    // console.log('Found employees:', employees.length);
    
    // Get all active time logs (clockIn exists, clockOut is null)
    const activeTimeLogs = await TimeLog.find({
      clockOut: null
    }).select('employeeId');
    // console.log('Found active time logs:', activeTimeLogs.length);
    // console.log('Active time logs:', activeTimeLogs);
    
    // Create a set of employee IDs who are currently working
    const workingEmployeeIds = new Set(
      activeTimeLogs.map(log => log.employeeId.toString())
    );
    // console.log('Working employee IDs:', Array.from(workingEmployeeIds));
    
    // Create a mapping of employee ID to working status
    const workingStatus = {};
    employees.forEach(employee => {
      workingStatus[employee._id.toString()] = workingEmployeeIds.has(employee._id.toString());
    });
    
    // console.log('Final working status:', workingStatus);
    res.json(workingStatus);
  } catch (err) {
    console.error('Error fetching working status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /test-working - Test endpoint to check if there are any active time logs
router.get('/test-working', async (req, res) => {
  try {
    console.log('Test working endpoint called');
    
    // Get all time logs
    const allTimeLogs = await TimeLog.find({});
    console.log('All time logs:', allTimeLogs);
    
    // Get active time logs
    const activeTimeLogs = await TimeLog.find({ clockOut: null });
    console.log('Active time logs:', activeTimeLogs);
    
    res.json({
      allTimeLogs: allTimeLogs.length,
      activeTimeLogs: activeTimeLogs.length,
      activeTimeLogsData: activeTimeLogs
    });
  } catch (err) {
    console.error('Error in test endpoint:', err);
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

// PATCH /:_id/add-task/:taskId - Add a taskId to employee's taskIds
router.patch('/:_id/add-task/:taskId', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params._id,
      { $addToSet: { taskIds: req.params.taskId } },
      { new: true }
    ).select('-passwordHash');
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /:_id/remove-task/:taskId - Remove a taskId from employee's taskIds
router.patch('/:_id/remove-task/:taskId', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params._id,
      { $pull: { taskIds: req.params.taskId } },
      { new: true }
    ).select('-passwordHash');
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /:_id/tasks - Get all tasks assigned to employee with project info
router.get('/:_id/tasks', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params._id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const tasks = await Task.find({ _id: { $in: employee.taskIds } })
      .populate('projectId', 'name')
      .sort({ isCompleted: -1, createdAt: -1 }); // Incomplete first (isCompleted: false), then by creation date

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /:_id/screenshots - Get all screenshots for employee sorted by createdAt
router.get('/:_id/screenshots', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params._id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const screenshots = await Screenshot.find({ employeeId: req.params._id })
      .sort({ createdAt: -1 }); // Newest first

    res.json(screenshots);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /:_id/toggle-status - Toggle employee active status
router.patch('/:_id/toggle-status', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params._id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    employee.isActive = !employee.isActive;
    await employee.save();

    const { passwordHash: _, ...employeeObj } = employee.toObject();
    res.json(employeeObj);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 