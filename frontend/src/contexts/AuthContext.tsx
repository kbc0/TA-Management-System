import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { AuthContextType, AuthState, User, LoginCredentials } from '../types/auth';
import { authService } from '../services/authService';

// Initial auth state
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  // Check if user is already authenticated on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Attempting login with credentials:', { bilkentId: credentials.bilkentId, passwordLength: credentials.password.length });
      console.log('API URL:', API_URL);
      
      // Use the authService instead of direct axios call
      const user = await authService.login(credentials);
      
      console.log('Login successful, user:', user);
      
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
      
      // User is already stored in localStorage by authService
    } catch (error: any) {
      console.error('Login error:', error);
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.message || 'Invalid Bilkent ID or password. Please try again.',
      });
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Call logout endpoint with token in Authorization header
      await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        withCredentials: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user and token from state and localStorage
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      console.log('User and token removed from localStorage');
    }
  };

  // Check authentication status
  const checkAuthStatus = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Try to get user and token from localStorage first
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      console.log('Checking auth status - stored user:', storedUser ? 'exists' : 'none');
      console.log('Checking auth status - token:', token ? 'exists' : 'none');
      
      if (storedUser && token) {
        const user: User = JSON.parse(storedUser);
        
        // Verify token is still valid with the server using the token in Authorization header
        const response = await axios.get(`${API_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true,
        });
        
        console.log('Verify response:', response.status, response.data);
        
        if (response.status === 200) {
          setAuthState({
            isAuthenticated: true,
            user,
            loading: false,
            error: null,
          });
          return;
        }
      }
      
      // If no stored user or token is invalid, try to refresh
      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });
        
        console.log('Refresh response:', response.status, response.data);
        
        if (response.status === 200) {
          const { user, token } = response.data;
          setAuthState({
            isAuthenticated: true,
            user,
            loading: false,
            error: null,
          });
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', token);
        } else {
          // No valid session
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
          });
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (refreshError) {
        console.error('Refresh token error:', refreshError);
        // No valid session
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  // Auth context value
  const value: AuthContextType = {
    authState,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
