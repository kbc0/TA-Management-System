// src/api/auth.ts
import { apiUrl } from './config';

interface LoginCredentials {
  bilkentId: string;
  password: string;
}

interface SignupData {
  bilkentId: string;
  email: string;
  fullName: string;
  password: string;
  role?: string;
}

interface RecoverPasswordData {
  bilkentId: string;
}

interface ResetPasswordData {
  token: string;
  bilkentId: string;
  newPassword: string;
}

export const login = async (credentials: LoginCredentials) => {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  return await response.json();
};

export const signup = async (data: SignupData) => {
  const response = await fetch(`${apiUrl}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Signup failed');
  }

  return await response.json();
};

export const recoverPassword = async (data: RecoverPasswordData) => {
  const response = await fetch(`${apiUrl}/auth/recover-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Password recovery failed');
  }

  return await response.json();
};

export const resetPassword = async (data: ResetPasswordData) => {
  const response = await fetch(`${apiUrl}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Password reset failed');
  }

  return await response.json();
};

export const logout = async (token: string) => {
  const response = await fetch(`${apiUrl}/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Logout failed');
  }

  return await response.json();
};
