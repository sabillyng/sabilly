"use client";
import { useEffect, useState } from 'react';
import { useService } from '../../context/ServiceContext';
import { ServiceCard } from './ServiceCard';
import { ServiceFilters } from '../../types/service';
import { FunnelIcon, ArrowPathIcon, WrenchIcon } from '@heroicons/react/24/outline';

interface ServicesListProps {
  filters?: ServiceFilters;
  showFilters?: boolean;
  title?: string;
}

export function ServicesList({ filters: initialFilters, showFilters = false, title }: ServicesListProps) {
  const { services, loadingServices, getServices, pagination } = useService();
  const [filters, setFilters] = useState<ServiceFilters>(initialFilters || {});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load services when filters change
  useEffect(() => {
    const fetchServices = async () => {
      // Clean up filters - remove undefined values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      );
      await getServices(cleanFilters);
    };
    
    fetchServices();
  }, [filters]);

  const handleFilterChange = (key: keyof ServiceFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 })); // Reset to first page on filter change
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12 });
  };

  // Get unique categories from services for filter dropdown
  const getUniqueCategories = () => {
    const categories = new Set(services.map(s => s.category));
    return Array.from(categories).sort();
  };

  if (loadingServices && services.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px]">
        <ArrowPathIcon className="h-8 w-8 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-500">Loading services...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with title and filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        {title && <h2 className="text-2xl font-bold mb-2 sm:mb-0">{title}</h2>}
        
        {showFilters && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center px-3 py-2 border border-gray-300 rounded-lg"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
            
            {/* Desktop filters */}
            <div className="hidden lg:flex items-center space-x-3">
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Locations</option>
                <option value="Osogbo">Osogbo</option>
                <option value="Ede">Ede</option>
                <option value="Ile-Ife">Ile Ife</option>
                <option value="Ikinrun">Ikinrun</option>
                <option value="Iwo">Iwo</option>
              </select>
              
              <select
                value={filters.sortBy || ''}
                onChange={(e) => handleFilterChange('sortBy', e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="createdAt">Newest First</option>
                <option value="rating">Highest Rated</option>
              </select>
              
              {(filters.category || filters.location || filters.sortBy) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-emerald-600"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile filters */}
      {showFilters && showMobileFilters && (
        <div className="lg:hidden mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Categories</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={filters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
                <option value="">All Locations</option>
                <option value="Osogbo">Osogbo</option>
                <option value="Ede">Ede</option>
                <option value="Ile-Ife">Ile Ife</option>
                <option value="Ikinrun">Ikinrun</option>
                <option value="Iwo">Iwo</option>
            </select>
            
            <select
              value={filters.sortBy || ''}
              onChange={(e) => handleFilterChange('sortBy', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="createdAt">Newest First</option>
              <option value="rating">Highest Rated</option>
            </select>
            
            <button
              onClick={clearFilters}
              className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Results count */}
      {services.length > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          Showing {services.length} of {pagination?.total || services.length} services
        </p>
      )}

      {/* Services grid */}
      {services.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg ${
                        pagination.page === pageNum
                          ? 'bg-emerald-600 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <span className="text-sm text-gray-500 mx-2">
                of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <WrenchIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No services found</p>
          <p className="text-sm text-gray-400">Try adjusting your filters or search criteria</p>
          {(filters.category || filters.location) && (
            <button
              onClick={clearFilters}
              className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}