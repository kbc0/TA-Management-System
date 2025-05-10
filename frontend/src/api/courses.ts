// src/api/courses.ts
import { apiUrl } from './config';

export interface Course {
  id: number;
  course_code: string;
  name: string;
  semester: string;
  instructor_id: number;
  instructor_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseCreateData {
  course_code: string;
  name: string;
  semester: string;
  instructor_id: number;
}

// Get all courses
export const getAllCourses = async (): Promise<Course[]> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/courses`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch courses');
  }

  return await response.json();
};

// Get a specific course
export const getCourseById = async (courseId: number): Promise<Course> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/courses/${courseId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch course');
  }

  return await response.json();
};

// Create a new course
export const createCourse = async (courseData: CourseCreateData): Promise<Course> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/courses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(courseData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create course');
  }

  return await response.json();
};

// Update an existing course
export const updateCourse = async (courseId: number, courseData: Partial<CourseCreateData>): Promise<Course> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/courses/${courseId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(courseData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update course');
  }

  return await response.json();
};

// Delete a course
export const deleteCourse = async (courseId: number): Promise<{ message: string }> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${apiUrl}/courses/${courseId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete course');
  }

  return await response.json();
};
