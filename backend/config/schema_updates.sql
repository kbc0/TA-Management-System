-- backend/config/schema_updates.sql
-- Schema updates for new functionality

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(255) DEFAULT NULL,
  data JSON DEFAULT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add index for faster queries on user_id and is_read
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- Add statistics table for caching aggregated data
CREATE TABLE IF NOT EXISTS system_statistics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  statistic_key VARCHAR(100) NOT NULL,
  statistic_value JSON NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (statistic_key)
);

-- Add course_statistics view for reporting
CREATE OR REPLACE VIEW course_statistics AS
SELECT 
  c.id,
  c.course_code,
  c.course_name,
  c.semester,
  c.department,
  c.credits,
  COUNT(DISTINCT ct.ta_id) as ta_count,
  SUM(ct.hours_per_week) as total_ta_hours,
  ROUND(SUM(ct.hours_per_week) / c.credits, 2) as hours_per_credit,
  COUNT(DISTINCT t.id) as task_count,
  SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
  ROUND(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT t.id), 0) * 100, 2) as task_completion_rate
FROM courses c
LEFT JOIN course_tas ct ON c.id = ct.course_id
LEFT JOIN tasks t ON c.course_code = t.course_id
GROUP BY c.id;

-- Add ta_performance view for reporting
CREATE OR REPLACE VIEW ta_performance AS
SELECT 
  u.id,
  u.full_name,
  u.bilkent_id,
  u.email,
  COUNT(DISTINCT ct.course_id) as course_count,
  GROUP_CONCAT(DISTINCT c.course_code) as courses,
  COUNT(DISTINCT t.id) as total_tasks,
  SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
  ROUND(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT t.id), 0) * 100, 2) as completion_rate,
  AVG(CASE WHEN t.status = 'completed' THEN TIMESTAMPDIFF(DAY, t.created_at, t.completed_at) ELSE NULL END) as avg_completion_days,
  COUNT(DISTINCT lr.id) as leave_requests,
  COUNT(DISTINCT sr.id) as swap_requests
FROM users u
LEFT JOIN course_tas ct ON u.id = ct.ta_id
LEFT JOIN courses c ON ct.course_id = c.id
LEFT JOIN task_assignments ta ON u.id = ta.user_id
LEFT JOIN tasks t ON ta.task_id = t.id
LEFT JOIN leave_requests lr ON u.id = lr.user_id
LEFT JOIN swap_requests sr ON u.id = sr.requester_id
WHERE u.role = 'ta'
GROUP BY u.id;

-- Add semester_summary view for reporting
CREATE OR REPLACE VIEW semester_summary AS
SELECT 
  c.semester,
  COUNT(DISTINCT c.id) as total_courses,
  COUNT(DISTINCT c.department) as total_departments,
  SUM(c.credits) as total_credits,
  AVG(c.credits) as avg_credits_per_course,
  COUNT(DISTINCT ct.ta_id) as total_tas,
  SUM(ct.hours_per_week) as total_ta_hours,
  AVG(ct.hours_per_week) as avg_hours_per_ta,
  COUNT(DISTINCT t.id) as total_tasks,
  SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
  ROUND(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT t.id), 0) * 100, 2) as task_completion_rate
FROM courses c
LEFT JOIN course_tas ct ON c.id = ct.course_id
LEFT JOIN tasks t ON c.course_code = t.course_id
GROUP BY c.semester;

-- Add function to get course statistics
DELIMITER //
CREATE FUNCTION IF NOT EXISTS get_course_statistics(course_id INT) 
RETURNS JSON
DETERMINISTIC
BEGIN
  DECLARE stats JSON;
  
  SELECT JSON_OBJECT(
    'ta_count', COUNT(DISTINCT ct.ta_id),
    'total_ta_hours', SUM(ct.hours_per_week),
    'task_count', COUNT(DISTINCT t.id),
    'completed_tasks', SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END),
    'completion_rate', ROUND(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT t.id), 0) * 100, 2)
  ) INTO stats
  FROM courses c
  LEFT JOIN course_tas ct ON c.id = ct.course_id
  LEFT JOIN tasks t ON c.course_code = t.course_id
  WHERE c.id = course_id;
  
  RETURN stats;
END //
DELIMITER ;

-- Add function to get TA statistics
DELIMITER //
CREATE FUNCTION IF NOT EXISTS get_ta_statistics(ta_id INT) 
RETURNS JSON
DETERMINISTIC
BEGIN
  DECLARE stats JSON;
  
  SELECT JSON_OBJECT(
    'course_count', COUNT(DISTINCT ct.course_id),
    'total_tasks', COUNT(DISTINCT t.id),
    'completed_tasks', SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END),
    'completion_rate', ROUND(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT t.id), 0) * 100, 2),
    'leave_requests', COUNT(DISTINCT lr.id),
    'swap_requests', COUNT(DISTINCT sr.id)
  ) INTO stats
  FROM users u
  LEFT JOIN course_tas ct ON u.id = ct.ta_id
  LEFT JOIN task_assignments ta ON u.id = ta.user_id
  LEFT JOIN tasks t ON ta.task_id = t.id
  LEFT JOIN leave_requests lr ON u.id = lr.user_id
  LEFT JOIN swap_requests sr ON u.id = sr.requester_id
  WHERE u.id = ta_id;
  
  RETURN stats;
END //
DELIMITER ;

-- Add stored procedure to generate task reminders
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS generate_task_reminders(IN days_threshold INT)
BEGIN
  -- Find tasks due within the threshold days
  INSERT INTO notifications (user_id, type, title, message, link, data, is_read)
  SELECT 
    ta.user_id,
    'task_reminder',
    'Task Reminder',
    CASE 
      WHEN DATEDIFF(t.due_date, CURDATE()) = 0 THEN CONCAT('Task "', t.title, '" is due today!')
      WHEN DATEDIFF(t.due_date, CURDATE()) = 1 THEN CONCAT('Task "', t.title, '" is due tomorrow!')
      ELSE CONCAT('Task "', t.title, '" is due in ', DATEDIFF(t.due_date, CURDATE()), ' days.')
    END,
    CONCAT('/tasks/', t.id),
    JSON_OBJECT(
      'task_id', t.id, 
      'task_type', t.task_type, 
      'due_date', t.due_date, 
      'days_remaining', DATEDIFF(t.due_date, CURDATE())
    ),
    0
  FROM tasks t
  JOIN task_assignments ta ON t.id = ta.task_id
  WHERE 
    t.status = 'active' 
    AND DATEDIFF(t.due_date, CURDATE()) BETWEEN 0 AND days_threshold
    AND NOT EXISTS (
      -- Check if a reminder has already been sent in the last 24 hours
      SELECT 1 FROM notifications n 
      WHERE n.user_id = ta.user_id 
        AND n.type = 'task_reminder'
        AND JSON_EXTRACT(n.data, '$.task_id') = t.id
        AND n.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
    );
END //
DELIMITER ;

-- Add stored procedure to update user status based on leave requests
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS update_user_leave_status()
BEGIN
  -- Update users to 'on_leave' status if they have an approved leave request that starts today
  UPDATE users u
  JOIN leave_requests lr ON u.id = lr.user_id
  SET u.status = 'on_leave'
  WHERE 
    lr.status = 'approved'
    AND lr.start_date <= CURDATE()
    AND lr.end_date >= CURDATE()
    AND u.status = 'active';
    
  -- Update users back to 'active' status if their leave has ended
  UPDATE users u
  JOIN (
    SELECT lr.user_id
    FROM leave_requests lr
    GROUP BY lr.user_id
    HAVING MAX(CASE WHEN lr.status = 'approved' AND lr.end_date >= CURDATE() THEN 1 ELSE 0 END) = 0
  ) active_users ON u.id = active_users.user_id
  SET u.status = 'active'
  WHERE u.status = 'on_leave';
END //
DELIMITER ;
