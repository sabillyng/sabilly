"use client";
import { useEffect, useState } from 'react';
import { Navbar } from '../../components/Home/Navbar';
import { ServiceCard } from '../../components/services/ServiceCard';
import { CategorySidebar } from '../../components/Home/CategorySidebar';
import { useService } from '../../context/ServiceContext';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ServiceFilters } from '../../types/service';
import { Footer } from '../../components/Home/Footer';

export default function ServicesPage() {
  const { services, getServices, loadingServices, pagination } = useService();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    category: string;
    location: string;
    minPrice: string;
    maxPrice: string;
    sortBy: 'createdAt' | 'price' | 'rating' | 'newest' | 'oldest';
    sortOrder: 'asc' | 'desc';
  }>({
    category: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadServices();
  }, [filters, searchQuery]);

  const loadServices = async () => {
    const filterParams: ServiceFilters = {
      limit: 12,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder as 'asc' | 'desc'
    };
    
    if (filters.category) filterParams.category = filters.category;
    if (filters.location) filterParams.location = filters.location;
    if (filters.minPrice) filterParams.minPrice = parseInt(filters.minPrice);
    if (filters.maxPrice) filterParams.maxPrice = parseInt(filters.maxPrice);
    if (searchQuery) filterParams.search = searchQuery;
    
    await getServices(filterParams);
  };

  const handlePageChange = (newPage: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const filterParams: ServiceFilters = {
      ...filters,
      page: newPage,
      limit: 12,
      minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
    };
    // Remove string minPrice/maxPrice to avoid type error
    delete (filterParams).minPrice;
    delete (filterParams).maxPrice;
    if (filters.minPrice) filterParams.minPrice = parseInt(filters.minPrice);
    if (filters.maxPrice) filterParams.maxPrice = parseInt(filters.maxPrice);
    getServices(filterParams);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchQuery('');
  };

  return (
    <>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Services</h1>
          <p className="text-gray-600">Find trusted professionals for all your needs</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, skills, or professionals..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="lg:hidden mb-6 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="Enter location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    placeholder="Min"
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    placeholder="Max"
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as 'createdAt' | 'price' | 'rating' | 'newest' | 'oldest' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price">Price: Low to High</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="w-full text-center text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-80">
            <CategorySidebar onCategorySelect={() => {}} />
            
            {/* Additional Filters */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-4">Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    placeholder="Enter location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (₦)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      placeholder="Min"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      placeholder="Max"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as 'createdAt' | 'price' | 'rating' | 'newest' | 'oldest' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="createdAt">Newest First</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                  </select>
                </div>

                {(filters.category || filters.location || filters.minPrice || filters.maxPrice) && (
                  <button
                    onClick={clearFilters}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {services.length} of {pagination?.total || 0} services
            </div>

            {/* Loading State */}
            {loadingServices && services.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                <p className="text-gray-500">Loading services...</p>
              </div>
            ) : (
              <>
                {/* Services Grid */}
                {services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                      <ServiceCard key={service._id} service={service} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No services found</p>
                    <p className="text-sm text-gray-400">Try adjusting your filters or search criteria</p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}

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
            )}
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
}