// backend/controllers/swapController.js
const Swap = require('../models/Swap');

/**
 * Get all swap requests based on user role
 * @route GET /api/swaps
 */
exports.getAllSwaps = async (req, res) => {
  try {
    const swaps = await Swap.findAll(req.user.id, req.user.role);
    res.json(swaps);
  } catch (error) {
    console.error('Error fetching swap requests:', error);
    res.status(500).json({ message: 'Server error while fetching swap requests', error: error.message });
  }
};

/**
 * Get a specific swap request by ID
 * @route GET /api/swaps/:id
 */
exports.getSwapById = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    
    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }
    
    // Check if user has permission to view this swap request
    if (req.user.role !== 'admin' && 
        req.user.role !== 'department_chair' && 
        req.user.role !== 'staff' &&
        req.user.id !== swap.requester_id && 
        req.user.id !== swap.target_id) {
      return res.status(403).json({ message: 'You do not have permission to view this swap request' });
    }
    
    res.json(swap);
  } catch (error) {
    console.error('Error fetching swap request:', error);
    res.status(500).json({ message: 'Server error while fetching swap request', error: error.message });
  }
};

/**
 * Get all swap requests involving the current user
 * @route GET /api/swaps/my-swaps
 */
exports.getMySwaps = async (req, res) => {
  try {
    const swaps = await Swap.findByUserId(req.user.id);
    res.json(swaps);
  } catch (error) {
    console.error('Error fetching user swap requests:', error);
    res.status(500).json({ message: 'Server error while fetching user swap requests', error: error.message });
  }
};

/**
 * Create a new swap request
 * @route POST /api/swaps
 */
exports.createSwap = async (req, res) => {
  try {
    const { 
      target_id, 
      assignment_type, 
      original_assignment_id, 
      proposed_assignment_id,
      reason 
    } = req.body;
    
    // Validate required fields
    if (!target_id || !assignment_type || !original_assignment_id || !reason) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['target_id', 'assignment_type', 'original_assignment_id', 'reason']
      });
    }
    
    // Validate type
    if (!['task', 'exam'].includes(assignment_type)) {
      return res.status(400).json({ message: 'Invalid assignment type. Must be "task" or "exam"' });
    }
    
    // Prevent self-swaps
    if (req.user.id === parseInt(target_id)) {
      return res.status(400).json({ message: 'Cannot create a swap request with yourself' });
    }
    
    // Create swap request
    try {
      const swapResult = await Swap.create({
        requester_id: req.user.id,
        target_id,
        assignment_type,
        original_assignment_id,
        proposed_assignment_id: proposed_assignment_id || null,
        reason
      });
      
      // Get the created swap with details
      const createdSwap = await Swap.findById(swapResult.id);
      
      res.status(201).json({
        message: 'Swap request created successfully',
        swap: createdSwap
      });
    } catch (error) {
      // Catch specific model errors and return appropriate response
      if (error.message.includes('not assigned') || 
          error.message.includes('not found')) {
        return res.status(400).json({ message: error.message });
      }
      throw error; // Re-throw other errors to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Error creating swap request:', error);
    res.status(500).json({ message: 'Server error while creating swap request', error: error.message });
  }
};

/**
 * Update the status of a swap request (approve/reject)
 * @route PUT /api/swaps/:id/status
 */
exports.updateSwapStatus = async (req, res) => {
  try {
    const { status, reviewer_notes } = req.body;
    const swapId = req.params.id;
    
    // Validate the status
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected"' });
    }
    
    // Get the swap request
    const swap = await Swap.findById(swapId);
    
    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }
    
    // Only allow changes to pending requests
    if (swap.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot update status of a swap request that has already been processed', 
        currentStatus: swap.status
      });
    }
    
    // Check permissions
    const isStaffOrAdmin = ['admin', 'department_chair', 'staff'].includes(req.user.role);
    const isTargetUser = req.user.id === swap.target_id;
    
    // Target user can respond to the request, or staff/admins can override
    if (!isStaffOrAdmin && !isTargetUser) {
      return res.status(403).json({ message: 'You do not have permission to update this swap request' });
    }
    
    try {
      // Update the swap request status
      const updateResult = await Swap.updateStatus(swapId, status, req.user.id, reviewer_notes);
      
      if (!updateResult.success) {
        return res.status(400).json({ message: 'Failed to update swap request status' });
      }
      
      // Get the updated swap with details
      const updatedSwap = await Swap.findById(swapId);
      
      res.json({
        message: `Swap request ${status}`,
        swap: updatedSwap
      });
    } catch (error) {
      // Catch specific model errors and return appropriate response
      if (error.message.includes('not found') || 
          error.message.includes('assignment not found')) {
        return res.status(400).json({ message: error.message });
      }
      throw error; // Re-throw other errors to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Error updating swap request status:', error);
    res.status(500).json({ message: 'Server error while updating swap request status', error: error.message });
  }
};

/**
 * Delete a swap request
 * @route DELETE /api/swaps/:id
 */
exports.deleteSwap = async (req, res) => {
  try {
    const swapId = req.params.id;
    
    // First check if the swap exists
    const swap = await Swap.findById(swapId);
    
    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }
    
    // Check permissions - only the user who created it (if still pending) or an admin can delete
    if (req.user.role !== 'admin' && req.user.id !== swap.requester_id) {
      return res.status(403).json({ message: 'You do not have permission to delete this swap request' });
    }
    
    if (req.user.role !== 'admin' && swap.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete swap requests that have already been reviewed' });
    }
    
    // Delete the swap request
    const deleted = await Swap.delete(swapId, req.user.id, req.user.role);
    
    if (!deleted) {
      return res.status(400).json({ message: 'Failed to delete swap request' });
    }
    
    res.json({ message: 'Swap request deleted successfully' });
  } catch (error) {
    console.error('Error deleting swap request:', error);
    res.status(500).json({ message: 'Server error while deleting swap request', error: error.message });
  }
};

/**
 * Get eligible target users for a swap
 * @route GET /api/swaps/eligible-targets/:assignmentId/:type
 */
exports.getEligibleTargets = async (req, res) => {
  try {
    const { assignmentId, type } = req.params;
    
    // Validate the type
    if (!['task', 'exam'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type. Must be "task" or "exam"' });
    }
    
    const eligibleTargets = await Swap.getEligibleTargets(req.user.id, assignmentId, type);
    
    res.json(eligibleTargets);
  } catch (error) {
    console.error('Error fetching eligible targets:', error);
    res.status(500).json({ message: 'Server error while fetching eligible targets', error: error.message });
  }
};

/**
 * Get swap statistics
 * @route GET /api/swaps/statistics
 */
exports.getSwapStatistics = async (req, res) => {
  try {
    // For normal users, get only their stats; for admins/department chairs/staff, get all stats
    const userId = (req.user.role === 'admin' || req.user.role === 'department_chair' || req.user.role === 'staff') ? 
      null : req.user.id;
    
    const statistics = await Swap.getSwapStatistics(userId);
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching swap statistics:', error);
    res.status(500).json({ message: 'Server error while fetching swap statistics', error: error.message });
  }
};