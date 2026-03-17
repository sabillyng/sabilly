import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  CreateServiceData, 
  ServiceFilters,
  ServiceResponse,
  ServicesResponse,
  ProvidersResponse,
  ProviderResponse,
  FavouritesResponse,
  RatingData,
  RatingResponse,
  Job
} from '../types/service';
import { cookieService } from '../lib/cookies';

// Constants for service endpoints
const SERVICE_ENDPOINTS = {
  CREATE: '/service/create-service',
  GET_ALL: '/service/all-services',
  GET_BY_ID: (id: string) => `/service/get-service/${id}`,
  APPLY: (id: string) => `/service/apply/${id}`,
  DELETE: (id: string) => `/service/delete/${id}`,
  COMPLETE: (id: string) => `/service/complete/${id}`,
  RATE: (id: string) => `/service/service/${id}/rate`,
  GET_PROVIDERS: '/service/providers',
  GET_PROVIDER_BY_ID: (id: string) => `/service/provider/${id}`,
  ADD_TO_FAVOURITES: (id: string) => `/service/favourites/${id}`,
  REMOVE_FROM_FAVOURITES: (id: string) => `/service/favourites/${id}`,
  GET_FAVOURITES: '/service/favourites',
} as const;

// Custom error classes
export class ServiceError extends Error {
  public statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ServiceError';
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

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      throw new ServiceError('Request timeout. Please try again.');
    }
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data as { message?: string };
      
      if (status === 401 || status === 403) {
        // Handle unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
      
      throw new ServiceError(
        errorData?.message || `Request failed with status ${status}`,
        status
      );
    } else if (error.request) {
      throw new ServiceError('No response received from server. Please check your connection.');
    } else {
      throw new ServiceError(error.message || 'An unknown error occurred.');
    }
  }
);

class ServiceApiService {
  private extractData<T>(response: { data: T }): T {
    return response.data;
  }

  // Create a new service
  async createService(serviceData: CreateServiceData): Promise<ServiceResponse> {
    try {
      const formData = new FormData();
      
      // Append all text fields
      formData.append('title', serviceData.title);
      if (serviceData.description) formData.append('description', serviceData.description);
      if (serviceData.priceRange) formData.append('priceRange', JSON.stringify(serviceData.priceRange));
      formData.append('category', serviceData.category);
      if (serviceData.location) formData.append('location', serviceData.location);
      
      // Append images
      serviceData.images.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await api.post<ServiceResponse>(
        SERVICE_ENDPOINTS.CREATE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError('Failed to create service');
    }
  }

  // Get all services with filters
  async getServices(filters?: ServiceFilters): Promise<ServicesResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.location) queryParams.append('location', filters.location);
      if (filters?.page) queryParams.append('page', String(filters.page));
      if (filters?.limit) queryParams.append('limit', String(filters.limit));
      if (filters?.provider) queryParams.append('provider', filters.provider);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.minPrice) queryParams.append('minPrice', String(filters.minPrice));
      if (filters?.maxPrice) queryParams.append('maxPrice', String(filters.maxPrice));

      const url = `${SERVICE_ENDPOINTS.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<ServicesResponse>(url);
      
      return response.data;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError('Failed to fetch services');
    }
  }

  // Get service by ID
  async getServiceById(id: string): Promise<ServiceResponse> {
    try {
      const response = await api.get<ServiceResponse>(SERVICE_ENDPOINTS.GET_BY_ID(id));
      return response.data;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError('Failed to fetch service details');
    }
  }

  // Apply for a service
  async applyForService(id: string): Promise<{ success: boolean; message: string; data?: Job }> {
    try {
      const response = await api.post(SERVICE_ENDPOINTS.APPLY(id));
      return response.data;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError('Failed to apply for service');
    }
  }

  // Delete service
  async deleteService(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(SERVICE_ENDPOINTS.DELETE(id));
      return response.data;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError('Failed to delete service');
    }
  }

  // Complete service
  async completeService(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.patch(SERVICE_ENDPOINTS.COMPLETE(id));
      return response.data;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError('Failed to complete service');
    }
  }

  // Rate provider
  async rateProvider(serviceId: string, ratingData: RatingData): Promise<RatingResponse> {
    try {
      const response = await api.post<RatingResponse>(
        SERVICE_ENDPOINTS.RATE(serviceId),
        ratingData
      );
      return response.data;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError('Failed to rate provider');
    }
  }

  // Get all providers
  async getProviders(): Promise<ProvidersResponse> {
    try {
      const response = await api.get<ProvidersResponse>(SERVICE_ENDPOINTS.GET_PROVIDERS);
      return response.data;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError('Failed to fetch providers');
    }
  }

  // Get provider by ID
  async getProviderById(id: string): Promise<ProviderResponse> {
    try {
      const response = await api.get<ProviderResponse>(SERVICE_ENDPOINTS.GET_PROVIDER_BY_ID(id));
      return response.data;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError('Failed to fetch provider details');
    }
  }

  // Add provider to favourites
  async addToFavourites(providerId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(SERVICE_ENDPOINTS.ADD_TO_FAVOURITES(providerId));
      return response.data;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError('Failed to add to favourites');
    }
  }

  // Remove provider from favourites
  async removeFromFavourites(providerId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(SERVICE_ENDPOINTS.REMOVE_FROM_FAVOURITES(providerId));
      return response.data;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError('Failed to remove from favourites');
    }
  }

  // Get user's favourites
  async getFavourites(): Promise<FavouritesResponse> {
    try {
      const response = await api.get<FavouritesResponse>(SERVICE_ENDPOINTS.GET_FAVOURITES);
      return response.data;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError('Failed to fetch favourites');
    }
  }
}

export const serviceApi = new ServiceApiService();