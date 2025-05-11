// Script to create test notifications for TA users
const db = require('../config/db');

async function createTestNotifications() {
  try {
    console.log('Creating test notifications...');
    
    // Get all TA users
    const [tas] = await db.query(
      'SELECT id, full_name FROM users WHERE role = "ta"'
    );
    
    if (tas.length === 0) {
      console.log('No TA users found. Please run the database initialization script first.');
      process.exit(1);
    }
    
    console.log(`Found ${tas.length} TA users`);
    
    // Notification types and templates
    const notificationTypes = [
      {
        type: 'task',
        title: 'New Task Assigned',
        message: 'You have been assigned a new task: Grading Midterm Exams'
      },
      {
        type: 'info',
        title: 'Course Schedule Updated',
        message: 'The schedule for CS201 has been updated. Please check the course page.'
      },
      {
        type: 'warning',
        title: 'Deadline Approaching',
        message: 'You have a task due in 2 days. Please complete it on time.'
      },
      {
        type: 'event',
        title: 'Department Meeting',
        message: 'There will be a department meeting on Friday at 2:00 PM.'
      },
      {
        type: 'task',
        title: 'Task Status Updated',
        message: 'Your task "Prepare Lab Materials" has been marked as completed.'
      }
    ];
    
    // Create notifications for each TA
    for (const ta of tas) {
      console.log(`Creating notifications for TA: ${ta.full_name} (ID: ${ta.id})`);
      
      // Create 3-5 random notifications for each TA
      const numNotifications = Math.floor(Math.random() * 3) + 3; // 3-5 notifications
      
      for (let i = 0; i < numNotifications; i++) {
        // Select a random notification template
        const template = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        
        // Determine if notification should be read or unread (70% chance of being unread)
        const isRead = Math.random() > 0.7;
        
        // Create notification
        const [result] = await db.query(
          `INSERT INTO notifications 
          (user_id, type, title, message, read, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [ta.id, template.type, template.title, template.message, isRead]
        );
        
        console.log(`Created notification ID ${result.insertId} for TA ID ${ta.id}: ${template.title} (${isRead ? 'read' : 'unread'})`);
      }
    }
    
    console.log('Test notifications created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test notifications:', error);
    process.exit(1);
  }
}

// Run the function
createTestNotifications();
