-- Script to clean all tables in the TA Management System database
-- This script will delete all data while preserving table structures

-- Temporarily disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Clean all tables
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE course_tas;
TRUNCATE TABLE courses;
TRUNCATE TABLE evaluations;
TRUNCATE TABLE leaves;
TRUNCATE TABLE notifications;
TRUNCATE TABLE offered_courses;
TRUNCATE TABLE registered_courses;
TRUNCATE TABLE swaps;
TRUNCATE TABLE tasks;
TRUNCATE TABLE users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Confirmation message
SELECT 'All tables have been cleaned successfully!' AS message;
