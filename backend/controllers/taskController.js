// controllers/taskController.js
const Task = require('../models/Task');
const { PERMISSIONS } = require('../config/roles');
const { handleError } = require('../utils/errorHandler');
const db = require('../config/db');
const loggingService = require('../services/LoggingService');

/**
 * Get all tasks based on user role
 * @route GET /api/tasks
 * @access Private
 */
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll(req.user.id, req.user.role);
    res.json(tasks);
  } catch (error) {
    return handleError(error, 'task', req.user, 'Error fetching tasks', req, res);
  }
};

/**
 * Get a specific task by ID
 * @route GET /api/tasks/:id
 * @access Private
 */
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    return handleError(error, 'task', req.user, 'Error fetching task', req, res);
  }
};

/**
 * Get upcoming tasks for the current user
 * @route GET /api/tasks/upcoming
 * @access Private
 */
exports.getUpcomingTasks = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const tasks = await Task.findUpcoming(req.user.id, limit);
    res.json(tasks);
  } catch (error) {
    return handleError(error, 'task', req.user, 'Error fetching upcoming tasks', req, res);
  }
};

/**
 * Get tasks assigned to the current user
 * @route GET /api/tasks/my-tasks
 * @access Private
 */
exports.getMyTasks = async (req, res) => {
  try {
    // Query to get all tasks assigned to the current user
    const [tasks] = await db.query(
      `SELECT t.*, c.course_code, c.course_name
       FROM tasks t
       JOIN task_assignments ta ON t.id = ta.task_id
       LEFT JOIN courses c ON t.course_id = c.course_code
       WHERE ta.user_id = ?
       ORDER BY t.due_date ASC`,
      [req.user.id]
    );
    
    if (tasks.length === 0) {
      return res.status(200).json([]);
    }
    
    res.json(tasks);
  } catch (error) {
    return handleError(error, 'task', req.user, 'Error fetching your tasks', req, res);
  }
};

/**
 * Get tasks for a specific course
 * @route GET /api/tasks/course/:courseId
 * @access Private
 */
exports.getTasksByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const tasks = await Task.getTasksForCourse(courseId);
    res.json(tasks);
  } catch (error) {
    return handleError(error, 'task', req.user, 'Error fetching course tasks', req, res);
  }
};

/**
 * Create a new task
 * @route POST /api/tasks
 * @access Private (staff, department_chair, admin)
 */
exports.createTask = async (req, res) => {
  try {
    // Check if user has permission to create tasks
    if (!req.user.permissions.includes(PERMISSIONS.CREATE_ASSIGNMENT)) {
      return res.status(403).json({ message: 'You do not have permission to create tasks' });
    }
    
    // Validate the required fields
    const { title, task_type, due_date, duration } = req.body;
    
    if (!title || !task_type || !due_date || !duration) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Add the creator's ID to the task data
    const taskData = {
      ...req.body,
      created_by: req.user.id
    };
    
    const newTask = await Task.create(taskData);
    res.status(201).json(newTask);
  } catch (error) {
    return handleError(error, 'task', req.user, 'Error creating task', req, res);
  }
};

/**
 * Update an existing task
 * @route PUT /api/tasks/:id
 * @access Private (creator or admin)
 */
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Get the existing task
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check permissions - only creator or admin can update
    const canUpdate = req.user.permissions.includes(PERMISSIONS.UPDATE_ASSIGNMENT) && 
                      (task.created_by === req.user.id || req.user.role === 'admin');
    
    if (!canUpdate) {
      return res.status(403).json({ message: 'You do not have permission to update this task' });
    }
    
    const updated = await Task.update(taskId, req.body);
    
    if (!updated) {
      return res.status(400).json({ message: 'Failed to update task' });
    }
    
    const updatedTask = await Task.findById(taskId);
    res.json(updatedTask);
  } catch (error) {
    return handleError(error, 'task', req.user, 'Error updating task', req, res);
  }
};

/**
 * Mark a task as completed
 * @route PUT /api/tasks/:id/complete
 * @access Private (assigned TA or creator)
 */
exports.completeTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const result = await Task.complete(taskId, req.user.id, req.user.role);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    
    res.json({ message: result.message });
  } catch (error) {
    return handleError(error, 'task', req.user, 'Error completing task', req, res);
  }
};

/**
 * Delete a task
 * @route DELETE /api/tasks/:id
 * @access Private (creator or admin)
 */
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Get the existing task
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check permissions - any user with DELETE_ASSIGNMENT permission can delete
    // This includes instructors (staff) who have been granted this permission
    if (!req.user.permissions.includes(PERMISSIONS.DELETE_ASSIGNMENT)) {
      return res.status(403).json({ message: 'You do not have permission to delete this task' });
    }
    
    const deleted = await Task.delete(taskId);
    
    if (!deleted) {
      return res.status(400).json({ message: 'Failed to delete task' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return handleError(error, 'task', req.user, 'Error deleting task', req, res);
  }
};

/**
 * Get task statistics
 * @route GET /api/tasks/statistics
 * @access Private (requires VIEW_ASSIGNMENTS permission)
 */
exports.getTaskStatistics = async (req, res) => {
  try {
    // Check if user has permission to view tasks
    if (!req.user.permissions.includes(PERMISSIONS.VIEW_ASSIGNMENTS)) {
      return res.status(403).json({ message: 'You do not have permission to view task statistics' });
    }
    
    // Get optional course_id filter
    const courseId = req.query.course_id;
    
    // Build query with optional course filter
    let query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN due_date < NOW() AND status != 'completed' THEN 1 ELSE 0 END) as overdue,
        SUM(CASE WHEN task_type = 'grading' THEN 1 ELSE 0 END) as grading,
        SUM(CASE WHEN task_type = 'proctoring' THEN 1 ELSE 0 END) as proctoring,
        SUM(CASE WHEN task_type = 'office_hours' THEN 1 ELSE 0 END) as office_hours,
        SUM(CASE WHEN task_type = 'other' THEN 1 ELSE 0 END) as other
      FROM tasks
    `;
    
    const params = [];
    
    // Add course filter if provided
    if (courseId && courseId !== 'all') {
      query += ' WHERE course_id = ?';
      params.push(courseId);
    }
    
    // Execute the query
    const [statistics] = await db.query(query, params);
    
    if (!statistics || statistics.length === 0) {
      return res.status(404).json({ message: 'No task statistics found' });
    }
    
    // Log the action
    await loggingService.log({
      action: 'task_statistics_viewed',
      entity: 'task',
      user_id: req.user?.bilkentId,
      description: `User viewed task statistics`,
      metadata: { 
        user_role: req.user?.role,
        course_id: courseId || 'all'
      }
    }, req);
    
    res.json(statistics[0]);
  } catch (error) {
    return handleError(error, 'task', req.user, 'Error fetching task statistics', req, res);
  }
};