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
  "errors": {
    "email": "Must use a Bilkent email address (@bilkent.edu.tr)",
    "password": "Password must be at least 6 characters long"
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
  "errors": {
    "bilkentId": "Bilkent ID is required"
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

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "If your ID exists, a password reset link has been sent to your email"
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
- **Condition**: Invalid token
- **Content**:
```json
{
  "message": "Invalid or expired token"
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

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of task objects

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
- **Content**: Task object

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
- **Content**: Array of task objects

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

**Success Response**:
- **Code**: 201 Created
- **Content**: Created task object

**Error Response**:
- **Code**: 403 Forbidden
- **Content**:
```json
{
  "message": "You do not have permission to create tasks"
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

**Success Response**:
- **Code**: 200 OK
- **Content**: Updated task object

**Error Response**:
- **Code**: 403 Forbidden
- **Content**:
```json
{
  "message": "You do not have permission to update this task"
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

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Task marked as completed"
}
```

**Error Response**:
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "message": "You are not assigned to this task"
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

**Success Response**:
- **Code**: 200 OK
- **Content**:
```json
{
  "message": "Task deleted successfully"
}
```

**Error Response**:
- **Code**: 403 Forbidden
- **Content**:
```json
{
  "message": "You do not have permission to delete this task"
}
```