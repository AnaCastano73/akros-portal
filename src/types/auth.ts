
export type UserRole = 'client' | 'expert' | 'employee' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  company_id?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  company_id?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
