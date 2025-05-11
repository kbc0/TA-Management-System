// backend/scripts/apply_schema_updates.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const loggingService = require('../services/LoggingService');

/**
 * Apply schema updates from SQL file
 */
async function applySchemaUpdates() {
  try {
    console.log('Starting schema updates...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../config/schema_updates.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL by delimiter statements
    const statements = [];
    let currentStatement = '';
    let delimiter = ';';
    
    sql.split('\n').forEach(line => {
      // Check for delimiter change
      if (line.trim().startsWith('DELIMITER')) {
        // Add current statement if not empty
        if (currentStatement.trim()) {
          statements.push(currentStatement);
        }
        
        // Update delimiter
        delimiter = line.trim().split(' ')[1];
        currentStatement = '';
      } else if (line.trim() === `DELIMITER ${delimiter}`) {
        // Reset delimiter back to default
        delimiter = ';';
      } else if (line.trim().endsWith(delimiter)) {
        // End of statement with current delimiter
        currentStatement += line;
        statements.push(currentStatement);
        currentStatement = '';
      } else {
        // Add line to current statement
        currentStatement += line + '\n';
      }
    });
    
    // Add final statement if not empty
    if (currentStatement.trim()) {
      statements.push(currentStatement);
    }
    
    // Execute each statement
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.query(statement);
          console.log('Executed statement successfully');
        }
      }
      
      await connection.commit();
      console.log('Schema updates applied successfully');
      
      // Log the action
      await loggingService.logSystem(
        'schema_updates',
        'Database schema updates applied',
        { timestamp: new Date().toISOString() }
      );
    } catch (error) {
      await connection.rollback();
      console.error('Error applying schema updates:', error);
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to apply schema updates:', error);
    process.exit(1);
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  applySchemaUpdates()
    .then(() => {
      console.log('Schema update script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Schema update script failed:', error);
      process.exit(1);
    });
}

module.exports = applySchemaUpdates;
