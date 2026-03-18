"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from './components/Home/Navbar';
import { CategorySidebar } from './components/Home/CategorySidebar';
import { ProviderCard } from './components/providers/ProviderCard';
import { ServiceCard } from './components/services/ServiceCard';
import { useService } from './context/ServiceContext';
import { useUser } from './context/UserContext';
import { 
  MagnifyingGlassIcon,
  WrenchIcon,
  BuildingStorefrontIcon,
  StarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { Provider, Service } from './types/service';
import { AuthPopup } from './components/auth/AuthPopup';

export default function HomePage() {
  const { 
    providers, 
    getProviders, 
    loadingProviders, // Fixed: changed from loadingProvider to loadingProviders
    services, 
    getServices, 
    loadingServices,
    getFavourites,
    getTopRatedProviders // Added this if you want to use the dedicated endpoint
  } = useService();
  
  const { user } = useUser();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [topRatedProviders, setTopRatedProviders] = useState<Provider[]>([]);
  const [recentServices, setRecentServices] = useState<Service[]>([]);
  const [stats, setStats] = useState({
    totalArtisans: 0,
    totalBusinesses: 0,
    totalServices: 0,
    verifiedProfessionals: 0
  });

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Load data on component mount
  useEffect(() => {
    const loadHomeData = async () => {
      // Get all providers (artisans and business owners)
      await getProviders();
      
      // Get recent services
      await getServices({ limit: 8, sortBy: 'createdAt', sortOrder: 'desc' });
      
      // Get top rated providers using the dedicated endpoint (optional)
      // const topRated = await getTopRatedProviders(4);
      // setTopRatedProviders(topRated);
      
      // Get user's favourites if logged in
      if (user) {
        await getFavourites();
      }
    };
    
    loadHomeData();
  }, [user, getProviders, getServices, getFavourites, getTopRatedProviders]);

  // Process provider data when it changes
  useEffect(() => {
    if (providers.length > 0) {
      // Filter top-rated providers (rating >= 4.5)
      const topRated = providers
        .filter(p => (p.rating || 0) >= 4.5)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4);
      
      setTopRatedProviders(topRated);

      // Calculate stats
      const artisans = providers.filter(p => p.role === 'artisan').length;
      const businesses = providers.filter(p => p.role === 'business_owner').length;
      const verified = providers.filter(p => p.kycVerified).length;

      // Calculate total services from providers
      const totalServicesCount = providers.reduce((acc, p) => {
        // Check if provider has services array (from populated data)
        if (p.services && Array.isArray(p.services)) {
          return acc + p.services.length;
        }
        // Check if provider has stats with totalServices
        if (p.stats && p.stats.totalServices) {
          return acc + p.stats.totalServices;
        }
        return acc;
      }, 0);

      setStats({
        totalArtisans: artisans,
        totalBusinesses: businesses,
        totalServices: totalServicesCount,
        verifiedProfessionals: verified
      });
    }
  }, [providers]);

  // Process services data when it changes
  useEffect(() => {
    if (services.length > 0) {
      setRecentServices(services.slice(0, 6));
    }
  }, [services]);

  const openAuthPopup = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthPopup(true);
    setShowUserMenu(false);
  };

  // Get popular categories with real counts
  const popularCategories = [
    { 
      name: 'Plumbing', 
      icon: '🔧', 
      count: providers.filter(p => p.skills?.some(s => s.toLowerCase().includes('plumbing'))).length,
      slug: 'plumbing',
      color: 'bg-blue-100'
    },
    { 
      name: 'Electrical', 
      icon: '⚡', 
      count: providers.filter(p => p.skills?.some(s => s.toLowerCase().includes('electrical'))).length,
      slug: 'electrical',
      color: 'bg-yellow-100'
    },
    { 
      name: 'Painting', 
      icon: '🎨', 
      count: providers.filter(p => p.skills?.some(s => s.toLowerCase().includes('painting'))).length,
      slug: 'painting',
      color: 'bg-purple-100'
    },
    { 
      name: 'Carpentry', 
      icon: '🪚', 
      count: providers.filter(p => p.skills?.some(s => s.toLowerCase().includes('carpentry'))).length,
      slug: 'carpentry',
      color: 'bg-amber-100'
    },
    { 
      name: 'Cleaning', 
      icon: '🧹', 
      count: providers.filter(p => p.skills?.some(s => s.toLowerCase().includes('cleaning'))).length,
      slug: 'cleaning',
      color: 'bg-green-100'
    },
    { 
      name: 'Moving', 
      icon: '🚚', 
      count: providers.filter(p => p.skills?.some(s => s.toLowerCase().includes('moving'))).length,
      slug: 'moving',
      color: 'bg-orange-100'
    },
    { 
      name: 'IT Services', 
      icon: '💻', 
      count: providers.filter(p => p.skills?.some(s => s.toLowerCase().includes('it') || s.toLowerCase().includes('computer'))).length,
      slug: 'it-services',
      color: 'bg-indigo-100'
    },
    { 
      name: 'Photography', 
      icon: '📸', 
      count: providers.filter(p => p.skills?.some(s => s.toLowerCase().includes('photo'))).length,
      slug: 'photography',
      color: 'bg-pink-100'
    },
  ];

  // Loading state - use the correct property names
  const isLoading = loadingProviders || loadingServices;

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Call to Action for Different User Types */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
            <div className="flex items-start justify-between">
              <div>
                <WrenchIcon className="h-12 w-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Are you an Artisan or Business Owner?</h3>
                <p className="text-gray-700 mb-4">List your services and connect with customers today</p>
                <button
                  onClick={() => openAuthPopup('register')}
                  className="cursor-pointer inline-flex items-center bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Join as Professional
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </button>
              </div>
              <div className="text-6xl opacity-20">👨‍🔧</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
            <div className="flex items-start justify-between">
              <div>
                <BuildingStorefrontIcon className="h-12 w-12 text-emerald-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Need a Service?</h3>
                <p className="text-gray-700 mb-4">Find trusted professionals near you</p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/services"
                    className="inline-flex items-center bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Find Services
                  </Link>
                  <Link
                    href="/providers"
                    className="inline-flex items-center bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Find Providers
                  </Link>
                </div>
              </div>
              <div className="text-6xl opacity-20">🏠</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={`lg:w-80 ${showMobileMenu ? 'block' : 'hidden lg:block'}`}>
            <CategorySidebar onCategorySelect={() => setShowMobileMenu(false)} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden w-full mb-4 bg-emerald-600 text-white py-2 rounded-lg flex items-center justify-center"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Browse Service Categories
            </button>

            {/* Loading State */}
            {isLoading && providers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                <p className="text-gray-500">Loading professionals...</p>
              </div>
            ) : (
              <>
                {/* Top Rated Professionals */}
                {topRatedProviders.length > 0 && (
                  <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <SparklesIcon className="h-6 w-6 text-yellow-500" />
                        <h2 className="text-2xl font-bold">Top Rated Professionals</h2>
                      </div>
                      <Link 
                        href="/providers?filter=top-rated"
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
                      >
                        View All
                        <ArrowRightIcon className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {topRatedProviders.map((provider) => (
                        <ProviderCard key={provider._id} provider={provider} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Popular Categories */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-6">Popular Service Categories</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {popularCategories.map((category) => (
                      <Link
                        key={category.name}
                        href={`/category/${category.slug}`}
                        className={`${category.color} p-4 rounded-lg hover:shadow-md transition-shadow text-center group`}
                      >
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                          {category.icon}
                        </div>
                        <h3 className="font-semibold text-gray-800">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.count} professionals</p>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* Recent Services */}
                {recentServices.length > 0 && (
                  <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <FireIcon className="h-6 w-6 text-orange-500" />
                        <h2 className="text-2xl font-bold">Recent Services</h2>
                      </div>
                      <Link 
                        href="/services"
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
                      >
                        View All
                        <ArrowRightIcon className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recentServices.map((service) => (
                        <ServiceCard key={service._id} service={service} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Why Choose Sabilly */}
                <section className="mt-12 bg-gray-50 p-8 rounded-xl">
                  <h2 className="text-2xl font-bold mb-8 text-center">Why Choose Sabilly?</h2>
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheckIcon className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Verified Professionals</h3>
                      <p className="text-sm text-gray-600">All artisans and businesses are KYC verified with valid IDs</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <StarIcon className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Genuine Reviews</h3>
                      <p className="text-sm text-gray-600">Real feedback from real customers to help you choose</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BuildingStorefrontIcon className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Local Experts</h3>
                      <p className="text-sm text-gray-600">Find professionals in your area for quick service</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-600">{stats.totalArtisans}+</p>
                      <p className="text-sm text-gray-600">Artisans</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-600">{stats.totalBusinesses}+</p>
                      <p className="text-sm text-gray-600">Businesses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-600">{stats.totalServices}+</p>
                      <p className="text-sm text-gray-600">Services</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-600">{stats.verifiedProfessionals}+</p>
                      <p className="text-sm text-gray-600">Verified</p>
                    </div>
                  </div>
                </section>

                {/* Testimonials Section */}
                <section className="mt-12">
                  <h2 className="text-2xl font-bold mb-6 text-center">What Our Users Say</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      {
                        name: "John Adeleke",
                        role: "Customer",
                        content: "Found an amazing plumber through Sabilly. Quick response and quality work!",
                        rating: 5
                      },
                      {
                        name: "Mrs. Obi",
                        role: "Business Owner",
                        content: "Sabilly helped me grow my cleaning business. Now I have steady clients!",
                        rating: 5
                      },
                      {
                        name: "Emeka Nwosu",
                        role: "Artisan",
                        content: "Best platform for artisans to connect with genuine customers.",
                        rating: 5
                      }
                    ].map((testimonial, index) => (
                      <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-3">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <p className="text-gray-700 mb-4">&quot;{testimonial.content}&quot;</p>
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                            <span className="font-bold text-emerald-600">{testimonial.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium">{testimonial.name}</p>
                            <p className="text-sm text-gray-500">{testimonial.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </main>
      
      {/* Auth Popup */}
      <AuthPopup 
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        initialMode={authMode}
      />
    </>
  );
}