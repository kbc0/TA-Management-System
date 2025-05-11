// backend/scripts/populate-sample-data.js
require('dotenv').config();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function populateSampleData() {
  try {
    console.log('Connecting to database...');
    console.log('Populating database with sample data...');

    // Create sample users if they don't exist
    await createSampleUsers();
    
    // Create sample courses if they don't exist
    await createSampleCourses();
    
    // Create sample tasks and assign them
    await createSampleTasks();
    
    // Create sample leave requests
    await createSampleLeaveRequests();
    
    // Create sample swap requests
    await createSampleSwapRequests();
    
    // Create sample exams
    await createSampleExams();

    console.log('Sample data population completed successfully!');
  } catch (error) {
    console.error('Error populating sample data:', error);
  }
}

async function createSampleUsers() {
  console.log('Creating sample users...');
  
  const sampleUsers = [
    {
      bilkent_id: '20101992',
      email: '20101992@ug.bilkent.edu.tr',
      password: await bcrypt.hash('password123', 10),
      full_name: 'John Smith',
      role: 'ta',
      department: 'Computer Science'
    },
    {
      bilkent_id: '20101993',
      email: '20101993@ug.bilkent.edu.tr',
      password: await bcrypt.hash('password123', 10),
      full_name: 'Emily Johnson',
      role: 'ta',
      department: 'Computer Science'
    },
    {
      bilkent_id: '20101994',
      email: '20101994@ug.bilkent.edu.tr',
      password: await bcrypt.hash('password123', 10),
      full_name: 'Michael Brown',
      role: 'ta',
      department: 'Computer Science'
    },
    {
      bilkent_id: 'STAFF001',
      email: 'staff001@bilkent.edu.tr',
      password: await bcrypt.hash('password123', 10),
      full_name: 'Dr. Sarah Wilson',
      role: 'staff',
      department: 'Computer Science'
    },
    {
      bilkent_id: 'CHAIR001',
      email: 'chair001@bilkent.edu.tr',
      password: await bcrypt.hash('password123', 10),
      full_name: 'Prof. Robert Davis',
      role: 'department_chair',
      department: 'Computer Science'
    },
    {
      bilkent_id: 'DEAN001',
      email: 'dean001@bilkent.edu.tr',
      password: await bcrypt.hash('password123', 10),
      full_name: 'Prof. Jennifer Lee',
      role: 'dean',
      department: 'Engineering'
    }
  ];

  for (const user of sampleUsers) {
    // Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE bilkent_id = ?',
      [user.bilkent_id]
    );

    if (existingUsers.length === 0) {
      try {
        // First check if department column exists
        const [columns] = await db.query('SHOW COLUMNS FROM users LIKE "department"');
        const hasDepartmentColumn = columns.length > 0;
        
        if (hasDepartmentColumn) {
          // Insert new user with department
          await db.query(
            `INSERT INTO users (bilkent_id, email, password, full_name, role, department) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              user.bilkent_id,
              user.email,
              user.password,
              user.full_name,
              user.role,
              user.department
            ]
          );
        } else {
          // Insert new user without department
          await db.query(
            `INSERT INTO users (bilkent_id, email, password, full_name, role) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              user.bilkent_id,
              user.email,
              user.password,
              user.full_name,
              user.role
            ]
          );
        }
        console.log(`Created user: ${user.full_name} (${user.role})`);
      } catch (error) {
        console.error(`Error creating user ${user.full_name}:`, error.message);
      }
    } else {
      console.log(`User ${user.full_name} already exists, skipping...`);
    }
  }
}

async function createSampleCourses() {
  console.log('Creating sample courses...');
  
  // Get instructor IDs
  const [instructors] = await db.query(
    "SELECT id FROM users WHERE role IN ('staff', 'department_chair') LIMIT 2"
  );
  
  if (instructors.length === 0) {
    console.log('No instructors found, skipping course creation');
    return;
  }
  
  const sampleCourses = [
    {
      course_code: 'CS101',
      course_name: 'Introduction to Computer Science',
      description: 'An introductory course to computer science and programming.',
      semester: '2025-Spring',
      credits: 3,
      department: 'Computer Science',
      instructor_id: instructors[0].id
    },
    {
      course_code: 'CS223',
      course_name: 'Digital Design',
      description: 'Introduction to digital systems, Boolean algebra, and hardware description languages.',
      semester: '2025-Spring',
      credits: 4,
      department: 'Computer Science',
      instructor_id: instructors[0].id
    },
    {
      course_code: 'CS315',
      course_name: 'Programming Languages',
      description: 'Concepts of programming languages, including language features and implementation details.',
      semester: '2025-Spring',
      credits: 3,
      department: 'Computer Science',
      instructor_id: instructors[1]?.id || instructors[0].id
    },
    {
      course_code: 'CS342',
      course_name: 'Database Systems',
      description: 'Introduction to database management systems, SQL, and database design.',
      semester: '2025-Spring',
      credits: 4,
      department: 'Computer Science',
      instructor_id: instructors[1]?.id || instructors[0].id
    }
  ];

  for (const course of sampleCourses) {
    // Check if course already exists
    const [existingCourses] = await db.query(
      'SELECT * FROM courses WHERE course_code = ?',
      [course.course_code]
    );

    if (existingCourses.length === 0) {
      // Insert new course
      await db.query(
        `INSERT INTO courses (course_code, course_name, description, semester, credits, department, instructor_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          course.course_code,
          course.course_name,
          course.description,
          course.semester,
          course.credits,
          course.department,
          course.instructor_id
        ]
      );
      console.log(`Created course: ${course.course_code} - ${course.course_name}`);
    } else {
      console.log(`Course ${course.course_code} already exists, skipping...`);
    }
  }
  
  // Assign TAs to courses
  await assignTAsToCourses();
}

async function assignTAsToCourses() {
  // Get TA IDs
  const [tas] = await db.query(
    "SELECT id FROM users WHERE role = 'ta' LIMIT 3"
  );
  
  if (tas.length === 0) {
    console.log('No TAs found, skipping TA assignment');
    return;
  }
  
  // Get course IDs
  const [courses] = await db.query(
    "SELECT id FROM courses LIMIT 4"
  );
  
  if (courses.length === 0) {
    console.log('No courses found, skipping TA assignment');
    return;
  }
  
  // Assign TAs to courses with different hours per week
  const assignments = [
    { ta_id: tas[0].id, course_id: courses[0].id, hours_per_week: 10 },
    { ta_id: tas[0].id, course_id: courses[1].id, hours_per_week: 5 },
    { ta_id: tas[1].id, course_id: courses[1].id, hours_per_week: 10 },
    { ta_id: tas[1].id, course_id: courses[2].id, hours_per_week: 8 },
    { ta_id: tas[2]?.id || tas[0].id, course_id: courses[2].id, hours_per_week: 10 },
    { ta_id: tas[2]?.id || tas[0].id, course_id: courses[3]?.id || courses[0].id, hours_per_week: 7 }
  ];
  
  for (const assignment of assignments) {
    // Check if assignment already exists
    const [existingAssignments] = await db.query(
      'SELECT * FROM course_tas WHERE course_id = ? AND ta_id = ?',
      [assignment.course_id, assignment.ta_id]
    );
    
    if (existingAssignments.length === 0) {
      // Insert new assignment
      const startDate = new Date('2025-02-01');
      const endDate = new Date('2025-06-15');
      
      await db.query(
        `INSERT INTO course_tas (course_id, ta_id, hours_per_week, start_date, end_date, status) 
         VALUES (?, ?, ?, ?, ?, 'active')`,
        [
          assignment.course_id,
          assignment.ta_id,
          assignment.hours_per_week,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ]
      );
      console.log(`Assigned TA ${assignment.ta_id} to course ${assignment.course_id}`);
    } else {
      console.log(`TA ${assignment.ta_id} already assigned to course ${assignment.course_id}, skipping...`);
    }
  }
}

async function createSampleTasks() {
  console.log('Creating sample tasks...');
  
  // Get user IDs
  const [users] = await db.query(
    "SELECT id, role FROM users LIMIT 10"
  );
  
  if (users.length === 0) {
    console.log('No users found, skipping task creation');
    return;
  }
  
  // Get course IDs
  const [courses] = await db.query(
    "SELECT id FROM courses LIMIT 4"
  );
  
  if (courses.length === 0) {
    console.log('No courses found, skipping task creation');
    return;
  }
  
  // Find a staff or admin user to be the creator
  const creator = users.find(user => user.role === 'staff' || user.role === 'department_chair') || users[0];
  
  // Find TAs
  const tas = users.filter(user => user.role === 'ta');
  if (tas.length === 0) {
    console.log('No TAs found, skipping task creation');
    return;
  }
  
  const taskTypes = ['grading', 'office_hours', 'proctoring', 'lab_session', 'other'];
  const statuses = ['active', 'completed', 'cancelled'];
  
  // Get course codes instead of IDs
  const [courseCodes] = await db.query(
    "SELECT id, course_code FROM courses LIMIT 4"
  );
  
  // Map course IDs to course codes
  const courseCodeMap = {};
  courseCodes.forEach(course => {
    courseCodeMap[course.id] = course.course_code;
  });
  
  // Sample tasks with different types and statuses
  const sampleTasks = [
    {
      title: 'Grade Midterm Exams',
      description: 'Grade midterm exams for CS101 students.',
      task_type: 'grading',
      course_id: courseCodeMap[courses[0].id] || 'CS101',
      due_date: '2025-05-20',
      duration: 120, // minutes
      status: 'active',
      created_by: creator.id,
      assigned_to: tas[0].id
    },
    {
      title: 'Office Hours',
      description: 'Hold office hours for CS223 students.',
      task_type: 'office_hours',
      course_id: courseCodeMap[courses[1].id] || 'CS223',
      due_date: '2025-05-15',
      duration: 60, // minutes
      status: 'active',
      created_by: creator.id,
      assigned_to: tas[0].id
    },
    {
      title: 'Proctor Final Exam',
      description: 'Proctor final exam for CS315 students.',
      task_type: 'proctoring',
      course_id: courseCodeMap[courses[2].id] || 'CS315',
      due_date: '2025-06-10',
      duration: 180, // minutes
      status: 'active',
      created_by: creator.id,
      assigned_to: tas[1].id
    },
    {
      title: 'Lab Session',
      description: 'Conduct lab session for CS101 students.',
      task_type: 'lab_session',
      course_id: courseCodeMap[courses[0].id] || 'CS101',
      due_date: '2025-05-12',
      duration: 90, // minutes
      status: 'completed',
      created_by: creator.id,
      assigned_to: tas[1].id
    },
    {
      title: 'Prepare Lab Materials',
      description: 'Prepare materials for the upcoming lab session.',
      task_type: 'other',
      course_id: courseCodeMap[courses[0].id] || 'CS101',
      due_date: '2025-05-11',
      duration: 45, // minutes
      status: 'cancelled',
      created_by: creator.id,
      assigned_to: tas[2]?.id || tas[0].id
    },
    {
      title: 'Grade Programming Assignment 2',
      description: 'Grade the second programming assignment for CS342.',
      task_type: 'grading',
      course_id: courseCodeMap[courses[3]?.id] || 'CS342',
      due_date: '2025-05-25',
      duration: 150, // minutes
      status: 'active',
      created_by: creator.id,
      assigned_to: tas[2]?.id || tas[0].id
    },
    {
      title: 'Prepare Exam Questions',
      description: 'Help prepare questions for the upcoming midterm exam.',
      task_type: 'other',
      course_id: courseCodeMap[courses[1].id] || 'CS223',
      due_date: '2025-04-15',
      duration: 120, // minutes
      status: 'completed',
      created_by: creator.id,
      assigned_to: tas[0].id
    },
    {
      title: 'Debug Lab Code',
      description: 'Fix issues in the lab code before the next session.',
      task_type: 'other',
      course_id: courseCodeMap[courses[2].id] || 'CS315',
      due_date: '2025-05-05',
      duration: 90, // minutes
      status: 'active',
      created_by: creator.id,
      assigned_to: tas[1].id
    }
  ];
  
  for (const task of sampleTasks) {
    // Insert the task with assigned_to field
    const [taskResult] = await db.query(
      `INSERT INTO tasks (title, description, task_type, course_id, due_date, duration, status, created_by, assigned_to, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        task.title,
        task.description,
        task.task_type,
        task.course_id,
        task.due_date,
        task.duration,
        task.status,
        task.created_by,
        task.assigned_to
      ]
    );
    
    const taskId = taskResult.insertId;
    
    // Also maintain the task_assignments table for compatibility
    await db.query(
      `INSERT INTO task_assignments (task_id, user_id, assigned_at) 
       VALUES (?, ?, NOW())`,
      [taskId, task.assigned_to]
    );
    
    console.log(`Created and assigned task: ${task.title} (ID: ${taskId})`);
  }
}

async function createSampleLeaveRequests() {
  console.log('Creating sample leave requests...');
  
  // Get TA IDs
  const [tas] = await db.query(
    "SELECT id FROM users WHERE role = 'ta' LIMIT 3"
  );
  
  if (tas.length === 0) {
    console.log('No TAs found, skipping leave request creation');
    return;
  }
  
  // Get reviewer IDs (staff or department chair)
  const [reviewers] = await db.query(
    "SELECT id FROM users WHERE role IN ('staff', 'department_chair') LIMIT 2"
  );
  
  if (reviewers.length === 0) {
    console.log('No reviewers found, skipping leave request creation');
    return;
  }
  
  const leaveTypes = ['conference', 'medical', 'family_emergency', 'personal', 'other'];
  const statuses = ['pending', 'approved', 'rejected'];
  
  // Sample leave requests with different types and statuses
  const sampleLeaveRequests = [
    {
      user_id: tas[0].id,
      leave_type: 'conference',
      start_date: '2025-06-01',
      end_date: '2025-06-05',
      duration: 5,
      reason: 'Attending ACM SIGCSE conference to present a paper.',
      status: 'approved',
      reviewer_id: reviewers[0].id,
      reviewer_notes: 'Approved. Conference attendance is beneficial for academic development.'
    },
    {
      user_id: tas[0].id,
      leave_type: 'medical',
      start_date: '2025-05-10',
      end_date: '2025-05-12',
      duration: 3,
      reason: 'Medical appointment and recovery.',
      status: 'approved',
      reviewer_id: reviewers[0].id,
      reviewer_notes: 'Approved based on medical documentation provided.'
    },
    {
      user_id: tas[1].id,
      leave_type: 'family_emergency',
      start_date: '2025-05-15',
      end_date: '2025-05-20',
      duration: 6,
      reason: 'Family emergency requiring immediate travel.',
      status: 'approved',
      reviewer_id: reviewers[1]?.id || reviewers[0].id,
      reviewer_notes: 'Approved due to emergency circumstances.'
    },
    {
      user_id: tas[1].id,
      leave_type: 'personal',
      start_date: '2025-07-01',
      end_date: '2025-07-05',
      duration: 5,
      reason: 'Personal leave for family wedding.',
      status: 'pending',
      reviewer_id: null,
      reviewer_notes: null
    },
    {
      user_id: tas[2]?.id || tas[0].id,
      leave_type: 'other',
      start_date: '2025-06-20',
      end_date: '2025-06-25',
      duration: 6,
      reason: 'Participating in a hackathon event.',
      status: 'rejected',
      reviewer_id: reviewers[0].id,
      reviewer_notes: 'Rejected due to conflict with exam period responsibilities.'
    },
    {
      user_id: tas[2]?.id || tas[0].id,
      leave_type: 'conference',
      start_date: '2025-08-10',
      end_date: '2025-08-15',
      duration: 6,
      reason: 'Attending IEEE conference.',
      status: 'pending',
      reviewer_id: null,
      reviewer_notes: null
    }
  ];
  
  for (const request of sampleLeaveRequests) {
    // Insert the leave request
    const [result] = await db.query(
      `INSERT INTO leave_requests (
        user_id, leave_type, start_date, end_date, duration, reason, 
        status, reviewer_id, reviewer_notes, created_at, updated_at, 
        reviewed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
      [
        request.user_id,
        request.leave_type,
        request.start_date,
        request.end_date,
        request.duration,
        request.reason,
        request.status,
        request.reviewer_id,
        request.reviewer_notes,
        request.status !== 'pending' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null
      ]
    );
    
    console.log(`Created leave request: ${request.leave_type} for user ${request.user_id} (${request.status})`);
  }
}

async function createSampleSwapRequests() {
  console.log('Creating sample swap requests...');
  
  // Get TA IDs
  const [tas] = await db.query(
    "SELECT id FROM users WHERE role = 'ta' LIMIT 3"
  );
  
  if (tas.length === 0) {
    console.log('No TAs found, skipping swap request creation');
    return;
  }
  
  // Get reviewer IDs (staff or department chair)
  const [reviewers] = await db.query(
    "SELECT id FROM users WHERE role IN ('staff', 'department_chair') LIMIT 2"
  );
  
  if (reviewers.length === 0) {
    console.log('No reviewers found, skipping swap request creation');
    return;
  }
  
  // Get task IDs
  const [tasks] = await db.query(
    "SELECT id FROM tasks LIMIT 8"
  );
  
  if (tasks.length < 4) {
    console.log('Not enough tasks found, skipping swap request creation');
    return;
  }
  
  // Sample swap requests with different statuses
  const sampleSwapRequests = [
    {
      requester_id: tas[0].id,
      target_id: tas[1].id,
      assignment_type: 'task',
      original_assignment_id: tasks[0].id,
      proposed_assignment_id: tasks[2].id,
      reason: 'I have a conflict with another course during this time.',
      status: 'approved',
      reviewer_id: reviewers[0].id,
      reviewer_notes: 'Approved. Both TAs have agreed to the swap.'
    },
    {
      requester_id: tas[1].id,
      target_id: tas[0].id,
      assignment_type: 'task',
      original_assignment_id: tasks[3].id,
      proposed_assignment_id: tasks[1].id,
      reason: 'I have more experience with the course material for the proposed task.',
      status: 'pending',
      reviewer_id: null,
      reviewer_notes: null
    },
    {
      requester_id: tas[0].id,
      target_id: tas[2]?.id || tas[1].id,
      assignment_type: 'task',
      original_assignment_id: tasks[4].id,
      proposed_assignment_id: tasks[5].id,
      reason: 'The proposed task better aligns with my research interests.',
      status: 'rejected',
      reviewer_id: reviewers[1]?.id || reviewers[0].id,
      reviewer_notes: 'Rejected. The target TA has already committed to their assigned task.'
    },
    {
      requester_id: tas[2]?.id || tas[1].id,
      target_id: tas[0].id,
      assignment_type: 'task',
      original_assignment_id: tasks[6].id,
      proposed_assignment_id: tasks[7].id,
      reason: 'I have a scheduling conflict with the original task.',
      status: 'pending',
      reviewer_id: null,
      reviewer_notes: null
    }
  ];
  
  for (const request of sampleSwapRequests) {
    // Insert the swap request
    const [result] = await db.query(
      `INSERT INTO swap_requests (
        requester_id, target_id, assignment_type, original_assignment_id, 
        proposed_assignment_id, reason, status, reviewer_id, reviewer_notes, 
        created_at, updated_at, reviewed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
      [
        request.requester_id,
        request.target_id,
        request.assignment_type,
        request.original_assignment_id,
        request.proposed_assignment_id,
        request.reason,
        request.status,
        request.reviewer_id,
        request.reviewer_notes,
        request.status !== 'pending' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null
      ]
    );
    
    console.log(`Created swap request from user ${request.requester_id} to ${request.target_id} (${request.status})`);
  }
}

async function createSampleExams() {
  console.log('Creating sample exams...');
  
  // Get course IDs
  const [courses] = await db.query(
    "SELECT id FROM courses LIMIT 4"
  );
  
  if (courses.length === 0) {
    console.log('No courses found, skipping exam creation');
    return;
  }
  
  // Get creator ID (staff or department chair)
  const [creators] = await db.query(
    "SELECT id FROM users WHERE role IN ('staff', 'department_chair') LIMIT 1"
  );
  
  if (creators.length === 0) {
    console.log('No creators found, skipping exam creation');
    return;
  }
  
  const creator_id = creators[0].id;
  
  // Get course codes
  const [courseCodes] = await db.query(
    "SELECT id, course_code FROM courses LIMIT 4"
  );
  
  // Map course IDs to course codes
  const courseCodeMap = {};
  courseCodes.forEach(course => {
    courseCodeMap[course.id] = course.course_code;
  });

  // Sample exams
  const sampleExams = [
    {
      course_id: courseCodeMap[courses[0].id] || 'CS101',
      exam_name: 'CS101 Midterm',
      exam_date: '2025-04-15',
      start_time: '10:00:00',
      end_time: '12:00:00',
      duration_minutes: 120,
      number_of_students: 120,
      number_of_proctors_needed: 4,
      created_by: creator_id,
      rooms: [
        { room_number: 'EA-101', capacity: 40 },
        { room_number: 'EA-102', capacity: 40 },
        { room_number: 'EA-103', capacity: 40 }
      ]
    },
    {
      course_id: courseCodeMap[courses[1].id] || 'CS223',
      exam_name: 'CS223 Midterm',
      exam_date: '2025-04-18',
      start_time: '13:00:00',
      end_time: '15:00:00',
      duration_minutes: 120,
      number_of_students: 80,
      number_of_proctors_needed: 3,
      created_by: creator_id,
      rooms: [
        { room_number: 'EB-201', capacity: 40 },
        { room_number: 'EB-202', capacity: 40 }
      ]
    },
    {
      course_id: courseCodeMap[courses[2].id] || 'CS315',
      exam_name: 'CS315 Final',
      exam_date: '2025-06-05',
      start_time: '09:00:00',
      end_time: '12:00:00',
      duration_minutes: 180,
      number_of_students: 60,
      number_of_proctors_needed: 2,
      created_by: creator_id,
      rooms: [
        { room_number: 'EC-301', capacity: 30 },
        { room_number: 'EC-302', capacity: 30 }
      ]
    },
    {
      course_id: courseCodeMap[courses[3]?.id] || 'CS342',
      exam_name: 'CS342 Final',
      exam_date: '2025-06-10',
      start_time: '14:00:00',
      end_time: '16:00:00',
      duration_minutes: 120,
      number_of_students: 100,
      number_of_proctors_needed: 3,
      created_by: creator_id,
      rooms: [
        { room_number: 'ED-401', capacity: 50 },
        { room_number: 'ED-402', capacity: 50 }
      ]
    }
  ];
  
  for (const exam of sampleExams) {
    // Insert the exam
    const [examResult] = await db.query(
      `INSERT INTO exams (
        course_id, exam_name, exam_date, start_time, end_time, 
        duration_minutes, number_of_students, number_of_proctors_needed, 
        created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        exam.course_id,
        exam.exam_name,
        exam.exam_date,
        exam.start_time,
        exam.end_time,
        exam.duration_minutes,
        exam.number_of_students,
        exam.number_of_proctors_needed,
        exam.created_by
      ]
    );
    
    const examId = examResult.insertId;
    
    // Insert exam rooms
    for (const room of exam.rooms) {
      await db.query(
        `INSERT INTO exam_rooms (exam_id, room_number, capacity) 
         VALUES (?, ?, ?)`,
        [examId, room.room_number, room.capacity]
      );
    }
    
    console.log(`Created exam: ${exam.exam_name} with ${exam.rooms.length} rooms`);
  }
}

// Export the function to be used in dbInit.js
module.exports = populateSampleData;

// If this script is run directly, execute the function
if (require.main === module) {
  populateSampleData()
    .then(() => {
      console.log('Sample data population completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
