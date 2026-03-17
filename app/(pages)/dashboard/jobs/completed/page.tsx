"use client";
import Link from 'next/link';
import {
  CheckCircleIcon,
  StarIcon,
  EyeIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

export default function CompletedJobsPage() {
  // Mock data - replace with real API calls
  const completedJobs = [
    {
      id: '1',
      title: 'House Painting',
      customer: 'Mike Obi',
      location: 'Port Harcourt',
      amount: '₦50,000',
      completedDate: '2024-03-10',
      rating: 5,
      review: 'Excellent work! Very professional.'
    },
    {
      id: '2',
      title: 'Carpentry Work',
      customer: 'Amaka Eze',
      location: 'Enugu',
      amount: '₦35,000',
      completedDate: '2024-03-05',
      rating: 4,
      review: 'Good quality work, would recommend.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Completed Jobs</h1>
        <p className="text-gray-600">Jobs you&apos;ve successfully completed</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Completed</p>
          <p className="text-2xl font-bold text-gray-900">{completedJobs.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Earned</p>
          <p className="text-2xl font-bold text-emerald-600">₦85,000</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Average Rating</p>
          <div className="flex items-center">
            <p className="text-2xl font-bold text-gray-900 mr-2">4.5</p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-5 w-5 ${
                    star <= 4.5 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Completed Jobs List */}
      <div className="space-y-4">
        {completedJobs.map((job) => (
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
                    {job.amount}
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Completed
              </span>
            </div>

            {/* Rating and Review */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <div className="flex mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-4 w-4 ${
                        star <= job.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">Customer Rating</span>
              </div>
              <p className="text-sm text-gray-700">&apos;{job.review}&apos;</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Completed on {new Date(job.completedDate).toLocaleDateString()}
              </span>
              <Link
                href={`/dashboard/jobs/${job.id}`}
                className="inline-flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </div>
          </div>
        ))}

        {completedJobs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No completed jobs</h3>
            <p className="text-gray-500">You haven&apos;t completed any jobs yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}