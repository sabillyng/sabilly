"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ComponentType } from 'react';
import {
  UserCircleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Type definitions
type ApplicantRole = 'artisan' | 'business_owner';
type ApplicationStatus = 'pending' | 'shortlisted' | 'accepted' | 'rejected';

interface Applicant {
  id: string;
  name: string;
  avatar: string | null;
  role: ApplicantRole;
  rating: number;
  reviews: number;
  completedJobs: number;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  applicant: Applicant;
  skills: string[];
  proposedBudget: string;
  proposedTimeline: string;
  coverLetter: string;
  appliedDate: string;
  status: ApplicationStatus;
}

interface JobOption {
  id: string;
  title: string;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  color: string;
}

export default function ApplicationsPage() {
  const [filter, setFilter] = useState<'all' | ApplicationStatus>('all');
  const [selectedJob, setSelectedJob] = useState<string>('all');

  // Mock data - replace with real API calls
  const jobs: JobOption[] = [
    { id: 'all', title: 'All Jobs' },
    { id: '1', title: 'Plumbing Repair' },
    { id: '2', title: 'House Painting' },
    { id: '3', title: 'Electrical Wiring' },
  ];

  const applications: Application[] = [
    {
      id: '1',
      jobId: '1',
      jobTitle: 'Plumbing Repair',
      applicant: {
        id: '101',
        name: 'Adebayo Adekunle',
        avatar: null,
        role: 'artisan',
        rating: 4.8,
        reviews: 127,
        completedJobs: 89
      },
      skills: ['Plumbing', 'Pipe Fitting', 'Water Heater Installation'],
      proposedBudget: '₦18,000',
      proposedTimeline: '2 days',
      coverLetter: 'I have over 10 years of experience in plumbing. I can fix your sink issue quickly and professionally.',
      appliedDate: '2024-03-15T10:30:00',
      status: 'pending'
    },
    {
      id: '2',
      jobId: '1',
      jobTitle: 'Plumbing Repair',
      applicant: {
        id: '102',
        name: 'Chioma Okafor',
        avatar: null,
        role: 'artisan',
        rating: 4.9,
        reviews: 89,
        completedJobs: 56
      },
      skills: ['Plumbing', 'Bathroom Renovation', 'Leak Detection'],
      proposedBudget: '₦20,000',
      proposedTimeline: '1 day',
      coverLetter: 'Certified plumber with 8 years experience. I guarantee quality work.',
      appliedDate: '2024-03-14T15:45:00',
      status: 'shortlisted'
    },
    {
      id: '3',
      jobId: '2',
      jobTitle: 'House Painting',
      applicant: {
        id: '103',
        name: 'Femi Ogunleye',
        avatar: null,
        role: 'artisan',
        rating: 4.7,
        reviews: 203,
        completedJobs: 156
      },
      skills: ['Painting', 'Interior Design', 'Wallpaper Installation'],
      proposedBudget: '₦75,000',
      proposedTimeline: '5 days',
      coverLetter: 'Professional painter with 15 years experience. Your apartment will look beautiful.',
      appliedDate: '2024-03-13T09:15:00',
      status: 'accepted'
    },
    {
      id: '4',
      jobId: '3',
      jobTitle: 'Electrical Wiring',
      applicant: {
        id: '104',
        name: 'Emeka Nwosu',
        avatar: null,
        role: 'business_owner',
        rating: 4.5,
        reviews: 45,
        completedJobs: 32
      },
      skills: ['Electrical', 'Wiring', 'Installation'],
      proposedBudget: '₦40,000',
      proposedTimeline: '3 days',
      coverLetter: 'Licensed electrician, fully insured. Quality work guaranteed.',
      appliedDate: '2024-03-12T14:20:00',
      status: 'rejected'
    }
  ];

  const filteredApplications = applications.filter(app => {
    if (selectedJob !== 'all' && app.jobId !== selectedJob) return false;
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusBadge = (status: ApplicationStatus): string => {
    const styles: Record<ApplicationStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return styles[status];
  };

  const getStatusIcon = (status: ApplicationStatus): ComponentType<{ className?: string }> => {
    const icons: Record<ApplicationStatus, ComponentType<{ className?: string }>> = {
      pending: ClockIcon,
      shortlisted: StarIconSolid,
      accepted: CheckCircleIcon,
      rejected: XCircleIcon
    };
    return icons[status];
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  const filterTabs: Array<{ key: 'all' | ApplicationStatus; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'rejected', label: 'Rejected' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600">Review and manage job applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard label="Total" value={stats.total} icon={DocumentTextIcon} color="bg-gray-500" />
        <StatCard label="Pending" value={stats.pending} icon={ClockIcon} color="bg-yellow-500" />
        <StatCard label="Shortlisted" value={stats.shortlisted} icon={StarIconSolid} color="bg-blue-500" />
        <StatCard label="Accepted" value={stats.accepted} icon={CheckCircleIcon} color="bg-green-500" />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircleIcon} color="bg-red-500" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
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
              {tab.label} ({stats[tab.key]})
            </button>
          ))}
        </div>

        {/* Job Filter */}
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {jobs.map(job => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((app) => {
          const StatusIcon = getStatusIcon(app.status);
          
          return (
            <div key={app.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {app.applicant.avatar ? (
                      <Image
                        src={app.applicant.avatar}
                        alt={app.applicant.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <UserCircleIcon className="h-8 w-8 text-gray-500" />
                    )}
                  </div>

                  {/* Applicant Info */}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-lg">{app.applicant.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        app.applicant.role === 'artisan' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {app.applicant.role === 'artisan' ? 'Artisan' : 'Business'}
                      </span>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-3 text-sm mb-2">
                      <div className="flex items-center">
                        <StarIconSolid className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-medium">{app.applicant.rating}</span>
                        <span className="text-gray-500 ml-1">({app.applicant.reviews} reviews)</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-600">{app.applicant.completedJobs} jobs completed</span>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1">
                      {app.skills.map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusBadge(app.status)}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {app.status}
                  </span>
                </div>
              </div>

              {/* Job Title and Proposal */}
              <div className="ml-16 mb-4">
                <Link 
                  href={`/jobs/${app.jobId}`}
                  className="text-emerald-600 hover:text-emerald-700 font-medium mb-2 inline-block"
                >
                  {app.jobTitle}
                </Link>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                    Budget: {app.proposedBudget}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                    Timeline: {app.proposedTimeline}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                    Applied: {new Date(app.appliedDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Cover Letter */}
                <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded-lg">
                  {app.coverLetter}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                <Link
                  href={`/dashboard/applications/${app.id}`}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  View Full Profile
                </Link>
                
                {app.status === 'pending' && (
                  <>
                    <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Shortlist
                    </button>
                    <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Accept
                    </button>
                    <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Reject
                    </button>
                  </>
                )}
                
                {app.status === 'shortlisted' && (
                  <>
                    <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Accept
                    </button>
                    <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Reject
                    </button>
                  </>
                )}

                <Link
                  href={`/messages/new?applicant=${app.applicant.id}`}
                  className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-100"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                </Link>
              </div>
            </div>
          );
        })}

        {filteredApplications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You haven't received any applications yet" 
                : `No ${filter} applications at the moment`}
            </p>
          </div>
        )}
      </div>
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