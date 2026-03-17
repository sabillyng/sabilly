"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '../../../context/UserContext';
import {
  HomeIcon,
  BriefcaseIcon,
  WrenchIcon,
  DocumentTextIcon,
  StarIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useService } from '../../../context/ServiceContext';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const { services } = useService();

  const isActive = (path: string) => pathname === path;

const customerLinks = [
  { href: '/dashboard', label: 'Overview', icon: HomeIcon },
  { href: '/dashboard/jobs/post-job', label: 'Post a Job', icon: BriefcaseIcon },
  { href: '/dashboard/jobs/posted', label: 'My Job Posts', icon: DocumentTextIcon },
  { href: '/dashboard/jobs/applications', label: 'Applications', icon: UserGroupIcon },
  { href: '/dashboard/favourites', label: 'Saved Providers', icon: HeartIcon },
  { href: '/dashboard/messages', label: 'Messages', icon: ChatBubbleLeftIcon, badge: 3 },
  { href: '/dashboard/reviews', label: 'My Reviews', icon: StarIcon },
];

  const artisanLinks = [
    { href: '/dashboard', label: 'Overview', icon: HomeIcon },
    { href: '/dashboard/services', label: 'My Services', icon: WrenchIcon, count: services.length },
    { href: '/dashboard/services/create', label: 'Post New Service', icon: DocumentTextIcon },
    { href: '/dashboard/jobs/received', label: 'Job Requests', icon: BriefcaseIcon, badge: 5 },
    { href: '/dashboard/jobs/active', label: 'Active Jobs', icon: ClockIcon, badge: 2 },
    { href: '/dashboard/jobs/completed', label: 'Completed', icon: CheckCircleIcon },
    { href: '/dashboard/earnings', label: 'Earnings', icon: CurrencyDollarIcon },
    { href: '/dashboard/reviews', label: 'Reviews', icon: StarIcon },
    { href: '/dashboard/messages', label: 'Messages', icon: ChatBubbleLeftIcon, badge: 3 },
  ];

  const businessLinks = [
    { href: '/dashboard', label: 'Overview', icon: HomeIcon },
    { href: '/dashboard/services', label: 'Our Services', icon: WrenchIcon, count: services.length },
    { href: '/dashboard/services/create', label: 'List New Service', icon: DocumentTextIcon },
    { href: '/dashboard/jobs/received', label: 'Job Requests', icon: BriefcaseIcon, badge: 8 },
    { href: '/dashboard/jobs/active', label: 'Active Jobs', icon: ClockIcon, badge: 3 },
    { href: '/dashboard/jobs/completed', label: 'Completed', icon: CheckCircleIcon },
    { href: '/dashboard/earnings', label: 'Revenue', icon: CurrencyDollarIcon },
    { href: '/dashboard/reviews', label: 'Client Reviews', icon: StarIcon },
    { href: '/dashboard/messages', label: 'Messages', icon: ChatBubbleLeftIcon, badge: 5 },
  ];

  const adminLinks = [
    { href: '/dashboard/admin', label: 'Overview', icon: HomeIcon },
    { href: '/dashboard/admin/users', label: 'Manage Users', icon: UserGroupIcon },
    { href: '/dashboard/admin/services', label: 'All Services', icon: WrenchIcon },
    { href: '/dashboard/admin/jobs', label: 'All Jobs', icon: BriefcaseIcon },
    { href: '/dashboard/admin/verifications', label: 'KYC Verifications', icon: CheckCircleIcon, badge: 12 },
    { href: '/dashboard/admin/reports', label: 'Reports', icon: ChartBarIcon },
    { href: '/dashboard/admin/disputes', label: 'Disputes', icon: XCircleIcon, badge: 3 },
  ];

  const links = user?.role === 'customer' ? customerLinks
    : user?.role === 'artisan' ? artisanLinks
    : user?.role === 'business_owner' ? businessLinks
    : user?.role === 'admin' || user?.role === 'super_admin' ? adminLinks
    : [];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full sticky top-0">
      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto py-6">
        <div className="px-6">
          {/* User Info - Fixed at top of sidebar */}
          <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-200">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${
              user?.role === 'artisan' ? 'bg-orange-500' :
              user?.role === 'business_owner' ? 'bg-blue-500' :
              user?.role === 'customer' ? 'bg-emerald-500' :
              'bg-purple-500'
            }`}>
              {user?.fullName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <link.icon className={`h-5 w-5 mr-3 ${
                    isActive(link.href) ? 'text-emerald-600' : 'text-gray-400'
                  }`} />
                  <span>{link.label}</span>
                </div>
                {(link.badge) && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    isActive(link.href)
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* Settings */}
            <Link
              href="/dashboard/settings"
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/dashboard/settings')
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Cog6ToothIcon className={`h-5 w-5 mr-3 ${
                isActive('/dashboard/settings') ? 'text-emerald-600' : 'text-gray-400'
              }`} />
              Settings
            </Link>
          </nav>
        </div>
      </div>

      {/* Logout Button - Fixed at bottom */}
      <div className="p-6 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-red-500" />
          Logout
        </button>
      </div>
    </aside>
  );
}