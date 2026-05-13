const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const config = require('./config/app-config');
const logger = require('./config/logger');
const securityConfig = require('./config/security-config');
const auditLogRoutes = require('./routes/auditlog');

const app = express();

// Security Middleware
app.use(helmet(securityConfig.helmet));
app.use(cors(securityConfig.cors));

// Rate Limiting
const limiter = rateLimit(securityConfig.rateLimit);
app.use(limiter);

// Body Parsing Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Request Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auditlog', auditLogRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.app.env
  });
});

// Serve Main Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error('Application Error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString(),
    ...(config.app.env === 'development' && { stack: err.stack })
  });
});

// Start Server
const PORT = config.app.port;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    environment: config.app.env,
    nodeVersion: process.version
  });
});

module.exports = app;
