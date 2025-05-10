// controllers/taskController.js
const Task = require('../models/Task');
const { PERMISSIONS } = require('../config/roles');
const { handleError } = require('../utils/errorHandler');

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
    
    // Check permissions - only creator or admin can delete
    const canDelete = req.user.permissions.includes(PERMISSIONS.DELETE_ASSIGNMENT) && 
                      (task.created_by === req.user.id || req.user.role === 'admin');
    
    if (!canDelete) {
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