"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '../../../context/UserContext';
import {
  BriefcaseIcon,
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

export default function JobsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  // Mock jobs data - replace with real data from API
  const jobs = [
    {
      id: '1',
      title: 'Plumbing Repair',
      customer: 'John Doe',
      provider: 'Adebayo Adekunle',
      date: '2024-03-15',
      status: 'active',
      budget: '₦15,000',
      location: 'Lagos'
    },
    {
      id: '2',
      title: 'Electrical Wiring',
      customer: 'Sarah Okafor',
      provider: 'Chioma Okafor',
      date: '2024-03-14',
      status: 'completed',
      budget: '₦25,000',
      location: 'Abuja'
    },
    // Add more jobs...
  ];

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'all') return true;
    return job.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = {
    active: jobs.filter(j => j.status === 'active').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    cancelled: jobs.filter(j => j.status === 'cancelled').length,
    total: jobs.length
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.role === 'customer' ? 'My Job Posts' : 'Job Requests'}
        </h1>
        <p className="text-gray-600">
          {user?.role === 'customer' 
            ? 'Track and manage your job listings'
            : 'Manage incoming job requests and applications'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Jobs</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {(['all', 'active', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredJobs.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredJobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        {user?.role === 'customer' ? 'Provider: ' : 'Customer: '}
                        <span className="font-medium text-gray-700">
                          {user?.role === 'customer' ? job.provider : job.customer}
                        </span>
                      </span>
                      <span>•</span>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{new Date(job.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold text-emerald-600">{job.budget}</span>
                    {job.status === 'active' && (
                      <span className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Due in 2 days
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-100"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/messages?job=${job.id}`}
                      className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-100"
                    >
                      <ChatBubbleLeftIcon className="h-5 w-5" />
                    </Link>
                  </div>
                </div>

                {/* Progress Bar (for active jobs) */}
                {job.status === 'active' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500">
              {activeTab === 'all' 
                ? "You haven't posted any jobs yet" 
                : `No ${activeTab} jobs at the moment`}
            </p>
            {user?.role === 'customer' && activeTab === 'all' && (
              <Link
                href="/post-job"
                className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Post a Job
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}