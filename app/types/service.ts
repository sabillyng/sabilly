import { User } from "./auth";

export interface Service {
  _id: string;
  title: string;
  description?: string;
  priceRange?: {
    string: string;
  };
  category: string;
  location?: string;
  images: string[];
  provider: Provider | string;
  rating?: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Provider {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'artisan' | 'business_owner' | 'customer' | 'admin' | 'super_admin';
  skills?: string[];
  bio?: string;
  rating?: number;
  totalReviews?: number;
  services?: Service[];
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  location?: string;
  kycVerified: boolean;
}

export interface Job {
  _id: string;
  title: string;
  description?: string;
  service: string | Service;
  applicant: string | User;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceData {
  title: string;
  description?: string;
  priceRange?: {
    string: string;
  };
  category: string;
  location?: string;
  images: File[];
}

export interface ServiceFilters {
  category?: string;
  location?: string;
  page?: number;
  limit?: number;
  provider?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'newest' | 'oldest' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProviderFilters {
    _id: string;
  category?: string;
  location?: string;
  page?: number;
  limit?: number;
  provider?: User;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'newest' | 'oldest' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  data?: Service;
}

export interface ServicesResponse {
  success: boolean;
  data: Service[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProvidersResponse {
  success: boolean;
  data: Provider[];
}

export interface ProviderResponse {
  success: boolean;
  data: Provider;
  message: string;
}

export interface FavouritesResponse {
  success: boolean;
  data: Provider[];
}

export interface RatingData {
  rating: number;
  reviewText?: string;
}

export interface RatingResponse {
  success: boolean;
  message: string;
}