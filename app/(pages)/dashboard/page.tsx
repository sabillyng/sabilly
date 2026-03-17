"use client";
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
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

// Type definitions
interface CustomerStats {
  postedJobs: number;
  activeJobs: number;
  completedJobs: number;
  savedProviders: number;
  totalSpent: number;
}

interface ArtisanStats {
  totalServices: number;
  activeJobs: number;
  completedJobs: number;
  totalEarned: number;
  averageRating: number;
  totalReviews: number;
}

interface BusinessStats {
  totalServices: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;
  averageRating: number;
  totalClients: number;
}

type UserStats = CustomerStats | ArtisanStats | BusinessStats;

interface ActivityItem {
  title: string;
  date: string;
  status: string;
}

interface ReviewItem {
  from: string;
  rating: number;
  comment: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const { services } = useService();

  // Mock stats with proper typing
  const stats: {
    customer: CustomerStats;
    artisan: ArtisanStats;
    business: BusinessStats;
  } = {
    customer: {
      postedJobs: 5,
      activeJobs: 2,
      completedJobs: 3,
      savedProviders: 8,
      totalSpent: 245000
    },
    artisan: {
      totalServices: services.length,
      activeJobs: 3,
      completedJobs: 12,
      totalEarned: 385000,
      averageRating: 4.8,
      totalReviews: 24
    },
    business: {
      totalServices: services.length,
      activeJobs: 5,
      completedJobs: 28,
      totalRevenue: 1250000,
      averageRating: 4.6,
      totalClients: 45
    }
  };

  const currentStats = user?.role === 'customer' ? stats.customer
    : user?.role === 'artisan' ? stats.artisan
    : user?.role === 'business_owner' ? stats.business
    : null;

  const isCustomer = (stats: UserStats | null): stats is CustomerStats => {
    return user?.role === 'customer' && stats !== null;
  };

  const isArtisan = (stats: UserStats | null): stats is ArtisanStats => {
    return user?.role === 'artisan' && stats !== null;
  };

  const isBusiness = (stats: UserStats | null): stats is BusinessStats => {
    return user?.role === 'business_owner' && stats !== null;
  };

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.fullName}!</h1>
        <p className="text-gray-600">Here&apos;s what&apos;s happening with your account today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Customer Stats */}
        {isCustomer(currentStats) && (
          <>
            <StatCard
              title="Posted Jobs"
              value={currentStats.postedJobs}
              icon={BriefcaseIcon}
              color="bg-blue-500"
              link="/dashboard/jobs/posted"
            />
            <StatCard
              title="Active Jobs"
              value={currentStats.activeJobs}
              icon={ClockIcon}
              color="bg-green-500"
              link="/dashboard/jobs/active"
            />
            <StatCard
              title="Completed"
              value={currentStats.completedJobs}
              icon={CheckCircleIcon}
              color="bg-purple-500"
              link="/dashboard/jobs/completed"
            />
            <StatCard
              title="Saved Providers"
              value={currentStats.savedProviders}
              icon={UserGroupIcon}
              color="bg-orange-500"
              link="/dashboard/favourites"
            />
          </>
        )}

        {/* Artisan Stats */}
        {isArtisan(currentStats) && (
          <>
            <StatCard
              title="Active Services"
              value={currentStats.totalServices}
              icon={WrenchIcon}
              color="bg-blue-500"
              link="/dashboard/services"
            />
            <StatCard
              title="Active Jobs"
              value={currentStats.activeJobs}
              icon={ClockIcon}
              color="bg-green-500"
              link="/dashboard/jobs/active"
            />
            <StatCard
              title="Completed"
              value={currentStats.completedJobs}
              icon={CheckCircleIcon}
              color="bg-purple-500"
              link="/dashboard/jobs/completed"
            />
            <StatCard
              title="Total Earned"
              value={`₦${currentStats.totalEarned.toLocaleString()}`}
              icon={CurrencyDollarIcon}
              color="bg-orange-500"
              link="/dashboard/earnings"
            />
          </>
        )}

        {/* Business Stats */}
        {isBusiness(currentStats) && (
          <>
            <StatCard
              title="Active Services"
              value={currentStats.totalServices}
              icon={WrenchIcon}
              color="bg-blue-500"
              link="/dashboard/services"
            />
            <StatCard
              title="Active Jobs"
              value={currentStats.activeJobs}
              icon={ClockIcon}
              color="bg-green-500"
              link="/dashboard/jobs/active"
            />
            <StatCard
              title="Completed"
              value={currentStats.completedJobs}
              icon={CheckCircleIcon}
              color="bg-purple-500"
              link="/dashboard/jobs/completed"
            />
            <StatCard
              title="Revenue"
              value={`₦${currentStats.totalRevenue.toLocaleString()}`}
              icon={CurrencyDollarIcon}
              color="bg-orange-500"
              link="/dashboard/earnings"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Post a Job/Service */}
        <QuickActionCard
          title={user?.role === 'customer' ? 'Post a New Job' : 'Add New Service'}
          description={user?.role === 'customer' 
            ? 'Describe what you need and find the right professional'
            : 'Showcase your skills and attract new clients'}
          buttonText={user?.role === 'customer' ? 'Post Job' : 'Add Service'}
          buttonLink={user?.role === 'customer' ? '/post-job' : '/dashboard/services/create'}
          icon={user?.role === 'customer' ? BriefcaseIcon : WrenchIcon}
          color="emerald"
        />

        {/* Find Professionals/Services */}
        <QuickActionCard
          title={user?.role === 'customer' ? 'Find Professionals' : 'Browse Available Jobs'}
          description={user?.role === 'customer'
            ? 'Search for trusted artisans and businesses near you'
            : 'Find new job opportunities that match your skills'}
          buttonText={user?.role === 'customer' ? 'Browse' : 'Find Jobs'}
          buttonLink={user?.role === 'customer' ? '/providers' : '/jobs'}
          icon={user?.role === 'customer' ? UserGroupIcon : BriefcaseIcon}
          color="blue"
        />

        {/* View Messages */}
        <QuickActionCard
          title="Messages"
          description="Check your conversations with clients and providers"
          buttonText="View Messages"
          buttonLink="/dashboard/messages"
          icon={ChatBubbleLeftIcon}
          color="purple"
          badge={3}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs/Services */}
        <RecentActivityCard
          title={user?.role === 'customer' ? 'Recent Job Posts' : 'Recent Services'}
          items={recentActivities[user?.role || 'customer']}
          viewAllLink={user?.role === 'customer' ? '/dashboard/jobs' : '/dashboard/services'}
        />

        {/* Recent Reviews */}
        <RecentReviewsCard
          reviews={recentReviews}
          viewAllLink="/dashboard/reviews"
        />
      </div>

      {/* Performance Chart (for artisans/businesses) */}
      {(user?.role === 'artisan' || user?.role === 'business_owner') && (
        <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart will be displayed here</p>
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
}

function StatCard({ title, value, icon: Icon, color, link }: StatCardProps) {
  return (
    <Link href={link} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
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
        {badge && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {badge} new
          </span>
        )}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <Link
        href={buttonLink}
        className={`inline-block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${colors[color]}`}
      >
        {buttonText}
      </Link>
    </div>
  );
}

// Recent Activity Card
interface RecentActivityCardProps {
  title: string;
  items: ActivityItem[];
  viewAllLink: string;
}

function RecentActivityCard({ title, items, viewAllLink }: RecentActivityCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Link href={viewAllLink} className="text-sm text-emerald-600 hover:text-emerald-700">
          View All
        </Link>
      </div>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-500">{item.date}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.status === 'completed' ? 'bg-green-100 text-green-700' :
              item.status === 'active' ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Recent Reviews Card
interface RecentReviewsCardProps {
  reviews: ReviewItem[];
  viewAllLink: string;
}

function RecentReviewsCard({ reviews, viewAllLink }: RecentReviewsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Reviews</h3>
        <Link href={viewAllLink} className="text-sm text-emerald-600 hover:text-emerald-700">
          View All
        </Link>
      </div>
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={index} className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-0">
            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-gray-600">{review.from.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{review.from}</p>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-3 w-3 ${
                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-1">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mock data with proper typing
const recentActivities: Record<string, ActivityItem[]> = {
  customer: [
    { title: 'Need Plumbing Repair', date: '2 hours ago', status: 'active' },
    { title: 'Electrical Wiring Job', date: 'Yesterday', status: 'pending' },
    { title: 'House Painting', date: '3 days ago', status: 'completed' },
  ],
  artisan: [
    { title: 'Plumbing Services', date: '1 day ago', status: 'active' },
    { title: 'Electrical Repairs', date: '3 days ago', status: 'active' },
    { title: 'Carpentry Work', date: '1 week ago', status: 'completed' },
  ],
  business_owner: [
    { title: 'Cleaning Services', date: '2 hours ago', status: 'active' },
    { title: 'IT Support Package', date: 'Yesterday', status: 'active' },
    { title: 'Consulting Service', date: '5 days ago', status: 'completed' },
  ]
};

const recentReviews: ReviewItem[] = [
  { from: 'John D.', rating: 5, comment: 'Excellent work! Very professional.' },
  { from: 'Sarah M.', rating: 4, comment: 'Good quality, would recommend.' },
  { from: 'Mike O.', rating: 5, comment: 'Great service, on time and within budget.' },
];