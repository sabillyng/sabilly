"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '../../context/UserContext';
import { useService } from '../../context/ServiceContext';
import { Navbar } from '../../components/Home/Navbar';
import {
  UserCircleIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  BriefcaseIcon,
  StarIcon,
  WrenchIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  CameraIcon,
  HeartIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { User } from '../../types/auth';

// Type definitions
type UserRole = 'customer' | 'artisan' | 'business_owner' | 'admin' | 'super_admin';

interface CustomerStats {
  jobsPosted: number;
  jobsCompleted: number;
  totalSpent: number;
  averageRating: number;
  reviewsReceived: number;
  savedProviders: number;
}

interface ArtisanStats {
  servicesOffered: number;
  jobsCompleted: number;
  totalEarned: number;
  averageRating: number;
  reviewsReceived: number;
  hireRate: number;
}

interface BusinessStats {
  servicesOffered: number;
  projectsCompleted: number;
  totalRevenue: number;
  averageRating: number;
  reviewsReceived: number;
  clientsServed: number;
}

type UserStats = CustomerStats | ArtisanStats | BusinessStats;

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  skills: string[];
  avatar: File | null;
}

interface Review {
  id: string;
  from: string;
  rating: number;
  comment: string;
  date: string;
  jobTitle: string;
}

interface InfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function ProfilePage() {
  const { user, updateProfile } = useUser();
  const { services, getServices } = useService();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'reviews' | 'stats'>('profile');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState('');
  
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    avatar: null
  });

  // Mock reviews data - replace with real API calls
  const reviews: Review[] = [
    {
      id: '1',
      from: 'John Doe',
      rating: 5,
      comment: 'Excellent work! Very professional and completed the job on time.',
      date: '2024-03-15',
      jobTitle: 'Plumbing Repair'
    },
    {
      id: '2',
      from: 'Sarah Okafor',
      rating: 4,
      comment: 'Good quality work. Would recommend.',
      date: '2024-03-10',
      jobTitle: 'Electrical Wiring'
    },
    {
      id: '3',
      from: 'Mike Obi',
      rating: 5,
      comment: 'Very skilled and professional. Will hire again.',
      date: '2024-03-05',
      jobTitle: 'House Painting'
    }
  ];

  // Stats with proper typing
  const stats = {
    customer: {
      jobsPosted: 8,
      jobsCompleted: 5,
      totalSpent: 245000,
      averageRating: 4.7,
      reviewsReceived: 12,
      savedProviders: 15
    } as CustomerStats,
    artisan: {
      servicesOffered: services.length,
      jobsCompleted: 24,
      totalEarned: 385000,
      averageRating: 4.8,
      reviewsReceived: 32,
      hireRate: 85
    } as ArtisanStats,
    business_owner: {
      servicesOffered: services.length,
      projectsCompleted: 45,
      totalRevenue: 1250000,
      averageRating: 4.6,
      reviewsReceived: 28,
      clientsServed: 56
    } as BusinessStats
  };

  // Type guard functions
  const isCustomer = (role: UserRole): role is 'customer' => role === 'customer';
  const isArtisan = (role: UserRole): role is 'artisan' => role === 'artisan';
  const isBusinessOwner = (role: UserRole): role is 'business_owner' => role === 'business_owner';

  const getCurrentStats = (): UserStats | null => {
    if (!user) return null;
    
    if (isCustomer(user.role)) return stats.customer;
    if (isArtisan(user.role)) return stats.artisan;
    if (isBusinessOwner(user.role)) return stats.business_owner;
    return null;
  };

  const currentStats = getCurrentStats();

  useEffect(() => {
    if (user && (isArtisan(user.role) || isBusinessOwner(user.role))) {
      getServices({ provider: user._id });
    }
  }, [user, getServices]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Convert form data to match User type
      const updateData: Partial<User> = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        skills: formData.skills
      };

      // Handle avatar separately if needed
      if (formData.avatar) {
        // Here you would upload the avatar and get a URL
        // For now, we'll skip avatar upload
        console.log('Avatar to upload:', formData.avatar);
      }

      await updateProfile(updateData);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
      skills: user?.skills || [],
      avatar: null
    });
    setAvatarPreview(null);
    setIsEditing(false);
    setError('');
  };

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || '?';
  };

  const getRoleColor = (role?: UserRole) => {
    if (!role) return 'bg-purple-500';
    switch (role) {
      case 'artisan': return 'bg-orange-500';
      case 'business_owner': return 'bg-blue-500';
      case 'customer': return 'bg-emerald-500';
      default: return 'bg-purple-500';
    }
  };

  const getRoleIcon = (role?: UserRole) => {
    if (!role) return UserCircleIcon;
    switch (role) {
      case 'artisan': return WrenchIcon;
      case 'business_owner': return BuildingStorefrontIcon;
      default: return UserCircleIcon;
    }
  };

  const RoleIcon = user ? getRoleIcon(user.role) : UserCircleIcon;
  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-600 hover:text-emerald-600 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="relative group">
                <div className={`h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold text-white ${getRoleColor(user?.role)}`}>
                  {user?.avatar || avatarPreview ? (
                    <Image
                      src={avatarPreview || user?.avatar || ''}
                      alt={user?.fullName || ''}
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user?.fullName || '')
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-emerald-600 rounded-full p-2 cursor-pointer hover:bg-emerald-700 transition-colors">
                    <CameraIcon className="h-4 w-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* User Info */}
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900">{user?.fullName}</h1>
                  {user?.kycVerified && (
                    <ShieldCheckIcon className="h-6 w-6 text-blue-500" title="Verified Professional" />
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <RoleIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 capitalize">
                    {user?.role?.replace('_', ' ')}
                  </span>
                  {user?.role !== 'customer' && user?.rating && user?.rating > 0 && (
                    <>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center">
                        <StarIconSolid className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium text-gray-700">
                          {user.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({user.totalReviews || 0} reviews)
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 md:mt-0 flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <XMarkIcon className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile Information
            </button>
            {(user?.role === 'artisan' || user?.role === 'business_owner') && (
              <button
                onClick={() => setActiveTab('services')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'services'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Services ({services.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Reviews ({user?.totalReviews || 0})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Statistics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g., Ile-Ife, Osun State"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Tell potential clients about yourself..."
                    />
                  </div>

                  {/* Skills (for artisans/business owners) */}
                  {(user?.role === 'artisan' || user?.role === 'business_owner') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Skills / Services
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Add a skill"
                        />
                        <button
                          type="button"
                          onClick={addSkill}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-2 text-emerald-700 hover:text-emerald-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Profile Info Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem
                      icon={EnvelopeIcon}
                      label="Email"
                      value={user?.email}
                    />
                    <InfoItem
                      icon={PhoneIcon}
                      label="Phone"
                      value={user?.phone || 'Not provided'}
                    />
                    <InfoItem
                      icon={MapPinIcon}
                      label="Location"
                      value={user?.location || 'Not provided'}
                    />
                    <InfoItem
                      icon={CalendarIcon}
                      label="Member Since"
                      value={memberSince}
                    />
                  </div>

                  {/* Bio */}
                  {user?.bio && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Bio</h3>
                      <p className="text-gray-600">{user.bio}</p>
                    </div>
                  )}

                  {/* Skills Display */}
                  {(user?.role === 'artisan' || user?.role === 'business_owner') && user?.skills && user.skills.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Skills & Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill) => (
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

                  {/* Verification Status */}
                  {user?.kycVerified && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                      <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm text-green-700">
                        Your identity has been verified
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (user?.role === 'artisan' || user?.role === 'business_owner') && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">My Services</h2>
                <Link
                  href="/dashboard/services/create"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  + Add New Service
                </Link>
              </div>

              {services.length > 0 ? (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{service.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{service.category}</p>
                          <div className="flex items-center mt-2 text-sm">
                            <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="font-medium text-gray-700">
                              {service.rating?.toFixed(1) || '0.0'}
                            </span>
                            <span className="text-gray-500 ml-1">
                              ({service.totalReviews || 0} reviews)
                            </span>
                          </div>
                          {service.priceRange && (
                            <p className="text-emerald-600 font-medium mt-2">
                              {service.priceRange.string}
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/services/${service._id}`}
                          className="text-sm text-emerald-600 hover:text-emerald-700"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <WrenchIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No services listed yet</p>
                  <Link
                    href="/dashboard/services/create"
                    className="inline-block mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    List your first service →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-lg font-semibold mb-6">Reviews</h2>
              
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{review.from}</h3>
                          <p className="text-sm text-gray-500">{review.jobTitle}</p>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIconSolid
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No reviews yet</p>
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && currentStats && user && (
            <div>
              <h2 className="text-lg font-semibold mb-6">Performance Statistics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isCustomer(user.role) && (
                  <>
                    <StatCard
                      label="Jobs Posted"
                      value={(currentStats as CustomerStats).jobsPosted}
                      icon={BriefcaseIcon}
                      color="bg-blue-500"
                    />
                    <StatCard
                      label="Jobs Completed"
                      value={(currentStats as CustomerStats).jobsCompleted}
                      icon={CheckCircleIcon}
                      color="bg-green-500"
                    />
                    <StatCard
                      label="Total Spent"
                      value={`₦${(currentStats as CustomerStats).totalSpent.toLocaleString()}`}
                      icon={CurrencyDollarIcon}
                      color="bg-purple-500"
                    />
                    <StatCard
                      label="Average Rating"
                      value={(currentStats as CustomerStats).averageRating.toFixed(1)}
                      icon={StarIcon}
                      color="bg-yellow-500"
                    />
                    <StatCard
                      label="Reviews Received"
                      value={(currentStats as CustomerStats).reviewsReceived}
                      icon={StarIcon}
                      color="bg-orange-500"
                    />
                    <StatCard
                      label="Saved Providers"
                      value={(currentStats as CustomerStats).savedProviders}
                      icon={HeartIcon}
                      color="bg-red-500"
                    />
                  </>
                )}

                {isArtisan(user.role) && (
                  <>
                    <StatCard
                      label="Services Offered"
                      value={(currentStats as ArtisanStats).servicesOffered}
                      icon={WrenchIcon}
                      color="bg-blue-500"
                    />
                    <StatCard
                      label="Jobs Completed"
                      value={(currentStats as ArtisanStats).jobsCompleted}
                      icon={CheckCircleIcon}
                      color="bg-green-500"
                    />
                    <StatCard
                      label="Total Earned"
                      value={`₦${(currentStats as ArtisanStats).totalEarned.toLocaleString()}`}
                      icon={CurrencyDollarIcon}
                      color="bg-purple-500"
                    />
                    <StatCard
                      label="Average Rating"
                      value={(currentStats as ArtisanStats).averageRating.toFixed(1)}
                      icon={StarIcon}
                      color="bg-yellow-500"
                    />
                    <StatCard
                      label="Reviews Received"
                      value={(currentStats as ArtisanStats).reviewsReceived}
                      icon={StarIcon}
                      color="bg-orange-500"
                    />
                    <StatCard
                      label="Hire Rate"
                      value={`${(currentStats as ArtisanStats).hireRate}%`}
                      icon={BriefcaseIcon}
                      color="bg-emerald-500"
                    />
                  </>
                )}

                {isBusinessOwner(user.role) && (
                  <>
                    <StatCard
                      label="Services Offered"
                      value={(currentStats as BusinessStats).servicesOffered}
                      icon={WrenchIcon}
                      color="bg-blue-500"
                    />
                    <StatCard
                      label="Projects Completed"
                      value={(currentStats as BusinessStats).projectsCompleted}
                      icon={CheckCircleIcon}
                      color="bg-green-500"
                    />
                    <StatCard
                      label="Total Revenue"
                      value={`₦${(currentStats as BusinessStats).totalRevenue.toLocaleString()}`}
                      icon={CurrencyDollarIcon}
                      color="bg-purple-500"
                    />
                    <StatCard
                      label="Average Rating"
                      value={(currentStats as BusinessStats).averageRating.toFixed(1)}
                      icon={StarIcon}
                      color="bg-yellow-500"
                    />
                    <StatCard
                      label="Reviews Received"
                      value={(currentStats as BusinessStats).reviewsReceived}
                      icon={StarIcon}
                      color="bg-orange-500"
                    />
                    <StatCard
                      label="Clients Served"
                      value={(currentStats as BusinessStats).clientsServed}
                      icon={UserGroupIcon}
                      color="bg-emerald-500"
                    />
                  </>
                )}
              </div>

              {/* Performance Chart Placeholder */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">Performance Trend</h3>
                <div className="h-48 flex items-center justify-center">
                  <p className="text-gray-500">Chart will be displayed here</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// Helper Components
function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || 'Not provided'}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`${color} w-8 h-8 rounded-lg flex items-center justify-center`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}