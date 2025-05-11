// backend/controllers/dashboardController.js
const Course = require('../models/Course');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const Swap = require('../models/Swap');
const User = require('../models/User');
const loggingService = require('../services/LoggingService');

/**
 * Get dashboard data for the current user
 * @route GET /api/dashboard
 */
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const dashboardData = {};

    // Get user profile information
    dashboardData.user = await User.findById(userId);

    // Get upcoming tasks based on user role
    dashboardData.upcomingTasks = await Task.findUpcoming(userId, 5);

    // For TAs, get their course assignments
    if (userRole === 'ta') {
      dashboardData.courses = await Course.getCoursesForTA(userId);
      dashboardData.pendingLeaves = await Leave.findByUserId(userId);
      dashboardData.pendingSwaps = await Swap.findByUserId(userId);
      
      // Add task completion statistics for TA
      dashboardData.taskCompletionStats = {
        total: 25,
        completed: 18,
        pending: 5,
        overdue: 2
      };
    }

    // For instructors/staff, get courses they teach and their TAs
    if (userRole === 'staff' || userRole === 'department_chair') {
      dashboardData.courses = await Course.findAll({ instructorId: userId });
      
      // Get all TAs for these courses
      dashboardData.tas = [];
      
      // Create a map to track which courses each TA is assigned to
      const taCoursesMap = new Map();
      
      for (const course of dashboardData.courses) {
        const tas = await Course.getTAs(course.id);
        
        // For each TA, add this course to their list of courses
        for (const ta of tas) {
          const taId = ta.ta_id;
          
          if (!taCoursesMap.has(taId)) {
            // First time seeing this TA, initialize with basic info
            taCoursesMap.set(taId, {
              id: taId,
              fullName: ta.full_name,
              bilkentId: ta.bilkent_id,
              email: ta.email,
              courses: [],
              task_completion_rate: Math.floor(Math.random() * 30) + 70 // Random completion rate between 70-99%
            });
          }
          
          // Add this course to the TA's list of courses
          const courseCode = dashboardData.courses.find(c => c.id === course.id)?.course_code || 'Unknown';
          if (!taCoursesMap.get(taId).courses.includes(courseCode)) {
            taCoursesMap.get(taId).courses.push(courseCode);
          }
        }
      }
      
      // Convert the map to an array for the response
      dashboardData.tas = Array.from(taCoursesMap.values());
      
      // Get pending leave requests to review
      dashboardData.pendingLeaveRequests = await Leave.findAll(userId, userRole);
      dashboardData.pendingLeaveRequests = dashboardData.pendingLeaveRequests.filter(
        leave => leave.status === 'pending'
      );
      
      // Get pending swap requests to review
      dashboardData.pendingSwapRequests = await Swap.findAll(userId, userRole);
      dashboardData.pendingSwapRequests = dashboardData.pendingSwapRequests.filter(
        swap => swap.status === 'pending'
      );
      
      // Add task completion statistics
      // This would normally be calculated from the database
      dashboardData.taskCompletionStats = {
        total: 45,
        completed: 32,
        pending: 10,
        overdue: 3
      };
    }

    // For admins, get system-wide statistics
    if (userRole === 'admin') {
      // Get counts of various entities
      const [userCounts] = await User.getCountsByRole();
      dashboardData.userCounts = userCounts;
      
      // Get course statistics
      const [courseStats] = await Course.getStatistics();
      dashboardData.courseStats = courseStats;
      
      // Get leave statistics
      dashboardData.leaveStats = await Leave.getLeaveStatistics();
      
      // Get swap statistics
      dashboardData.swapStats = await Swap.getSwapStatistics();
      
      // Get recent system logs
      dashboardData.recentLogs = await loggingService.getRecentLogs(10);
    }

    res.json(dashboardData);
    
    // Log the action
    await loggingService.log({
      action: 'dashboard_viewed',
      entity: 'dashboard',
      user_id: req.user?.bilkentId,
      description: `User viewed dashboard`,
      metadata: { 
        user_role: req.user?.role
      }
    }, req);
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({ message: 'Server error retrieving dashboard data' });
  }
};

/**
 * Get system statistics
 * @route GET /api/dashboard/statistics
 */
exports.getSystemStatistics = async (req, res) => {
  try {
    // Check if user has admin permissions
    if (req.user.role !== 'admin' && req.user.role !== 'department_chair') {
      return res.status(403).json({ message: 'Unauthorized to access system statistics' });
    }
    
    const statistics = {
      users: {},
      courses: {},
      tasks: {},
      leaves: {},
      swaps: {}
    };
    
    // Get user statistics
    const [userStats] = await User.getCountsByRole();
    statistics.users = userStats;
    
    // Get course statistics
    const [courseStats] = await Course.getStatistics();
    statistics.courses = courseStats;
    
    // Get leave statistics
    statistics.leaves = await Leave.getLeaveStatistics();
    
    // Get swap statistics
    statistics.swaps = await Swap.getSwapStatistics();
    
    // Get task statistics
    const [taskStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN task_type = 'grading' THEN 1 ELSE 0 END) as grading,
        SUM(CASE WHEN task_type = 'proctoring' THEN 1 ELSE 0 END) as proctoring,
        SUM(CASE WHEN task_type = 'office_hours' THEN 1 ELSE 0 END) as office_hours,
        SUM(CASE WHEN task_type = 'other' THEN 1 ELSE 0 END) as other
      FROM tasks
    `);
    statistics.tasks = taskStats[0];
    
    res.json(statistics);
    
    // Log the action
    await loggingService.log({
      action: 'system_statistics_viewed',
      entity: 'statistics',
      user_id: req.user?.bilkentId,
      description: `User viewed system statistics`,
      metadata: { 
        user_role: req.user?.role
      }
    }, req);
  } catch (error) {
    console.error('Error getting system statistics:', error);
    res.status(500).json({ message: 'Server error retrieving system statistics' });
  }
};

/**
 * Get workload report for TAs
 * @route GET /api/dashboard/workload
 */
exports.getWorkloadReport = async (req, res) => {
  try {
    // Check if user has appropriate permissions
    if (req.user.role !== 'admin' && req.user.role !== 'department_chair' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Unauthorized to access workload report' });
    }
    
    // Get optional filter parameters
    const courseId = req.query.course_id;
    const semester = req.query.semester;
    
    // Build query conditions
    let conditions = [];
    let params = [];
    
    if (courseId) {
      conditions.push('ct.course_id = ?');
      params.push(courseId);
    }
    
    if (semester) {
      conditions.push('c.semester = ?');
      params.push(semester);
    }
    
    // Only include active TAs
    conditions.push('u.status = "active"');
    conditions.push('u.role = "ta"');
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get TA workload data
    const [workloadData] = await db.query(`
      SELECT 
        u.id,
        u.full_name,
        u.bilkent_id,
        u.email,
        COUNT(DISTINCT ct.course_id) as course_count,
        SUM(ct.hours_per_week) as total_hours_per_week,
        COUNT(DISTINCT t.id) as task_count,
        SUM(CASE WHEN t.status = 'active' THEN 1 ELSE 0 END) as active_tasks,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        GROUP_CONCAT(DISTINCT c.course_code) as course_codes
      FROM users u
      LEFT JOIN course_tas ct ON u.id = ct.ta_id
      LEFT JOIN courses c ON ct.course_id = c.id
      LEFT JOIN task_assignments ta ON u.id = ta.user_id
      LEFT JOIN tasks t ON ta.task_id = t.id
      ${whereClause}
      GROUP BY u.id
      ORDER BY total_hours_per_week DESC, u.full_name
    `, params);
    
    res.json(workloadData);
    
    // Log the action
    await loggingService.log({
      action: 'workload_report_viewed',
      entity: 'report',
      user_id: req.user?.bilkentId,
      description: `User viewed TA workload report`,
      metadata: { 
        user_role: req.user?.role,
        filters: { courseId, semester }
      }
    }, req);
  } catch (error) {
    console.error('Error getting workload report:', error);
    res.status(500).json({ message: 'Server error retrieving workload report' });
  }
};
