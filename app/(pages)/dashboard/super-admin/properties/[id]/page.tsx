// app/dashboard/admin/properties/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useProperty } from '../../../../../context/PropertyContext'
import { useUser } from '../../../../../context/UserContext'
import { Property, ApartmentType } from '../../../../../types/property'
import DashboardLayout from '../../../DashboardLayout'
import {
  ArrowLeftIcon,
  HomeModernIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CreditCardIcon,
  CameraIcon,
  // CarIcon is not available, use TruckIcon instead or remove it
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'

// Map apartment types to display names
const apartmentTypeLabels: Record<ApartmentType, string> = {
  'a-room': 'Single Room',
  'self-contained': 'Self Contained',
  'room-and-parlour': 'Room & Parlour',
  'two-bedroom': 'Two Bedroom Apartment',
  'three-bedroom': 'Three Bedroom Apartment',
  'flat': 'Apartment Flat',
  'others': 'Other'
}

// Status configuration
const statusConfig = {
  available: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircleSolidIcon, label: 'Available' },
  rented: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: HomeModernIcon, label: 'Rented' },
  maintenance: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircleIcon, label: 'Maintenance' },
  pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: ClockIcon, label: 'Pending' }
}

export default function AdminPropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const { fetchAdminProperty, deleteProperty } = useProperty()
  
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'details' | 'landlord' | 'management' | 'documents'>('details')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Fetch property data
  useEffect(() => {
    const loadProperty = async () => {
      if (!params.id) return
      
      try {
        setLoading(true)
        setError(null)
        const propertyData = await fetchAdminProperty(params.id as string)
        setProperty(propertyData)
      } catch (err) {
        console.error('Failed to load property:', err)
        setError('Failed to load property details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadProperty()
    }
  }, [params.id, fetchAdminProperty, user])

  // Handle edit
  const handleEdit = () => {
    router.push(`/dashboard/super-admin/properties/${property?._id}/edit`)
  }

  // Handle delete
  const handleDelete = async () => {
    if (!property) return
    
    setDeleting(true)
    try {
      const result = await deleteProperty(property._id)
      if (result.success) {
        router.push('/dashboard/super-admin/properties')
      } else {
        alert(result.message || 'Failed to delete property')
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('Failed to delete property')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  // Format date
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format datetime
  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

// Helper function to safely render objects as strings
const renderObjectAsString = (obj: unknown): string => {
  if (!obj) return 'N/A'
  
  if (typeof obj === 'string') return obj
  if (typeof obj === 'number') return obj.toString()
  if (typeof obj === 'boolean') return obj.toString()
  
  return String(obj)
}


  if (loading) {
    return (
      <DashboardLayout activeTab="properties" onTabChange={() => {}}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading property details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !property) {
    return (
      <DashboardLayout activeTab="properties" onTabChange={() => {}}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircleIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h3>
            <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
            <Link
              href="/dashboard/admin/properties"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Properties
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const StatusIcon = statusConfig[property.status].icon

  return (
    <DashboardLayout activeTab="properties" onTabChange={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <Link
                href="/dashboard/admin/properties"
                className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-emerald-600" />
              </Link>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {property.title}
                  </h1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[property.status].color}`}>
                    <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                    {statusConfig[property.status].label}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 mt-2">
                  <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{property.address}, {property.city}, {property.state} {property.country}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <PencilIcon className="w-5 h-5" />
                Edit Property
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <TrashIcon className="w-5 h-5" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Annual Rent</p>
                <p className="text-xl font-bold text-emerald-700 mt-1">{formatPrice(property.price)}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Property Type</p>
                <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                  {apartmentTypeLabels[property.apartmentType]}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <HomeModernIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{property.views || 0}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <EyeIcon className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Listed Date</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(property.listedDate)}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Images */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Main Image */}
              <div className="relative h-[400px] bg-gray-100">
                {property.media.images.length > 0 ? (
                  <>
                    <Image
                      src={property.media.images[selectedImageIndex].url}
                      alt={`${property.title} - Image ${selectedImageIndex + 1}`}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                    />
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {property.media.images.length}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {property.media.images.length > 1 && (
                <div className="p-4 border-t border-gray-100">
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {property.media.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                          selectedImageIndex === index 
                            ? 'ring-2 ring-emerald-500 scale-95' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Section */}
              {property.media.videos && property.media.videos.length > 0 && (
                <div className="p-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Property Video</h3>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <video
                      src={property.media.videos[0].url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200 px-6">
                <nav className="flex -mb-px space-x-8">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'details'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <DocumentTextIcon className="w-5 h-5 inline-block mr-2" />
                    Property Details
                  </button>
                  <button
                    onClick={() => setActiveTab('landlord')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'landlord'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <UserCircleIcon className="w-5 h-5 inline-block mr-2" />
                    Landlord Information
                  </button>
                  <button
                    onClick={() => setActiveTab('management')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'management'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <ShieldCheckIcon className="w-5 h-5 inline-block mr-2" />
                    Management
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Property Details Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{property.description}</p>
                    </div>

                    {/* Features */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-emerald-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <HomeModernIcon className="w-5 h-5 text-emerald-600" />
                            <span className="text-lg font-bold text-emerald-700">{property.features.bedrooms}</span>
                          </div>
                          <p className="text-sm text-emerald-700">Bedrooms</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-lg font-bold text-blue-700">{property.features.bathrooms}</span>
                          </div>
                          <p className="text-sm text-blue-700">Bathrooms</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="text-lg font-bold text-purple-700">{property.features.toilet || 0}</span>
                          </div>
                          <p className="text-sm text-purple-700">Toilets</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            {/* Replace CarIcon with a simple text indicator */}
                            <span className="text-amber-700 font-medium">Parking</span>
                            <span className="text-lg font-bold text-amber-700">{property.features.parking ? 'Yes' : 'No'}</span>
                          </div>
                          <p className="text-sm text-amber-700">Parking Available</p>
                        </div>
                      </div>
                    </div>

                    {/* Amenities */}
                    {property.features.amenities && property.features.amenities.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {property.features.amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                              <CheckCircleIcon className="w-5 h-5 text-emerald-500 mr-2" />
                              <span className="text-gray-700">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extras */}
                    {property.features.extras && property.features.extras.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Features</h3>
                        <div className="flex flex-wrap gap-2">
                          {property.features.extras.map((extra, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                              {extra}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Landlord Information Tab */}
                {activeTab === 'landlord' && (
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <UserCircleIcon className="w-5 h-5 mr-2 text-emerald-600" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs text-gray-500 mb-1">Full Name</p>
                          <p className="font-medium text-gray-900">
                            {property.landlordInfo?.personalInfo?.fullName || 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs text-gray-500 mb-1">Email Address</p>
                          <div className="flex items-center">
                            <EnvelopeIcon className="w-4 h-4 text-emerald-600 mr-2" />
                            <a href={`mailto:${property.landlordInfo?.personalInfo?.email}`} className="text-emerald-700 hover:underline">
                              {property.landlordInfo?.personalInfo?.email || 'N/A'}
                            </a>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                          <div className="flex items-center">
                            <PhoneIcon className="w-4 h-4 text-emerald-600 mr-2" />
                            <a href={`tel:${property.landlordInfo?.personalInfo?.phone}`} className="text-emerald-700">
                              {property.landlordInfo?.personalInfo?.phone || 'N/A'}
                            </a>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs text-gray-500 mb-1">Alternative Phone</p>
                          <div className="flex items-center">
                            <PhoneIcon className="w-4 h-4 text-emerald-600 mr-2" />
                            <span>{property.landlordInfo?.personalInfo?.alternativePhone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Address */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPinIcon className="w-5 h-5 mr-2 text-emerald-600" />
                        Contact Address
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Street Address</p>
                            <p className="text-gray-900">{property.landlordInfo?.contactAddress?.street || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">City</p>
                            <p className="text-gray-900">{property.landlordInfo?.contactAddress?.city || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">State</p>
                            <p className="text-gray-900">{property.landlordInfo?.contactAddress?.state || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Country</p>
                            <p className="text-gray-900">{property.landlordInfo?.contactAddress?.country || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CreditCardIcon className="w-5 h-5 mr-2 text-emerald-600" />
                        Bank Details
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                            <p className="font-medium text-gray-900">{property.landlordInfo?.bankDetails?.bankName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Account Number</p>
                            <p className="font-mono text-gray-900">{property.landlordInfo?.bankDetails?.accountNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Account Name</p>
                            <p className="text-gray-900">{property.landlordInfo?.bankDetails?.accountName || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    {property.landlordInfo?.emergencyContact && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <ShieldCheckIcon className="w-5 h-5 mr-2 text-emerald-600" />
                          Emergency Contact
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Name</p>
                              <p className="text-gray-900">{property.landlordInfo.emergencyContact.name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Relationship</p>
                              <p className="text-gray-900">{property.landlordInfo.emergencyContact.relationship || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Phone</p>
                              <a href={`tel:${property.landlordInfo.emergencyContact.phone}`} className="text-emerald-700">
                                {property.landlordInfo.emergencyContact.phone || 'N/A'}
                              </a>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Email</p>
                              <a href={`mailto:${property.landlordInfo.emergencyContact.email}`} className="text-emerald-700">
                                {property.landlordInfo.emergencyContact.email || 'N/A'}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Additional Information */}
                    {property.landlordInfo?.additionalInfo && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <DocumentTextIcon className="w-5 h-5 mr-2 text-emerald-600" />
                          Additional Information
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Occupation</p>
                              <p className="text-gray-900">{property.landlordInfo.additionalInfo.occupation || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Next of Kin</p>
                              <p className="text-gray-900">{property.landlordInfo.additionalInfo.nextOfKin || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Relationship to Kin</p>
                              <p className="text-gray-900">{property.landlordInfo.additionalInfo.relationshipToKin || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Kin Phone</p>
                              <a href={`tel:${property.landlordInfo.additionalInfo.kinPhone}`} className="text-emerald-700">
                                {property.landlordInfo.additionalInfo.kinPhone || 'N/A'}
                              </a>
                            </div>
                          </div>
                          {property.landlordInfo.additionalInfo.notes && (
                            <div className="mt-4">
                              <p className="text-xs text-gray-500 mb-1">Notes</p>
                              <p className="text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                                {property.landlordInfo.additionalInfo.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Verification Status */}
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ShieldCheckIcon className="w-5 h-5 text-emerald-600 mr-2" />
                          <span className="font-medium text-emerald-800">Verification Status</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          property.landlordInfo?.verification?.verified 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {property.landlordInfo?.verification?.verified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                      {property.landlordInfo?.verification?.verified && (
                        <div className="mt-3 text-sm text-emerald-700">
                          <p>Verified by: {renderObjectAsString(property.landlordInfo.verification.verifiedBy)}</p>
                          <p className="text-xs text-emerald-600 mt-1">
                            Verified on: {formatDateTime(property.landlordInfo.verification.verifiedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Management Information Tab */}
                {activeTab === 'management' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Management Agreement</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs text-gray-500 mb-1">Commission Rate</p>
                          <p className="text-2xl font-bold text-emerald-700">
                            {property.managementInfo?.commissionRate || 10}%
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs text-gray-500 mb-1">Management Fee</p>
                          <p className="text-2xl font-bold text-emerald-700">
                            {formatPrice(property.managementInfo?.managementFee || 0)}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs text-gray-500 mb-1">Payment Schedule</p>
                          <p className="text-lg font-semibold text-gray-900 capitalize">
                            {property.managementInfo?.paymentSchedule || 'Monthly'}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-xs text-gray-500 mb-1">Contract Period</p>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-700">
                              From: {formatDate(property.managementInfo?.contractStartDate)}
                            </p>
                            <p className="text-sm text-gray-700">
                              To: {formatDate(property.managementInfo?.contractEndDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Property Status Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Current Status</span>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig[property.status].color}`}>
                    <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                    {statusConfig[property.status].label}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Listed By</span>
                  <span className="font-medium text-gray-900">{renderObjectAsString(property.listedBy)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Listed Date</span>
                  <span className="font-medium text-gray-900">{formatDate(property.listedDate)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium text-gray-900">{formatDate(property.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2 text-emerald-600" />
                Location Details
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Full Address</p>
                  <p className="text-gray-900 font-medium">{property.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">City</p>
                    <p className="text-gray-900 font-medium">{property.city}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">State</p>
                    <p className="text-gray-900 font-medium">{property.state}</p>
                  </div>
                </div>
                {property.unitNumber && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Unit Number</p>
                    <p className="text-gray-900 font-medium">{property.unitNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ShieldCheckIcon className="w-5 h-5 mr-2 text-emerald-600" />
                Admin Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Property ID</span>
                  <span className="font-mono text-xs text-gray-900">{property._id}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Admin ID</span>
                  <span className="font-mono text-xs text-gray-900">{renderObjectAsString(property.admin)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Active Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    property.isActive 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {property.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pending Requests Card */}
            {property.pendingRequests && property.pendingRequests.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2 text-amber-600" />
                  Pending Requests
                </h3>
                <div className="space-y-3">
                  {property.pendingRequests.map((requestId, index) => (
                    <div key={index} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-amber-800">{renderObjectAsString(requestId)}</span>
                        <button className="text-xs text-amber-700 hover:text-amber-900">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fadeIn">
              <div className="p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrashIcon className="w-8 h-8 text-red-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Delete Property?
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete <span className="font-semibold">{property.title}</span>?
                  This action cannot be undone and all associated data will be permanently removed.
                </p>

                <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
                  <p className="text-sm text-red-800 flex items-start">
                    <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>
                      This will also delete all rental requests, documents, and media associated with this property.
                    </span>
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {deleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      'Yes, Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}