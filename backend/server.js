// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const db = require('./config/db');
const { initDatabase } = require('./config/dbInit');

// Middleware
app.use(cors());
app.use(express.json());

// Test DB Connection and Initialize Database
db.getConnection()
  .then(async connection => {
    console.log('Database connection established');
    connection.release();
    
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
