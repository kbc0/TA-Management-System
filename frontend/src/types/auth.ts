export type UserRole = 'ta' | 'staff' | 'department_chair' | 'admin';

export interface User {
  id: number;
  bilkent_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status?: 'active' | 'inactive' | 'on_leave';
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  bilkent_id: string;
  password: string;
}

export interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}
