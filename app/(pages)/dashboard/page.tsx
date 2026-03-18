"use client";
import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useService } from '../../context/ServiceContext';
import Link from 'next/link';
import {
  BriefcaseIcon,
  WrenchIcon,
  StarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Type definitions
interface CustomerStats {
  postedJobs: number;
  activeJobs: number;
  completedJobs: number;
  savedProviders: number;
  totalSpent: number;
  pendingApplications: number;
  unreadMessages: number;
}

interface ArtisanStats {
  totalServices: number;
  activeJobs: number;
  completedJobs: number;
  totalEarned: number;
  averageRating: number;
  totalReviews: number;
  pendingRequests: number;
  unreadMessages: number;
  totalViews: number;
}

interface BusinessStats {
  totalServices: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;
  averageRating: number;
  totalClients: number;
  pendingRequests: number;
  unreadMessages: number;
  totalViews: number;
}

type UserStats = CustomerStats | ArtisanStats | BusinessStats;

interface ActivityItem {
  id: string;
  title: string;
  date: string;
  status: string;
  type: 'job' | 'service' | 'application';
}

interface ReviewItem {
  id: string;
  from: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const { services, getServices, providers, getProviders, favourites } = useService();
  
  const [loading, setLoading] = useState(true);
  const [userServices, setUserServices] = useState<Service[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [recentReviews, setRecentReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Load user's services if artisan/business
        if (user?.role === 'artisan' || user?.role === 'business_owner') {
          await getServices({ provider: user._id });
          // Filter services for this user
          const filtered = services.filter(s => 
            typeof s.provider === 'object' ? s.provider._id === user._id : s.provider === user._id
          );
          setUserServices(filtered);
        }
        
        // Load providers for customer stats
        if (user?.role === 'customer') {
          await getProviders();
        }

        // TODO: Replace with actual API calls for:
        // - Jobs data (posted, active, completed)
        // - Earnings/Revenue data
        // - Messages count
        // - Applications/Requests
        // - Reviews
        
        // For now, we'll use real data that's already available
        await loadRecentActivitiesFromRealData();
        await loadRecentReviewsFromRealData();
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Calculate real stats from available data
  const getRealStats = () => {
    if (!user) return null;

    const baseStats = {
      savedProviders: favourites.length,
      unreadMessages: 0, // TODO: Get from messages API
    };

    switch (user.role) {
      case 'customer':
        return {
          postedJobs: 0, // TODO: Get from jobs API
          activeJobs: 0, // TODO: Get from jobs API
          completedJobs: 0, // TODO: Get from jobs API
          savedProviders: favourites.length,
          totalSpent: 0, // TODO: Get from payments API
          pendingApplications: 0, // TODO: Get from applications API
          unreadMessages: 0, // TODO: Get from messages API
        } as CustomerStats;

      case 'artisan':
        return {
          totalServices: userServices.length,
          activeJobs: 0, // TODO: Get from jobs API
          completedJobs: 0, // TODO: Get from jobs API
          totalEarned: 0, // TODO: Get from payments API
          averageRating: user.rating || 0,
          totalReviews: user.totalReviews || 0,
          pendingRequests: 0, // TODO: Get from requests API
          unreadMessages: 0, // TODO: Get from messages API
          totalViews: userServices.reduce((sum, s) => sum + (s.views || 0), 0),
        } as ArtisanStats;

      case 'business_owner':
        return {
          totalServices: userServices.length,
          activeJobs: 0, // TODO: Get from jobs API
          completedJobs: 0, // TODO: Get from jobs API
          totalRevenue: 0, // TODO: Get from payments API
          averageRating: user.rating || 0,
          totalClients: 0, // TODO: Get from clients API
          pendingRequests: 0, // TODO: Get from requests API
          unreadMessages: 0, // TODO: Get from messages API
          totalViews: userServices.reduce((sum, s) => sum + (s.views || 0), 0),
        } as BusinessStats;

      default:
        return null;
    }
  };

  const loadRecentActivitiesFromRealData = async () => {
    const activities: ActivityItem[] = [];

    // Add user's services as activities (for artisans/businesses)
    if (user?.role === 'artisan' || user?.role === 'business_owner') {
      userServices.slice(0, 3).forEach(service => {
        activities.push({
          id: service._id,
          title: service.title,
          date: new Date(service.createdAt).toLocaleDateString(),
          status: service.isActive ? 'active' : 'inactive',
          type: 'service'
        });
      });
    }

    // TODO: Add jobs, applications from API
    // For now, we'll use the services we have
    setRecentActivities(activities.slice(0, 5));
  };

  const loadRecentReviewsFromRealData = async () => {
    // TODO: Get actual reviews from API
    // For now, use empty array or derive from user data
    const reviews: ReviewItem[] = [];
    
    // If user has reviews in their data, use them
    if (user?.totalReviews && user.totalReviews > 0) {
      // This would come from a reviews API endpoint
      // reviews.push({
      //   id: '1',
      //   from: 'Customer Name',
      //   rating: 5,
      //   comment: 'Great service!',
      //   date: new Date().toISOString()
      // });
    }

    setRecentReviews(reviews);
  };

  const currentStats = getRealStats();
  const isCustomer = user?.role === 'customer';
  const isArtisan = user?.role === 'artisan';
  const isBusiness = user?.role === 'business_owner';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.fullName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what&apos;s happening with your account today.
        </p>
      </div>

      {/* Stats Grid */}
      {currentStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Customer Stats */}
          {isCustomer && (
            <>
              <StatCard
                title="Posted Jobs"
                value={(currentStats as CustomerStats).postedJobs}
                icon={BriefcaseIcon}
                color="bg-blue-500"
                link="/dashboard/jobs/posted"
              />
              <StatCard
                title="Active Jobs"
                value={(currentStats as CustomerStats).activeJobs}
                icon={ClockIcon}
                color="bg-green-500"
                link="/dashboard/jobs/active"
              />
              <StatCard
                title="Saved Providers"
                value={(currentStats as CustomerStats).savedProviders}
                icon={HeartIcon}
                color="bg-red-500"
                link="/dashboard/favourites"
              />
              <StatCard
                title="Applications"
                value={(currentStats as CustomerStats).pendingApplications}
                icon={DocumentTextIcon}
                color="bg-purple-500"
                link="/dashboard/jobs/applications"
              />
            </>
          )}

          {/* Artisan Stats */}
          {isArtisan && (
            <>
              <StatCard
                title="Active Services"
                value={(currentStats as ArtisanStats).totalServices}
                icon={WrenchIcon}
                color="bg-blue-500"
                link="/dashboard/services"
              />
              <StatCard
                title="Total Views"
                value={(currentStats as ArtisanStats).totalViews.toLocaleString()}
                icon={EyeIcon}
                color="bg-green-500"
                link="/dashboard/services"
              />
              <StatCard
                title="Average Rating"
                value={(currentStats as ArtisanStats).averageRating.toFixed(1)}
                icon={StarIcon}
                color="bg-yellow-500"
                link="/dashboard/reviews"
                suffix={` (${(currentStats as ArtisanStats).totalReviews})`}
              />
              <StatCard
                title="Pending Requests"
                value={(currentStats as ArtisanStats).pendingRequests}
                icon={ClockIcon}
                color="bg-orange-500"
                link="/dashboard/jobs/received"
              />
            </>
          )}

          {/* Business Stats */}
          {isBusiness && (
            <>
              <StatCard
                title="Active Services"
                value={(currentStats as BusinessStats).totalServices}
                icon={WrenchIcon}
                color="bg-blue-500"
                link="/dashboard/services"
              />
              <StatCard
                title="Total Views"
                value={(currentStats as BusinessStats).totalViews.toLocaleString()}
                icon={EyeIcon}
                color="bg-green-500"
                link="/dashboard/services"
              />
              <StatCard
                title="Average Rating"
                value={(currentStats as BusinessStats).averageRating.toFixed(1)}
                icon={StarIcon}
                color="bg-yellow-500"
                link="/dashboard/reviews"
              />
              <StatCard
                title="Pending Requests"
                value={(currentStats as BusinessStats).pendingRequests}
                icon={ClockIcon}
                color="bg-orange-500"
                link="/dashboard/jobs/received"
              />
            </>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Post a Job/Service */}
        <QuickActionCard
          title={isCustomer ? 'Post a Job' : 'Add Service'}
          description={isCustomer 
            ? 'Find the right professional for your needs'
            : 'Showcase your skills to potential clients'}
          buttonText={isCustomer ? 'Post Job' : 'Add Service'}
          buttonLink={isCustomer ? '/post-job' : '/dashboard/services/create'}
          icon={isCustomer ? BriefcaseIcon : WrenchIcon}
          color="emerald"
        />
        
        {/* Find Providers/Jobs */}
        <QuickActionCard
          title={isCustomer ? 'Find Providers' : 'Find Jobs'}
          description={isCustomer
            ? 'Browse trusted professionals near you'
            : 'Discover new job opportunities'}
          buttonText="Browse"
          buttonLink={isCustomer ? '/providers' : '/jobs'}
          icon={isCustomer ? UserGroupIcon : BriefcaseIcon}
          color="blue"
        />
        
        {/* View Messages */}
        <QuickActionCard
          title="Messages"
          description={`You have ${currentStats?.unreadMessages || 0} unread messages`}
          buttonText="View Messages"
          buttonLink="/dashboard/messages"
          icon={ChatBubbleLeftIcon}
          color="purple"
          badge={currentStats?.unreadMessages || undefined}
        />
      </div>

      {/* Recent Activity - From Real Data */}
      {recentActivities.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {isCustomer ? 'Recent Job Posts' : 'Recent Services'}
            </h2>
            <Link 
              href={isCustomer ? '/dashboard/jobs' : '/dashboard/services'} 
              className="text-sm text-emerald-600 hover:text-emerald-700"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.status === 'active' ? 'bg-green-100 text-green-800' :
                  activity.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Reviews - From Real Data */}
      {recentReviews.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Reviews</h2>
            <Link href="/dashboard/reviews" className="text-sm text-emerald-600 hover:text-emerald-700">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-0">
                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  {review.avatar ? (
                    <img src={review.avatar} alt={review.from} className="h-8 w-8 rounded-full" />
                  ) : (
                    <span className="text-sm font-medium text-gray-600">{review.from.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{review.from}</p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIconSolid
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">{review.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Chart Placeholder - Will be replaced with real data */}
      {(isArtisan || isBusiness) && userServices.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Overview</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {userServices.length} active services • {userServices.reduce((sum, s) => sum + (s.views || 0), 0)} total views
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  link: string;
  suffix?: string;
}

function StatCard({ title, value, icon: Icon, color, link, suffix }: StatCardProps) {
  return (
    <Link href={link} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          {suffix && <span className="text-sm text-gray-500 ml-1">{suffix}</span>}
        </div>
      </div>
      <p className="text-gray-600">{title}</p>
    </Link>
  );
}

// Quick Action Card Component
interface QuickActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'blue' | 'purple';
  badge?: number;
}

function QuickActionCard({ title, description, buttonText, buttonLink, icon: Icon, color, badge }: QuickActionCardProps) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color].split(' ')[0]}`}>
          <Icon className={`h-6 w-6 ${colors[color].split(' ')[1]}`} />
        </div>
        {badge ? (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {badge} new
          </span>
        ) : (
          <div className="h-6 w-6" /> // Spacer for alignment
        )}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <Link
        href={buttonLink}
        className={`inline-block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${colors[color]}`}
      >
        {buttonText} →
      </Link>
    </div>
  );
}

// Missing icons
import { EyeIcon } from '@heroicons/react/24/outline';
import { Service } from '../../types/service';
