import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegistrationData, 
  User,
  UserFilters,
  UserResponse,
  UsersResponse, 
} from '../types/auth';
import { cookieService } from '../lib/cookies';

// Constants for better maintainability
const AUTH_ENDPOINTS = {
  REGISTER_ARTISAN: '/auth/register-artisan',
  REGISTER_CUSTOMER: '/auth/register-customer',
  REGISTER_ADMIN: '/admin/register-admin',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  CURRENT_USER: '/auth/profile',
  VERIFY_EMAIL: '/auth/verify-otp',
  RESEND_OTP: '/auth/resend-otp',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  UPDATE_PROFILE: '/auth/profile',
  GET_ALL_USERS: '/admin/users',
  GET_USER_BY_ID: (id: string) => `/admin/users/${id}`,
  UPDATE_USER_STATUS: (id: string) => `/admin/users/${id}/status`,
  VERIFY_USER_KYC: (id: string) => `/admin/users/${id}/verify`,
} as const;

// Error response type
interface ErrorResponse {
  message?: string;
  success?: boolean;
  error?: string;
  email?: string;
  requiresVerification?: boolean;
}

// Extend AxiosRequestConfig to support retry flag
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// Custom error classes
export class EmailNotVerifiedError extends Error {
  public email: string;
  
  constructor(message: string, email: string) {
    super(message);
    this.name = 'EmailNotVerifiedError';
    this.email = email;
  }
}

export class AuthError extends Error {
  public statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

// Create axios instance with proper configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 50000
});

// Request interceptor to add auth token from cookies
api.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const token = cookieService.get('accessToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    // Handle other error cases
    if (error.code === 'ECONNABORTED') {
      throw new AuthError('Request timeout. Please try again.');
    }
    
    if (error.response) {
      const errorData = error.response.data;
      const status = error.response.status;
      
      // Handle email not verified case
      if (status === 403 && errorData?.requiresVerification) {
        const email = errorData.email || '';
        throw new EmailNotVerifiedError(errorData.message || 'Email not verified', email);
      }
      
      throw error;
      
    } else if (error.request) {
      throw new AuthError('No response received from server. Please check your connection.');
    } else {
      throw new AuthError(error.message || 'An unknown error occurred.');
    }
  }
);

// Helper function for client-side cleanup
async function handleClientSideLogout() {
  cookieService.remove('accessToken');
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    sessionStorage.clear();
    
    // Only redirect if we're not already on auth pages
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.includes('/auth/login') || 
                      currentPath.includes('/auth/register') || 
                      currentPath.includes('/auth/verify-email');
    
    if (!isAuthPage) {
      window.location.href = '/dashboard';
    }
  }
}

class AuthService {
  private extractData<T>(response: { data: T }): T {
    return response.data;
  }

  // --- Registration Methods ---
  async registerArtisan(userData: RegistrationData): Promise<AuthResponse> {
    try {
      const payload = { 
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '',
        skills: userData.skills || [],
        bio: userData.bio || ''
      };

      const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER_ARTISAN, payload);
      return this.extractData(response);
    } catch (error: unknown) {
      throw error;
    }
  }

  async registerCustomer(userData: RegistrationData): Promise<AuthResponse> {
    try {
      const payload = { 
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || ''
      };

      const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER_CUSTOMER, payload);
      return this.extractData(response);
    } catch (error: unknown) {
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, {
        email: credentials.email,
        password: credentials.password
      });
      
      if (response.data.accessToken) {
        cookieService.set('accessToken', response.data.accessToken, 7);
        if (credentials.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
      }
      
      return response.data;
      
    } catch (error: unknown) {    
      if (error instanceof AxiosError && error.response) {
        const errorData = error.response.data;
        
        // Check if it's the email not verified case
        if (error.response.status === 403 && errorData?.requiresVerification) {
          throw new EmailNotVerifiedError(
            errorData.message || 'Email not verified', 
            errorData.email || credentials.email
          );
        }
        
        const errorMessage = errorData?.message || 
                            errorData?.error || 
                            `Login failed (${error.response.status})`;
        throw new AuthError(errorMessage, error.response.status);
      }
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new AuthError('An unexpected error occurred');
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error: unknown) {
      console.error('Logout error:', error);
    } finally {
      // Always clear client-side tokens
      await handleClientSideLogout();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<{ success: boolean; user: User }>(AUTH_ENDPOINTS.CURRENT_USER);
      
      if (response.data.success && response.data.user) {
        return response.data.user;
      }
      
      return null;
      
    } catch (error: unknown) {    
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 401 || status === 403) {
          cookieService.remove('accessToken');
          return null;
        }
      }
      
      return null;
    }
  }
  
  async getAllUsers(filters?: UserFilters): Promise<UsersResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.role) queryParams.append('role', filters.role);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.page) queryParams.append('page', String(filters.page));
      if (filters?.limit) queryParams.append('limit', String(filters.limit));
      if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

      const url = `${AUTH_ENDPOINTS.GET_ALL_USERS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<UsersResponse>(url);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch users');
    }
  }

  async getUserById(userId: string): Promise<UserResponse> {
    try {
      const response = await api.get<UserResponse>(AUTH_ENDPOINTS.GET_USER_BY_ID(userId));
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch user details');
    }
  }

  async updateUserStatus(userId: string, isActive: boolean, reason?: string): Promise<{ success: boolean; message?: string; data?: User }> {
    try {
      const response = await api.put(AUTH_ENDPOINTS.UPDATE_USER_STATUS(userId), { isActive, reason });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update user status');
    }
  }

  async verifyUserKYC(userId: string, verified: boolean, notes?: string): Promise<{ success: boolean; message?: string; data?: User }> {
    try {
      const response = await api.patch(AUTH_ENDPOINTS.VERIFY_USER_KYC(userId), { verified, notes });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to verify KYC');
    }
  }

  async createAdmin(userData: { fullName: string; email: string; password: string; phone?: string }): Promise<{ success: boolean; message?: string; data?: User }> {
    try {
      const response = await api.post(AUTH_ENDPOINTS.REGISTER_ADMIN, userData);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create admin');
    }
  }

  async verifyEmail(email: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        AUTH_ENDPOINTS.VERIFY_EMAIL, 
        { email, otp }
      );

      // Store token if verification successful
      if (response.data.accessToken) {
        cookieService.set('accessToken', response.data.accessToken, 7);
      }

      return this.extractData(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to verify email');
    }
  }

  async resendOtp(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        AUTH_ENDPOINTS.RESEND_OTP, 
        { email }
      );
      return this.extractData(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to resend OTP');
    }
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        AUTH_ENDPOINTS.FORGOT_PASSWORD, 
        { email }
      );
      return this.extractData(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to process forgot password request');
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        AUTH_ENDPOINTS.RESET_PASSWORD, 
        { 
          email,      
          otp,
          newPassword 
        }
      );
      return this.extractData(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to reset password');
    }
  }

  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; message: string; user: User }> {
    try {
      const response = await api.put<{ success: boolean; message: string; user: User }>(
        AUTH_ENDPOINTS.UPDATE_PROFILE, 
        updates
      );
      return this.extractData(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update profile');
    }
  }

  // Utility method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!cookieService.get('accessToken');
  }

  // Utility method to get stored token
  getStoredToken(): string | null {
    return cookieService.get('accessToken');
  }
}

export const authService = new AuthService();

// Helper functions
export const isVerifiedUser = (user: User | null): boolean => {
  return !!(user && user.isVerified && user.isEmailVerified);
};

export const isAdmin = (user: User | null): boolean => {
  return !!(user && (user.role === 'admin' || user.role === 'super_admin'));
};

export const isSuperAdmin = (user: User | null): boolean => {
  return !!(user && user.role === 'super_admin');
};

export const isArtisan = (user: User | null): boolean => {
  return !!(user && user.role === 'artisan');
};

export const isCustomer = (user: User | null): boolean => {
  return !!(user && user.role === 'customer');
};

export const isBusinessOwner = (user: User | null): boolean => {
  return !!(user && user.role === 'business_owner');
};

// Export the API instance for direct use if needed
export { api as authApi };