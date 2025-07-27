const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');

const router = express.Router();

// GET / - Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST / - Create a project
router.post('/', async (req, res) => {
  try {
    const { name, description, taskIds } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const project = new Project({ 
      name, 
      description, 
      taskIds: taskIds || [] 
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// PUT /:_id - Update project by _id
router.put('/:_id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params._id,
      { name, description },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /:_id - Delete project by _id and all associated tasks
router.delete('/:_id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params._id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    // Delete all tasks associated with this project
    await Task.deleteMany({ projectId: project._id });
    res.json({ message: 'Project and associated tasks deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 