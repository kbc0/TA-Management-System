// backend/scripts/add-tasks.js
require('dotenv').config();
const db = require('../config/db');

async function addTasksToUser() {
  try {
    console.log('Connecting to database...');
    
    // User to assign tasks to
    const bilkentId = '20101992';
    
    console.log(`Checking if user with Bilkent ID ${bilkentId} exists...`);
    
    // Check if user exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE bilkent_id = ?',
      [bilkentId]
    );
    
    if (existingUsers.length === 0) {
      console.log(`User with Bilkent ID ${bilkentId} does not exist.`);
      return;
    }
    
    const user = existingUsers[0];
    console.log(`Found user: ${user.full_name} (ID: ${user.id})`);
    
    // Get course information
    console.log('Fetching course information...');
    const [courses] = await db.query('SELECT * FROM courses LIMIT 3');
    
    if (courses.length === 0) {
      console.log('No courses found. Creating sample courses...');
      
      // Create sample courses if none exist
      await db.query(
        'INSERT INTO courses (course_code, name, semester, instructor_id) VALUES (?, ?, ?, ?)',
        ['CS101', 'Introduction to Computer Science', '2025-Spring', user.id]
      );
      
      await db.query(
        'INSERT INTO courses (course_code, name, semester, instructor_id) VALUES (?, ?, ?, ?)',
        ['CS223', 'Digital Design', '2025-Spring', user.id]
      );
      
      await db.query(
        'INSERT INTO courses (course_code, name, semester, instructor_id) VALUES (?, ?, ?, ?)',
        ['CS315', 'Programming Languages', '2025-Spring', user.id]
      );
      
      // Fetch the newly created courses
      const [newCourses] = await db.query('SELECT * FROM courses LIMIT 3');
      courses.push(...newCourses);
    }
    
    console.log(`Found ${courses.length} courses.`);
    
    // Create tasks for the user
    console.log('Creating tasks for the user...');
    
    const taskTypes = ['grading', 'office_hours', 'proctoring', 'lab_session', 'other'];
    const statuses = ['active', 'completed', 'cancelled'];
    
    // Sample task data
    const tasks = [
      {
        title: 'Grade Midterm Exams',
        description: 'Grade midterm exams for CS101 students.',
        task_type: 'grading',
        course_id: courses[0]?.id || 1,
        due_date: '2025-05-20',
        duration: 120, // minutes
        status: 'active'
      },
      {
        title: 'Office Hours',
        description: 'Hold office hours for CS223 students.',
        task_type: 'office_hours',
        course_id: courses[1]?.id || 2,
        due_date: '2025-05-15',
        duration: 60, // minutes
        status: 'active'
      },
      {
        title: 'Proctor Final Exam',
        description: 'Proctor final exam for CS315 students.',
        task_type: 'proctoring',
        course_id: courses[2]?.id || 3,
        due_date: '2025-06-10',
        duration: 180, // minutes
        status: 'active'
      },
      {
        title: 'Lab Session',
        description: 'Conduct lab session for CS101 students.',
        task_type: 'lab_session',
        course_id: courses[0]?.id || 1,
        due_date: '2025-05-12',
        duration: 90, // minutes
        status: 'active'
      },
      {
        title: 'Prepare Lab Materials',
        description: 'Prepare materials for the upcoming lab session.',
        task_type: 'other',
        course_id: courses[0]?.id || 1,
        due_date: '2025-05-11',
        duration: 45, // minutes
        status: 'active'
      }
    ];
    
    // Insert tasks and assign them to the user
    for (const task of tasks) {
      console.log(`Creating task: ${task.title}`);
      
      // Insert the task
      const [taskResult] = await db.query(
        `INSERT INTO tasks (title, description, task_type, course_id, due_date, duration, status, created_by, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          task.title,
          task.description,
          task.task_type,
          task.course_id,
          task.due_date,
          task.duration,
          task.status,
          user.id
        ]
      );
      
      const taskId = taskResult.insertId;
      
      // Assign the task to the user
      await db.query(
        `INSERT INTO task_assignments (task_id, user_id, assigned_at) 
         VALUES (?, ?, NOW())`,
        [taskId, user.id]
      );
      
      console.log(`Task created and assigned: ${task.title} (ID: ${taskId})`);
    }
    
    console.log(`\nSuccessfully created and assigned ${tasks.length} tasks to user ${user.full_name} (ID: ${user.id}).`);
    
  } catch (error) {
    console.error('Error adding tasks to user:', error);
  } finally {
    // Close the database connection pool
    await db.end();
    process.exit(0);
  }
}

// Run the function
addTasksToUser();
