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
      
      console.log('Attempting login with credentials:', { bilkent_id: credentials.bilkent_id, passwordLength: credentials.password.length });
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
      await axios.post(`${API_URL}/auth/logout`, {}, {
        withCredentials: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user from state and localStorage
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
      localStorage.removeItem('user');
    }
  };

  // Check authentication status
  const checkAuthStatus = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Try to get user from localStorage first
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        
        // Verify token is still valid with the server
        const response = await axios.get(`${API_URL}/auth/verify`, {
          withCredentials: true,
        });
        
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
      const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
        withCredentials: true,
      });
      
      if (response.status === 200) {
        const { user } = response.data;
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null,
        });
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        // No valid session
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
        localStorage.removeItem('user');
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
