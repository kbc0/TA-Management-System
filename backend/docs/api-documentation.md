# TA Management System API Documentation

This documentation outlines the API endpoints for the TA Management System. All dates should be formatted as ISO strings (YYYY-MM-DD) or full ISO datetime strings (YYYY-MM-DDThh:mm:ssZ) unless specified otherwise.

## Permissions System

The system uses a permission-based authorization model. Endpoints require specific permissions that are associated with user roles. The main permissions include:

- **VIEW_USERS**: View user details
- **CREATE_USER**: Create new users
- **UPDATE_USER**: Update user information
- **DELETE_USER**: Deactivate users
- **VIEW_COURSES**: View course details
- **CREATE_COURSE**: Create new courses
- **UPDATE_COURSE**: Update course information
- **DELETE_COURSE**: Delete courses
- **VIEW_APPLICATIONS**: View TA applications
- **CREATE_APPLICATION**: Create applications
- **UPDATE_APPLICATION**: Update applications
- **APPROVE_APPLICATION**: Approve/reject applications
- **VIEW_ASSIGNMENTS**: View task/exam assignments
- **CREATE_ASSIGNMENT**: Create assignments
- **UPDATE_ASSIGNMENT**: Update assignments
- **DELETE_ASSIGNMENT**: Delete assignments
- **VIEW_EVALUATIONS**: View evaluations
- **CREATE_EVALUATION**: Create evaluations
- **UPDATE_EVALUATION**: Update evaluations
- **VIEW_AUDIT_LOGS**: View system audit logs
- **MANAGE_SYSTEM_SETTINGS**: Change system settings

## Authentication Endpoints

### Sign Up
Register a new user in the system.

**URL**: `/api/auth/signup`  
**Method**: `POST`  
**Auth Required**: No

**Request Body**:
```json
{
  "bilkentId": "12345678",
  "email": "student@bilkent.edu.tr",
  "fullName": "John Doe",
  "password": "securepassword",
  "role": "ta"  // Optional, defaults to "ta"
}
```

**Notes**:
- Both camelCase (`bilkentId`, `fullName`) and snake_case (`bilkent_id`, `full_name`) parameter formats are accepted
- `email` must end with `@bilkent.edu.tr`
- `password` must be at least 6 characters
- `role` must be one of: ["ta", "staff", "department_chair", "dean", "admin"]

**Success Response**:
- **Code**: 201 Created
- **Content**:
```json
{
  "message": "User registered successfully",
  "token": "jwt-token",
  "user": {
    "id": 1,
    "bilkentId": "12345678",
    "email": "student@bilkent.edu.tr",
    "fullName": "John Doe",
    "role": "ta",
    "permissions": ["view_courses", "view_applications", "create_application", "update_application", "view_assignments", "view_evaluations"]
  }
}
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Condition**: Validation failed
- **Content**:
```json
{
  "message": "Validation failed",
  "details": {
    "missingFields": ["bilkentId"],
    "errors": {
      "email": "Must use a Bilkent email address ending with @bilkent.edu.tr",
      "password": "Password must be at least 6 characters long"
    }
  }
}
```

- **Code**: 409 Conflict
- **Condition**: User already exists
- **Content**:
```json
{
  "message": "User with this Bilkent ID already exists"
}
```

- **Code**: 409 Conflict
- **Condition**: Email already in use
- **Content**:
```json
{
  "message": "Email is already in use"
}
```

### Login
Authenticate a user and get a token.

**URL**: `/api/auth/login`  
**Method**: `POST`  
**Auth Required**: No

**Request Body**:
```json
{
  "bilkentId": "12345678",
  "password": "securepassword"
}
```

**Notes**:
- Both camelCase (`bilkentId`) and snake_case (`bilkent_id`) parameter formats are accepted

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "bilkentId": "12345678",
    "email": "student@bilkent.edu.tr",
    "fullName": "John Doe",
    "role": "ta",
    "permissions": ["view_courses", "view_applications", "create_application", "update_application", "view_assignments", "view_evaluations"]
  }
}
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Condition**: Validation failed
- **Content**:
```json
{
  "message": "Validation failed",
  "details": {
    "missingFields": ["bilkentId", "password"]
  }
}
```

- **Code**: 401 Unauthorized
- **Condition**: Invalid credentials
- **Content**:
```json
{
  "message": "Invalid credentials"
}
```

### Recover Password
Request a password reset link.

**URL**: `/api/auth/recover-password`  
**Method**: `POST`  
**Auth Required**: No

**Request Body**:
```json
{
  "bilkentId": "12345678"
}
```

**Notes**:
- Both camelCase (`bilkentId`) and snake_case (`bilkent_id`) parameter formats are accepted

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "If your ID exists, a password reset link has been sent to your email"
}
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Condition**: Validation failed
- **Content**:
```json
{
  "message": "Validation failed",
  "details": {
    "missingFields": ["bilkentId"]
  }
}
```

### Reset Password
Reset a user's password using a token.

**URL**: `/api/auth/reset-password`  
**Method**: `POST`  
**Auth Required**: No

**Request Body**:
```json
{
  "token": "reset-token",
  "bilkentId": "12345678",
  "newPassword": "newSecurePassword"
}
```

**Notes**:
- Both camelCase (`bilkentId`, `newPassword`) and snake_case (`bilkent_id`, `new_password`) parameter formats are accepted
- `newPassword` must be at least 6 characters long

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Password has been reset successfully"
}
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Condition**: Invalid token or validation failed
- **Content**:
```json
{
  "message": "Invalid or expired token"
}
```

or

```json
{
  "message": "Validation failed",
  "details": {
    "missingFields": ["token", "bilkentId", "newPassword"],
    "errors": {
      "newPassword": "New password must be at least 6 characters long"
    }
  }
}
```

### Logout
Logout a user (client-side implementation).

**URL**: `/api/auth/logout`  
**Method**: `POST`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Logged out successfully"
}
```

## Task Management Endpoints

### Get All Tasks
Get all tasks based on user role.

**URL**: `/api/tasks`  
**Method**: `GET`  
**Auth Required**: Yes
**Required Permission**: `VIEW_ASSIGNMENTS`

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Notes**:
- For TAs: Returns only tasks assigned to them
- For staff/department chairs: Returns all tasks created by them
- For admins: Returns all tasks in the system

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of task objects
```json
[
  {
    "id": 1,
    "title": "Lab Grading",
    "description": "Grade Week 5 lab submissions",
    "task_type": "grading",
    "course_id": "CS101",
    "due_date": "2025-05-15",
    "duration": 120,
    "status": "active",
    "created_by": 3,
    "assigned_to_name": "John Doe",
    "creator_name": "Dr. Smith"
  }
]
```

### Get Task by ID
Get details of a specific task.

**URL**: `/api/tasks/:id`  
**Method**: `GET`  
**Auth Required**: Yes
**Required Permission**: `VIEW_ASSIGNMENTS`

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Success Response**:
- **Code**: 200 OK
- **Content**: Task object with details

**Error Response**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Task not found"
}
```

### Get Upcoming Tasks
Get upcoming tasks for the current user.

**URL**: `/api/tasks/upcoming`  
**Method**: `GET`  
**Auth Required**: Yes
**Required Permission**: `VIEW_ASSIGNMENTS`

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Query Parameters**:
- `limit` (optional): Number of tasks to return (default: 5)

**⚠️ IMPLEMENTATION NOTE**: This endpoint is implemented in the controller (`taskController.getUpcomingTasks`), but is **NOT currently registered as a route** in the API. The route would need to be added to `taskRoutes.js` before it becomes accessible.

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of task objects (limited to active tasks with due_date >= current date)
```json
[
  {
    "id": 1,
    "title": "Lab Grading",
    "description": "Grade lab submissions for Week 5",
    "task_type": "grading",
    "course_id": "CS101",
    "due_date": "2025-05-15",
    "duration": 120,
    "status": "active",
    "assigned_to_name": "John Doe"
  }
]
```

### Get Tasks for a Course
Get tasks for a specific course.

**URL**: `/api/tasks/course/:courseId`  
**Method**: `GET`  
**Auth Required**: Yes
**Required Permission**: `VIEW_ASSIGNMENTS`

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**⚠️ IMPLEMENTATION NOTE**: This endpoint is implemented in the controller (`taskController.getTasksByCourse`), but is **NOT currently registered as a route** in the API. The route would need to be added to `taskRoutes.js` before it becomes accessible.

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of task objects associated with the specified course
```json
[
  {
    "id": 1,
    "title": "Lab Grading",
    "description": "Grade lab submissions for Week 5",
    "task_type": "grading",
    "course_id": "CS101",
    "due_date": "2025-05-15",
    "duration": 120,
    "status": "active",
    "assigned_to_name": "John Doe"
  }
]
```

### Create Task
Create a new task.

**URL**: `/api/tasks`  
**Method**: `POST`  
**Auth Required**: Yes (staff, department_chair, admin roles only)
**Required Permission**: `CREATE_ASSIGNMENT`

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request Body**:
```json
{
  "title": "Lab Grading",
  "description": "Grade lab submissions for Week 5",
  "task_type": "grading",
  "course_id": "CS101",
  "due_date": "2025-05-15",
  "duration": 120,
  "assignees": [1, 2, 3]  // Array of user IDs
}
```

**Notes**:
- `title`, `task_type`, `due_date`, and `duration` are required fields

**Success Response**:
- **Code**: 201 Created
- **Content**: Created task object

**Error Responses**:
- **Code**: 403 Forbidden
- **Content**:
```json
{
  "message": "You do not have permission to create tasks"
}
```

- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "Missing required fields"
}
```

### Update Task
Update an existing task.

**URL**: `/api/tasks/:id`  
**Method**: `PUT`  
**Auth Required**: Yes
**Required Permission**: `UPDATE_ASSIGNMENT`

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request Body**:
```json
{
  "title": "Updated Lab Grading",
  "description": "Updated description",
  "task_type": "grading",
  "course_id": "CS101",
  "due_date": "2025-05-16",
  "duration": 150,
  "status": "active",
  "assignees": [1, 4]
}
```

**Notes**:
- Only the task creator or an admin can update the task

**Success Response**:
- **Code**: 200 OK
- **Content**: Updated task object

**Error Responses**:
- **Code**: 403 Forbidden
- **Content**:
```json
{
  "message": "You do not have permission to update this task"
}
```

- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Task not found"
}
```

### Complete Task
Mark a task as completed.

**URL**: `/api/tasks/:id/complete`  
**Method**: `PUT`  
**Auth Required**: Yes
**Required Permission**: `UPDATE_ASSIGNMENT`

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**⚠️ IMPLEMENTATION NOTE**: This endpoint is implemented in the controller (`taskController.completeTask`), but is **NOT currently registered as a route** in the API. The route would need to be added to `taskRoutes.js` before it becomes accessible.

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Task marked as completed",
  "success": true
}
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "You are not assigned to this task",
  "success": false
}
```

- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Task not found",
  "success": false
}
```

### Delete Task
Delete a task.

**URL**: `/api/tasks/:id`  
**Method**: `DELETE`  
**Auth Required**: Yes
**Required Permission**: `DELETE_ASSIGNMENT`

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Notes**:
- Only the task creator or an admin can delete the task

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses**:
- **Code**: 403 Forbidden
- **Content**:
```json
{
  "message": "You do not have permission to delete this task"
}
```

- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Task not found"
}
```

## Leave Management Endpoints

### Get All Leaves
Get all leave requests based on user role.

**URL**: `/api/leaves`  
**Method**: `GET`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Notes**:
- For TAs: Returns only their own leave requests
- For department chairs, admins, and staff: Returns all leave requests

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of leave request objects
```json
[
  {
    "id": 1,
    "user_id": 12,
    "leave_type": "conference",
    "start_date": "2025-05-10",
    "end_date": "2025-05-15",
    "duration": 6,
    "reason": "Attending ACM Conference",
    "status": "pending",
    "supporting_document_url": "https://example.com/document.pdf",
    "created_at": "2025-05-01T12:00:00Z",
    "requester_name": "John Doe",
    "requester_bilkent_id": "12345678"
  }
]
```

### Get Leave by ID
Get details of a specific leave request.

**URL**: `/api/leaves/:id`  
**Method**: `GET`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Notes**:
- Users can only view their own leave requests unless they are admin, department_chair, or staff

**Success Response**:
- **Code**: 200 OK
- **Content**: Leave request object with requester and reviewer details
```json
{
  "id": 1,
  "user_id": 12,
  "leave_type": "conference",
  "start_date": "2025-05-10",
  "end_date": "2025-05-15",
  "duration": 6,
  "reason": "Attending ACM Conference",
  "status": "approved",
  "supporting_document_url": "https://example.com/document.pdf",
  "created_at": "2025-05-01T12:00:00Z",
  "reviewed_at": "2025-05-02T10:30:00Z",
  "requester_name": "John Doe",
  "requester_bilkent_id": "12345678",
  "requester_email": "john@bilkent.edu.tr",
  "user_status": "active",
  "reviewer_name": "Dr. Smith",
  "reviewer_bilkent_id": "98765432"
}
```

**Error Responses**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Leave request not found"
}
```

- **Code**: 403 Forbidden
- **Content**:
```json
{
  "message": "You do not have permission to view this leave request"
}
```

### Get My Leaves
Get all leave requests for the current user.

**URL**: `/api/leaves/my-leaves`  
**Method**: `GET`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of user's leave request objects including reviewer details
```json
[
  {
    "id": 1,
    "user_id": 12,
    "leave_type": "conference",
    "start_date": "2025-05-10",
    "end_date": "2025-05-15",
    "duration": 6,
    "reason": "Attending ACM Conference",
    "status": "approved",
    "supporting_document_url": "https://example.com/document.pdf",
    "created_at": "2025-05-01T12:00:00Z",
    "reviewed_at": "2025-05-02T10:30:00Z",
    "reviewer_name": "Dr. Smith"
  }
]
```

### Create Leave Request
Create a new leave request.

**URL**: `/api/leaves`  
**Method**: `POST`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request Body**:
```json
{
  "leave_type": "conference",
  "start_date": "2025-05-10",
  "end_date": "2025-05-15",
  "reason": "Attending ACM Conference",
  "supporting_document_url": "https://example.com/document.pdf"
}
```

**Notes**:
- `leave_type` must be one of: ["conference", "medical", "family_emergency", "personal", "other"]
- `start_date`, `end_date`, and `reason` are required fields
- `start_date` must be before `end_date`
- Only admins can create backdated leave requests (start_date < today)
- System checks for conflicts with existing assignments during the leave period

**Success Response**:
- **Code**: 201 Created
- **Content**:
```json
{
  "message": "Leave request created successfully",
  "leave": {
    "id": 1,
    "user_id": 12,
    "leave_type": "conference",
    "start_date": "2025-05-10",
    "end_date": "2025-05-15",
    "duration": 6,
    "reason": "Attending ACM Conference",
    "status": "pending",
    "created_at": "2025-05-01T12:00:00Z"
  },
  "conflicts": {
    "message": "Warning: You have assignments during the requested leave period",
    "taskConflicts": [
      {
        "id": 5,
        "title": "Grade Midterm Exams",
        "due_date": "2025-05-12",
        "task_type": "grading",
        "course_id": "CS101"
      }
    ],
    "examConflicts": [
      {
        "id": 3,
        "title": "CS102 Final Exam",
        "due_date": "2025-05-14",
        "course_id": "CS102"
      }
    ]
  }
}
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Conditions**: Validation failed, invalid date format, start date after end date, or backdated request (for non-admins)
- **Content**:
```json
{
  "message": "Missing required fields",
  "required": ["leave_type", "start_date", "end_date", "reason"]
}
```

or

```json
{
  "message": "Invalid leave type",
  "validTypes": ["conference", "medical", "family_emergency", "personal", "other"]
}
```

or

```json
{
  "message": "Invalid date format"
}
```

or

```json
{
  "message": "Start date must be before end date"
}
```

or

```json
{
  "message": "Cannot request leave for past dates"
}
```

### Update Leave Status
Update the status of a leave request (approve/reject).

**URL**: `/api/leaves/:id/status`  
**Method**: `PUT`  
**Auth Required**: Yes (department_chair, admin, staff roles only)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request Body**:
```json
{
  "status": "approved",
  "reviewer_notes": "Approved as requested"
}
```

**Notes**:
- `status` must be either "approved" or "rejected"
- `reviewer_notes` is optional and provides context for the decision
- Only pending leave requests can be updated

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Leave request approved",
  "leave": {
    "id": 1,
    "user_id": 12,
    "leave_type": "conference",
    "start_date": "2025-05-10",
    "end_date": "2025-05-15",
    "duration": 6,
    "reason": "Attending ACM Conference",
    "status": "approved",
    "reviewer_id": 3,
    "reviewer_notes": "Approved as requested",
    "created_at": "2025-05-01T12:00:00Z",
    "reviewed_at": "2025-05-02T10:30:00Z",
    "requester_name": "John Doe",
    "reviewer_name": "Dr. Smith"
  }
}
```

**Error Responses**:
- **Code**: 403 Forbidden
- **Content**:
```json
{
  "message": "You do not have permission to approve or reject leave requests"
}
```

- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "Invalid status. Must be \"approved\" or \"rejected\""
}
```

or

```json
{
  "message": "Cannot update status of a leave request that has already been processed",
  "currentStatus": "approved"
}
```

- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Leave request not found"
}
```

### Delete Leave Request
Delete a leave request (only pending requests or admin).

**URL**: `/api/leaves/:id`  
**Method**: `DELETE`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Notes**:
- Only the leave requester (for pending requests) or an admin can delete leave requests
- Non-admin users cannot delete leave requests that have already been reviewed

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Leave request deleted successfully"
}
```

**Error Responses**:
- **Code**: 403 Forbidden
- **Content**:
```json
{
  "message": "You do not have permission to delete this leave request"
}
```

- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "Cannot delete leave requests that have already been reviewed"
}
```

- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Leave request not found"
}
```

### Get Leave Statistics
Get statistics about leave requests.

**URL**: `/api/leaves/statistics`  
**Method**: `GET`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Notes**:
- For regular users: Returns only their own statistics
- For admins, department chairs, and staff: Returns system-wide statistics

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "total_requests": 15,
  "approved": 10,
  "rejected": 2,
  "pending": 3,
  "total_days_taken": 45
}
```

## Swap Request Endpoints

### Get All Swaps
Get all swap requests based on user role.

**URL**: `/api/swaps`  
**Method**: `GET`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Notes**:
- For TAs: Returns swaps they're involved in (either as requester or target)
- For staff, department chairs, and admins: Returns all swap requests

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of swap request objects
```json
[
  {
    "id": 1,
    "requester_id": 12,
    "target_id": 15,
    "assignment_type": "task",
    "original_assignment_id": 5,
    "proposed_assignment_id": 8,
    "reason": "Schedule conflict with research meeting",
    "status": "pending",
    "created_at": "2025-05-01T12:00:00Z",
    "requester_name": "John Doe",
    "target_name": "Jane Smith",
    "assignment_title": "Lab Grading - Week 5",
    "assignment_subtype": "grading"
  }
]
```

### Get Swap by ID
Get details of a specific swap request.

**URL**: `/api/swaps/:id`  
**Method**: `GET`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Notes**:
- Users can only view swap requests they're involved in, unless they are admin, department_chair, or staff

**Success Response**:
- **Code**: 200 OK
- **Content**: Swap request object with requester, target, and assignment details
```json
{
  "id": 1,
  "requester_id": 12,
  "target_id": 15,
  "assignment_type": "task",
  "original_assignment_id": 5,
  "proposed_assignment_id": 8,
  "reason": "Schedule conflict with research meeting",
  "status": "pending",
  "created_at": "2025-05-01T12:00:00Z",
  "requester_name": "John Doe",
  "requester_bilkent_id": "12345678",
  "requester_email": "john@bilkent.edu.tr",
  "target_name": "Jane Smith",
  "target_bilkent_id": "20156789",
  "target_email": "jane@bilkent.edu.tr",
  "assignment_title": "Lab Grading - Week 5",
  "assignment_subtype": "grading",
  "course_id": "CS101",
  "reviewer_name": null
}
```

**Error Responses**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Swap request not found"
}
```

- **Code**: 403 Forbidden
- **Content**:
```json
{
  "message": "You do not have permission to view this swap request"
}
```

### Get My Swaps
Get all swap requests involving the current user.

**URL**: `/api/swaps/my-swaps`  
**Method**: `GET`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of swap request objects where the user is either the requester or target
```json
[
  {
    "id": 1,
    "requester_id": 12,
    "target_id": 15,
    "assignment_type": "task",
    "original_assignment_id": 5,
    "proposed_assignment_id": 8,
    "reason": "Schedule conflict with research meeting",
    "status": "pending",
    "created_at": "2025-05-01T12:00:00Z",
    "requester_name": "John Doe",
    "target_name": "Jane Smith",
    "assignment_title": "Lab Grading - Week 5",
    "assignment_subtype": "grading"
  }
]
```

### Create Swap Request
Create a new swap request.

**URL**: `/api/swaps`  
**Method**: `POST`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request Body**:
```json
{
  "target_id": 15,
  "assignment_type": "task",
  "original_assignment_id": 5,
  "proposed_assignment_id": 8,
  "reason": "Schedule conflict with research meeting"
}
```

**Notes**:
- `assignment_type` must be either "task" or "exam"
- `target_id`, `assignment_type`, `original_assignment_id`, and `reason` are required fields
- Users cannot create swap requests with themselves
- For tasks: Requester must be assigned to the original task
- For exams: Requester must be assigned to proctor the original exam
- If `proposed_assignment_id` is provided (two-way swap), target must be assigned to that task/exam

**Success Response**:
- **Code**: 201 Created
- **Content**:
```json
{
  "message": "Swap request created successfully",
  "swap": {
    "id": 1,
    "requester_id": 12,
    "target_id": 15,
    "assignment_type": "task",
    "original_assignment_id": 5,
    "proposed_assignment_id": 8,
    "reason": "Schedule conflict with research meeting",
    "status": "pending",
    "created_at": "2025-05-01T12:00:00Z",
    "requester_name": "John Doe",
    "target_name": "Jane Smith",
    "assignment_title": "Lab Grading - Week 5"
  }
}
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Conditions**: Missing fields, validation errors, or assignment issues
- **Content**:
```json
{
  "message": "Missing required fields",
  "required": ["target_id", "assignment_type", "original_assignment_id", "reason"]
}
```

or

```json
{
  "message": "Invalid assignment type. Must be \"task\" or \"exam\""
}
```

or

```json
{
  "message": "Cannot create a swap request with yourself"
}
```

or

```json
{
  "message": "Requester is not assigned to the original task"
}
```

or

```json
{
  "message": "Target is not assigned to the proposed task"
}
```

### Update Swap Status
Update the status of a swap request (approve/reject).

**URL**: `/api/swaps/:id/status`  
**Method**: `PUT`  
**Auth Required**: Yes (target user or staff/admin/department_chair)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request Body**:
```json
{
  "status": "approved",
  "reviewer_notes": "Swap approved"
}
```

**Notes**:
- `status` must be either "approved" or "rejected"
- `reviewer_notes` is optional and provides context for the decision
- Only pending swap requests can be updated
- Target user can respond to the request, or staff/admins can override

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Swap request approved",
  "swap": {
    "id": 1,
    "requester_id": 12,
    "target_id": 15,
    "assignment_type": "task",
    "original_assignment_id": 5,
    "proposed_assignment_id": 8,
    "reason": "Schedule conflict with research meeting",
    "status": "approved",
    "reviewer_id": 15,
    "reviewer_notes": "Swap approved",
    "created_at": "2025-05-01T12:00:00Z",
    "reviewed_at": "2025-05-02T10:30:00Z",
    "requester_name": "John Doe",
    "target_name": "Jane Smith",
    "assignment_title": "Lab Grading - Week 5"
  }
}
```

**Error Responses**:
- **Code**: 403 Forbidden
- **Content**:
```json
{
  "message": "You do not have permission to update this swap request"
}
```

- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "Invalid status. Must be \"approved\" or \"rejected\""
}
```

or

```json
{
  "message": "Cannot update status of a swap request that has already been processed",
  "currentStatus": "approved"
}
```

- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Swap request not found"
}
```

### Delete Swap Request
Delete a swap request (only pending requests or admin).

**URL**: `/api/swaps/:id`  
**Method**: `DELETE`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Notes**:
- Only the swap requester (for pending requests) or an admin can delete swap requests
- Non-admin users cannot delete swap requests that have already been reviewed

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Swap request deleted successfully"
}
```

**Error Responses**:
- **Code**: 403 Forbidden
- **Content**:
```json
{
  "message": "You do not have permission to delete this swap request"
}
```

- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "Cannot delete swap requests that have already been reviewed"
}
```

- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Swap request not found"
}
```

### Get Eligible Targets
Get a list of eligible targets (TAs) for a swap.

**URL**: `/api/swaps/eligible-targets/:assignmentId/:type`  
**Method**: `GET`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**URL Parameters**:
- `assignmentId`: ID of the task or exam to swap
- `type`: Type of assignment ("task" or "exam")

**Notes**:
- Returns active TAs who are not on leave during the assignment date

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of eligible TA objects
```json
[
  {
    "id": 15,
    "full_name": "Jane Smith",
    "bilkent_id": "20156789",
    "email": "jane@bilkent.edu.tr"
  },
  {
    "id": 16,
    "full_name": "Bob Johnson",
    "bilkent_id": "20187654",
    "email": "bob@bilkent.edu.tr"
  }
]
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "Invalid type. Must be \"task\" or \"exam\""
}
```

- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "Task not found"
}
```

or

```json
{
  "message": "Exam not found"
}
```

### Get Swap Statistics
Get statistics about swap requests.

**URL**: `/api/swaps/statistics`  
**Method**: `GET`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Notes**:
- For regular users: Returns only statistics for swaps they're involved in
- For admins, department chairs, and staff: Returns system-wide statistics

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "total_swaps": 25,
  "approved": 18,
  "rejected": 3,
  "pending": 4,
  "task_swaps": 20,
  "exam_swaps": 5
}
```

## Course Management Endpoints

### Get All Courses
Get all courses with optional filtering.

**URL**: `/api/courses`  
**Method**: `GET`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Query Parameters**:
- `semester` (optional): Filter by semester
- `department` (optional): Filter by department
- `instructor_id` (optional): Filter by instructor ID
- `is_active` (optional): Filter by active status (true/false)
- `limit` (optional): Maximum number of courses to return (default: 100)
- `offset` (optional): Number of courses to skip (default: 0)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "courses": [
    {
      "id": 1,
      "course_code": "CS101",
      "course_name": "Introduction to Programming",
      "description": "Basic programming concepts",
      "semester": "Spring 2025",
      "credits": 3,
      "department": "Computer Science",
      "instructor_id": 5,
      "instructor_name": "Dr. Smith",
      "is_active": true
    }
  ]
}
```

### Get Course by ID
Get a specific course by ID.

**URL**: `/api/courses/:id`  
**Method**: `GET`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "course": {
    "id": 1,
    "course_code": "CS101",
    "course_name": "Introduction to Programming",
    "description": "Basic programming concepts",
    "semester": "Spring 2025",
    "credits": 3,
    "department": "Computer Science",
    "instructor_id": 5,
    "instructor_name": "Dr. Smith",
    "is_active": true
  },
  "tas": [
    {
      "id": 8,
      "ta_id": 12,
      "course_id": 1,
      "hours_per_week": 10,
      "start_date": "2025-01-15",
      "end_date": "2025-05-25",
      "status": "active",
      "full_name": "John Doe",
      "email": "john@bilkent.edu.tr",
      "bilkent_id": "12345678"
    }
  ]
}
```

**Error Response**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Course not found"
}
```

### Create Course
Create a new course.

**URL**: `/api/courses`  
**Method**: `POST`  
**Auth Required**: Yes (admin, department_chair roles)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request Body**:
```json
{
  "course_code": "CS101",
  "course_name": "Introduction to Programming",
  "description": "Basic programming concepts",
  "semester": "Spring 2025",
  "credits": 3,
  "department": "Computer Science",
  "instructor_id": 5,
  "is_active": true
}
```

**Notes**:
- `course_code`, `course_name`, and `semester` are required fields

**Success Response**:
- **Code**: 201 Created
- **Content**:
```json
{
  "message": "Course created successfully",
  "course": {
    "id": 1,
    "course_code": "CS101",
    "course_name": "Introduction to Programming",
    "description": "Basic programming concepts",
    "semester": "Spring 2025",
    "credits": 3,
    "department": "Computer Science",
    "instructor_id": 5,
    "is_active": true,
    "created_at": "2025-01-01T12:00:00Z"
  }
}
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "Course code, name, and semester are required"
}
```

- **Code**: 409 Conflict
- **Content**:
```json
{
  "message": "A course with this code already exists"
}
```

- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "Invalid instructor ID"
}
```

### Update Course
Update an existing course.

**URL**: `/api/courses/:id`  
**Method**: `PUT`  
**Auth Required**: Yes (admin, department_chair roles)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request Body**:
```json
{
  "course_code": "CS101",
  "course_name": "Updated Introduction to Programming",
  "description": "Updated description",
  "semester": "Spring 2025",
  "credits": 4,
  "department": "Computer Science",
  "instructor_id": 5,
  "is_active": true
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Course updated successfully",
  "course": {
    "id": 1,
    "course_code": "CS101",
    "course_name": "Updated Introduction to Programming",
    "description": "Updated description",
    "semester": "Spring 2025",
    "credits": 4,
    "department": "Computer Science",
    "instructor_id": 5,
    "is_active": true
  }
}
```

**Error Responses**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Course not found"
}
```

- **Code**: 409 Conflict
- **Content**:
```json
{
  "message": "A course with this code already exists"
}
```

- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "No changes were made"
}
```

### Delete Course
Delete a course.

**URL**: `/api/courses/:id`  
**Method**: `DELETE`  
**Auth Required**: Yes (admin, department_chair roles)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Course deleted successfully"
}
```

**Error Responses**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Course not found"
}
```

- **Code**: 500 Internal Server Error
- **Content**:
```json
{
  "message": "Failed to delete course"
}
```

### Assign TA to Course
Assign a TA to a course.

**URL**: `/api/courses/:id/tas`  
**Method**: `POST`  
**Auth Required**: Yes (admin, department_chair, staff roles)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request Body**:
```json
{
  "ta_id": 12,
  "hours_per_week": 10,
  "start_date": "2025-01-15",
  "end_date": "2025-05-25",
  "status": "active"
}
```

**Notes**:
- `ta_id`, `start_date`, and `end_date` are required fields

**Success Response**:
- **Code**: 201 Created
- **Content**:
```json
{
  "message": "TA assigned successfully",
  "assignment": {
    "id": 8,
    "course_id": 1,
    "ta_id": 12,
    "hours_per_week": 10,
    "start_date": "2025-01-15",
    "end_date": "2025-05-25",
    "status": "active",
    "created_at": "2025-01-01T12:00:00Z"
  }
}
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "TA ID, start date, and end date are required"
}
```

- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Course not found"
}
```

- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "TA not found"
}
```

- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "The selected user is not a TA"
}
```

- **Code**: 409 Conflict
- **Content**:
```json
{
  "message": "This TA is already assigned to this course"
}
```

### Update TA Assignment
Update a TA assignment.

**URL**: `/api/courses/:courseId/tas/:assignmentId`  
**Method**: `PUT`  
**Auth Required**: Yes (admin, department_chair, staff roles)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request Body**:
```json
{
  "hours_per_week": 15,
  "start_date": "2025-01-15",
  "end_date": "2025-05-25",
  "status": "active"
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "TA assignment updated successfully"
}
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "No update data provided"
}
```

- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "TA assignment not found or no changes were made"
}
```

### Remove TA from Course
Remove a TA from a course.

**URL**: `/api/courses/:courseId/tas/:taId`  
**Method**: `DELETE`  
**Auth Required**: Yes (admin, department_chair, staff roles)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "TA removed from course successfully"
}
```

**Error Responses**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Course not found"
}
```

- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "TA is not assigned to this course"
}
```

### Get All TAs for a Course
Get all TAs assigned to a course.

**URL**: `/api/courses/:id/tas`  
**Method**: `GET`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "tas": [
    {
      "id": 8,
      "ta_id": 12,
      "course_id": 1,
      "hours_per_week": 10,
      "start_date": "2025-01-15",
      "end_date": "2025-05-25",
      "status": "active",
      "full_name": "John Doe",
      "email": "john@bilkent.edu.tr",
      "bilkent_id": "12345678"
    }
  ]
}
```

**Error Responses**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Course not found"
}
```

### Get All Courses for a TA
Get all courses assigned to a TA.

**URL**: `/api/courses/ta/:id`  
**Method**: `GET`  
**Auth Required**: Yes

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "courses": [
    {
      "id": 8,
      "ta_id": 12,
      "course_id": 1,
      "hours_per_week": 10,
      "start_date": "2025-01-15",
      "end_date": "2025-05-25",
      "status": "active",
      "course_code": "CS101",
      "course_name": "Introduction to Programming",
      "semester": "Spring 2025"
    }
  ]
}
```

**Error Responses**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "TA not found"
}
```

## User Management Endpoints

### Get All Users
Get a list of users.

**URL**: `/api/users`  
**Method**: `GET`  
**Auth Required**: Yes (admin, department_chair roles)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of users per page (default: 20)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "User list functionality will be implemented here",
  "pagination": {
    "page": 1,
    "limit": 20,
    "offset": 0
  }
}
```

### Get User by ID
Get a specific user by ID.

**URL**: `/api/users/:id`  
**Method**: `GET`  
**Auth Required**: Yes (admin, department_chair roles)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "user": {
    "id": 1,
    "bilkentId": "12345678",
    "email": "john@bilkent.edu.tr",
    "fullName": "John Doe",
    "role": "ta",
    "permissions": ["view_courses", "view_applications", "create_application", "update_application", "view_assignments", "view_evaluations"]
  }
}
```

**Error Response**:
- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "User not found"
}
```

### Update User Role
Update a user's role.

**URL**: `/api/users/:id/role`  
**Method**: `PATCH`  
**Auth Required**: Yes (admin role)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Request Body**:
```json
{
  "role": "staff"
}
```

**Notes**:
- `role` must be one of: ["ta", "staff", "department_chair", "dean", "admin"]

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "User role updated successfully",
  "user": {
    "id": 1,
    "bilkentId": "12345678",
    "role": "staff"
  }
}
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "Invalid role specified"
}
```

- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "User not found"
}
```

- **Code**: 500 Internal Server Error
- **Content**:
```json
{
  "message": "Failed to update user role"
}
```

### Deactivate User
Deactivate a user account.

**URL**: `/api/users/:id/deactivate`  
**Method**: `PATCH`  
**Auth Required**: Yes (admin role)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "User deactivation functionality will be implemented here"
}
```

## Audit Log Endpoints

### Get All Logs
Get audit logs with filtering options.

**URL**: `/api/audit-logs`  
**Method**: `GET`  
**Auth Required**: Yes (admin role)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Query Parameters**:
- `action` (optional): Filter by action type
- `entity` (optional): Filter by entity type
- `entity_id` (optional): Filter by entity ID
- `user_id` (optional): Filter by user ID
- `description` (optional): Search in description
- `start_date` (optional): Start date for filtering
- `end_date` (optional): End date for filtering
- `limit` (optional): Maximum number of logs to return (default: 100)
- `offset` (optional): Number of logs to skip (default: 0)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "action": "login",
      "entity": "user",
      "entity_id": "12345678",
      "user_id": "12345678",
      "description": "User 12345678 logged in successfully",
      "metadata": { "role": "ta" },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-05-01T12:00:00Z"
    },
    {
      "id": 2,
      "action": "view_course",
      "entity": "course",
      "entity_id": "CS101",
      "user_id": "12345678",
      "description": "User viewed course CS101",
      "metadata": { "course_name": "Introduction to Programming" },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-05-01T12:05:00Z"
    }
  ]
}
```

### Get Logs by Entity
Get audit logs for a specific entity.

**URL**: `/api/audit-logs/entity/:entity/:entityId`  
**Method**: `GET`  
**Auth Required**: Yes (admin role)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**URL Parameters**:
- `entity`: Entity type (e.g., "user", "course")
- `entityId`: Entity ID

**Query Parameters**:
- `limit` (optional): Maximum number of logs to return (default: 100)
- `offset` (optional): Number of logs to skip (default: 0)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "action": "update_course",
      "entity": "course",
      "entity_id": "CS101",
      "user_id": "98765432",
      "description": "Course CS101 updated",
      "metadata": { "previous": {}, "updated": {} },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-05-01T12:00:00Z"
    },
    {
      "id": 2,
      "action": "delete_course",
      "entity": "course",
      "entity_id": "CS101",
      "user_id": "98765432",
      "description": "Course CS101 deleted",
      "metadata": { "course_name": "Introduction to Programming" },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-05-02T10:00:00Z"
    }
  ]
}
```

### Get Logs by User
Get audit logs for a specific user.

**URL**: `/api/audit-logs/user/:userId`  
**Method**: `GET`  
**Auth Required**: Yes (admin role)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**URL Parameters**:
- `userId`: User ID

**Query Parameters**:
- `limit` (optional): Maximum number of logs to return (default: 100)
- `offset` (optional): Number of logs to skip (default: 0)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "action": "login",
      "entity": "user",
      "entity_id": "12345678",
      "user_id": "12345678",
      "description": "User 12345678 logged in successfully",
      "metadata": { "role": "ta" },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-05-01T12:00:00Z"
    },
    {
      "id": 2,
      "action": "view_course",
      "entity": "course",
      "entity_id": "CS101",
      "user_id": "12345678",
      "description": "User viewed course CS101",
      "metadata": { "course_name": "Introduction to Programming" },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-05-01T12:05:00Z"
    }
  ]
}
```

### Get Logs by Action
Get audit logs for a specific action.

**URL**: `/api/audit-logs/action/:action`  
**Method**: `GET`  
**Auth Required**: Yes (admin role)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**URL Parameters**:
- `action`: Action type (e.g., "login", "update_course")

**Query Parameters**:
- `limit` (optional): Maximum number of logs to return (default: 100)
- `offset` (optional): Number of logs to skip (default: 0)

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "action": "login",
      "entity": "user",
      "entity_id": "12345678",
      "user_id": "12345678",
      "description": "User 12345678 logged in successfully",
      "metadata": { "role": "ta" },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-05-01T12:00:00Z"
    },
    {
      "id": 2,
      "action": "login",
      "entity": "user",
      "entity_id": "98765432",
      "user_id": "98765432",
      "description": "User 98765432 logged in successfully",
      "metadata": { "role": "staff" },
      "ip_address": "192.168.1.2",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-05-01T13:00:00Z"
    }
  ]
}
```

### Get Log Statistics
Get summary statistics for audit logs.

**URL**: `/api/audit-logs/stats`  
**Method**: `GET`  
**Auth Required**: Yes (admin role)

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "data": {
    "entityStats": {
      "user": 50,
      "course": 30,
      "task": 25,
      "leave": 15,
      "swap": 10
    },
    "actionStats": {
      "login": 40,
      "view_course": 25,
      "create_task": 15,
      "update_task": 10,
      "delete_task": 5
    },
    "totalLogs": 130
  }
}
```