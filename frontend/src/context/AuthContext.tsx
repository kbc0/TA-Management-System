// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { logout as logoutApi } from '../api/auth';
import { apiRequest } from '../api/apiUtils';

interface User {
  id: number;
  bilkentId: string;
  email: string;
  fullName: string;
  role: string;
  permissions?: string[];
  profileImage?: string;
  phone?: string;
  department?: string;
  bio?: string;
  skills?: string[];
  qualifications?: string[];
  courses?: string[];
  leaveRequests?: {
    start: string;
    end: string;
    reason: string;
    status: string;
  }[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<User | null>;
}

// Create a context with a default value
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  refreshUserData: async () => null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to refresh user data from the backend
  const refreshUserData = async () => {
    try {
      const userData = await apiRequest<User>('/users/me');
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('[AuthContext] Error refreshing user data:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[AuthContext] Initializing auth state...');
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token) {
        try {
          // First try to parse the stored user
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
              setUser(parsedUser);
              setIsAuthenticated(true);
            }
          }
          
          // Then try to refresh user data from the backend
          const freshUserData = await refreshUserData();
          if (freshUserData) {
            console.log('[AuthContext] User data refreshed from backend');
          } else {
            // If we couldn't refresh but had a valid stored user, we'll use that
            console.log('[AuthContext] Using cached user data');
          }
        } catch (e) {
          console.error('[AuthContext] Error during auth initialization:', e);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // No token found
        console.log('[AuthContext] No token found. User not authenticated.');
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = (token: string, userData: User) => {
    console.log('[AuthContext] Logging in user:', userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = async () => {
    console.log('[AuthContext] Logging out user...');
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await logoutApi(token);
        console.log('[AuthContext] Logout API call successful.');
      }
    } catch (err) {
      console.error('[AuthContext] Logout API error:', err);
    } finally {
      console.log('[AuthContext] Clearing localStorage and resetting auth state.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading,
      login, 
      logout,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};
