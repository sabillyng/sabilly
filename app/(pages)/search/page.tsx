"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '../../components/Home/Navbar';
import { ServicesList } from '../../components/services/ServicesList';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    if (query) {
      setSearchPerformed(true);
    }
  }, [query]);

  return (
    <>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Search Results for &quot;{query}&quot;
          </h1>
          {location && location !== 'All Osun' && (
            <p className="text-gray-600">in {location}</p>
          )}
        </div>

        {/* Results */}
        {searchPerformed ? (
          <ServicesList 
            filters={{ 
              search: query,
              location: location !== 'All Osun' ? location : undefined 
            }}
            showFilters={true}
            title={`Found services for "${query}"`}
          />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">Enter a search term to find services</p>
            <p className="text-sm text-gray-400">
              Search for plumbers, electricians, painters, and more
            </p>
          </div>
        )}
      </main>
    </>
  );
}