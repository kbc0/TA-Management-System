// backend/scripts/clean-database.js
const db = require('../config/db');

async function cleanDatabase() {
  const connection = await db.getConnection();
  
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Begin transaction
    await connection.beginTransaction();
    
    // Disable foreign key checks temporarily to allow deleting from tables with foreign key constraints
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Get all tables in the database
    const [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);
    
    // Delete data from each table
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`🗑️  Cleaning table: ${tableName}`);
      await connection.query(`TRUNCATE TABLE ${tableName}`);
    }
    
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    // Commit the transaction
    await connection.commit();
    
    console.log('✅ Database cleanup completed successfully!');
  } catch (error) {
    // Rollback in case of error
    await connection.rollback();
    console.error('❌ Error during database cleanup:', error);
    throw error;
  } finally {
    // Release the connection
    connection.release();
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  cleanDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Failed to clean database:', err);
      process.exit(1);
    });
} else {
  // Export for use in other scripts
  module.exports = cleanDatabase;
}
