const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLogLevel = process.env.LOG_LEVEL || 'info';
const minLogLevel = logLevels[currentLogLevel];

const logger = {
  error: (message, meta = {}) => {
    if (logLevels.error <= minLogLevel) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, meta);
      logToFile('ERROR', message, meta);
    }
  },
  
  warn: (message, meta = {}) => {
    if (logLevels.warn <= minLogLevel) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta);
      logToFile('WARN', message, meta);
    }
  },
  
  info: (message, meta = {}) => {
    if (logLevels.info <= minLogLevel) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta);
      logToFile('INFO', message, meta);
    }
  },
  
  debug: (message, meta = {}) => {
    if (logLevels.debug <= minLogLevel) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta);
      logToFile('DEBUG', message, meta);
    }
  }
};

function logToFile(level, message, meta) {
  const logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
  const logEntry = `${new Date().toISOString()} [${level}] ${message} ${JSON.stringify(meta)}\n`;
  
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) console.error('Failed to write to log file:', err);
  });
}

module.exports = logger;
