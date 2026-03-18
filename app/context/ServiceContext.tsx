"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { serviceApi, ServiceError } from '../api/service';
import type { 
  Service, 
  CreateServiceData, 
  ServiceFilters,
  Provider,
  RatingData,
  Job,
  FavouritesResponse,
  ProvidersResponse,
  ServicesResponse
} from '../types/service';
import { useUser } from './UserContext';
import { useMessage } from '../components/ui/MessagePopup';

interface ServiceContextType {
  // State
  services: Service[];
  currentService: Service | null;
  providers: Provider[];
  favourites: Provider[];
  loading: boolean;
  loadingServices: boolean;
  loadingProviders: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  providersPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;

  // Service methods
  createService: (serviceData: CreateServiceData) => Promise<Service | null>;
  updateService: (id: string, serviceData: Partial<CreateServiceData>) => Promise<Service | null>;
  getServices: (filters?: ServiceFilters) => Promise<void>;
  getServiceById: (id: string) => Promise<Service | null>;
  applyForService: (id: string) => Promise<Job | null>;
  deleteService: (id: string) => Promise<boolean>;
  completeService: (id: string) => Promise<boolean>;
  toggleServiceStatus: (id: string, isActive: boolean) => Promise<boolean>;
  rateProvider: (serviceId: string, rating: number, reviewText?: string) => Promise<boolean>;

  // Provider methods
  getProviders: (filters?: { page?: number; limit?: number; search?: string; category?: string; minRating?: number }) => Promise<void>;
  getProviderById: (id: string) => Promise<Provider | null>;
  getTopRatedProviders: (limit?: number) => Promise<Provider[]>;
  searchProvidersBySkill: (skill: string, page?: number, limit?: number) => Promise<Provider[]>;
  getProviderServices: (providerId: string, includeInactive?: boolean) => Promise<Service[]>;

  // Favourites methods
  addToFavourites: (providerId: string) => Promise<boolean>;
  removeFromFavourites: (providerId: string) => Promise<boolean>;
  getFavourites: () => Promise<void>;

  // Utility
  clearCurrentService: () => void;
  isProvider: (providerId: string) => boolean;
  isFavourite: (providerId: string) => boolean;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export function ServiceProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [favourites, setFavourites] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [pagination, setPagination] = useState<ServiceContextType['pagination']>(null);
  const [providersPagination, setProvidersPagination] = useState<ServiceContextType['pagination']>(null);

  const { user } = useUser();
  const { showSuccess, showError } = useMessage();

  // Service Methods
  const createService = async (serviceData: CreateServiceData): Promise<Service | null> => {
    if (!user || (user.role !== 'artisan' && user.role !== 'business_owner')) {
      showError('Only artisans and business owners can create services');
      return null;
    }

    setLoading(true);
    try {
      const response = await serviceApi.createService(serviceData);
      
      if (response.success && response.data) {
        setServices(prev => [response.data!, ...prev]);
        showSuccess(response.message || 'Service created successfully');
        return response.data;
      } else {
        showError(response.message || 'Failed to create service');
        return null;
      }
    } catch (error) {
      const message = error instanceof ServiceError ? error.message : 'Failed to create service';
      showError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (id: string, serviceData: Partial<CreateServiceData>): Promise<Service | null> => {
    if (!user) {
      showError('You must be logged in to update a service');
      return null;
    }

    setLoading(true);
    try {
      const response = await serviceApi.updateService(id, serviceData);
      
      if (response.success && response.data) {
        setServices(prev => prev.map(s => s._id === id ? response.data! : s));
        if (currentService?._id === id) {
          setCurrentService(response.data);
        }
        showSuccess(response.message || 'Service updated successfully');
        return response.data;
      } else {
        showError(response.message || 'Failed to update service');
        return null;
      }
    } catch (error) {
      const message = error instanceof ServiceError ? error.message : 'Failed to update service';
      showError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getServices = useCallback(async (filters?: ServiceFilters) => {
    setLoadingServices(true);
    try {
      const response = await serviceApi.getServices(filters);
      
      if (response.success) {
        setServices(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      showError('Failed to fetch services');
    } finally {
      setLoadingServices(false);
    }
  }, [showError]);

  const getServiceById = async (id: string): Promise<Service | null> => {
    setLoading(true);
    try {
      const response = await serviceApi.getServiceById(id);
      
      if (response.success && response.data) {
        setCurrentService(response.data);
        return response.data;
      } else {
        showError(response.message || 'Service not found');
        return null;
      }
    } catch (error) {
      const message = error instanceof ServiceError ? error.message : 'Failed to fetch service';
      showError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const applyForService = async (id: string): Promise<Job | null> => {
    if (!user) {
      showError('Please login to apply for services');
      return null;
    }

    setLoading(true);
    try {
      const response = await serviceApi.applyForService(id);
      
      if (response.success && response.data) {
        showSuccess(response.message || 'Applied for service successfully');
        return response.data;
      } else {
        showError(response.message || 'Failed to apply for service');
        return null;
      }
    } catch (error) {
      const message = error instanceof ServiceError ? error.message : 'Failed to apply for service';
      showError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await serviceApi.deleteService(id);
      
      if (response.success) {
        setServices(prev => prev.filter(s => s._id !== id));
        if (currentService?._id === id) {
          setCurrentService(null);
        }
        showSuccess(response.message || 'Service deleted successfully');
        return true;
      } else {
        showError(response.message || 'Failed to delete service');
        return false;
      }
    } catch (error) {
      const message = error instanceof ServiceError ? error.message : 'Failed to delete service';
      showError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await serviceApi.toggleServiceStatus(id, isActive);
      
      if (response.success) {
        setServices(prev => prev.map(s => 
          s._id === id ? { ...s, isActive } : s
        ));
        if (currentService?._id === id) {
          setCurrentService(prev => prev ? { ...prev, isActive } : null);
        }
        showSuccess(response.message || `Service ${isActive ? 'activated' : 'deactivated'} successfully`);
        return true;
      } else {
        showError(response.message || 'Failed to update service status');
        return false;
      }
    } catch (error) {
      const message = error instanceof ServiceError ? error.message : 'Failed to update service status';
      showError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const completeService = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await serviceApi.completeService(id);
      
      if (response.success) {
        setServices(prev => prev.map(s => 
          s._id === id ? { ...s, status: 'completed' } : s
        ));
        if (currentService?._id === id) {
          setCurrentService(prev => prev ? { ...prev, status: 'completed' } : null);
        }
        showSuccess(response.message || 'Service marked as completed');
        return true;
      } else {
        showError(response.message || 'Failed to complete service');
        return false;
      }
    } catch (error) {
      const message = error instanceof ServiceError ? error.message : 'Failed to complete service';
      showError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rateProvider = async (serviceId: string, rating: number, reviewText?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await serviceApi.rateProvider(serviceId, { rating, reviewText });
      
      if (response.success) {
        showSuccess(response.message || 'Provider rated successfully');
        return true;
      } else {
        showError(response.message || 'Failed to rate provider');
        return false;
      }
    } catch (error) {
      const message = error instanceof ServiceError ? error.message : 'Failed to rate provider';
      showError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Provider Methods
  const getProviders = useCallback(async (filters?: { page?: number; limit?: number; search?: string; category?: string; minRating?: number }) => {
    setLoadingProviders(true);
    try {
      const response = await serviceApi.getProviders(filters);
      
      if (response.success) {
        setProviders(response.data);
        setProvidersPagination(response.pagination);
      }
    } catch (error) {
      const message = error instanceof ServiceError ? error.message : 'Failed to fetch providers';
      showError(message);
    } finally {
      setLoadingProviders(false);
    }
  }, [showError]);

  const getProviderById = async (id: string): Promise<Provider | null> => {
    setLoadingProviders(true);
    try {
      const response = await serviceApi.getProviderById(id);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        showError(response.message || 'Provider not found');
        return null;
      }
    } catch (error) {
      const message = error instanceof ServiceError ? error.message : 'Failed to fetch provider';
      showError(message);
      return null;
    } finally {
      setLoadingProviders(false);
    }
  };

  const getTopRatedProviders = async (limit?: number): Promise<Provider[]> => {
    setLoadingProviders(true);
    try {
      const response = await serviceApi.getTopRatedProviders(limit);
      
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error) {
      const message = error instanceof ServiceError ? error.message : 'Failed to fetch top rated providers';
      showError(message);
      return [];
    } finally {
      setLoadingProviders(false);
    }
  };

  const searchProvidersBySkill = async (skill: string, page?: number, limit?: number): Promise<Provider[]> => {
    setLoadingProviders(true);
    try {
      const response = await serviceApi.searchProvidersBySkill(skill, page, limit);
      
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error) {
      const message = error instanceof ServiceError ? error.message : 'Failed to search providers';
      showError(message);
      return [];
    } finally {
      setLoadingProviders(false);
    }
  };

  const getProviderServices = async (providerId: string, includeInactive?: boolean): Promise<Service[]> => {
    setLoadingServices(true);
    try {
      const response = await serviceApi.getProviderServices(providerId, includeInactive);
      
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error) {
      const message = error instanceof ServiceError ? error.message : 'Failed to fetch provider services';
      showError(message);
      return [];
    } finally {
      setLoadingServices(false);
    }
  };

  // Favourites Methods
  const addToFavourites = async (providerId: string): Promise<boolean> => {
    if (!user) {
      showError('Please login to add favourites');
      return false;
    }

    try {
      const response = await serviceApi.addToFavourites(providerId);
      
      if (response.success) {
        // Refresh favourites
        await getFavourites();
        showSuccess(response.message || 'Added to favourites');
        return true;
      } else {
        showError(response.message || 'Failed to add to favourites');
        return false;
      }
    } catch (error) {
      const message = error instanceof ServiceError ? error.message : 'Failed to add to favourites';
      showError(message);
      return false;
    }
  };

  const removeFromFavourites = async (providerId: string): Promise<boolean> => {
    if (!user) {
      showError('Please login to remove favourites');
      return false;
    }

    try {
      const response = await serviceApi.removeFromFavourites(providerId);
      
      if (response.success) {
        // Refresh favourites
        await getFavourites();
        showSuccess(response.message || 'Removed from favourites');
        return true;
      } else {
        showError(response.message || 'Failed to remove from favourites');
        return false;
      }
    } catch (error) {
      const message = error instanceof ServiceError ? error.message : 'Failed to remove from favourites';
      showError(message);
      return false;
    }
  };

  const getFavourites = async () => {
    if (!user) return;

    try {
      const response = await serviceApi.getFavourites();
      
      if (response.success) {
        setFavourites(response.data);
      }
    } catch (error) {
      const message = error instanceof ServiceError ? error.message : 'Failed to fetch favourites';
      showError(message);
    }
  };

  // Utility methods
  const clearCurrentService = () => {
    setCurrentService(null);
  };

  const isProvider = (providerId: string): boolean => {
    return user?._id === providerId;
  };

  const isFavourite = (providerId: string): boolean => {
    return favourites.some(fav => fav._id === providerId);
  };

  const value: ServiceContextType = {
    services,
    currentService,
    providers,
    favourites,
    loading,
    loadingServices,
    loadingProviders,
    pagination,
    providersPagination,
    createService,
    updateService,
    getServices,
    getServiceById,
    applyForService,
    deleteService,
    toggleServiceStatus,
    completeService,
    rateProvider,
    getProviders,
    getProviderById,
    getTopRatedProviders,
    searchProvidersBySkill,
    getProviderServices,
    addToFavourites,
    removeFromFavourites,
    getFavourites,
    clearCurrentService,
    isProvider,
    isFavourite,
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useService() {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
}