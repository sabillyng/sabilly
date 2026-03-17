"use client";
import { Provider } from '../../types/service';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { 
  StarIcon, 
  MapPinIcon, 
  WrenchIcon,
  BriefcaseIcon,
  CheckBadgeIcon
} from '@heroicons/react/20/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useService } from '../../context/ServiceContext';
import { useUser } from '../../context/UserContext';

interface ProviderCardProps {
  provider: Provider;
  isFavourite?: boolean;
  onFavouriteToggle?: () => void;
  showFavouriteButton?: boolean;
}

export function ProviderCard({ 
  provider, 
  isFavourite: externalIsFavourite, 
  onFavouriteToggle,
  showFavouriteButton = true 
}: ProviderCardProps) {
  const { addToFavourites, removeFromFavourites, isFavourite: checkIsFavourite } = useService();
  const { user } = useUser();
  const [isFav, setIsFav] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Check if provider is in favourites
  useEffect(() => {
    if (externalIsFavourite !== undefined) {
      setIsFav(externalIsFavourite);
    } else if (provider._id) {
      setIsFav(checkIsFavourite(provider._id));
    }
  }, [provider._id, externalIsFavourite, checkIsFavourite]);

  const yearsInBusiness = provider.createdAt 
    ? Math.floor((new Date().getTime() - new Date(provider.createdAt).getTime()) / (365 * 24 * 60 * 60 * 1000))
    : 2;

  const handleFavouriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to login or show auth popup
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    if (onFavouriteToggle) {
      onFavouriteToggle();
    } else {
      try {
        if (isFav) {
          await removeFromFavourites(provider._id);
          setIsFav(false);
        } else {
          await addToFavourites(provider._id);
          setIsFav(true);
        }
      } catch (error) {
        console.error('Error toggling favourite:', error);
      }
    }
  };

  // Get role-based colors
  const getRoleColors = () => {
    switch (provider.role) {
      case 'artisan':
        return {
          gradient: 'from-orange-500 to-orange-600',
          badge: 'bg-orange-100 text-orange-700',
          avatar: 'bg-orange-500'
        };
      case 'business_owner':
        return {
          gradient: 'from-blue-500 to-blue-600',
          badge: 'bg-blue-100 text-blue-700',
          avatar: 'bg-blue-500'
        };
      default:
        return {
          gradient: 'from-emerald-500 to-emerald-600',
          badge: 'bg-emerald-100 text-emerald-700',
          avatar: 'bg-emerald-500'
        };
    }
  };

  const colors = getRoleColors();

  return (
    <Link href={`/providers/${provider._id}`} className="block group">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Header with gradient */}
        <div className={`relative h-32 bg-gradient-to-r ${colors.gradient}`}>
          {/* Avatar overlapping */}
          <div className="absolute -bottom-12 left-4 z-10">
            <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
              {provider.avatar && !imageError ? (
                <Image
                  src={provider.avatar}
                  alt={provider.fullName}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className={`h-full w-full flex items-center justify-center text-3xl font-bold text-white ${colors.avatar}`}>
                  {provider.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Favourite button */}
          {showFavouriteButton && (
            <button
              onClick={handleFavouriteClick}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all z-20"
              aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
            >
              {isFav ? (
                <HeartSolid className="h-5 w-5 text-red-500" />
              ) : (
                <HeartOutline className="h-5 w-5 text-gray-600" />
              )}
            </button>
          )}

          {/* Role badge */}
          <div className="absolute top-2 left-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${colors.badge}`}>
              {provider.role === 'artisan' ? 'Artisan' : 
               provider.role === 'business_owner' ? 'Business' : 'Professional'}
            </span>
          </div>

          {/* Years badge */}
          {yearsInBusiness >= 3 && (
            <div className="absolute bottom-2 right-2">
              <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                {yearsInBusiness}+ yrs
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="pt-14 p-4">
          {/* Name and verification */}
          <div className="flex items-center space-x-1 mb-2">
            <h3 className="font-semibold text-lg group-hover:text-emerald-600 transition-colors line-clamp-1">
              {provider.fullName}
            </h3>
            {provider.kycVerified && (
              <CheckBadgeIcon className="h-5 w-5 text-blue-500 flex-shrink-0" title="Verified Professional" />
            )}
          </div>

          {/* Rating */}
          {provider.rating && provider.rating > 0 ? (
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(provider.rating!)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                {provider.rating.toFixed(1)} ({provider.totalReviews || 0})
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-3">No reviews yet</p>
          )}

          {/* Skills/Tags */}
          {provider.skills && provider.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {provider.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
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
          )}

          {/* Bio */}
          {provider.bio && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {provider.bio}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
            <div className="flex items-center text-gray-600">
              <BriefcaseIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{yearsInBusiness} yr{yearsInBusiness !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <WrenchIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{provider.services?.length || 0} service{provider.services?.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Location */}
          {provider.location && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{provider.location}</span>
            </div>
          )}

          {/* CTA Button */}
          <div className="mt-4">
            <span className="block w-full text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-lg text-sm font-medium transition-colors">
              View Profile
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}