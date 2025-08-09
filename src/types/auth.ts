export enum UserRole {
  EMPLOYEE = "employee",
  MANAGER = "manager", 
  ADMIN = "admin",
  STAFF = "employee",
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole | "employee" | "manager" | "admin";
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  name?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface RegisterCredentials extends RegisterData {}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatarUrl?: string;
  };
}
