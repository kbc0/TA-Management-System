import { LoginCredentials, User } from '../types/auth';
import api from './api';

// Authentication service functions
export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      // Convert snake_case to camelCase for backend compatibility
      const backendCredentials = {
        bilkentId: credentials.bilkentId,
        password: credentials.password
      };
      
      console.log('Sending login request with credentials:', { 
        bilkentId: backendCredentials.bilkentId,
        passwordLength: backendCredentials.password.length 
      });
      
      const response = await api.post('/auth/login', backendCredentials);
      
      console.log('Login response:', response);
      
      if (!response.data || !response.data.user) {
        throw new Error('Invalid response from server. User data not found.');
      }
      
      const { user, token } = response.data;
      
      // Store user and token in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Provide more specific error messages based on the response
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Invalid Bilkent ID or password. Please try again.');
        } else if (error.response.status === 404) {
          throw new Error('User not found. Please check your Bilkent ID.');
        } else if (error.response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
      }
      
      throw error;
    }
  },
  
  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove the user and token from localStorage even if the API call fails
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  },
  
  // Request password reset
  requestPasswordReset: async (bilkentId: string): Promise<void> => {
    try {
      // Convert snake_case to camelCase for backend compatibility
      await api.post('/auth/recover-password', { bilkentId });
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },
  
  // Reset password
  resetPassword: async (token: string, password: string): Promise<void> => {
    try {
      await api.post('/auth/reset-password', { token, password });
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },
  
  // Verify authentication status
  verifyAuth: async (): Promise<User | null> => {
    try {
      const response = await api.get('/auth/verify');
      return response.data.user;
    } catch (error) {
      console.error('Auth verification error:', error);
      return null;
    }
  },
  
  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }
};

export default authService;