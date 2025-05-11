// backend/scripts/migrate-tasks-table.js
require('dotenv').config();
const db = require('../config/db');

async function migrateTasksTable() {
  try {
    console.log('Connecting to database...');
    console.log('Checking if migration is needed...');

    // Check if assigned_to column exists in tasks table
    const [columns] = await db.query('SHOW COLUMNS FROM tasks LIKE "assigned_to"');
    
    if (columns.length > 0) {
      console.log('The assigned_to column already exists in the tasks table. No migration needed.');
      return;
    }

    console.log('Adding assigned_to column to tasks table...');
    
    // Add the assigned_to column to the tasks table
    await db.query(`
      ALTER TABLE tasks
      ADD COLUMN assigned_to INT DEFAULT NULL,
      ADD FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    `);

    console.log('Successfully added assigned_to column to tasks table.');
    
    // Update the assigned_to field based on task_assignments
    console.log('Updating tasks with assigned_to field based on task_assignments...');
    
    // Get all task assignments
    const [assignments] = await db.query(`
      SELECT task_id, user_id 
      FROM task_assignments
    `);

    console.log(`Found ${assignments.length} task assignments to update.`);

    // Update each task with its assigned user
    for (const assignment of assignments) {
      await db.query(
        'UPDATE tasks SET assigned_to = ? WHERE id = ?',
        [assignment.user_id, assignment.task_id]
      );
      console.log(`Updated task ${assignment.task_id} with assigned_to = ${assignment.user_id}`);
    }

    console.log('Successfully updated all tasks with assigned_to field.');

  } catch (error) {
    console.error('Error migrating tasks table:', error);
  } finally {
    // Close the database connection pool
    await db.end();
    process.exit(0);
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  migrateTasksTable();
}

module.exports = migrateTasksTable;
