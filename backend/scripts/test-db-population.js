// backend/scripts/test-db-population.js
require('dotenv').config();
const db = require('../config/db');

async function testDatabasePopulation() {
  try {
    console.log('Testing database population...');
    
    // Test users
    const [users] = await db.query('SELECT COUNT(*) as count, role FROM users GROUP BY role');
    console.log('Users in database:');
    users.forEach(row => {
      console.log(`- ${row.role}: ${row.count}`);
    });
    
    // Test courses
    const [courses] = await db.query('SELECT COUNT(*) as count FROM courses');
    console.log(`\nCourses in database: ${courses[0].count}`);
    
    // Test course TAs
    const [courseTAs] = await db.query('SELECT COUNT(*) as count FROM course_tas');
    console.log(`Course TA assignments: ${courseTAs[0].count}`);
    
    // Test tasks
    const [tasks] = await db.query('SELECT COUNT(*) as count, status FROM tasks GROUP BY status');
    console.log('\nTasks in database:');
    tasks.forEach(row => {
      console.log(`- ${row.status}: ${row.count}`);
    });
    
    // Test task assignments
    const [taskAssignments] = await db.query('SELECT COUNT(*) as count FROM task_assignments');
    console.log(`Task assignments: ${taskAssignments[0].count}`);
    
    // Test leave requests
    const [leaveRequests] = await db.query('SELECT COUNT(*) as count, status FROM leave_requests GROUP BY status');
    console.log('\nLeave requests in database:');
    leaveRequests.forEach(row => {
      console.log(`- ${row.status}: ${row.count}`);
    });
    
    // Test swap requests
    const [swapRequests] = await db.query('SELECT COUNT(*) as count, status FROM swap_requests GROUP BY status');
    console.log('\nSwap requests in database:');
    swapRequests.forEach(row => {
      console.log(`- ${row.status}: ${row.count}`);
    });
    
    // Test exams
    const [exams] = await db.query('SELECT COUNT(*) as count FROM exams');
    console.log(`\nExams in database: ${exams[0].count}`);
    
    // Test exam rooms
    const [examRooms] = await db.query('SELECT COUNT(*) as count FROM exam_rooms');
    console.log(`Exam rooms: ${examRooms[0].count}`);
    
    console.log('\nDatabase population test completed!');
  } catch (error) {
    console.error('Error testing database population:', error);
  } finally {
    // Close the database connection
    await db.end();
    process.exit(0);
  }
}

// Run the test
testDatabasePopulation();
