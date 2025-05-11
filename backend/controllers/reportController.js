// backend/controllers/reportController.js
const db = require('../config/db');
const Course = require('../models/Course');
const Task = require('../models/Task');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Swap = require('../models/Swap');
const loggingService = require('../services/LoggingService');

/**
 * Generate a TA performance report
 * @route GET /api/reports/ta-performance
 */
exports.getTAPerformanceReport = async (req, res) => {
  try {
    // Check if user has appropriate permissions
    if (req.user.role !== 'admin' && req.user.role !== 'department_chair' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Unauthorized to access TA performance reports' });
    }
    
    // Get filter parameters
    const taId = req.query.ta_id;
    const courseId = req.query.course_id;
    const semester = req.query.semester;
    
    // Build query conditions
    let conditions = [];
    let params = [];
    
    if (taId) {
      conditions.push('u.id = ?');
      params.push(taId);
    } else {
      // Only include TAs
      conditions.push('u.role = "ta"');
    }
    
    if (courseId) {
      conditions.push('ct.course_id = ?');
      params.push(courseId);
    }
    
    if (semester) {
      conditions.push('c.semester = ?');
      params.push(semester);
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get TA performance data
    const [performanceData] = await db.query(`
      SELECT 
        u.id,
        u.full_name,
        u.bilkent_id,
        u.email,
        COUNT(DISTINCT ct.course_id) as course_count,
        GROUP_CONCAT(DISTINCT c.course_code) as courses,
        COUNT(DISTINCT t.id) as total_tasks,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        ROUND(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) / COUNT(DISTINCT t.id) * 100, 2) as completion_rate,
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
      ${whereClause}
      GROUP BY u.id
      ORDER BY completion_rate DESC, u.full_name
    `, params);
    
    // Enhance the report with additional data
    for (const ta of performanceData) {
      // Get task breakdown by type
      const [taskBreakdown] = await db.query(`
        SELECT 
          t.task_type,
          COUNT(*) as count,
          SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM tasks t
        JOIN task_assignments ta ON t.id = ta.task_id
        WHERE ta.user_id = ?
        GROUP BY t.task_type
      `, [ta.id]);
      
      ta.task_breakdown = taskBreakdown;
      
      // Get leave request breakdown by status
      const [leaveBreakdown] = await db.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM leave_requests
        WHERE user_id = ?
        GROUP BY status
      `, [ta.id]);
      
      ta.leave_breakdown = leaveBreakdown;
    }
    
    res.json(performanceData);
    
    // Log the action
    await loggingService.log({
      action: 'ta_performance_report_viewed',
      entity: 'report',
      user_id: req.user?.bilkentId,
      description: `User viewed TA performance report`,
      metadata: { 
        user_role: req.user?.role,
        filters: { taId, courseId, semester }
      }
    }, req);
  } catch (error) {
    console.error('Error generating TA performance report:', error);
    res.status(500).json({ message: 'Server error generating TA performance report' });
  }
};

/**
 * Generate a course utilization report
 * @route GET /api/reports/course-utilization
 */
exports.getCourseUtilizationReport = async (req, res) => {
  try {
    // Check if user has appropriate permissions
    if (req.user.role !== 'admin' && req.user.role !== 'department_chair') {
      return res.status(403).json({ message: 'Unauthorized to access course utilization reports' });
    }
    
    // Get filter parameters
    const semester = req.query.semester;
    const department = req.query.department;
    
    // Build query conditions
    let conditions = [];
    let params = [];
    
    if (semester) {
      conditions.push('c.semester = ?');
      params.push(semester);
    }
    
    if (department) {
      conditions.push('c.department = ?');
      params.push(department);
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get course utilization data
    const [utilizationData] = await db.query(`
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
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.semester DESC, c.course_code
    `, params);
    
    // Enhance the report with additional data
    for (const course of utilizationData) {
      // Get TA list for this course
      const [taList] = await db.query(`
        SELECT 
          u.id,
          u.full_name,
          u.bilkent_id,
          ct.hours_per_week,
          ct.start_date,
          ct.end_date,
          ct.status
        FROM course_tas ct
        JOIN users u ON ct.ta_id = u.id
        WHERE ct.course_id = ?
        ORDER BY u.full_name
      `, [course.id]);
      
      course.tas = taList;
      
      // Get task breakdown by type
      const [taskBreakdown] = await db.query(`
        SELECT 
          task_type,
          COUNT(*) as count,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM tasks
        WHERE course_id = ?
        GROUP BY task_type
      `, [course.course_code]);
      
      course.task_breakdown = taskBreakdown;
    }
    
    res.json(utilizationData);
    
    // Log the action
    await loggingService.log({
      action: 'course_utilization_report_viewed',
      entity: 'report',
      user_id: req.user?.bilkentId,
      description: `User viewed course utilization report`,
      metadata: { 
        user_role: req.user?.role,
        filters: { semester, department }
      }
    }, req);
  } catch (error) {
    console.error('Error generating course utilization report:', error);
    res.status(500).json({ message: 'Server error generating course utilization report' });
  }
};

/**
 * Generate a semester summary report
 * @route GET /api/reports/semester-summary
 */
exports.getSemesterSummaryReport = async (req, res) => {
  try {
    // Check if user has appropriate permissions
    if (req.user.role !== 'admin' && req.user.role !== 'department_chair') {
      return res.status(403).json({ message: 'Unauthorized to access semester summary reports' });
    }
    
    // Get semester parameter (required)
    const semester = req.query.semester;
    if (!semester) {
      return res.status(400).json({ message: 'Semester parameter is required' });
    }
    
    // Get summary data
    const summary = {
      semester,
      courses: {},
      tas: {},
      tasks: {},
      leaves: {},
      swaps: {}
    };
    
    // Get course statistics
    const [courseStats] = await db.query(`
      SELECT 
        COUNT(*) as total_courses,
        COUNT(DISTINCT department) as total_departments,
        SUM(credits) as total_credits,
        AVG(credits) as avg_credits_per_course
      FROM courses
      WHERE semester = ?
    `, [semester]);
    
    summary.courses = courseStats[0];
    
    // Get TA statistics
    const [taStats] = await db.query(`
      SELECT 
        COUNT(DISTINCT ct.ta_id) as total_tas,
        SUM(ct.hours_per_week) as total_ta_hours,
        AVG(ct.hours_per_week) as avg_hours_per_ta
      FROM course_tas ct
      JOIN courses c ON ct.course_id = c.id
      WHERE c.semester = ?
    `, [semester]);
    
    summary.tas = taStats[0];
    
    // Get task statistics
    const [taskStats] = await db.query(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_tasks,
        ROUND(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as completion_rate,
        COUNT(DISTINCT task_type) as task_types
      FROM tasks t
      JOIN courses c ON t.course_id = c.course_code
      WHERE c.semester = ?
    `, [semester]);
    
    summary.tasks = taskStats[0];
    
    // Get task breakdown by type
    const [taskBreakdown] = await db.query(`
      SELECT 
        t.task_type,
        COUNT(*) as count,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM tasks t
      JOIN courses c ON t.course_id = c.course_code
      WHERE c.semester = ?
      GROUP BY t.task_type
    `, [semester]);
    
    summary.tasks.breakdown = taskBreakdown;
    
    // Get leave statistics
    const [leaveStats] = await db.query(`
      SELECT 
        COUNT(*) as total_leaves,
        SUM(CASE WHEN lr.status = 'approved' THEN 1 ELSE 0 END) as approved_leaves,
        SUM(CASE WHEN lr.status = 'rejected' THEN 1 ELSE 0 END) as rejected_leaves,
        SUM(CASE WHEN lr.status = 'pending' THEN 1 ELSE 0 END) as pending_leaves,
        AVG(lr.duration) as avg_leave_duration
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      JOIN course_tas ct ON u.id = ct.ta_id
      JOIN courses c ON ct.course_id = c.id
      WHERE c.semester = ? AND u.role = 'ta'
    `, [semester]);
    
    summary.leaves = leaveStats[0];
    
    // Get swap statistics
    const [swapStats] = await db.query(`
      SELECT 
        COUNT(*) as total_swaps,
        SUM(CASE WHEN sr.status = 'approved' THEN 1 ELSE 0 END) as approved_swaps,
        SUM(CASE WHEN sr.status = 'rejected' THEN 1 ELSE 0 END) as rejected_swaps,
        SUM(CASE WHEN sr.status = 'pending' THEN 1 ELSE 0 END) as pending_swaps
      FROM swap_requests sr
      JOIN users u ON sr.requester_id = u.id
      JOIN course_tas ct ON u.id = ct.ta_id
      JOIN courses c ON ct.course_id = c.id
      WHERE c.semester = ? AND u.role = 'ta'
    `, [semester]);
    
    summary.swaps = swapStats[0];
    
    // Get department breakdown
    const [departmentBreakdown] = await db.query(`
      SELECT 
        c.department,
        COUNT(*) as course_count,
        SUM(c.credits) as total_credits,
        COUNT(DISTINCT ct.ta_id) as ta_count,
        SUM(ct.hours_per_week) as total_ta_hours
      FROM courses c
      LEFT JOIN course_tas ct ON c.id = ct.course_id
      WHERE c.semester = ?
      GROUP BY c.department
      ORDER BY course_count DESC
    `, [semester]);
    
    summary.department_breakdown = departmentBreakdown;
    
    res.json(summary);
    
    // Log the action
    await loggingService.log({
      action: 'semester_summary_report_viewed',
      entity: 'report',
      user_id: req.user?.bilkentId,
      description: `User viewed semester summary report for ${semester}`,
      metadata: { 
        user_role: req.user?.role,
        semester
      }
    }, req);
  } catch (error) {
    console.error('Error generating semester summary report:', error);
    res.status(500).json({ message: 'Server error generating semester summary report' });
  }
};

/**
 * Export data to CSV format
 * @route GET /api/reports/export/:type
 */
exports.exportData = async (req, res) => {
  try {
    // Check if user has appropriate permissions
    if (req.user.role !== 'admin' && req.user.role !== 'department_chair') {
      return res.status(403).json({ message: 'Unauthorized to export data' });
    }
    
    const exportType = req.params.type;
    let data = [];
    let filename = '';
    
    // Get data based on export type
    switch (exportType) {
      case 'courses':
        const courseFilters = {
          semester: req.query.semester,
          department: req.query.department
        };
        data = await Course.findAll(courseFilters);
        filename = 'courses_export.csv';
        break;
        
      case 'tas':
        data = await User.findByRole('ta');
        filename = 'tas_export.csv';
        break;
        
      case 'assignments':
        const courseId = req.query.course_id;
        if (!courseId) {
          return res.status(400).json({ message: 'Course ID is required for assignment export' });
        }
        data = await Course.getTAs(courseId);
        filename = `course_${courseId}_assignments.csv`;
        break;
        
      case 'tasks':
        const taskFilters = {
          courseId: req.query.course_id,
          status: req.query.status,
          taskType: req.query.task_type
        };
        // This would require a new method in Task model to support filtering
        data = await Task.findAllWithFilters(taskFilters);
        filename = 'tasks_export.csv';
        break;
        
      case 'leaves':
        data = await Leave.findAll();
        filename = 'leave_requests_export.csv';
        break;
        
      case 'swaps':
        data = await Swap.findAll();
        filename = 'swap_requests_export.csv';
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }
    
    // Convert data to CSV format
    // This is a simplified implementation - in a real application, you'd use a CSV library
    let csv = '';
    
    // Add headers
    if (data.length > 0) {
      csv += Object.keys(data[0]).join(',') + '\n';
      
      // Add data rows
      data.forEach(item => {
        const values = Object.values(item).map(value => {
          // Handle values that contain commas or quotes
          if (value === null || value === undefined) {
            return '';
          }
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        csv += values.join(',') + '\n';
      });
    }
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    // Send CSV data
    res.send(csv);
    
    // Log the action
    await loggingService.log({
      action: 'data_exported',
      entity: 'export',
      user_id: req.user?.bilkentId,
      description: `User exported ${exportType} data`,
      metadata: { 
        user_role: req.user?.role,
        export_type: exportType,
        filters: req.query
      }
    }, req);
  } catch (error) {
    console.error(`Error exporting ${req.params.type} data:`, error);
    res.status(500).json({ message: `Server error exporting ${req.params.type} data` });
  }
};
