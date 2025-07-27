require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const employeesRouter = require('./routes/employees');
const projectsRouter = require('./routes/projects');
const tasksRouter = require('./routes/tasks');
const timelogsRouter = require('./routes/timelogs');
const screenshotsRouter = require('./routes/screenshots');
const authRouter = require('./routes/auth');

// Middleware
app.use(express.json());
app.use(cors());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routers
app.use('/api/employees', employeesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/timelogs', timelogsRouter);
app.use('/api/screenshots', screenshotsRouter);
app.use('/api/auth', authRouter);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mercor_timetracker';

console.log('Connecting to MongoDB at:', MONGO_URI);
console.log('Server will run on port:', PORT);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 