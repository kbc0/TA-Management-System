// src/pages/admin/CourseCreatePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminStyles.css';

interface CourseFormData {
  course_code: string;
  course_name: string;
  department: string;
  instructor_id?: number;
  semester: string;
  year: number;
  credits: number;
  description?: string;
}

interface Instructor {
  id: number;
  full_name: string;
  email: string;
}

const CourseCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CourseFormData>({
    course_code: '',
    course_name: '',
    department: '',
    semester: 'Fall',
    year: new Date().getFullYear(),
    credits: 3,
    description: ''
  });
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Fetch instructors (staff and department chairs) for dropdown
    const fetchInstructors = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await axios.get(
          'http://localhost:5001/api/users?role=staff,department_chair',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data && Array.isArray(response.data.users)) {
          setInstructors(response.data.users);
        }
      } catch (err) {
        console.error('Error fetching instructors:', err);
      }
    };

    fetchInstructors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' || name === 'year' || name === 'instructor_id' 
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Create course via API
      const response = await axios.post(
        'http://localhost:5001/api/courses', 
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccess('Course created successfully!');
      // Reset form after successful creation
      setFormData({
        course_code: '',
        course_name: '',
        department: '',
        semester: 'Fall',
        year: new Date().getFullYear(),
        credits: 3,
        description: ''
      });
    } catch (err: any) {
      console.error('Error creating course:', err);
      setError(err.response?.data?.message || 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Create New Course</h1>
        <button className="back-button" onClick={() => navigate('/home')}>
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i> {success}
        </div>
      )}

      <div className="admin-card">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="course_code">Course Code</label>
            <input
              type="text"
              id="course_code"
              name="course_code"
              value={formData.course_code}
              onChange={handleChange}
              required
              placeholder="e.g., CS101"
            />
          </div>

          <div className="form-group">
            <label htmlFor="course_name">Course Name</label>
            <input
              type="text"
              id="course_name"
              name="course_name"
              value={formData.course_name}
              onChange={handleChange}
              required
              placeholder="e.g., Introduction to Computer Science"
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              placeholder="e.g., Computer Science"
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="semester">Semester</label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
              >
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
              </select>
            </div>

            <div className="form-group half">
              <label htmlFor="year">Year</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min={2000}
                max={2100}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="credits">Credits</label>
              <input
                type="number"
                id="credits"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                required
                min={1}
                max={10}
              />
            </div>

            <div className="form-group half">
              <label htmlFor="instructor_id">Instructor</label>
              <select
                id="instructor_id"
                name="instructor_id"
                value={formData.instructor_id || ''}
                onChange={handleChange}
              >
                <option value="">Select Instructor</option>
                {instructors.map(instructor => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              placeholder="Enter course description"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate('/home')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseCreatePage;
