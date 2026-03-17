export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'artisan' | 'business_owner' | 'admin' | 'super_admin';
  skills?: string[];
  idNumber?: string;
  favourites?: string[];
  rating?: number;
  reviewText?: string;
  location?: string;
  bio?: string;
  totalReviews?: number;
  isVerified: boolean;
  isEmailVerified: boolean;
  kycVerified: boolean;
  kycSubmittedAt?: Date;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  stats?: {
    activeJobs: number;
    activeServices: number;
    totalServices: number;
    totalJobs: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'artisan' | 'business_owner' | 'customer';
  skills?: string[];
  bio?: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  user?: User;
  requiresVerification?: boolean;
  email?: string;
}

export interface UserFilters {
  role?: string;
  status?: 'verified' | 'pending' | 'suspended';
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data?: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
    stats: {
      totalUsers: number;
      totalCustomers: number;
      totalArtisans: number;
      totalBusinessOwners: number;
      totalAdmins: number;
      verifiedUsers: number;
      pendingVerification: number;
      suspendedUsers: number;
    };
  };
}

export interface UserResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    stats: {
      totalServices: number;
      totalJobs: number;
      openJobs: number;
      assignedJobs: number;
      jobInProgress: number;
      completedJobs: number;
      cancelledJobs: number;
    };
  };
}