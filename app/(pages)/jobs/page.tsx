"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Home/Navbar';
import { Footer } from '../../components/Home/Footer';
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Mock data for jobs - replace with real API data
const mockJobs = [
  {
    id: '1',
    title: 'Need Plumbing Repair',
    category: 'Plumbing',
    location: 'Ile-Ife, Osun State',
    budget: '₦15,000 - ₦25,000',
    description: 'Bathroom sink leaking urgently. Need experienced plumber to fix the issue.',
    postedDate: '2024-03-15',
    deadline: '2024-03-25',
    jobType: 'Fixed Price',
    experience: 'Intermediate',
    proposals: 5,
    client: {
      name: 'John Adeleke',
      rating: 4.8,
      jobsPosted: 12
    }
  },
  {
    id: '2',
    title: 'House Painting - 3 Bedroom Apartment',
    category: 'Painting',
    location: 'Osogbo, Osun State',
    budget: '₦50,000 - ₦80,000',
    description: 'Looking for experienced painter to paint 3 bedroom apartment. Paint and materials provided.',
    postedDate: '2024-03-14',
    deadline: '2024-03-28',
    jobType: 'Fixed Price',
    experience: 'Expert',
    proposals: 8,
    client: {
      name: 'Sarah Okafor',
      rating: 4.9,
      jobsPosted: 8
    }
  },
  {
    id: '3',
    title: 'Electrical Wiring - New Construction',
    category: 'Electrical',
    location: 'Iwo, Osun State',
    budget: '₦80,000 - ₦120,000',
    description: 'Need licensed electrician for complete wiring of new 4-bedroom duplex.',
    postedDate: '2024-03-13',
    deadline: '2024-04-10',
    jobType: 'Fixed Price',
    experience: 'Expert',
    proposals: 12,
    client: {
      name: 'Mike Obi',
      rating: 4.7,
      jobsPosted: 15
    }
  },
  {
    id: '4',
    title: 'Custom Kitchen Cabinets',
    category: 'Carpentry',
    location: 'Ede, Osun State',
    budget: '₦100,000 - ₦150,000',
    description: 'Need carpenter to build custom kitchen cabinets with modern design.',
    postedDate: '2024-03-12',
    deadline: '2024-04-05',
    jobType: 'Fixed Price',
    experience: 'Intermediate',
    proposals: 6,
    client: {
      name: 'Funmi Adewale',
      rating: 5.0,
      jobsPosted: 6
    }
  },
  {
    id: '5',
    title: 'Deep Cleaning Services',
    category: 'Cleaning',
    location: 'Ile-Ife, Osun State',
    budget: '₦20,000 - ₦35,000',
    description: 'Need professional cleaner for deep cleaning of 4-bedroom house.',
    postedDate: '2024-03-11',
    deadline: '2024-03-20',
    jobType: 'Fixed Price',
    experience: 'Entry',
    proposals: 15,
    client: {
      name: 'Chidi Okonkwo',
      rating: 4.6,
      jobsPosted: 9
    }
  },
  {
    id: '6',
    title: 'Furniture Assembly',
    category: 'Carpentry',
    location: 'Osogbo, Osun State',
    budget: '₦10,000 - ₦20,000',
    description: 'Need help assembling IKEA furniture for new apartment.',
    postedDate: '2024-03-10',
    deadline: '2024-03-18',
    jobType: 'Fixed Price',
    experience: 'Entry',
    proposals: 10,
    client: {
      name: 'Amara Eze',
      rating: 4.5,
      jobsPosted: 4
    }
  }
];

const categories = [
  'All Categories',
  'Plumbing',
  'Electrical',
  'Painting',
  'Carpentry',
  'Cleaning',
  'Moving',
  'IT Services',
  'Photography',
  'Home Repairs',
  'Construction'
];

const experienceLevels = [
  'All Levels',
  'Entry',
  'Intermediate',
  'Expert'
];

const jobTypes = [
  'All Types',
  'Fixed Price',
  'Hourly',
  'Negotiable'
];

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedExperience, setSelectedExperience] = useState('All Levels');
  const [selectedJobType, setSelectedJobType] = useState('All Types');
  const [showFilters, setShowFilters] = useState(false);

  const filteredJobs = mockJobs.filter(job => {
    // Search filter
    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !job.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategory !== 'All Categories' && job.category !== selectedCategory) {
      return false;
    }
    
    // Experience filter
    if (selectedExperience !== 'All Levels' && job.experience !== selectedExperience) {
      return false;
    }
    
    // Job type filter
    if (selectedJobType !== 'All Types' && job.jobType !== selectedJobType) {
      return false;
    }
    
    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedExperience('All Levels');
    setSelectedJobType('All Types');
  };

  return (
    <>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Jobs</h1>
          <p className="text-gray-600">
            Browse through available jobs and find the perfect opportunity for your skills
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {experienceLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {(searchQuery || selectedCategory !== 'All Categories' || 
                selectedExperience !== 'All Levels' || selectedJobType !== 'All Types') && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 space-y-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {experienceLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {(searchQuery || selectedCategory !== 'All Categories' || 
                selectedExperience !== 'All Levels' || selectedJobType !== 'All Types') && (
                <button
                  onClick={clearFilters}
                  className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredJobs.length}</span> jobs
          </p>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow group"
              >
                {/* Job Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors mb-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                      <span>{job.client.name}</span>
                      <span className="mx-2">•</span>
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{job.client.rating}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    {job.category}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {job.description}
                </p>

                {/* Job Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {job.budget}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {job.experience} • {job.jobType}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Posted {new Date(job.postedDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm font-medium text-emerald-600">
                    <BriefcaseIcon className="h-4 w-4 mr-1" />
                    {job.proposals} proposals
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your filters or search criteria
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Load More Button (if needed) */}
        {filteredJobs.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
              Load More Jobs
            </button>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

// Missing StarIcon import
import { StarIcon } from '@heroicons/react/24/solid';