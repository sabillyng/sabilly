// components/dashboard/properties/PropertyGrid.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useProperty } from '../../../../context/PropertyContext'
import {
  HomeModernIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  MapPinIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { Property, PropertyStatus, ApartmentType } from '../../../../types/property'

interface PropertyGridProps {
  viewMode: 'grid' | 'list'
  properties: Property[]
  isLoading?: boolean
  showActions?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onView?: (id: string) => void
  selectedProperties?: string[]
  onSelectProperty?: (id: string) => void
  onSelectAll?: () => void
}

const statusConfig: Record<PropertyStatus, { color: string; icon: typeof CheckCircleIcon; label: string }> = {
  available: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Available' },
  rented: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon, label: 'Rented' },
  maintenance: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Maintenance' },
  pending: { color: 'bg-amber-100 text-amber-800', icon: ClockIcon, label: 'Pending' }
}

const apartmentTypeLabels: Record<ApartmentType, string> = {
  'a-room': 'A Room',
  'self-contained': 'Self Contained',
  'room-and-parlour': 'Room & Parlour',
  'two-bedroom': 'Two Bedroom',
  'three-bedroom': 'Three Bedroom',
  'flat': 'Flat',
  'others': 'Others'
}

export default function PropertyGrid({ 
  viewMode, 
  properties, 
  isLoading = false, 
  showActions = true,
  onEdit,
  onDelete,
  onView,
  selectedProperties = [],
  onSelectProperty,
  onSelectAll
}: PropertyGridProps) {
  const router = useRouter()
  const { deleteProperty } = useProperty()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleViewDetails = (propertyId: string) => {
    if (onView) {
      onView(propertyId)
    } else {
      router.push(`/dashboard/admin/properties/${propertyId}`)
    }
  }

  const handleEditProperty = (propertyId: string) => {
    if (onEdit) {
      onEdit(propertyId)
    } else {
      router.push(`/dashboard/admin/properties/${propertyId}/edit`)
    }
  }

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) return
    
    setDeletingId(propertyId)
    try {
      if (onDelete) {
        await onDelete(propertyId)
      } else {
        const result = await deleteProperty(propertyId)
        if (!result.success) {
          alert(result.message || 'Failed to delete property')
        }
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('Failed to delete property')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSelectProperty = (propertyId: string) => {
    if (onSelectProperty) {
      onSelectProperty(propertyId)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-emerald-200"></div>
            <div className="p-4 space-y-4">
              <div className="h-4 bg-emerald-200 rounded w-3/4"></div>
              <div className="h-3 bg-emerald-200 rounded w-2/3"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-emerald-200 rounded w-1/3"></div>
                <div className="h-3 bg-emerald-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HomeModernIcon className="w-10 h-10 text-emerald-600" />
        </div>
        <h3 className="text-xl font-semibold text-emerald-900 mb-2">No Properties Found</h3>
        <p className="text-emerald-600">Try adjusting your filters or add a new property</p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-emerald-50/50 border-b border-emerald-100">
                {onSelectProperty && (
                  <th className="p-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedProperties.length === properties.length && properties.length > 0}
                      onChange={onSelectAll}
                      className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                    />
                  </th>
                )}
                <th className="text-left p-4 font-medium text-emerald-700">Property</th>
                <th className="text-left p-4 font-medium text-emerald-700">Type</th>
                <th className="text-left p-4 font-medium text-emerald-700">Status</th>
                <th className="text-left p-4 font-medium text-emerald-700">Price</th>
                <th className="text-left p-4 font-medium text-emerald-700">Views</th>
                <th className="text-left p-4 font-medium text-emerald-700">Landlord</th>
                {showActions && (
                  <th className="text-left p-4 font-medium text-emerald-700">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {properties.map((property) => {
                const StatusIcon = statusConfig[property.status].icon
                const statusColor = statusConfig[property.status].color
                
                return (
                  <tr 
                    key={property._id} 
                    className="hover:bg-emerald-50/30 transition-colors group cursor-pointer"
                    onClick={() => handleViewDetails(property._id)}
                  >
                    {onSelectProperty && (
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedProperties.includes(property._id)}
                          onChange={() => handleSelectProperty(property._id)}
                          className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                        />
                      </td>
                    )}
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {property.media?.images?.[0] ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                              <Image
                                src={property.media.images[0].url}
                                alt={property.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <HomeModernIcon className="w-6 h-6 text-emerald-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-emerald-900 truncate group-hover:text-emerald-700">
                            {property.title}
                          </p>
                          <p className="text-sm text-emerald-600 truncate max-w-xs">
                            {property.address}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm capitalize whitespace-nowrap">
                        {apartmentTypeLabels[property.apartmentType]}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-4 h-4 ${statusColor.replace('bg-', 'text-').replace(' text-', '')}`} />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor} whitespace-nowrap`}>
                          {statusConfig[property.status].label}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-emerald-900 whitespace-nowrap">
                      {formatCurrency(property.price)}/mo
                    </td>
                    <td className="p-4 text-emerald-700">
                      <div className="flex items-center">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        {property.views || 0}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                          <UserCircleIcon className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-sm text-emerald-700 truncate max-w-[120px]">
                          {property.landlordInfo?.personalInfo?.fullName || 'N/A'}
                        </span>
                      </div>
                    </td>
                    {showActions && (
                      <td className="p-4">
                        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleViewDetails(property._id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditProperty(property._id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit Property"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(property._id)}
                            disabled={deletingId === property._id}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Property"
                          >
                            {deletingId === property._id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <TrashIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Grid View
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => {
        const StatusIcon = statusConfig[property.status].icon
        const statusColor = statusConfig[property.status].color
        
        return (
          <div
            key={property._id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group relative"
          >
            {/* Selection Checkbox */}
            {onSelectProperty && (
              <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedProperties.includes(property._id)}
                  onChange={() => handleSelectProperty(property._id)}
                  className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                />
              </div>
            )}

            {/* Property Image */}
            <div 
              className="relative h-48 bg-emerald-100 overflow-hidden cursor-pointer"
              onClick={() => handleViewDetails(property._id)}
            >
              {property.media?.images?.[0] ? (
                <div className="relative w-full h-full">
                  <Image
                    src={property.media.images[0].url}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-400 flex items-center justify-center">
                  <HomeModernIcon className="w-12 h-12 text-white opacity-50" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <div className="flex items-center space-x-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                  <StatusIcon className={`w-3 h-3 ${statusColor.replace('bg-', 'text-').split(' ')[0]}`} />
                  <span className={`text-xs font-medium ${statusColor.replace('bg-', '').replace(' text-', '')}`}>
                    {statusConfig[property.status].label}
                  </span>
                </div>
              </div>
              
              {/* Price Badge */}
              <div className="absolute bottom-3 left-3">
                <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-emerald-900 rounded-lg font-bold shadow-sm">
                  {formatCurrency(property.price)}<span className="text-xs font-normal text-emerald-600 ml-1">/mo</span>
                </span>
              </div>
            </div>
            
            {/* Property Details */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 
                  className="font-bold text-emerald-900 line-clamp-1 cursor-pointer hover:text-emerald-700"
                  onClick={() => handleViewDetails(property._id)}
                >
                  {property.title}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // Add to favorites logic here
                  }}
                  className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <StarIcon className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-sm text-emerald-600 mb-3 line-clamp-2">
                {property.description?.substring(0, 100)}...
              </p>
              
              {/* Location */}
              <div className="flex items-center text-sm text-emerald-700 mb-3">
                <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{property.address}</span>
              </div>
              
              {/* Features */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-emerald-700">
                  <span className="flex items-center bg-emerald-50 px-2 py-1 rounded-md">
                    <HomeModernIcon className="w-4 h-4 mr-1 text-emerald-600" />
                    {property.features?.bedrooms || 0} BR
                  </span>
                  <span className="flex items-center bg-emerald-50 px-2 py-1 rounded-md">
                    <svg className="w-4 h-4 mr-1 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {property.features?.bathrooms || 0} BA
                  </span>
                  <span className="flex items-center bg-emerald-50 px-2 py-1 rounded-md">
                    <EyeIcon className="w-4 h-4 mr-1 text-emerald-600" />
                    {property.views || 0}
                  </span>
                </div>
              </div>
              
              {/* Property Type & Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-emerald-100">
                <div>
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs rounded-full capitalize">
                    {apartmentTypeLabels[property.apartmentType]}
                  </span>
                </div>
                
                {showActions && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleViewDetails(property._id)}
                      className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditProperty(property._id)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit Property"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(property._id)}
                      disabled={deletingId === property._id}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete Property"
                    >
                      {deletingId === property._id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <TrashIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Landlord Info - Shown only if available */}
              {property.landlordInfo?.personalInfo?.fullName && (
                <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
                      <UserCircleIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-xs text-emerald-700 truncate max-w-[100px]">
                      {property.landlordInfo.personalInfo.fullName}
                    </span>
                  </div>
                  {property.landlordInfo.verification?.verified && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}