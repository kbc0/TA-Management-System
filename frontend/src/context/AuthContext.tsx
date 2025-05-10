// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';

interface User {
  id: number;
  bilkentId: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// Create a context with a default value
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log('[AuthContext] useEffect: Checking localStorage...');
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('[AuthContext] localStorage token:', token);
    console.log('[AuthContext] localStorage storedUser:', storedUser);

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Add a check to ensure parsedUser is a valid user object with an id
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log('[AuthContext] User authenticated from localStorage:', parsedUser);
        } else {
          // Invalid user object structure
          console.log('[AuthContext] Invalid user data in localStorage. Clearing storage.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error('[AuthContext] Error parsing user data from localStorage:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      // Token or user not found in localStorage
      console.log('[AuthContext] No token/user in localStorage. User not authenticated.');
      setUser(null); // Ensure user is null if not authenticating from localStorage
      setIsAuthenticated(false); // Ensure authenticated is false
    }
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
        await fetch('http://localhost:5001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        console.log('[AuthContext] Logout API call successful (or no token).');
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
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
