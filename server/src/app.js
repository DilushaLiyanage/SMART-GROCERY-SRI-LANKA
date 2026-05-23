const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets if necessary
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// API Routes
app.use('/api', apiRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Smart Grocery Sri Lanka API',
    status: 'Running'
  });
});

// Centralized error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
