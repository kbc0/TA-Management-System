// backend/config/roles.js
/**
 * Role definitions and permissions for the TA Management System
 * This file centralizes all role-based access control configuration
 */

// Define all possible roles in the system (with consistent naming)
const ROLES = {
    TEACHING_ASSISTANT: 'ta',
    INSTRUCTOR: 'staff',
    ADMIN: 'admin',
    DEPARTMENT_CHAIR: 'department_chair',
    DEAN: 'dean'
  };
  
  // Define all possible permissions in the system
  const PERMISSIONS = {
    // User management
    VIEW_USERS: 'view_users',
    CREATE_USER: 'create_user',
    UPDATE_USER: 'update_user',
    DELETE_USER: 'delete_user',
    
    // Course management
    VIEW_COURSES: 'view_courses',
    CREATE_COURSE: 'create_course',
    UPDATE_COURSE: 'update_course',
    DELETE_COURSE: 'delete_course',
    
    // TA Application management
    VIEW_APPLICATIONS: 'view_applications',
    CREATE_APPLICATION: 'create_application',
    UPDATE_APPLICATION: 'update_application',
    DELETE_APPLICATION: 'delete_application',
    APPROVE_APPLICATION: 'approve_application',
    REJECT_APPLICATION: 'reject_application',
    
    // Assignment management
    VIEW_ASSIGNMENTS: 'view_assignments',
    CREATE_ASSIGNMENT: 'create_assignment',
    UPDATE_ASSIGNMENT: 'update_assignment',
    DELETE_ASSIGNMENT: 'delete_assignment',
    
    // Evaluation management
    VIEW_EVALUATIONS: 'view_evaluations',
    CREATE_EVALUATION: 'create_evaluation',
    UPDATE_EVALUATION: 'update_evaluation',
    DELETE_EVALUATION: 'delete_evaluation',
    
    // Report management
    VIEW_REPORTS: 'view_reports',
    
    // System management
    VIEW_AUDIT_LOGS: 'view_audit_logs',
    MANAGE_SYSTEM_SETTINGS: 'manage_system_settings'
  };
  
  // Define role-based permissions
  const ROLE_PERMISSIONS = {
    // Teaching Assistant permissions
    [ROLES.TEACHING_ASSISTANT]: [
      PERMISSIONS.VIEW_USERS,  // Added to allow TAs to fetch other TAs for swap requests
      PERMISSIONS.VIEW_COURSES,
      PERMISSIONS.VIEW_APPLICATIONS,
      PERMISSIONS.CREATE_APPLICATION,
      PERMISSIONS.UPDATE_APPLICATION,
      PERMISSIONS.VIEW_ASSIGNMENTS,
      PERMISSIONS.VIEW_EVALUATIONS
    ],
    
    // Instructor permissions
    [ROLES.INSTRUCTOR]: [
      PERMISSIONS.VIEW_USERS,  // Added to allow instructors to view user profiles
      PERMISSIONS.VIEW_COURSES,
      PERMISSIONS.VIEW_APPLICATIONS,
      PERMISSIONS.APPROVE_APPLICATION,
      PERMISSIONS.REJECT_APPLICATION,
      PERMISSIONS.VIEW_ASSIGNMENTS,
      PERMISSIONS.CREATE_ASSIGNMENT,
      PERMISSIONS.UPDATE_ASSIGNMENT,
      PERMISSIONS.DELETE_ASSIGNMENT,
      PERMISSIONS.VIEW_EVALUATIONS,
      PERMISSIONS.CREATE_EVALUATION,
      PERMISSIONS.UPDATE_EVALUATION,
      PERMISSIONS.DELETE_EVALUATION,
      PERMISSIONS.VIEW_REPORTS  // Added to allow instructors to view reports
    ],
    
    // Admin permissions
    [ROLES.ADMIN]: [
      PERMISSIONS.VIEW_USERS,
      PERMISSIONS.CREATE_USER,
      PERMISSIONS.UPDATE_USER,
      PERMISSIONS.DELETE_USER,
      PERMISSIONS.VIEW_COURSES,
      PERMISSIONS.CREATE_COURSE,
      PERMISSIONS.UPDATE_COURSE,
      PERMISSIONS.DELETE_COURSE,
      PERMISSIONS.VIEW_APPLICATIONS,
      PERMISSIONS.CREATE_APPLICATION,
      PERMISSIONS.UPDATE_APPLICATION,
      PERMISSIONS.DELETE_APPLICATION,
      PERMISSIONS.APPROVE_APPLICATION,
      PERMISSIONS.REJECT_APPLICATION,
      PERMISSIONS.VIEW_ASSIGNMENTS,
      PERMISSIONS.CREATE_ASSIGNMENT,
      PERMISSIONS.UPDATE_ASSIGNMENT,
      PERMISSIONS.DELETE_ASSIGNMENT,
      PERMISSIONS.VIEW_EVALUATIONS,
      PERMISSIONS.CREATE_EVALUATION,
      PERMISSIONS.UPDATE_EVALUATION,
      PERMISSIONS.DELETE_EVALUATION,
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.MANAGE_SYSTEM_SETTINGS
    ],
    
    // Department Chair permissions
    [ROLES.DEPARTMENT_CHAIR]: [
      PERMISSIONS.VIEW_USERS,
      PERMISSIONS.VIEW_COURSES,
      PERMISSIONS.CREATE_COURSE,
      PERMISSIONS.UPDATE_COURSE,
      PERMISSIONS.VIEW_APPLICATIONS,
      PERMISSIONS.APPROVE_APPLICATION,
      PERMISSIONS.REJECT_APPLICATION,
      PERMISSIONS.VIEW_ASSIGNMENTS,
      PERMISSIONS.VIEW_EVALUATIONS,
      PERMISSIONS.VIEW_AUDIT_LOGS
    ],
    
    // Dean permissions (added for completeness)
    [ROLES.DEAN]: [
      PERMISSIONS.VIEW_USERS,
      PERMISSIONS.VIEW_COURSES,
      PERMISSIONS.VIEW_APPLICATIONS,
      PERMISSIONS.VIEW_ASSIGNMENTS,
      PERMISSIONS.VIEW_EVALUATIONS,
      PERMISSIONS.VIEW_AUDIT_LOGS
    ]
  };
  
  // Utility function to check if a role has a specific permission
  function hasPermission(role, permission) {
    if (!ROLE_PERMISSIONS[role]) {
      return false;
    }
    return ROLE_PERMISSIONS[role].includes(permission);
  }
  
  // Utility function to get all permissions for a role
  function getPermissionsForRole(role) {
    return ROLE_PERMISSIONS[role] || [];
  }
  
  // Utility function to check if a role exists
  function isValidRole(role) {
    return Object.values(ROLES).includes(role);
  }
  
  module.exports = {
    ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS,
    hasPermission,
    getPermissionsForRole,
    isValidRole
  };