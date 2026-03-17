"use client";
import Link from 'next/link';
import {
  BriefcaseIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function ActiveJobsPage() {
  // Mock data - replace with real API calls
  const activeJobs = [
    {
      id: '1',
      title: 'Plumbing Repair',
      customer: 'John Doe',
      location: 'Lagos',
      budget: '₦15,000',
      startDate: '2024-03-20',
      endDate: '2024-03-22',
      progress: 60,
      status: 'in_progress'
    },
    {
      id: '2',
      title: 'Electrical Wiring',
      customer: 'Sarah Okafor',
      location: 'Abuja',
      budget: '₦25,000',
      startDate: '2024-03-18',
      endDate: '2024-03-25',
      progress: 30,
      status: 'in_progress'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Active Jobs</h1>
        <p className="text-gray-600">Jobs you&apos;re currently working on</p>
      </div>

      {/* Active Jobs List */}
      <div className="space-y-4">
        {activeJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <UserCircleIcon className="h-4 w-4 mr-1" />
                    {job.customer}
                  </span>
                  <span className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {job.location}
                  </span>
                  <span className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                    {job.budget}
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                In Progress
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">{job.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Started: {new Date(job.startDate).toLocaleDateString()}</span>
              <ClockIcon className="h-4 w-4" />
              <span>Deadline: {new Date(job.endDate).toLocaleDateString()}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <Link
                  href={`/dashboard/jobs/${job.id}`}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  View Details
                </Link>
                <button className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                  Update Progress
                </button>
              </div>
              <Link
                href={`/messages/new?job=${job.id}`}
                className="p-2 text-gray-400 hover:text-emerald-600"
              >
                <ChatBubbleLeftIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        ))}

        {activeJobs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active jobs</h3>
            <p className="text-gray-500">You don&apos;t have any active jobs at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}