export type UserRole = 'ta' | 'staff' | 'department_chair' | 'admin';

export interface User {
  id: number;
  bilkent_id: string; // Using snake_case to match backend
  email: string;
  full_name: string; // Using snake_case to match backend
  role: UserRole;
  max_hours?: number;
  status?: 'active' | 'inactive' | 'on_leave';
  permissions?: string[];
  created_at?: string; // Using snake_case to match backend
  updated_at?: string; // Using snake_case to match backend
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  bilkentId: string;
  password: string;
}

export interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}
