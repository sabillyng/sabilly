"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useService } from '../../../context/ServiceContext';
import { useUser } from '../../../context/UserContext';
import { Navbar } from '../../../components/Home/Navbar';
import { AuthPopup } from '../../../components/auth/AuthPopup';
import { 
  StarIcon, 
  MapPinIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  HeartIcon as HeartOutline,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckBadgeIcon,
  WrenchIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { ServiceCard } from '../../../components/services/ServiceCard';
import { Service } from '../../../types/service';

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

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentService, getServiceById, loading, addToFavourites, removeFromFavourites, isFavourite } = useService();
  const { user } = useUser();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarServices, setSimilarServices] = useState<Service[]>([]);

  useEffect(() => {
    if (id) {
      loadServiceDetails();
    }
  }, [id]);

  useEffect(() => {
    if (currentService) {
      // Load mock reviews (replace with actual API call)
      loadMockReviews();
      // Load similar services based on category
      loadSimilarServices();
    }
  }, [currentService]);

  const loadServiceDetails = async () => {
    await getServiceById(id as string);
  };

  const loadMockReviews = () => {
    const mockReviews: Review[] = [
      {
        _id: '1',
        user: { fullName: 'John Adeleke' },
        rating: 5,
        reviewText: 'Excellent work! Very professional and completed the job on time. Highly recommended!',
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        user: { fullName: 'Sarah Okafor' },
        rating: 4,
        reviewText: 'Good quality work. Would recommend.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '3',
        user: { fullName: 'Michael Obi' },
        rating: 5,
        reviewText: 'Very skilled and professional. Will hire again.',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    setReviews(mockReviews);
  };

  const loadSimilarServices = async () => {
    // This would be replaced with actual API call
    // await getServices({ category: currentService?.category, limit: 4 });
  };

  const handleFavourite = async () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthPopup(true);
      return;
    }

    if (!currentService?.provider) return;

    const providerId = typeof currentService.provider === 'string' 
      ? currentService.provider 
      : currentService.provider._id;

    if (isFavourite(providerId)) {
      await removeFromFavourites(providerId);
    } else {
      await addToFavourites(providerId);
    }
  };

  const handleContact = () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthPopup(true);
      return;
    }
    setShowContactInfo(true);
  };

  const handleApply = () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthPopup(true);
      return;
    }
    router.push(`/apply/${id}`);
  };

  if (loading || !currentService) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </>
    );
  }

  const provider = typeof currentService.provider === 'object' ? currentService.provider : null;
  const providerId = provider?._id || '';
  const isFav = providerId ? isFavourite(providerId) : false;
  const yearsOnPlatform = provider?.createdAt 
    ? Math.floor((new Date().getTime() - new Date(provider.createdAt).getTime()) / (365 * 24 * 60 * 60 * 1000))
    : 0;

  const averageRating = currentService.rating || 4.5;
  const totalReviews = currentService.totalReviews || reviews.length;

  return (
    <>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-emerald-600 mb-6 transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Images and Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              {/* Main image */}
              <div className="relative h-96 w-full mb-4 bg-gray-100 rounded-lg overflow-hidden">
                {currentService.images && currentService.images.length > 0 ? (
                  <Image
                    src={currentService.images[selectedImage]}
                    alt={currentService.title}
                    fill
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <WrenchIcon className="h-16 w-16 mb-2" />
                    <span>No image available</span>
                  </div>
                )}

                {/* Image navigation arrows */}
                {currentService.images && currentService.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(prev => (prev === 0 ? currentService.images!.length - 1 : prev - 1))}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage(prev => (prev === currentService.images!.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail images */}
              {currentService.images && currentService.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {currentService.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 w-20 flex shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-emerald-600 scale-105' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Service Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold">{currentService.title}</h1>
                <button
                  onClick={handleFavourite}
                  className={`p-2 rounded-full transition-colors ${
                    isFav ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {isFav ? (
                    <HeartSolid className="h-6 w-6" />
                  ) : (
                    <HeartOutline className="h-6 w-6" />
                  )}
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold ml-2">{averageRating.toFixed(1)}</span>
                <span className="text-sm text-gray-500 ml-1">({totalReviews} reviews)</span>
              </div>

              {/* Price */}
              {currentService.priceRange && (
                <div className="mb-4">
                  <span className="text-2xl font-bold text-emerald-600">
                    {currentService.priceRange.string}
                  </span>
                </div>
              )}

              {/* Category & Location */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="font-medium">{currentService.category}</p>
                </div>
                {currentService.location && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="font-medium flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {currentService.location}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {currentService.description || 'No description provided.'}
                </p>
              </div>

              {/* Posted Date */}
              <div className="flex items-center text-sm text-gray-500">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>Posted {new Date(currentService.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Customer Reviews ({totalReviews})</h2>
              
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserCircleIcon className="h-6 w-6 text-gray-500" />
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
                      <p className="text-gray-700 ml-13">{review.reviewText}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews yet</p>
              )}
            </div>
          </div>

          {/* Right column - Provider Info & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              {/* Provider Info */}
              {provider ? (
                <div className="mb-6">
                  <h3 className="font-semibold mb-4">Service Provider</h3>
                  
                  <Link href={`/providers/${provider._id}`} className="flex items-center space-x-3 mb-4 hover:bg-gray-50 p-2 rounded-lg transition">
                    <div className="h-14 w-14 from-emerald-100 to-green-100 rounded-full flex items-center justify-center">
                      {provider.avatar ? (
                        <Image
                          src={provider.avatar}
                          alt={provider.fullName}
                          width={56}
                          height={56}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-xl font-bold text-emerald-600">
                          {provider.fullName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium hover:text-emerald-600">{provider.fullName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {provider.kycVerified && (
                          <span className="flex items-center text-xs text-blue-600">
                            <CheckBadgeIcon className="h-4 w-4 mr-1" />
                            Verified
                          </span>
                        )}
                        {yearsOnPlatform >= 2 && (
                          <span className="flex items-center text-xs text-emerald-600">
                            <ShieldCheckIcon className="h-4 w-4 mr-1" />
                            {yearsOnPlatform}+ yrs
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Provider Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <p className="text-lg font-semibold text-emerald-600">{provider.rating?.toFixed(1) || '0.0'}</p>
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <p className="text-lg font-semibold text-emerald-600">{provider.totalReviews || 0}</p>
                      <p className="text-xs text-gray-500">Reviews</p>
                    </div>
                  </div>

                  {/* Skills */}
                  {provider.skills && provider.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {provider.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{provider.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6 text-center py-4">
                  <UserCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Provider information unavailable</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleContact}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors"
                >
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  {showContactInfo && provider?.phone ? provider.phone : 'Show Contact'}
                </button>

                {showContactInfo && provider?.phone && (
                  <a
                    href={`tel:${provider.phone}`}
                    className="block w-full text-center bg-emerald-50 text-emerald-700 py-2 rounded-lg text-sm hover:bg-emerald-100 transition-colors"
                  >
                    Call Now
                  </a>
                )}

                <button
                  onClick={handleContact}
                  className="w-full border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 py-3 rounded-lg font-medium flex items-center justify-center transition-colors"
                >
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  Send Message
                </button>

                {user && user.role === 'customer' && (
                  <button
                    onClick={handleApply}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Apply for Service
                  </button>
                )}

                <button
                  onClick={() => {
                    navigator.share?.({
                      title: currentService.title,
                      text: currentService.description,
                      url: window.location.href
                    }).catch(() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    });
                  }}
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-medium flex items-center justify-center transition-colors"
                >
                  <ShareIcon className="h-5 w-5 mr-2" />
                  Share
                </button>
              </div>

              {/* Safety Tips */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-sm mb-2">Safety Tips</h4>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li className="flex items-start">
                    <ShieldCheckIcon className="h-4 w-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Meet in a safe, public place</span>
                  </li>
                  <li className="flex items-start">
                    <ShieldCheckIcon className="h-4 w-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Don&apos;t pay before service is completed</span>
                  </li>
                  <li className="flex items-start">
                    <ShieldCheckIcon className="h-4 w-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Check reviews and ratings before hiring</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Services */}
        {similarServices.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarServices.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          </div>
        )}
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