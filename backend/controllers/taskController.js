// backend/controllers/taskController.js
const Task = require('../models/Task');

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll(req.user.id, req.user.role);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
};

exports.getUpcomingTasks = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const tasks = await Task.findUpcoming(req.user.id, limit);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching upcoming tasks:', error);
    res.status(500).json({ message: 'Server error while fetching upcoming tasks' });
  }
};

exports.createTask = async (req, res) => {
  try {
    // Check if user has permission to create tasks
    if (!['admin', 'staff', 'department_chair'].includes(req.user.role)) {
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
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Get the existing task
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check permissions - only creator or admin can update
    if (task.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to update this task' });
    }
    
    const updated = await Task.update(taskId, req.body);
    
    if (!updated) {
      return res.status(400).json({ message: 'Failed to update task' });
    }
    
    const updatedTask = await Task.findById(taskId);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const result = await Task.complete(taskId, req.user.id, req.user.role);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    
    res.json({ message: result.message });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ message: 'Server error while completing task' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Get the existing task
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check permissions - only creator or admin can delete
    if (task.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this task' });
    }
    
    const deleted = await Task.delete(taskId);
    
    if (!deleted) {
      return res.status(400).json({ message: 'Failed to delete task' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
};
