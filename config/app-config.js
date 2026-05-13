const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  
  btp: {
    username: process.env.BTP_USERNAME,
    password: process.env.BTP_PASSWORD,
    subdomain: process.env.BTP_SUBDOMAIN,
    region: process.env.BTP_REGION,
    host: process.env.BTP_HOST,
    authUrl: `https://${process.env.BTP_HOST}/oauth/token`
  },
  
  auditlog: {
    host: process.env.AUDITLOG_API_HOST,
    path: process.env.AUDITLOG_API_PATH,
    baseURL: `https://${process.env.AUDITLOG_API_HOST}${process.env.AUDITLOG_API_PATH}`,
    timeout: 30000, // 30 seconds
    retries: 3
  },
  
  api: {
    defaultPageSize: 100,
    maxPageSize: 500,
    requestTimeout: 30000
  },
  
  validation: {
    maxDateRangeInDays: 90,
    allowedActions: ['Create', 'Read', 'Update', 'Delete', 'Deploy', 'Execute'],
    allowedResults: ['Success', 'Failure', 'Error']
  }
};
