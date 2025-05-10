// src/pages/admin/UserCreatePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminStyles.css';

interface UserFormData {
  full_name: string;
  email: string;
  bilkent_id: string;
  role: string;
  department: string;
  password: string;
  max_hours?: number;
}

const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserFormData>({
    full_name: '',
    email: '',
    bilkent_id: '',
    role: 'ta',
    department: '',
    password: '',
    max_hours: 20
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

      // Create user via API
      const response = await axios.post(
        'http://localhost:5001/api/users', 
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccess('User created successfully!');
      // Reset form after successful creation
      setFormData({
        full_name: '',
        email: '',
        bilkent_id: '',
        role: 'ta',
        department: '',
        password: '',
        max_hours: 20
      });
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.message || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Create New User</h1>
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
            <label htmlFor="full_name">Full Name</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Enter full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bilkent_id">Bilkent ID</label>
            <input
              type="text"
              id="bilkent_id"
              name="bilkent_id"
              value={formData.bilkent_id}
              onChange={handleChange}
              required
              placeholder="Enter Bilkent ID"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="ta">Teaching Assistant</option>
              <option value="staff">Staff</option>
              <option value="department_chair">Department Chair</option>
              <option value="admin">Admin</option>
              <option value="dean">Dean</option>
            </select>
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
              placeholder="Enter department"
            />
          </div>

          {formData.role === 'ta' && (
            <div className="form-group">
              <label htmlFor="max_hours">Maximum Hours per Week</label>
              <input
                type="number"
                id="max_hours"
                name="max_hours"
                value={formData.max_hours}
                onChange={handleChange}
                min="1"
                max="40"
                placeholder="Enter maximum hours"
              />
            </div>
          )}

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
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreatePage;
