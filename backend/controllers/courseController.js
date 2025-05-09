// backend/controllers/courseController.js
const Course = require('../models/Course');
const User = require('../models/User');
const loggingService = require('../services/LoggingService');

/**
 * Get all courses with optional filtering
 */
exports.getCourses = async (req, res) => {
  try {
    // Extract filter parameters from query
    const filters = {
      semester: req.query.semester,
      department: req.query.department,
      instructorId: req.query.instructor_id,
      isActive: req.query.is_active !== undefined ? 
        req.query.is_active === 'true' : undefined
    };
    
    // Extract pagination parameters
    const options = {
      limit: parseInt(req.query.limit) || 100,
      offset: parseInt(req.query.offset) || 0
    };
    
    const courses = await Course.findAll(filters, options);
    
    res.json({ courses });
    
    // Log the action
    await loggingService.log({
      action: 'courses_retrieved',
      entity: 'course',
      user_id: req.user?.bilkentId,
      description: `Retrieved ${courses.length} courses`,
      metadata: { 
        filters, 
        options,
        permission: 'VIEW_COURSES',
        user_role: req.user?.role
      }
    }, req);
  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({ message: 'Server error retrieving courses' });
  }
};

/**
 * Get a course by ID
 */
exports.getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Get TAs assigned to this course
    const tas = await Course.getTAs(courseId);
    
    res.json({ 
      course,
      tas
    });
    
    // Log the action
    await loggingService.log({
      action: 'course_details_retrieved',
      entity: 'course',
      entity_id: courseId,
      user_id: req.user?.bilkentId,
      description: `Retrieved details for course ${course.course_code}`,
      metadata: { 
        course_id: courseId,
        course_code: course.course_code,
        permission: 'VIEW_COURSES',
        user_role: req.user?.role
      }
    }, req);
  } catch (error) {
    console.error('Error getting course details:', error);
    res.status(500).json({ message: 'Server error retrieving course details' });
  }
};

/**
 * Create a new course
 */
exports.createCourse = async (req, res) => {
  try {
    const { 
      course_code, 
      course_name, 
      description, 
      semester, 
      credits, 
      department, 
      instructor_id, 
      is_active 
    } = req.body;
    
    // Validate required fields
    if (!course_code || !course_name || !semester) {
      return res.status(400).json({ 
        message: 'Course code, name, and semester are required' 
      });
    }
    
    // Check if course already exists
    const existingCourse = await Course.findByCourseCode(course_code);
    if (existingCourse) {
      return res.status(409).json({ 
        message: 'A course with this code already exists' 
      });
    }
    
    // Validate instructor ID if provided
    if (instructor_id) {
      const instructor = await User.findById(instructor_id);
      if (!instructor) {
        return res.status(400).json({ 
          message: 'Invalid instructor ID' 
        });
      }
    }
    
    // Create the course
    const newCourse = await Course.create({
      course_code,
      course_name,
      description,
      semester,
      credits,
      department,
      instructor_id,
      is_active
    });
    
    res.status(201).json({
      message: 'Course created successfully',
      course: newCourse
    });
    
    // Log the action
    await loggingService.log({
      action: 'course_created',
      entity: 'course',
      entity_id: newCourse.id,
      user_id: req.user?.bilkentId,
      description: `Created new course ${course_code}`,
      metadata: { 
        course_code,
        course_name,
        semester,
        created_by: req.user?.bilkentId,
        permission: 'CREATE_COURSE',
        user_role: req.user?.role
      }
    }, req);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error creating course' });
  }
};

/**
 * Update a course
 */
exports.updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Extract update data from request body
    const updateData = {};
    const allowedFields = [
      'course_code', 'course_name', 'description', 'semester', 
      'credits', 'department', 'instructor_id', 'is_active'
    ];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }
    
    // Validate instructor ID if provided
    if (updateData.instructor_id) {
      const instructor = await User.findById(updateData.instructor_id);
      if (!instructor) {
        return res.status(400).json({ 
          message: 'Invalid instructor ID' 
        });
      }
    }
    
    // If course code is being updated, check for duplicates
    if (updateData.course_code && updateData.course_code !== course.course_code) {
      const existingCourse = await Course.findByCourseCode(updateData.course_code);
      if (existingCourse) {
        return res.status(409).json({ 
          message: 'A course with this code already exists' 
        });
      }
    }
    
    // Update the course
    const updated = await Course.update(courseId, updateData);
    
    if (!updated) {
      return res.status(400).json({ message: 'No changes were made' });
    }
    
    // Get the updated course
    const updatedCourse = await Course.findById(courseId);
    
    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
    
    // Log the action
    await loggingService.log({
      action: 'course_updated',
      entity: 'course',
      entity_id: courseId,
      user_id: req.user?.bilkentId,
      description: `Updated course ${course.course_code}`,
      metadata: { 
        previous: {
          course_code: course.course_code,
          course_name: course.course_name,
          semester: course.semester
        },
        updated: updateData,
        updated_by: req.user?.bilkentId,
        permission: 'UPDATE_COURSE',
        user_role: req.user?.role
      }
    }, req);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server error updating course' });
  }
};

/**
 * Delete a course
 */
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Delete the course
    const deleted = await Course.delete(courseId);
    
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete course' });
    }
    
    res.json({
      message: 'Course deleted successfully'
    });
    
    // Log the action
    await loggingService.log({
      action: 'course_deleted',
      entity: 'course',
      entity_id: courseId,
      user_id: req.user?.bilkentId,
      description: `Deleted course ${course.course_code}`,
      metadata: { 
        course_code: course.course_code,
        course_name: course.course_name,
        semester: course.semester,
        deleted_by: req.user?.bilkentId,
        permission: 'DELETE_COURSE',
        user_role: req.user?.role
      }
    }, req);
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error deleting course' });
  }
};

/**
 * Assign a TA to a course
 */
exports.assignTA = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { 
      ta_id, 
      hours_per_week, 
      start_date, 
      end_date, 
      status 
    } = req.body;
    
    // Validate required fields
    if (!ta_id || !start_date || !end_date) {
      return res.status(400).json({ 
        message: 'TA ID, start date, and end date are required' 
      });
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if TA exists and has the TA role
    const ta = await User.findById(ta_id);
    if (!ta) {
      return res.status(404).json({ message: 'TA not found' });
    }
    
    if (ta.role !== 'ta') {
      return res.status(400).json({ 
        message: 'The selected user is not a TA' 
      });
    }
    
    // Assign the TA
    const assignment = await Course.assignTA({
      course_id: courseId,
      ta_id,
      hours_per_week,
      start_date,
      end_date,
      status
    });
    
    res.status(201).json({
      message: 'TA assigned successfully',
      assignment
    });
    
    // Log the action
    await loggingService.log({
      action: 'ta_assigned',
      entity: 'course_ta',
      entity_id: assignment.id,
      user_id: req.user?.bilkentId,
      description: `Assigned TA (ID: ${ta_id}) to course ${course.course_code}`,
      metadata: { 
        course_id: courseId,
        course_code: course.course_code,
        ta_id,
        ta_name: ta.full_name,
        hours_per_week,
        start_date,
        end_date,
        assigned_by: req.user?.bilkentId,
        permission: 'CREATE_ASSIGNMENT',
        user_role: req.user?.role
      }
    }, req);
  } catch (error) {
    console.error('Error assigning TA:', error);
    
    // Handle duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        message: 'This TA is already assigned to this course' 
      });
    }
    
    res.status(500).json({ message: 'Server error assigning TA' });
  }
};

/**
 * Update a TA assignment
 */
exports.updateTAAssignment = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const assignmentId = req.params.assignmentId;
    
    // Extract update data from request body
    const updateData = {};
    const allowedFields = [
      'hours_per_week', 'start_date', 'end_date', 'status'
    ];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No update data provided' });
    }
    
    // Update the assignment
    const updated = await Course.updateTAAssignment(assignmentId, updateData);
    
    if (!updated) {
      return res.status(404).json({ 
        message: 'TA assignment not found or no changes were made' 
      });
    }
    
    res.json({
      message: 'TA assignment updated successfully'
    });
    
    // Log the action
    await loggingService.log({
      action: 'ta_assignment_updated',
      entity: 'course_ta',
      entity_id: assignmentId,
      user_id: req.user?.bilkentId,
      description: `Updated TA assignment for course ID ${courseId}`,
      metadata: { 
        course_id: courseId,
        assignment_id: assignmentId,
        updates: updateData,
        updated_by: req.user?.bilkentId,
        permission: 'UPDATE_ASSIGNMENT',
        user_role: req.user?.role
      }
    }, req);
  } catch (error) {
    console.error('Error updating TA assignment:', error);
    res.status(500).json({ message: 'Server error updating TA assignment' });
  }
};

/**
 * Remove a TA from a course
 */
exports.removeTA = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const taId = req.params.taId;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Remove the TA
    const removed = await Course.removeTA(courseId, taId);
    
    if (!removed) {
      return res.status(404).json({ 
        message: 'TA is not assigned to this course' 
      });
    }
    
    res.json({
      message: 'TA removed from course successfully'
    });
    
    // Log the action
    await loggingService.log({
      action: 'ta_removed',
      entity: 'course',
      entity_id: courseId,
      user_id: req.user?.bilkentId,
      description: `Removed TA (ID: ${taId}) from course ${course.course_code}`,
      metadata: { 
        course_id: courseId,
        course_code: course.course_code,
        ta_id: taId,
        removed_by: req.user?.bilkentId,
        permission: 'DELETE_ASSIGNMENT',
        user_role: req.user?.role
      }
    }, req);
  } catch (error) {
    console.error('Error removing TA:', error);
    res.status(500).json({ message: 'Server error removing TA' });
  }
};

/**
 * Get all TAs for a course
 */
exports.getCourseTAs = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Get TAs
    const tas = await Course.getTAs(courseId);
    
    res.json({ tas });
    
    // Log the action
    await loggingService.log({
      action: 'course_tas_retrieved',
      entity: 'course',
      entity_id: courseId,
      user_id: req.user?.bilkentId,
      description: `Retrieved ${tas.length} TAs for course ${course.course_code}`,
      metadata: { 
        course_id: courseId,
        course_code: course.course_code,
        ta_count: tas.length,
        permission: 'VIEW_ASSIGNMENTS',
        user_role: req.user?.role
      }
    }, req);
  } catch (error) {
    console.error('Error getting course TAs:', error);
    res.status(500).json({ message: 'Server error retrieving course TAs' });
  }
};

/**
 * Get all courses for a TA
 */
exports.getTACourses = async (req, res) => {
  try {
    const taId = req.params.id;
    
    // Check if TA exists
    const ta = await User.findById(taId);
    if (!ta) {
      return res.status(404).json({ message: 'TA not found' });
    }
    
    // Get courses
    const courses = await Course.getCoursesForTA(taId);
    
    res.json({ courses });
    
    // Log the action
    await loggingService.log({
      action: 'ta_courses_retrieved',
      entity: 'user',
      entity_id: taId,
      user_id: req.user?.bilkentId,
      description: `Retrieved ${courses.length} courses for TA ${ta.full_name}`,
      metadata: { 
        ta_id: taId,
        ta_name: ta.full_name,
        course_count: courses.length,
        permission: 'VIEW_COURSES',
        user_role: req.user?.role
      }
    }, req);
  } catch (error) {
    console.error('Error getting TA courses:', error);
    res.status(500).json({ message: 'Server error retrieving TA courses' });
  }
};
