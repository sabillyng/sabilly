"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { authService, EmailNotVerifiedError, AuthError } from '../api/auth';
import type { User, UserFilters, UsersResponse } from '../types/auth';
import { cookieService } from '../lib/cookies';
import { useMessage } from '../components/ui/MessagePopup';

interface UserStats {
  totalUsers: number;
  totalCustomers: number;
  totalArtisans: number;
  totalBusinessOwners: number;
  totalAdmins: number;
  verifiedUsers: number;
  pendingVerification: number;
  suspendedUsers: number;
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  registerArtisan: (userData: RegistrationData) => Promise<void>;
  registerCustomer: (userData: RegistrationData) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  allUsers: User[];
  userStats: UserStats | null;
  loadingUsers: boolean;
  fetchAllUsers: (filters?: UserFilters) => Promise<void>;
  fetchUserById: (userId: string) => Promise<User | null>;
  updateUserStatus: (userId: string, isActive: boolean, reason?: string) => Promise<boolean>;
  verifyUserKYC: (userId: string, verified: boolean, notes?: string) => Promise<boolean>;
  createAdmin: (userData: { fullName: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; message?: string }>;
}

interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  skills?: string[];
  role?: 'artisan' | 'business_owner' | 'customer';
  bio?: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { showSuccess, showError } = useMessage();

  // Helper to store user in cookies
  const storeUserInCookies = (userData: User) => {
    const userForCookie = {
      _id: userData._id,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role,
      isVerified: userData.isVerified,
      isEmailVerified: userData.isEmailVerified,
      kycVerified: userData.kycVerified,
      avatar: userData.avatar,
      phone: userData.phone
    };
    cookieService.set('userData', encodeURIComponent(JSON.stringify(userForCookie)), 7);
  };

  // Helper to get user from cookies
  const getUserFromCookies = (): User | null => {
    try {
      const userCookie = cookieService.get('userData');
      if (userCookie) {
        return JSON.parse(decodeURIComponent(userCookie));
      }
    } catch (error) {
      console.error('Failed to parse user cookie:', error);
    }
    return null;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    
    try {
      const token = cookieService.get('accessToken');
      
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        cookieService.remove('userData');
        return;
      }

      const cachedUser = getUserFromCookies();
      
      if (cachedUser) {
        setUser(cachedUser);
        setIsAuthenticated(true);
      }

      try {
        const apiUserData = await authService.getCurrentUser();
        
        if (apiUserData) {
          setUser(apiUserData);
          setIsAuthenticated(true);
          storeUserInCookies(apiUserData);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          cookieService.remove('accessToken');
          cookieService.remove('userData');
        }
        
      } catch (apiError) {
        console.error('API fetch failed:', apiError);
        
        if (cachedUser) {
          // Keep using cached user but log the error
          console.warn('Using cached user data due to API error');
        } else {
          setUser(null);
          setIsAuthenticated(false);
          cookieService.remove('accessToken');
          cookieService.remove('userData');
        }
      }
      
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      cookieService.remove('accessToken');
      cookieService.remove('userData');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const response = await authService.login({ email, password, rememberMe });
      
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        storeUserInCookies(response.user);
        showSuccess('Login successful');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      if (error instanceof EmailNotVerifiedError) {
        // Handle email not verified case - redirect to verification page
        throw error;
      } else if (error instanceof AuthError) {
        showError(error.message);
        throw error;
      } else {
        const message = error instanceof Error ? error.message : 'Login failed';
        showError(message);
        throw error;
      }
    }
  };

  const registerArtisan = async (userData: RegistrationData) => {
    try {
      const response = await authService.registerArtisan(userData);
      
      if (response.success) {
        showSuccess(response.message || 'Registration successful! Please verify your email.');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      showError(message);
      throw error;
    }
  };

  const registerCustomer = async (userData: RegistrationData) => {
    try {
      const response = await authService.registerCustomer(userData);
      
      if (response.success) {
        showSuccess(response.message || 'Registration successful! Please verify your email.');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      showError(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      showSuccess('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      cookieService.remove('accessToken');
      cookieService.remove('userData');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const response = await authService.updateProfile(updates);
      
      if (response.success && response.user) {
        setUser(response.user);
        storeUserInCookies(response.user);
        showSuccess(response.message || 'Profile updated successfully');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      showError(message);
      throw error;
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
    try {
      const response = await authService.verifyEmail(email, otp);
      
      if (response.success) {
        if (response.user) {
          setUser(response.user);
          storeUserInCookies(response.user);
          setIsAuthenticated(true);
        }
        showSuccess('Email verified successfully!');
      } else {
        throw new Error(response.message || 'Verification failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      showError(message);
      throw error;
    }
  };

  const resendOtp = async (email: string) => {
    try {
      const response = await authService.resendOtp(email);
      
      if (response.success) {
        showSuccess(response.message || 'OTP resent successfully');
      } else {
        throw new Error(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend OTP';
      showError(message);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        showSuccess(response.message || 'Password reset email sent');
      } else {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      showError(message);
      throw error;
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    try {
      const response = await authService.resetPassword(email, otp, newPassword);
      
      if (response.success) {
        showSuccess(response.message || 'Password reset successful');
      } else {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      showError(message);
      throw error;
    }
  };

  const fetchAllUsers = useCallback(async (filters?: UserFilters) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return;
    }

    setLoadingUsers(true);
    try {
      const result = await authService.getAllUsers(filters);
      if (result.success && result.data) {
        setAllUsers(result.data.users);
        setUserStats(result.data.stats);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  }, [user, showError]);

  const fetchUserById = useCallback(async (userId: string) => {
    setLoadingUsers(true);
    try {
      const result = await authService.getUserById(userId);
      if (result.success && result.data) {
        return result.data.user;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      showError('Failed to fetch user details');
      return null;
    } finally {
      setLoadingUsers(false);
    }
  }, [showError]);

  const updateUserStatus = useCallback(async (userId: string, isActive: boolean, reason?: string) => {
    try {
      const result = await authService.updateUserStatus(userId, isActive, reason);
      if (result.success) {
        setAllUsers(prev => prev.map(u => 
          u._id === userId ? { ...u, isActive } : u
        ));
        showSuccess('User status updated successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating user status:', error);
      showError('Failed to update user status');
      return false;
    }
  }, [showError, showSuccess]);

  const verifyUserKYC = useCallback(async (userId: string, verified: boolean, notes?: string) => {
    try {
      const result = await authService.verifyUserKYC(userId, verified, notes);
      if (result.success) {
        setAllUsers(prev => prev.map(u => 
          u._id === userId ? { ...u, kycVerified: verified } : u
        ));
        showSuccess('KYC verification updated successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error verifying KYC:', error);
      showError('Failed to verify KYC');
      return false;
    }
  }, [showError, showSuccess]);

  const createAdmin = useCallback(async (userData: { fullName: string; email: string; password: string; phone?: string }) => {
    try {
      const result = await authService.createAdmin(userData);
      if (result.success) {
        showSuccess('Admin created successfully');
      } else {
        showError(result.message || 'Failed to create admin');
      }
      return result;
    } catch (error) {
      console.error('Error creating admin:', error);
      showError('Failed to create admin');
      return { success: false, message: 'Failed to create admin' };
    }
  }, [showError, showSuccess]);

  const value: UserContextType = {
    user,
    login,
    logout,
    registerArtisan,
    registerCustomer,
    updateProfile,
    verifyEmail,
    resendOtp,
    forgotPassword,
    resetPassword,
    checkAuth,
    loading,
    isAuthenticated,
    allUsers,
    userStats,
    loadingUsers,
    fetchAllUsers,
    fetchUserById,
    updateUserStatus,
    verifyUserKYC,
    createAdmin,
  };

  return (
    <UserContext.Provider value={value}>
      {!loading ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      )}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}