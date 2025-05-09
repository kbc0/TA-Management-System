# TA Management System API Documentation

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
    "role": "ta"
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
    "role": "ta"
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

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Query Parameters**:
- `limit` (optional): Number of tasks to return (default: 5)

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

### Create Task
Create a new task.

**URL**: `/api/tasks`  
**Method**: `POST`  
**Auth Required**: Yes (staff, department_chair, admin roles only)

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

**Headers**:
```
Authorization: Bearer {jwt-token}
```

**Notes**:
- User must be assigned to the task or be the creator (if staff/department_chair) to mark it as completed

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Task marked as completed"
}
```

**Error Responses**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "You are not assigned to this task"
}
```

- **Code**: 404 Not Found
- **Content**:
```json
{
  "message": "Task not found"
}
```

### Delete Task
Delete a task.

**URL**: `/api/tasks/:id`  
**Method**: `DELETE`  
**Auth Required**: Yes

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