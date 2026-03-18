"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useService } from '../../../context/ServiceContext';
import { useUser } from '../../../context/UserContext';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  WrenchIcon,
  MapPinIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  NoSymbolIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Service } from '../../../types/service';

type FilterType = 'all' | 'active' | 'inactive';

export default function MyServicesPage() {
  const { 
    services, 
    getServices, 
    deleteService, 
    toggleServiceStatus, 
    loadingServices,
    pagination 
  } = useService();
  
  const { user } = useUser();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');

  useEffect(() => {
    if (user) {
      loadServices();
    }
  }, [user, currentPage, sortBy]);

  const loadServices = async () => {
    await getServices({ 
      provider: user?._id,
      page: currentPage,
      limit: 10,
      sortBy: sortBy === 'rating' ? 'rating' : 'createdAt',
      sortOrder: sortBy === 'oldest' ? 'asc' : 'desc'
    });
  };

  const handleDelete = async () => {
    if (serviceToDelete) {
      setActionLoading(serviceToDelete._id);
      await deleteService(serviceToDelete._id);
      setShowDeleteModal(false);
      setServiceToDelete(null);
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (service: Service) => {
    setActionLoading(service._id);
    await toggleServiceStatus(service._id, !service.isActive);
    setActionLoading(null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter services locally (in addition to API filtering)
  const filteredServices = services.filter(service => {
    if (filter === 'all') return true;
    if (filter === 'active') return service.isActive;
    if (filter === 'inactive') return !service.isActive;
    return true;
  });

  // Calculate real stats from actual services
  const totalServices = services.length;
  const activeServices = services.filter(s => s.isActive).length;
  const inactiveServices = services.filter(s => !s.isActive).length;
  
  // Calculate average rating from services
  const servicesWithRating = services.filter(s => s.rating && s.rating > 0);
  const averageRating = servicesWithRating.length > 0
    ? servicesWithRating.reduce((sum, s) => sum + (s.rating || 0), 0) / servicesWithRating.length
    : 0;

  const totalReviews = services.reduce((sum, s) => sum + (s.totalReviews || 0), 0);
  const totalViews = services.reduce((sum, s) => sum + ((s).views || 0), 0);

  if (loadingServices && services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-500">Loading your services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-600">Manage your service listings</p>
        </div>
        <Link
          href="/dashboard/services/create"
          className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Service
        </Link>
      </div>

      {/* Stats Cards - All from actual data */}
      {services.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Services"
            value={totalServices}
            icon={DocumentTextIcon}
            color="bg-blue-500"
          />
          <StatCard
            label="Active Services"
            value={activeServices}
            icon={CheckCircleIcon}
            color="bg-green-500"
          />
          <StatCard
            label="Inactive Services"
            value={inactiveServices}
            icon={NoSymbolIcon}
            color="bg-gray-500"
          />
          <StatCard
            label="Total Views"
            value={totalViews.toLocaleString()}
            icon={EyeIcon}
            color="bg-purple-500"
          />
        </div>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex space-x-2 border-b border-gray-200">
          {(['all', 'active', 'inactive'] as FilterType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                filter === tab
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
              }`}
            >
              {tab} ({tab === 'all' ? totalServices : tab === 'active' ? activeServices : inactiveServices})
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-4 w-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Services List */}
      {filteredServices.length > 0 ? (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map((service) => (
                    <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {service.images && service.images.length > 0 ? (
                            <div className="h-10 w-10 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                              <Image
                                src={service.images[0]}
                                alt={service.title}
                                width={40}
                                height={40}
                                className="object-cover h-full w-full"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-100 mr-3 flex-shrink-0 flex items-center justify-center">
                              <WrenchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{service.title}</p>
                            {service.location && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <MapPinIcon className="h-3 w-3 mr-1" />
                                {service.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {service.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-emerald-600">
                          {service.priceRange?.string || 'Contact for price'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {service.rating && service.rating > 0 ? (
                          <div className="flex items-center">
                            <div className="flex items-center mr-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <StarIconSolid
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= Math.round(service.rating || 0)
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({service.totalReviews || 0})
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No ratings</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(service)}
                          disabled={actionLoading === service._id}
                          className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            service.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {actionLoading === service._id ? (
                            <ArrowPathIcon className="h-3 w-3 animate-spin mr-1" />
                          ) : null}
                          {service.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(service.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          href={`/services/${service._id}`}
                          className="inline-flex items-center p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-100 transition-colors"
                          title="View Service"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/dashboard/services/edit/${service._id}`}
                          className="inline-flex items-center p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Edit Service"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => {
                            setServiceToDelete(service);
                            setShowDeleteModal(true);
                          }}
                          disabled={actionLoading === service._id}
                          className="inline-flex items-center p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Service"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState />
      )}

      {/* Rating Summary Card (if there are ratings) */}
      {servicesWithRating.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-emerald-900 mb-1">Overall Performance</h3>
              <div className="flex items-center">
                <div className="flex items-center mr-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIconSolid
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(averageRating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-2xl font-bold text-emerald-700 mr-2">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-emerald-600">
                  average from {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-emerald-700">
                <span className="font-bold">{servicesWithRating.length}</span> services rated
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && serviceToDelete && (
        <DeleteModal
          service={serviceToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setServiceToDelete(null);
          }}
          onConfirm={handleDelete}
          loading={actionLoading === serviceToDelete._id}
        />
      )}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
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

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <WrenchIcon className="h-10 w-10 text-emerald-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Get started by creating your first service listing. Showcase your skills and attract potential clients.
      </p>
      <Link
        href="/dashboard/services/create"
        className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Create Your First Service
      </Link>
    </div>
  );
}

// Delete Modal Component
interface DeleteModalProps {
  service: Service;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

function DeleteModal({ service, onClose, onConfirm, loading }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <TrashIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Service</h3>
            <p className="text-sm text-gray-500 mb-2">
              Are you sure you want to delete <span className="font-semibold">&quot;{service.title}&quot;</span>?
            </p>
            <p className="text-xs text-gray-400 mb-6">
              This action cannot be undone and will remove the service from the platform.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Service'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}