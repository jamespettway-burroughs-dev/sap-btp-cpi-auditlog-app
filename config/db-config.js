// If you want to add database support for caching or logging

module.exports = {
  sqlite: {
    filename: './data/auditlog.db',
    driver: 'better-sqlite3'
  },
  
  postgres: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'auditlog',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    pool: {
      min: 2,
      max: 10
    }
  }
};
