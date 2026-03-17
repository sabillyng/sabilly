"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useService } from '../../../context/ServiceContext';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, MapPinIcon, StarIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

export default function FavouritesPage() {
  const { favourites, getFavourites, removeFromFavourites } = useService();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavourites();
  }, []);

  const loadFavourites = async () => {
    setLoading(true);
    await getFavourites();
    setLoading(false);
  };

  const handleRemove = async (providerId: string) => {
    await removeFromFavourites(providerId);
    await loadFavourites();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Saved Providers</h1>
        <p className="text-gray-600">Your favourite artisans and businesses</p>
      </div>

      {/* Favourites Grid */}
      {favourites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map((provider) => (
            <div key={provider._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-24 ${
                provider.role === 'artisan' ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
              } relative`}>
                <button
                  onClick={() => handleRemove(provider._id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg"
                >
                  <HeartSolid className="h-4 w-4 text-red-500" />
                </button>
              </div>

              <div className="px-4 pb-4">
                <div className="relative -mt-8 mb-4">
                  <div className="h-16 w-16 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                    {provider.avatar ? (
                      <Image
                        src={provider.avatar}
                        alt={provider.fullName}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    ) : (
                      <div className={`h-full w-full flex items-center justify-center text-xl font-bold text-white ${
                        provider.role === 'artisan' ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {provider.fullName?.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                <Link href={`/providers/${provider._id}`}>
                  <h3 className="font-semibold text-lg hover:text-emerald-600 mb-1">
                    {provider.fullName}
                  </h3>
                </Link>

                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-4 w-4 ${
                          star <= (provider.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({provider.totalReviews || 0})</span>
                </div>

                {provider.location && (
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {provider.location}
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-500">
                  <BriefcaseIcon className="h-4 w-4 mr-1" />
                  {provider.services?.length || 0} services
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <HeartOutline className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favourites yet</h3>
          <p className="text-gray-500 mb-6">Start saving your favourite providers</p>
          <Link
            href="/providers"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Browse Providers
          </Link>
        </div>
      )}
    </div>
  );
}