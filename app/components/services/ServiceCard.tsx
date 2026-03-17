"use client";
import { Service } from '../../types/service';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { 
  StarIcon, 
  MapPinIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  UserCircleIcon,
  CheckBadgeIcon
} from '@heroicons/react/20/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useService } from '../../context/ServiceContext';
import { useUser } from '../../context/UserContext';

interface ServiceCardProps {
  service: Service;
  featured?: boolean;
  showProvider?: boolean;
}

export function ServiceCard({ service, featured = false, showProvider = true }: ServiceCardProps) {
  const { addToFavourites, removeFromFavourites, isFavourite } = useService();
  const { user } = useUser();
  const [isFav, setIsFav] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Get provider details - handle both populated and unpopulated cases
  const provider = typeof service.provider === 'object' ? service.provider : null;
  const providerId = typeof service.provider === 'string' ? service.provider : provider?._id;
  
  // Calculate years on platform if provider exists
  const yearsOnPlatform = provider?.createdAt 
    ? Math.floor((new Date().getTime() - new Date(provider.createdAt).getTime()) / (365 * 24 * 60 * 60 * 1000))
    : 0;

  // Check if service is in favourites
  useEffect(() => {
    if (providerId) {
      setIsFav(isFavourite(providerId));
    }
  }, [providerId, isFavourite]);

  const handleFavouriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to service detail
    e.stopPropagation();
    
    if (!user) {
      // Redirect to login or show modal
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    if (!providerId) return;

    try {
      if (isFav) {
        await removeFromFavourites(providerId);
        setIsFav(false);
      } else {
        await addToFavourites(providerId);
        setIsFav(true);
      }
    } catch (error) {
      console.error('Error toggling favourite:', error);
    }
  };

  // Format price range display
  const formatPriceRange = (priceRange?: { string: string }) => {
    if (!priceRange?.string) return null;
    
    // Check if it's a range format (e.g., "₦5,000 - ₦10,000")
    if (priceRange.string.includes('-')) {
      return priceRange.string;
    }
    
    // Handle single price
    return `From ${priceRange.string}`;
  };

  // Get first image or placeholder
  const displayImage = service.images && service.images.length > 0 && !imageError
    ? service.images[0]
    : '/images/placeholder-service.jpg';

  // Get service category icon based on category name
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      plumbing: '🔧',
      electrical: '⚡',
      painting: '🎨',
      carpentry: '🪚',
      cleaning: '🧹',
      moving: '🚚',
      'it-services': '💻',
      photography: '📸',
      beauty: '💇',
      'home-repairs': '🏠',
      construction: '🏗️',
      business: '💼',
    };
    
    const categoryLower = category.toLowerCase();
    return icons[categoryLower] || '🛠️';
  };

  return (
    <Link href={`/services/${service._id}`} className="block group">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
          {!imageError && service.images && service.images.length > 0 ? (
            <Image
              src={displayImage}
              alt={service.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              priority={featured}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <span className="text-6xl mb-2">{getCategoryIcon(service.category)}</span>
              <span className="text-sm">No image available</span>
            </div>
          )}

          {/* Verification Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {provider?.kycVerified && (
              <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center shadow-md">
                <CheckBadgeIcon className="h-3 w-3 mr-1" />
                Verified ID
              </div>
            )}
            {yearsOnPlatform >= 3 && (
              <div className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full flex items-center shadow-md">
                <ShieldCheckIcon className="h-3 w-3 mr-1" />
                {yearsOnPlatform}+ Years
              </div>
            )}
          </div>

          {/* Favourite Button */}
          {providerId && showProvider && (
            <button
              onClick={handleFavouriteToggle}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all z-10"
              aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
            >
              {isFav ? (
                <HeartSolid className="h-5 w-5 text-red-500" />
              ) : (
                <HeartOutline className="h-5 w-5 text-gray-600" />
              )}
            </button>
          )}

          {/* Category Tag */}
          <div className="absolute bottom-2 left-2">
            <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              {service.category}
            </span>
          </div>

          {/* Featured Badge */}
          {featured && (
            <div className="absolute bottom-2 right-2">
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {service.title}
          </h3>

          {/* Description */}
          {service.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {service.description}
            </p>
          )}

          {/* Rating */}
          {service.rating && service.rating > 0 ? (
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(service.rating!)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                {service.rating.toFixed(1)} ({service.totalReviews || 0})
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-2">No ratings yet</p>
          )}

          {/* Provider Info */}
          {provider && showProvider && (
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-6 w-6 bg-emerald-100 rounded-full flex items-center justify-center">
                {provider.avatar ? (
                  <Image
                    src={provider.avatar}
                    alt={provider.fullName}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="h-5 w-5 text-emerald-600" />
                )}
              </div>
              <span className="text-sm text-gray-700 hover:text-emerald-600">
                {provider.fullName}
              </span>
              {provider.role === 'business_owner' && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 rounded-full">
                  Business
                </span>
              )}
            </div>
          )}

          {/* Location and Date */}
          <div className="flex items-center text-sm text-gray-500 space-x-2 mb-2">
            {service.location && (
              <>
                <MapPinIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{service.location}</span>
              </>
            )}
            <span className="shrink-0">•</span>
            <ClockIcon className="h-4 w-4 shrink-0" />
            <span className="text-xs whitespace-nowrap">
              {new Date(service.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>

          {/* Price */}
          {service.priceRange && (
            <div className="text-xl font-bold text-emerald-600">
              {formatPriceRange(service.priceRange)}
            </div>
          )}

          {/* Skills/Tags if available */}
          {provider?.skills && provider.skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {provider.skills.slice(0, 2).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                >
                  {skill}
                </span>
              ))}
              {provider.skills.length > 2 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{provider.skills.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}