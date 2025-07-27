const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Employee = require('../models/Employee');

const router = express.Router();

// GET / - Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST / - Create a task and push to project
router.post('/', async (req, res) => {
  try {
    const { projectId, name, description, employeeIds } = req.body;
    console.log('POST /api/tasks body:', req.body); // Log incoming request
    if (!projectId || !name || !description) {
      console.error('Missing required fields:', req.body);
      return res.status(400).json({ error: 'Missing required fields', body: req.body });
    }
    // Find project by _id
    const project = await Project.findById(projectId);
    if (!project) {
      console.error('Project not found for projectId:', projectId);
      return res.status(404).json({ error: 'Project not found', projectId });
    }
    const task = new Task({ projectId: project._id, name, description, employeeIds: employeeIds || [] });
    await task.save();
    await Project.findByIdAndUpdate(project._id, { $push: { taskIds: task._id } });
    console.log('Task created:', task);
    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err, req.body);
    res.status(500).json({ error: 'Server error', details: err.message, body: req.body });
  }
});

// PUT /:_id - Update task by _id
router.put('/:_id', async (req, res) => {
  try {
    const { name, description, projectId, employeeIds } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (projectId !== undefined) {
      // Find project by _id
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      update.projectId = project._id;
    }
    let oldEmployeeIds = [];
    if (employeeIds !== undefined) {
      // Get the current employeeIds for this task
      const currentTask = await Task.findById(req.params._id);
      if (currentTask) {
        oldEmployeeIds = currentTask.employeeIds.map(id => id.toString());
      }
      update.employeeIds = employeeIds;
    }
    const task = await Task.findByIdAndUpdate(req.params._id, update, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    // Synchronize employee.taskIds
    if (employeeIds !== undefined) {
      const newEmployeeIds = employeeIds.map(id => id.toString());
      const taskId = task._id.toString();
      // Employees to add taskId to
      const toAdd = newEmployeeIds.filter(id => !oldEmployeeIds.includes(id));
      // Employees to remove taskId from
      const toRemove = oldEmployeeIds.filter(id => !newEmployeeIds.includes(id));
      // Add taskId to new employees
      await Promise.all(toAdd.map(empId =>
        Employee.findByIdAndUpdate(empId, { $addToSet: { taskIds: taskId } })
      ));
      // Remove taskId from removed employees
      await Promise.all(toRemove.map(empId =>
        Employee.findByIdAndUpdate(empId, { $pull: { taskIds: taskId } })
      ));
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /:_id - Delete task by _id and remove from project
router.delete('/:_id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params._id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await Project.findByIdAndUpdate(task.projectId, { $pull: { taskIds: task._id } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /:_id/assign-employee - Add employee to task
router.patch('/:_id/assign-employee', async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId is required' });
    }

    const task = await Task.findById(req.params._id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Add employeeId to workedOnBy array if not already present
    if (!task.workedOnBy.includes(employeeId)) {
      task.workedOnBy.push(employeeId);
      await task.save();
    }

    res.json(task);
  } catch (err) {
    console.error('Error assigning employee to task:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /:_id/complete - Mark task as completed
router.patch('/:_id/complete', async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId is required' });
    }

    const task = await Task.findById(req.params._id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if employee has worked on this task
    if (!task.workedOnBy.includes(employeeId)) {
      return res.status(403).json({ error: 'Employee has not worked on this task' });
    }

    // Mark task as completed
    task.isCompleted = true;
    task.completedAt = new Date();
    task.completedBy = employeeId;
    await task.save();

    res.json(task);
  } catch (err) {
    console.error('Error completing task:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /:_id/uncomplete - Mark task as incomplete
router.patch('/:_id/uncomplete', async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId is required' });
    }

    const task = await Task.findById(req.params._id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if the employee is the one who completed the task
    if (task.completedBy && task.completedBy.toString() !== employeeId) {
      return res.status(403).json({ error: 'Only the employee who completed the task can uncomplete it' });
    }

    // Mark task as incomplete
    task.isCompleted = false;
    task.completedAt = null;
    task.completedBy = null;
    await task.save();

    res.json(task);
  } catch (err) {
    console.error('Error uncompleting task:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 