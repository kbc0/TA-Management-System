// backend/scripts/update-tasks-assigned-to.js
require('dotenv').config();
const db = require('../config/db');

async function updateTasksAssignedTo() {
  try {
    console.log('Connecting to database...');
    console.log('Updating tasks with assigned_to field based on task_assignments...');

    // Check if assigned_to column exists in tasks table
    const [columns] = await db.query('SHOW COLUMNS FROM tasks LIKE "assigned_to"');
    
    if (columns.length === 0) {
      console.log('The assigned_to column does not exist in the tasks table.');
      console.log('Please run the database migration first to add this column.');
      return;
    }

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
    console.error('Error updating tasks:', error);
  } finally {
    // Close the database connection pool
    await db.end();
    process.exit(0);
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  updateTasksAssignedTo();
}

module.exports = updateTasksAssignedTo;
