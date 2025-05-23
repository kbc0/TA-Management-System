// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const runAllImports = require("./scripts/index");
const userRoutes = require('./routes/userRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const courseRoutes = require('./routes/courseRoutes');
const taskRoutes = require('./routes/taskRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const swapRoutes = require('./routes/swapRoutes');
const navigationRoutes = require('./routes/navigationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const db = require('./config/db');
const loggingService = require('./services/LoggingService');
const { errorLogger } = require('./middleware/auditLogger');
const { initDatabase } = require('./config/dbInit');

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Allow frontend origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true // Allow cookies and credentials
}));
app.use(express.json());

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

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

// Initialize database tables and run import scripts
    try {
      await initDatabase();
      await runAllImports(); 
      console.log('✅ Data import completed at server startup');
    } catch (error) {
      console.error('Failed during DB init or data import:', error);
    }

  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Navigation routes that match the frontend navigation bar links
app.use('/api', navigationRoutes);

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Audit logging for errors
app.use(errorLogger);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404 errors for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
