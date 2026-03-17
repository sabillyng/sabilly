"use client";
import { useState } from 'react';
import Link from 'next/link';
import {
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { ComponentType } from 'react';

// Type definitions
type RequestStatus = 'pending' | 'accepted' | 'rejected';

interface Customer {
  name: string;
  location: string;
  avatar: string | null;
}

interface JobRequest {
  id: string;
  jobTitle: string;
  customer: Customer;
  budget: string;
  description: string;
  requestedDate: string;
  status: RequestStatus;
  createdAt: string;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  color?: string;
}

export default function JobRequestsPage() {
  const [filter, setFilter] = useState<'all' | RequestStatus>('all');

  // Mock data with proper typing
  const requests: JobRequest[] = [
    {
      id: '1',
      jobTitle: 'Plumbing Repair',
      customer: {
        name: 'John Doe',
        location: 'Lagos',
        avatar: null
      },
      budget: '₦15,000',
      description: 'Need urgent plumbing repair for bathroom sink',
      requestedDate: '2024-03-20',
      status: 'pending',
      createdAt: '2 hours ago'
    },
    {
      id: '2',
      jobTitle: 'Electrical Wiring',
      customer: {
        name: 'Sarah Okafor',
        location: 'Abuja',
        avatar: null
      },
      budget: '₦25,000',
      description: 'Complete house rewiring needed',
      requestedDate: '2024-03-22',
      status: 'accepted',
      createdAt: '1 day ago'
    },
    {
      id: '3',
      jobTitle: 'House Painting',
      customer: {
        name: 'Mike Obi',
        location: 'Port Harcourt',
        avatar: null
      },
      budget: '₦50,000',
      description: '3 bedroom apartment painting',
      requestedDate: '2024-03-25',
      status: 'rejected',
      createdAt: '3 days ago'
    }
  ];

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusBadge = (status: RequestStatus): string => {
    const styles: Record<RequestStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return styles[status];
  };

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    total: requests.length
  };

  const tabs: Array<{ key: 'all' | RequestStatus; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'rejected', label: 'Rejected' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Requests</h1>
        <p className="text-gray-600">Manage incoming job requests from customers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={stats.total} icon={BriefcaseIcon} />
        <StatCard label="Pending" value={stats.pending} icon={ClockIcon} color="text-yellow-600" />
        <StatCard label="Accepted" value={stats.accepted} icon={CheckCircleIcon} color="text-green-600" />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircleIcon} color="text-red-600" />
      </div>

      {/* Filters */}
      <div className="flex space-x-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              filter === tab.key
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} ({tab.key === 'all' ? stats.total : stats[tab.key]})
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {request.jobTitle}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <UserCircleIcon className="h-4 w-4 mr-1" />
                    {request.customer.name}
                  </span>
                  <span className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {request.customer.location}
                  </span>
                  <span className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                    {request.budget}
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(request.status)}`}>
                {request.status}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{request.description}</p>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Requested for: {new Date(request.requestedDate).toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/dashboard/jobs/${request.id}`}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  View Details
                </Link>
                {request.status === 'pending' && (
                  <>
                    <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Accept
                    </button>
                    <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Decline
                    </button>
                  </>
                )}
                <Link
                  href={`/messages/new?customer=${encodeURIComponent(request.customer.name)}`}
                  className="p-2 text-gray-400 hover:text-emerald-600 border border-gray-300 rounded-lg"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">
              You don&apos;t have any {filter !== 'all' ? filter : ''} requests at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color = 'text-gray-900' }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-5 w-5 text-gray-400" />
        <span className={`text-xl font-bold ${color}`}>{value}</span>
      </div>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}