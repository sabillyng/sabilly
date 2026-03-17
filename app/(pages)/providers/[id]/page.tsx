"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useService } from '../../../context/ServiceContext';
import { useUser } from '../../../context/UserContext';
import { Navbar } from '../../../components/Home/Navbar';
import { ServiceCard } from '../../../components/services/ServiceCard';
import { 
  StarIcon, 
  MapPinIcon, 
  PhoneIcon,
  EnvelopeIcon,
  CheckBadgeIcon,
  BriefcaseIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { Provider, Service } from '../../../types/service';

interface Review {
  _id: string;
  user: {
    fullName: string;
    avatar?: string;
  };
  rating: number;
  reviewText: string;
  createdAt: string;
}

export default function ProviderProfilePage() {
  const { id } = useParams();
  const { getProviderById, addToFavourites, removeFromFavourites, isFavourite, services, getServices } = useService();
  const { user } = useUser();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'about'>('services');
  const [providerServices, setProviderServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favouriteLoading, setFavouriteLoading] = useState(false);

  // Fetch provider data
  useEffect(() => {
    let isMounted = true;

    const fetchProvider = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await getProviderById(id as string);
        if (isMounted) {
          setProvider(data);
          
          // Fetch provider's services after getting provider
          if (data) {
            await getServices({ provider: id as string });
          }
        }
      } catch (error) {
        console.error('Error fetching provider:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProvider();

    return () => {
      isMounted = false;
    };
  }, [id]); // Only depend on id, not on functions

  // Update provider services when services change
  useEffect(() => {
    if (provider && services.length > 0) {
      const filtered = services.filter(s => 
        typeof s.provider === 'object' 
          ? s.provider._id === provider._id 
          : s.provider === provider._id
      );
      setProviderServices(filtered);
    }
  }, [services, provider]);

  // Mock reviews for demonstration
  const mockReviews = [
    {
      _id: '1',
      user: { fullName: 'John Doe', avatar: '' },
      rating: 5,
      reviewText: 'Excellent work! Very professional and completed the job on time.',
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      user: { fullName: 'Jane Smith', avatar: '' },
      rating: 4,
      reviewText: 'Good quality work. Would recommend.',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const handleFavourite = async () => {
    if (!user) {
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    
    if (favouriteLoading) return;
    
    setFavouriteLoading(true);
    try {
      if (isFavourite(id as string)) {
        await removeFromFavourites(id as string);
      } else {
        await addToFavourites(id as string);
      }
    } catch (error) {
      console.error('Error toggling favourite:', error);
    } finally {
      setFavouriteLoading(false);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </>
    );
  }

  if (!provider) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <UserCircleIcon className="h-24 w-24 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider Not Found</h2>
          <p className="text-gray-600 mb-4">The provider you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link
            href="/providers"
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Browse Other Providers
          </Link>
        </div>
      </>
    );
  }

  const yearsInBusiness = provider.createdAt 
    ? Math.floor((new Date().getTime() - new Date(provider.createdAt).getTime()) / (365 * 24 * 60 * 60 * 1000))
    : 2;

  const isFav = isFavourite(id as string);

  return (
    <>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Cover image with role-based gradient */}
        <div className={`h-48 rounded-t-lg ${
          provider.role === 'artisan' 
            ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600'
        } relative`}>
          {/* Role badge */}
          <div className="absolute top-4 right-4 md:top-auto md:bottom-4 md:right-4">
            <span className={`px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg ${
              provider.role === 'artisan' ? 'bg-orange-700' : 'bg-blue-700'
            }`}>
              {provider.role === 'artisan' ? 'PROFESSIONAL ARTISAN' : 'REGISTERED BUSINESS'}
            </span>
          </div>
        </div>

        {/* Profile header */}
        <div className="bg-white rounded-b-lg border border-gray-200 p-6 mb-8 relative">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar with null check */}
              <div className="relative -mt-20">
                <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                  {provider.avatar ? (
                    <Image
                      src={provider.avatar}
                      alt={provider.fullName || 'Provider avatar'}
                      width={128}
                      height={128}
                      className="object-cover"
                      onError={(e) => {
                        // If image fails to load, hide it
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className={`h-full w-full flex items-center justify-center text-4xl font-bold text-white ${
                      provider.role === 'artisan' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {getInitials(provider.fullName || '')}
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-3xl font-bold">{provider.fullName || 'Unknown Provider'}</h1>
                  {provider.kycVerified && (
                    <CheckBadgeIcon className="h-6 w-6 text-blue-500" title="Verified Professional" />
                  )}
                </div>
                
                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-5 w-5 ${
                          (provider.rating || 0) >= star
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold ml-2">
                    {provider.rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    ({provider.totalReviews || 0} reviews)
                  </span>
                </div>

                {/* Location and stats */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {provider.location && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span>{provider.location}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>{yearsInBusiness} year{yearsInBusiness !== 1 ? 's' : ''} in business</span>
                  </div>
                  <div className="flex items-center">
                    <BriefcaseIcon className="h-4 w-4 mr-1" />
                    <span>{providerServices.length || 0} service{providerServices.length !== 1 ? 's' : ''} offered</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button
                onClick={handleFavourite}
                disabled={favouriteLoading}
                className={`p-3 rounded-lg border transition-all ${
                  isFav
                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                } ${favouriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isFav ? (
                  <HeartSolid className="h-5 w-5" />
                ) : (
                  <HeartOutline className="h-5 w-5" />
                )}
              </button>
              
              <Link
                href={`/messages/new?provider=${id}`}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                Contact
              </Link>
              
              {user?.role === 'customer' && (
                <Link
                  href={`/post-job?provider=${id}`}
                  className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Hire Now
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('services')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'services'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Services ({providerServices.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reviews'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reviews ({provider.totalReviews || 0})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'about'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              About
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'services' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Services Offered</h2>
                {providerServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {providerServices.map((service) => (
                      <ServiceCard key={service._id} service={service} showProvider={false} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No services listed yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
                {mockReviews.length > 0 ? (
                  <div className="space-y-4">
                    {mockReviews.map((review) => (
                      <div key={review._id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                              {review.user.avatar ? (
                                <Image
                                  src={review.user.avatar}
                                  alt={review.user.fullName}
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                              ) : (
                                <span className="font-bold text-gray-600">
                                  {getInitials(review.user.fullName)}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{review.user.fullName}</p>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <StarIcon
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.reviewText}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet.</p>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                {/* Bio */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">About</h3>
                  <p className="text-gray-700">{provider.bio || 'No bio provided.'}</p>
                </div>

                {/* Skills/Expertise */}
                {provider.skills && provider.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {provider.skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Business Hours (for businesses) */}
                {provider.role === 'business_owner' && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Business Hours</h3>
                    <p className="text-gray-700">Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p className="text-gray-700">Saturday: 9:00 AM - 4:00 PM</p>
                    <p className="text-gray-700">Sunday: Closed</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Contact Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                {/* Phone */}
                {provider.phone && (
                  <div className="flex items-start space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <a href={`tel:${provider.phone}`} className="font-medium hover:text-emerald-600">
                        {provider.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {provider.email && (
                  <div className="flex items-start space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a href={`mailto:${provider.email}`} className="font-medium hover:text-emerald-600">
                        {provider.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Location */}
                {provider.location && (
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{provider.location}</p>
                    </div>
                  </div>
                )}

                {/* Member since */}
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">
                      {provider.createdAt 
                        ? new Date(provider.createdAt).toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          })
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium mb-3">Verification</h4>
                <div className="space-y-2">
                  {provider.kycVerified && (
                    <div className="flex items-center text-green-600">
                      <CheckBadgeIcon className="h-5 w-5 mr-2" />
                      <span className="text-sm">Identity Verified</span>
                    </div>
                  )}
                  {yearsInBusiness >= 2 && (
                    <div className="flex items-center text-blue-600">
                      <BriefcaseIcon className="h-5 w-5 mr-2" />
                      <span className="text-sm">Experienced Professional</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 space-y-3">
                <Link
                  href={`/post-job?provider=${id}`}
                  className="block w-full text-center bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                >
                  Request Service
                </Link>
                <Link
                  href={`/messages/new?provider=${id}`}
                  className="block w-full text-center border border-emerald-600 text-emerald-600 py-3 rounded-lg hover:bg-emerald-50 font-medium transition-colors"
                >
                  Send Message
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}