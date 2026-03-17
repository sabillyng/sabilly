"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ComponentType } from 'react';
import {
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// Type definitions
type JobStatus = 'active' | 'in_progress' | 'completed' | 'cancelled';

interface JobPost {
  id: string;
  title: string;
  category: string;
  location: string;
  budget: string;
  description: string;
  postedDate: string;
  deadline: string;
  status: JobStatus;
  applications: number;
  shortlisted: number;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  color: string;
}

interface DeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function MyJobPostsPage() {
  const [filter, setFilter] = useState<'all' | JobStatus>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  // Mock data - replace with real API calls
  const jobPosts: JobPost[] = [
    {
      id: '1',
      title: 'Need Plumbing Repair',
      category: 'Plumbing',
      location: 'Ile-Ife',
      budget: '₦15,000 - ₦25,000',
      description: 'Bathroom sink leaking, need urgent repair',
      postedDate: '2024-03-15',
      deadline: '2024-03-25',
      status: 'active',
      applications: 5,
      shortlisted: 2
    },
    {
      id: '2',
      title: 'House Painting',
      category: 'Painting',
      location: 'Osogbo',
      budget: '₦50,000 - ₦80,000',
      description: '3 bedroom apartment needs painting',
      postedDate: '2024-03-10',
      deadline: '2024-03-20',
      status: 'in_progress',
      applications: 8,
      shortlisted: 3
    },
    {
      id: '3',
      title: 'Electrical Wiring',
      category: 'Electrical',
      location: 'Ede',
      budget: '₦30,000 - ₦45,000',
      description: 'Complete house rewiring needed',
      postedDate: '2024-03-01',
      deadline: '2024-03-15',
      status: 'completed',
      applications: 12,
      shortlisted: 4
    },
    {
      id: '4',
      title: 'Carpentry Work',
      category: 'Carpentry',
      location: 'Iwo',
      budget: '₦20,000 - ₦35,000',
      description: 'Build custom kitchen cabinets',
      postedDate: '2024-02-28',
      deadline: '2024-03-10',
      status: 'cancelled',
      applications: 3,
      shortlisted: 0
    }
  ];

  const filteredPosts = jobPosts.filter(post => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  const getStatusBadge = (status: JobStatus): string => {
    const styles: Record<JobStatus, string> = {
      active: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return styles[status];
  };

  const getStatusIcon = (status: JobStatus): ComponentType<{ className?: string }> => {
    const icons: Record<JobStatus, ComponentType<{ className?: string }>> = {
      active: ClockIcon,
      in_progress: BriefcaseIcon,
      completed: CheckCircleIcon,
      cancelled: XCircleIcon
    };
    return icons[status];
  };

  const stats = {
    total: jobPosts.length,
    active: jobPosts.filter(j => j.status === 'active').length,
    in_progress: jobPosts.filter(j => j.status === 'in_progress').length,
    completed: jobPosts.filter(j => j.status === 'completed').length,
    cancelled: jobPosts.filter(j => j.status === 'cancelled').length,
    totalApplications: jobPosts.reduce((acc, j) => acc + j.applications, 0)
  };

  const filterTabs: Array<{ key: 'all' | JobStatus; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  const handleDelete = (id: string) => {
    setJobToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    // Add delete logic here
    console.log('Deleting job:', jobToDelete);
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Job Posts</h1>
          <p className="text-gray-600">Manage and track your job listings</p>
        </div>
        <Link
          href="/post-job"
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <BriefcaseIcon className="h-5 w-5 mr-2" />
          Post New Job
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Jobs"
          value={stats.total}
          icon={BriefcaseIcon}
          color="bg-gray-500"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={ClockIcon}
          color="bg-blue-500"
        />
        <StatCard
          label="In Progress"
          value={stats.in_progress}
          icon={BriefcaseIcon}
          color="bg-yellow-500"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircleIcon}
          color="bg-green-500"
        />
        <StatCard
          label="Total Applications"
          value={stats.totalApplications}
          icon={UserGroupIcon}
          color="bg-purple-500"
        />
      </div>

      {/* Filters */}
      <div className="flex space-x-2 border-b border-gray-200">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              filter === tab.key
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} {tab.key !== 'all' && `(${stats[tab.key]})`}
          </button>
        ))}
      </div>

      {/* Job Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((job) => {
          const StatusIcon = getStatusIcon(job.status);
          
          return (
            <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{job.category}</span>
                    <span className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Posted {new Date(job.postedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusBadge(job.status)}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

              {/* Budget and Deadline */}
              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center text-sm">
                  <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="font-medium text-emerald-600">{job.budget}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Deadline: {new Date(job.deadline).toLocaleDateString()}
                </div>
              </div>

              {/* Applications Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-medium text-gray-900">
                    {job.applications} total • {job.shortlisted} shortlisted
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{ width: job.applications > 0 ? `${(job.shortlisted / job.applications) * 100}%` : '0%' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/jobs/${job.id}`}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                  <Link
                    href={`/dashboard/jobs/${job.id}/applications`}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                  >
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    View Applications ({job.applications})
                  </Link>
                </div>
                <div className="flex space-x-2">
                  {job.status === 'active' && (
                    <>
                      <Link
                        href={`/dashboard/jobs/edit/${job.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No job posts found</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? "You haven't posted any jobs yet" 
                : `You don't have any ${filter.replace('_', ' ')} jobs`}
            </p>
            {filter === 'all' && (
              <Link
                href="/post-job"
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <BriefcaseIcon className="h-5 w-5 mr-2" />
                Post Your First Job
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function DeleteModal({ onClose, onConfirm }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg max-w-md w-full p-6">
          <h3 className="text-lg font-semibold mb-2">Delete Job Post</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this job post? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}