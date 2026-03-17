"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '../../context/UserContext';
import { useRouter, usePathname } from 'next/navigation';
import { AuthPopup } from '../auth/AuthPopup';
import { 
  HeartIcon,
  WrenchScrewdriverIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import logo from "../../../public/sabilly-logo.png"

// Fixed Logo component - removed the Link wrapper since it will be used inside a Link
export const SabillyLogo = () => (
  <Image src={logo} alt="Sabilly" className='w-20 h-auto'/>
);

// Popular search suggestions
const searchSuggestions = [
  'Plumber',
  'Electrician',
  'Painter',
  'Carpenter',
  'Cleaner',
  'Moving Services',
  'IT Support',
  'Photographer',
  'Hair Stylist',
  'Home Repairs'
];

// Location options
const locationOptions = [
  'All Osun',
  'Ile-Ife',
  'Osogbo',
  'Ikire',
  'Olorunshola',
  'Ede',
  'Ejigbo',
  'Iwo',
  'Iree',
  'Ila'
];

export function Navbar() {
  const { user, logout } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('All Osun');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Build search params
    const params = new URLSearchParams();
    params.append('q', searchQuery.trim());
    if (location !== 'All Osun') {
      params.append('location', location);
    }
    
    router.push(`/search?${params.toString()}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    
    // Navigate to category page or search
    const categorySlug = suggestion.toLowerCase().replace(/\s+/g, '-');
    router.push(`/category/${categorySlug}`);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocation(e.target.value);
    
    // If on search page, trigger new search with updated location
    if (pathname === '/search') {
      const params = new URLSearchParams(window.location.search);
      if (e.target.value !== 'All Osun') {
        params.set('location', e.target.value);
      } else {
        params.delete('location');
      }
      router.push(`/search?${params.toString()}`);
    }
  };

  const openAuthPopup = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthPopup(true);
    setShowUserMenu(false);
  };

  const isArtisan = user?.role === 'artisan';
  const isBusinessOwner = user?.role === 'business_owner';
  const isCustomer = user?.role === 'customer';

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        {/* Top bar */}
        <div className="bg-emerald-700 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div className="text-sm font-medium">
              Find Trusted Artisans, Businesses Near You. Connect with verified professionals for all your service needs across Osun State
            </div>
            <div className="flex items-center space-x-4">
              {!user ? (
                <>
                  <button
                    onClick={() => openAuthPopup('login')}
                    className="text-sm hover:underline"
                  >
                    Sign In
                  </button>
                  <span className="text-emerald-300">|</span>
                  <button
                    onClick={() => openAuthPopup('register')}
                    className="text-sm hover:underline"
                  >
                    Join as Professional
                  </button>
                </>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-sm hover:bg-emerald-600/20 px-3 py-1 rounded-full transition"
                  >
                    {user.avatar ? (
                      <Image 
                        src={user.avatar} 
                        alt={user.fullName}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">{user.fullName.charAt(0)}</span>
                      </div>
                    )}
                    <span className="max-w-[100px] truncate">{user.fullName.split(' ')[0]}</span>
                    {isArtisan && <WrenchScrewdriverIcon className="h-4 w-4" />}
                    {isBusinessOwner && <BuildingStorefrontIcon className="h-4 w-4" />}
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 text-gray-700 border border-gray-200 z-50">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            user.role === 'artisan' ? 'bg-orange-100 text-orange-700' :
                            user.role === 'business_owner' ? 'bg-blue-100 text-blue-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {user.role === 'artisan' ? 'Artisan' :
                             user.role === 'business_owner' ? 'Business Owner' :
                             'Customer'}
                          </span>
                        </p>
                      </div>

                      {/* Menu items */}
                      <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50">
                        My Profile
                      </Link>
                      
                      {isArtisan && (
                        <>
                          <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-50">
                            My Dashboard
                          </Link>
                          <Link href="/dashboard/services/create" className="block px-4 py-2 text-sm hover:bg-gray-50">
                            Post a Service
                          </Link>
                        </>
                      )}
                      
                      {isBusinessOwner && (
                        <>
                          <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-50">
                            My Dashboard
                          </Link>
                          <Link href="/dashboard/services/create" className="block px-4 py-2 text-sm hover:bg-gray-50">
                            List Your Business
                          </Link>
                        </>
                      )}
                      
                      {isCustomer && (
                        <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-50">
                          My Dashboard
                        </Link>
                      )}
                      
                      <Link href="/dashboard/favourites" className="block px-4 py-2 text-sm hover:bg-gray-50">
                        <HeartIcon className="h-4 w-4 inline mr-2" />
                        Saved Providers
                      </Link>
                      <Link href="/dashboard/messages" className="block px-4 py-2 text-sm hover:bg-gray-50">
                        <BellIcon className="h-4 w-4 inline mr-2" />
                        Messages
                        <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
                      </Link>
                      <Link href="/dashboard/settings" className="block px-4 py-2 text-sm hover:bg-gray-50">
                        <Cog6ToothIcon className="h-4 w-4 inline mr-2" />
                        Settings
                      </Link>
                      
                      <hr className="my-2" />
                      
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 inline mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Post Service Button - Only for Artisans/Business Owners */}
              {user && (isArtisan || isBusinessOwner) ? (
                <Link
                  href="/dashboard/services/create"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded font-bold text-sm transition"
                >
                  POST SERVICE
                </Link>
              ) : !user ? (
                <button
                  onClick={() => openAuthPopup('register')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded font-bold text-sm transition"
                >
                  SELL
                </button>
              ) : null}
              
              {/* Find Service Button - For Customers */}
              {user && isCustomer && (
                <Link
                  href="/services"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1 rounded font-bold text-sm transition"
                >
                  FIND SERVICES
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main navbar with search */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            {/* Logo - Single Link wrapping both logo and text */}
            <Link href="/" className="flex items-center space-x-2">
              <SabillyLogo/>
              <span className="font-bold text-emerald-600">Sabilly</span>
            </Link>
            
            {/* Search form with suggestions */}
            <form onSubmit={handleSearch} className="flex-1 flex items-center space-x-2 relative">
              <div className="flex-1 flex items-center border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-emerald-500 transition relative">
                <select
                  value={location}
                  onChange={handleLocationChange}
                  className="px-3 py-2 bg-gray-50 border-r border-gray-300 text-sm focus:outline-none"
                >
                  {locationOptions.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search for artisans, services, or businesses..."
                    className="w-full px-4 py-2 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setShowSuggestions(false);
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </button>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    <p className="text-xs text-gray-500 px-3 py-2">Popular searches</p>
                    {searchSuggestions
                      .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                      .slice(0, 5)
                      .map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center"
                        >
                          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    
                    {/* Category links */}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <p className="text-xs text-gray-500 px-3 py-2">Browse categories</p>
                      <div className="grid grid-cols-2 gap-1">
                        <Link
                          href="/category/plumbing"
                          className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                          onClick={() => setShowSuggestions(false)}
                        >
                          🔧 Plumbing
                        </Link>
                        <Link
                          href="/category/electrical"
                          className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                          onClick={() => setShowSuggestions(false)}
                        >
                          ⚡ Electrical
                        </Link>
                        <Link
                          href="/category/painting"
                          className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                          onClick={() => setShowSuggestions(false)}
                        >
                          🎨 Painting
                        </Link>
                        <Link
                          href="/category/cleaning"
                          className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                          onClick={() => setShowSuggestions(false)}
                        >
                          🧹 Cleaning
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* Notification icon */}
            {user && (
              <button className="relative p-2 text-gray-600 hover:text-emerald-600 transition">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Popup */}
      <AuthPopup 
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        initialMode={authMode}
      />
    </>
  );
}