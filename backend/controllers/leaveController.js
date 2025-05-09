// backend/controllers/leaveController.js
const Leave = require('../models/Leave');

/**
 * Get all leave requests based on user role
 * @route GET /api/leaves
 */
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.findAll(req.user.id, req.user.role);
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Server error while fetching leave requests', error: error.message });
  }
};

/**
 * Get a specific leave request by ID
 * @route GET /api/leaves/:id
 */
exports.getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    // Check if user has permission to view this leave request
    if (req.user.role !== 'admin' && 
        req.user.role !== 'department_chair' && 
        req.user.role !== 'staff' &&
        req.user.id !== leave.user_id) {
      return res.status(403).json({ message: 'You do not have permission to view this leave request' });
    }
    
    res.json(leave);
  } catch (error) {
    console.error('Error fetching leave request:', error);
    res.status(500).json({ message: 'Server error while fetching leave request', error: error.message });
  }
};

/**
 * Get all leave requests for the current user
 * @route GET /api/leaves/my-leaves
 */
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.findByUserId(req.user.id);
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching user leave requests:', error);
    res.status(500).json({ message: 'Server error while fetching user leave requests', error: error.message });
  }
};

/**
 * Create a new leave request
 * @route POST /api/leaves
 */
exports.createLeave = async (req, res) => {
  try {
    const { leave_type, start_date, end_date, reason, supporting_document_url } = req.body;
    
    // Validate required fields
    if (!leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['leave_type', 'start_date', 'end_date', 'reason']
      });
    }
    
    // Validate leave type
    const validTypes = ['conference', 'medical', 'family_emergency', 'personal', 'other'];
    if (!validTypes.includes(leave_type)) {
      return res.status(400).json({ 
        message: 'Invalid leave type', 
        validTypes 
      });
    }
    
    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const today = new Date();
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    if (startDate > endDate) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }
    
    // Only admins can create backdated leave requests
    if (startDate < today && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Cannot request leave for past dates' });
    }
    
    // Check for conflicts with existing assignments
    const conflicts = await Leave.checkConflicts(req.user.id, start_date, end_date);
    
    // Create leave request
    const leaveResult = await Leave.create({
      user_id: req.user.id,
      leave_type,
      start_date,
      end_date,
      reason,
      supporting_document_url: supporting_document_url || null
    });
    
    // Get the created leave with details
    const createdLeave = await Leave.findById(leaveResult.id);
    
    // Return response with conflict warnings if any
    res.status(201).json({
      message: 'Leave request created successfully',
      leave: createdLeave,
      conflicts: conflicts.hasConflicts ? {
        message: 'Warning: You have assignments during the requested leave period',
        taskConflicts: conflicts.taskConflicts,
        examConflicts: conflicts.examConflicts
      } : null
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ message: 'Server error while creating leave request', error: error.message });
  }
};

/**
 * Update the status of a leave request (approve/reject)
 * @route PUT /api/leaves/:id/status
 */
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, reviewer_notes } = req.body;
    const leaveId = req.params.id;
    
    // Validate the status
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected"' });
    }
    
    // Check if user has permission to approve/reject leaves
    if (req.user.role !== 'admin' && req.user.role !== 'department_chair' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'You do not have permission to approve or reject leave requests' });
    }
    
    // Get the leave request
    const leave = await Leave.findById(leaveId);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    // Only allow changes to pending requests
    if (leave.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot update status of a leave request that has already been processed', 
        currentStatus: leave.status
      });
    }
    
    // Update the leave request status
    const updated = await Leave.update(leaveId, status, req.user.id, reviewer_notes);
    
    if (!updated) {
      return res.status(400).json({ message: 'Failed to update leave request status' });
    }
    
    // Get the updated leave with details
    const updatedLeave = await Leave.findById(leaveId);
    
    res.json({
      message: `Leave request ${status}`,
      leave: updatedLeave
    });
  } catch (error) {
    console.error('Error updating leave request status:', error);
    res.status(500).json({ message: 'Server error while updating leave request status', error: error.message });
  }
};

/**
 * Delete a leave request
 * @route DELETE /api/leaves/:id
 */
exports.deleteLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;
    
    // First check if the leave exists
    const leave = await Leave.findById(leaveId);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    // Check permissions - only the user who created it (if still pending) or an admin can delete
    if (req.user.role !== 'admin' && req.user.id !== leave.user_id) {
      return res.status(403).json({ message: 'You do not have permission to delete this leave request' });
    }
    
    if (req.user.role !== 'admin' && leave.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete leave requests that have already been reviewed' });
    }
    
    // Delete the leave request
    const deleted = await Leave.delete(leaveId, req.user.id, req.user.role);
    
    if (!deleted) {
      return res.status(400).json({ message: 'Failed to delete leave request' });
    }
    
    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    res.status(500).json({ message: 'Server error while deleting leave request', error: error.message });
  }
};

/**
 * Get leave statistics
 * @route GET /api/leaves/statistics
 */
exports.getLeaveStatistics = async (req, res) => {
  try {
    // For normal users, get only their stats; for admins/department chairs/staff, get all stats
    const userId = (req.user.role === 'admin' || req.user.role === 'department_chair' || req.user.role === 'staff') ? 
      null : req.user.id;
    
    const statistics = await Leave.getLeaveStatistics(userId);
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching leave statistics:', error);
    res.status(500).json({ message: 'Server error while fetching leave statistics', error: error.message });
  }
};