// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const db = require('./config/db');
const loggingService = require('./services/LoggingService');
const { errorLogger } = require('./middleware/auditLogger');
const { initDatabase } = require('./config/dbInit');


// Middleware
app.use(cors());
app.use(express.json());


// Test DB Connection and Initialize Database

db.getConnection()
  .then(async connection => {
    console.log('Database connection established');
    connection.release();
    

    // Initialize audit logs table
    try {
      await loggingService.initTable();
      console.log('Audit logging system initialized');
      
      // Log system startup
      await loggingService.logSystem(
        'system_startup',
        'Application server started',
        { timestamp: new Date().toISOString(), environment: process.env.NODE_ENV || 'development' }
      );
    } catch (error) {
      console.error('Failed to initialize audit logs:', error);
    }
    // Initialize database tables
    try {
      await initDatabase();
    } catch (error) {
      console.error('Failed to initialize database tables:', error);
    }
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Audit logging for errors
app.use(errorLogger);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
