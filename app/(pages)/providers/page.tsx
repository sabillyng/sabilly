"use client";
import { useEffect, useState } from 'react';
import { Navbar } from '../../components/Home/Navbar';
import { ProviderCard } from '../../components/providers/ProviderCard';
import { useService } from '../../context/ServiceContext';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  WrenchIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Provider } from '../../types/service';

export default function ProvidersPage() {
  const { providers, getProviders, loadingProvider } = useService();
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'artisan' | 'business_owner'>('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);

  // Categories based on skills
  const categories = [
    'Plumbing',
    'Electrical',
    'Painting',
    'Carpentry',
    'Cleaning',
    'Moving',
    'IT Services',
    'Photography',
    'Beauty',
    'Home Repairs',
    'Construction',
    'Business Services'
  ];

  useEffect(() => {
    getProviders();
  }, []);

  useEffect(() => {
    if (providers.length > 0) {
      filterAndSortProviders();
    }
  }, [providers, searchQuery, selectedRole, selectedCategory, sortBy]);

  const filterAndSortProviders = () => {
    let filtered = [...providers];

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(p => p.role === selectedRole);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.fullName.toLowerCase().includes(query) ||
        p.bio?.toLowerCase().includes(query) ||
        p.skills?.some((skill: string) => skill.toLowerCase().includes(query))
      );
    }

    // Filter by category/skill
    if (selectedCategory) {
      filtered = filtered.filter(p => 
        p.skills?.some((skill: string) => 
          skill.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      );
    }

    // Sort providers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'reviews':
          return (b.totalReviews || 0) - (a.totalReviews || 0);
        case 'name':
          return a.fullName.localeCompare(b.fullName);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredProviders(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
    setSelectedCategory('');
    setSortBy('rating');
  };

  // Calculate stats
  const totalArtisans = providers.filter(p => p.role === 'artisan').length;
  const totalBusinesses = providers.filter(p => p.role === 'business_owner').length;
  const avgRating = providers.reduce((acc, p) => acc + (p.rating || 0), 0) / providers.length || 0;

  return (
    <>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Professionals</h1>
          <p className="text-gray-600">Connect with trusted artisans and businesses near you</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-100">
            <UserGroupIcon className="h-6 w-6 text-emerald-600 mb-2" />
            <p className="text-2xl font-bold text-emerald-600">{providers.length}</p>
            <p className="text-sm text-gray-600">Total Professionals</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-100">
            <WrenchIcon className="h-6 w-6 text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-orange-600">{totalArtisans}</p>
            <p className="text-sm text-gray-600">Artisans</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <BuildingStorefrontIcon className="h-6 w-6 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-600">{totalBusinesses}</p>
            <p className="text-sm text-gray-600">Businesses</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
            <StarIcon className="h-6 w-6 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-600">{avgRating.toFixed(1)}</p>
            <p className="text-sm text-gray-600">Avg. Rating</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, skill, or business..."
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
              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedRole('all')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedRole === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedRole('artisan')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedRole === 'artisan'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Artisans
                  </button>
                  <button
                    onClick={() => setSelectedRole('business_owner')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedRole === 'business_owner'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Businesses
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="name">Name</option>
                  <option value="newest">Newest</option>
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

        {/* Desktop Filters Bar */}
        <div className="hidden lg:flex items-center justify-between mb-6 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Role Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show:</span>
              <button
                onClick={() => setSelectedRole('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedRole === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedRole('artisan')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedRole === 'artisan'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Artisans
              </button>
              <button
                onClick={() => setSelectedRole('business_owner')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedRole === 'business_owner'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Businesses
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="name">Name</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedRole !== 'all' || selectedCategory || sortBy !== 'rating') && (
            <button
              onClick={clearFilters}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredProviders.length} of {providers.length} professionals
        </div>

        {/* Loading State */}
        {loadingProvider && providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-gray-500">Loading professionals...</p>
          </div>
        ) : (
          <>
            {/* Providers Grid */}
            {filteredProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProviders.map((provider) => (
                  <ProviderCard key={provider._id} provider={provider} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No professionals found</p>
                <p className="text-sm text-gray-400">Try adjusting your filters or search criteria</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}

        {/* Verified Badge Legend */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Verification Badges</h3>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Verified ID - KYC verified professional</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-600 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">3+ Years - Experienced professional</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Top Rated - Rating 4.5+</span>
            </div>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const count = providers.filter(p => 
                p.skills?.some((s: string) => s.toLowerCase().includes(category.toLowerCase()))
              ).length;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:shadow-md transition-all text-left"
                >
                  <h3 className="font-medium text-gray-900">{category}</h3>
                  <p className="text-sm text-gray-500">{count} professionals</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Rated Section */}
        {providers.filter(p => (p.rating || 0) >= 4.5).length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6">Top Rated Professionals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {providers
                .filter(p => (p.rating || 0) >= 4.5)
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 4)
                .map((provider) => (
                  <ProviderCard key={provider._id} provider={provider} />
                ))}
            </div>
          </div>
        )}

        {/* Recently Joined */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Recently Joined</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {providers
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 4)
              .map((provider) => (
                <ProviderCard key={provider._id} provider={provider} />
              ))}
          </div>
        </div>
      </main>
    </>
  );
}