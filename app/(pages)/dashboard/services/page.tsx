"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useService } from '../../../context/ServiceContext';
import { useUser } from '../../../context/UserContext';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  WrenchIcon
} from '@heroicons/react/24/outline';

export default function MyServicesPage() {
  const { services, getServices, deleteService, loadingServices } = useService();
  const { user } = useUser();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getServices({ provider: user._id });
    }
  }, [user]);

  const handleDelete = async () => {
    if (serviceToDelete) {
      await deleteService(serviceToDelete);
      setShowDeleteModal(false);
      setServiceToDelete(null);
    }
  };

  const userServices = services.filter(s => 
    typeof s.provider === 'object' ? s.provider._id === user?._id : s.provider === user?._id
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-600">Manage your service listings</p>
        </div>
        <Link
          href="/dashboard/services/create"
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Service
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Services</p>
          <p className="text-2xl font-bold text-gray-900">{userServices.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {userServices.filter(s => s.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Views</p>
          <p className="text-2xl font-bold text-gray-900">1,234</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Applications</p>
          <p className="text-2xl font-bold text-gray-900">56</p>
        </div>
      </div>

      {/* Services List */}
      {loadingServices ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : userServices.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userServices.map((service) => (
                <tr key={service._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{service.title}</p>
                      <p className="text-sm text-gray-500">Posted {new Date(service.createdAt).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{service.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-emerald-600">
                      {service.priceRange?.string || 'Contact for price'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      service.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">12</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/services/${service._id}`}
                      className="inline-flex items-center p-1 text-gray-400 hover:text-emerald-600"
                      title="View"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/dashboard/services/edit/${service._id}`}
                      className="inline-flex items-center p-1 text-gray-400 hover:text-blue-600"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => {
                        setServiceToDelete(service._id);
                        setShowDeleteModal(true);
                      }}
                      className="inline-flex items-center p-1 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <WrenchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first service listing</p>
          <Link
            href="/dashboard/services/create"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Service
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-2">Delete Service</h3>
              <p className="text-gray-600 mb-4">Are you sure you want to delete this service? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}