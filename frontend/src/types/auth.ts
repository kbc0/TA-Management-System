export type UserRole = 'ta' | 'staff' | 'department_chair' | 'admin';

export interface User {
  id: number;
  bilkentId: string; // Changed from bilkent_id to match backend
  email: string;
  fullName: string; // Changed from full_name to match backend
  role: UserRole;
  status?: 'active' | 'inactive' | 'on_leave';
  permissions?: string[];
  createdAt?: string; // Changed from created_at
  updatedAt?: string; // Changed from updated_at
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
