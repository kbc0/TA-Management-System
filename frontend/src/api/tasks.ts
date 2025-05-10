// src/api/tasks.ts
import { apiUrl } from './config';

export interface Task {
  id: number;
  title: string;
  description: string;
  task_type: 'grading' | 'office_hours' | 'proctoring' | 'lab_session' | 'other';
  course_id: string;
  due_date: string;
  duration: number;
  status: 'active' | 'completed' | 'cancelled';
  created_by: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  assigned_to_name?: string;
}

export interface TaskCreateData {
  title: string;
  description: string;
  task_type: 'grading' | 'office_hours' | 'proctoring' | 'lab_session' | 'other';
  course_id: string;
  due_date: string;
  duration: number;
  assignees?: number[];
}

export interface TaskUpdateData extends Partial<TaskCreateData> {
  status?: 'active' | 'completed' | 'cancelled';
}

// Get all tasks
export const getAllTasks = async (): Promise<Task[]> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/tasks`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch tasks');
  }

  return await response.json();
};

// Get a specific task
export const getTaskById = async (taskId: number): Promise<Task> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch task');
  }

  return await response.json();
};

// Get upcoming tasks
export const getUpcomingTasks = async (limit: number = 5): Promise<Task[]> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/tasks/upcoming?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch upcoming tasks');
  }

  return await response.json();
};

// Create a new task
export const createTask = async (taskData: TaskCreateData): Promise<Task> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create task');
  }

  return await response.json();
};

// Update an existing task
export const updateTask = async (taskId: number, taskData: TaskUpdateData): Promise<Task> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update task');
  }

  return await response.json();
};

// Mark a task as completed
export const completeTask = async (taskId: number): Promise<{ message: string }> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/tasks/${taskId}/complete`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to complete task');
  }

  return await response.json();
};

// Delete a task
export const deleteTask = async (taskId: number): Promise<{ message: string }> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete task');
  }

  return await response.json();
};