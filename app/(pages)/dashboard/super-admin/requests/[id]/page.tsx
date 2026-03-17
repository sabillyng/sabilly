
'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAdminRentalRequest } from '../../../../../context/RentalRequestContext'
import { useUser } from '../../../../../context/UserContext'
import DashboardLayout from '../../../DashboardLayout'
import { RentalRequest, RentalRequestStatus } from '../../../../../types/rentalRequest'
import { Property } from '../../../../../types/property'
import { User } from '../../../../../types/auth'
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  HomeModernIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  CameraIcon,
  DocumentDuplicateIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'

// Status configuration with proper typing
const statusConfig: Record<RentalRequestStatus, {
  color: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
}> = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: ClockIcon,
    label: 'Pending Review',
    description: 'This request is waiting for admin review. Please review the tenant details and make a decision.'
  },
  approved: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircleSolidIcon,
    label: 'Approved',
    description: 'This request has been approved. The tenant needs to make payment to activate the lease.'
  },
  rejected: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircleIcon,
    label: 'Rejected',
    description: 'This request has been rejected. The property is still available for other tenants.'
  },
  cancelled: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: NoSymbolIcon,
    label: 'Cancelled',
    description: 'This request was cancelled by the tenant.'
  },
  active_lease: {
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: HomeModernIcon,
    label: 'Active Lease',
    description: 'This is an active lease. Payment has been verified and the tenant has moved in.'
  },
  expired_lease: {
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: ExclamationCircleIcon,
    label: 'Lease Expired',
    description: 'This lease has expired. Please contact tenant for renewal.'
  },
  completed: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckBadgeIcon,
    label: 'Completed',
    description: 'This rental agreement has been completed successfully.'
  },
  renewal_pending: {
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: DocumentDuplicateIcon,
    label: 'Renewal Pending',
    description: 'Tenant has requested a lease renewal. Please review and process.'
  }
}

interface ProcessModalState {
  isOpen: boolean
  status: 'approved' | 'rejected'
}

export default function AdminRentalRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const {
    getRequest,
    processRequest,
    verifyPaymentAndActivateLease,
    loadingAction
  } = useAdminRentalRequest()

  const [request, setRequest] = useState<RentalRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [processModal, setProcessModal] = useState<ProcessModalState>({
    isOpen: false,
    status: 'approved'
  })
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [adminResponse, setAdminResponse] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [verificationNotes, setVerificationNotes] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'payment' | 'documents'>('details')

  useEffect(() => {
    const loadRequest = async () => {
      if (!params.id) return
      setLoading(true)
      try {
        const result = await getRequest(params.id as string)
        if (result) {
          setRequest(result)
        }
      } catch (error) {
        console.error('Error loading request:', error)
      } finally {
        setLoading(false)
      }
    }
    loadRequest()
  }, [params.id, getRequest])

  const handleProcessRequest = async () => {
    if (!request) return

    const result = await processRequest(request._id, {
      status: processModal.status,
      adminResponse,
      adminNotes
    })

    if (result.success && result.request) {
      setProcessModal({ isOpen: false, status: 'approved' })
      setAdminResponse('')
      setAdminNotes('')
      setRequest(result.request)
    }
  }

  const handleVerifyPayment = async () => {
    if (!request) return

    const result = await verifyPaymentAndActivateLease(request._id, {
      verificationNotes
    })

    if (result.success && result.request) {
      setShowVerifyModal(false)
      setVerificationNotes('')
      setRequest(result.request)
    }
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

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '₦0'
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Get status badge
  const getStatusBadge = (status: RentalRequestStatus) => {
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3.5 h-3.5 mr-1.5" />
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <DashboardLayout activeTab="rental-requests" onTabChange={() => {}}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading rental request details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!request) {
    return (
      <DashboardLayout activeTab="rental-requests" onTabChange={() => {}}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircleIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Not Found</h3>
            <p className="text-gray-600 mb-6">The rental request you are looking for does not exist.</p>
            <Link
              href="/dashboard/admin/rental-requests"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Requests
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const property = request.property as Property
  const tenant = request.tenant as User
  const status = statusConfig[request.status]
  const StatusIcon = status.icon
  console.log("Property", request)

  return (
    <DashboardLayout activeTab="rental-requests" onTabChange={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-emerald-600" />
              </button>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Rental Request Details
                  </h1>
                  {getStatusBadge(request.status)}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Request ID: <span className="font-mono font-medium">{request._id}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted: {formatDateTime(request.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {request.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setProcessModal({ isOpen: true, status: 'approved' })
                      setAdminResponse('')
                      setAdminNotes('')
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Approve Request
                  </button>
                  <button
                    onClick={() => {
                      setProcessModal({ isOpen: true, status: 'rejected' })
                      setAdminResponse('')
                      setAdminNotes('')
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    Reject Request
                  </button>
                </>
              )}

              {request.status === 'approved' && request.paymentDetails && !request.paymentDetails.verified && (
                <button
                  onClick={() => {
                    setShowVerifyModal(true)
                    setVerificationNotes('')
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <ShieldCheckIcon className="w-5 h-5" />
                  Verify Payment
                </button>
              )}

              {request.status === 'active_lease' && (
                <Link
                  href={`/dashboard/admin/leases/${request._id}/renew`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <DocumentDuplicateIcon className="w-5 h-5" />
                  Renew Lease
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl shadow-lg p-6 border border-emerald-200">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${status.color}`}>
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{status.label}</h2>
              <p className="text-gray-700 mt-1">{status.description}</p>
              {request.respondedAt && (
                <p className="text-sm text-emerald-700 mt-2">
                  {request.status === 'pending' ? 'Requested' : 'Responded'} on {formatDateTime(request.respondedAt)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Property & Request Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BuildingOfficeIcon className="w-5 h-5 mr-2 text-emerald-600" />
                Property Information
              </h2>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-48 flex-shrink-0">
                  <div className="relative h-40 w-full rounded-xl overflow-hidden bg-gray-100">
                    {property.media?.images?.[0] ? (
                      <Image
                        src={property.media.images[0].url}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 192px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
                        <CameraIcon className="w-12 h-12 text-emerald-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <Link 
                    href={`/dashboard/admin/properties/${property._id}`}
                    className="text-xl font-semibold text-gray-900 hover:text-emerald-700 mb-2 inline-block"
                  >
                    {property.title}
                  </Link>
                  
                  <div className="flex items-start text-gray-600 mb-3">
                    <MapPinIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p>{property.address}, {property.city}, {property.state}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="font-medium capitalize">{property.apartmentType?.replace(/-/g, ' ')}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Annual Rent</p>
                      <p className="font-bold text-emerald-700">{formatCurrency(property.price)}</p>
                    </div>
                  </div>

                  {property.unitNumber && (
                    <p className="text-sm text-gray-600 mt-3">
                      Unit: <span className="font-medium">{property.unitNumber}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Request Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-emerald-600" />
                Request Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Requested Move-in Date</p>
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 text-emerald-600 mr-2" />
                    <span className="font-medium">{formatDate(request.requestedMoveInDate)}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Lease Duration</p>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 text-emerald-600 mr-2" />
                    <span className="font-medium">{request.duration} months</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Request Expires</p>
                  <div className="flex items-center">
                    <ExclamationCircleIcon className="w-4 h-4 text-emerald-600 mr-2" />
                    <span className="font-medium">{formatDate(request.expiresAt)}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 text-emerald-600 mr-2" />
                    <span className="font-medium">{formatDate(request.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs text-gray-500 mb-2">Tenants Message</p>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{request.message}</p>
                </div>
              </div>

              {request.adminResponse && (
                <div className="mt-6">
                  <p className="text-xs text-gray-500 mb-2">Your Response</p>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-emerald-800 whitespace-pre-wrap">{request.adminResponse}</p>
                  </div>
                </div>
              )}

              {request.adminNotes && (
                <div className="mt-6">
                  <p className="text-xs text-gray-500 mb-2">Admin Notes (Internal)</p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{request.adminNotes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Lease Information - Show for approved and active leases */}
            {(request.status === 'approved' || request.status === 'active_lease' || request.status === 'expired_lease') && request.leaseInfo && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DocumentDuplicateIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  Lease Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <p className="text-xs text-emerald-700 mb-1">Lease Start Date</p>
                    <p className="text-lg font-bold text-emerald-800">
                      {formatDate(request.leaseInfo.startDate)}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <p className="text-xs text-amber-700 mb-1">Lease End Date</p>
                    <p className="text-lg font-bold text-amber-800">
                      {formatDate(request.leaseInfo.endDate)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500">Total Rent</p>
                    <p className="font-bold text-gray-900 mt-1">{formatCurrency(request.leaseInfo.monthlyRent)}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs text-gray-500 mb-2">Lease Terms</p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700">{request.leaseInfo.terms || 'Standard lease agreement'}</p>
                  </div>
                </div>

                {request.leaseInfo.autoRenew && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Auto-renewal Enabled</p>
                      <p className="text-xs text-blue-700">
                        Lease will automatically renew at the end of the term
                      </p>
                    </div>
                  </div>
                )}

                {request.leaseInfo.signedAt && (
                  <p className="text-right text-sm text-gray-500 mt-4">
                    Signed on {formatDateTime(request.leaseInfo.signedAt)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Tenant & Payment Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tenant Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-emerald-600" />
                Tenant Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{tenant.fullName}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-0.5">
                      <EnvelopeIcon className="w-3.5 h-3.5 mr-1" />
                      <a href={`mailto:${tenant.email}`} className="hover:text-emerald-600">
                        {tenant.email}
                      </a>
                    </div>
                    {tenant.phone && (
                      <div className="flex items-center text-sm text-gray-500 mt-0.5">
                        <PhoneIcon className="w-3.5 h-3.5 mr-1" />
                        <a href={`tel:${tenant.phone}`} className="hover:text-emerald-600">
                          {tenant.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tenant ID</span>
                    <span className="font-mono text-xs">{tenant._id}</span>
                  </div>
                  {tenant.role && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500">Role</span>
                      <span className="capitalize">{tenant.role}</span>
                    </div>
                  )}
                  {tenant.isEmailVerified !== undefined && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500">Email Verified</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        tenant.isEmailVerified 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tenant.isEmailVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2 text-emerald-600" />
                Payment Information
              </h2>
              
              {request.paymentDetails ? (
                <div className="space-y-4">
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <p className="text-xs text-emerald-700 mb-1">Amount Paid</p>
                    <p className="text-2xl font-bold text-emerald-800">
                      {formatCurrency(request.paymentDetails.amount)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-medium capitalize">
                        {request.paymentDetails.method?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reference</span>
                      <span className="font-mono text-xs">{request.paymentDetails.reference}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Date</span>
                      <span className="font-medium">{formatDate(request.paymentDetails.paymentDate)}</span>
                    </div>
                  </div>

                  {request.paymentDetails.receiptImage && (
                    <a
                      href={request.paymentDetails.receiptImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <CameraIcon className="w-4 h-4 mr-2" />
                      View Payment Receipt
                    </a>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Verification Status</span>
                      {request.paymentDetails.verified ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          Pending Verification
                        </span>
                      )}
                    </div>
                    {request.paymentDetails.verified && request.paymentDetails.verifiedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Verified on {formatDateTime(request.paymentDetails.verifiedAt)}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BanknotesIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No Payment Yet</h3>
                  <p className="text-xs text-gray-500">
                    {request.status === 'approved' 
                      ? 'Waiting for tenant to upload payment receipt.'
                      : 'Payment details will appear once the tenant makes payment.'}
                  </p>
                </div>
              )}
            </div>

            {/* Admin Info Card */}
            {request.assignedAdmin && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  Assigned Admin
                </h2>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      {(request.assignedAdmin as User).fullName || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Processed on {formatDate(request.respondedAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Process Request Modal (Approve/Reject) */}
        {processModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-fadeIn">
              <div className="p-6">
                <div className={`w-16 h-16 ${
                  processModal.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                } rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {processModal.status === 'approved' ? (
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-8 h-8 text-red-600" />
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  {processModal.status === 'approved' ? 'Approve Rental Request?' : 'Reject Rental Request?'}
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  {processModal.status === 'approved' 
                    ? 'This will approve the tenant\'s rental request. The tenant will be notified and can proceed with payment.'
                    : 'This will reject the tenant\'s request. The property will remain available for other tenants.'}
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response to Tenant <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      rows={3}
                      placeholder={processModal.status === 'approved' 
                        ? 'Please provide instructions for payment and next steps...'
                        : 'Please provide a reason for rejection...'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes (Internal)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={2}
                      placeholder="Add private notes for reference..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setProcessModal({ isOpen: false, status: 'approved' })
                      setAdminResponse('')
                      setAdminNotes('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessRequest}
                    disabled={!adminResponse || loadingAction}
                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center ${
                      processModal.status === 'approved'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {loadingAction ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      processModal.status === 'approved' ? 'Approve Request' : 'Reject Request'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verify Payment Modal */}
        {showVerifyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-fadeIn">
              <div className="p-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-emerald-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Verify Payment & Activate Lease
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  Confirm that the payment has been received and activate the tenants lease.
                  This will mark the property as rented and create an active lease.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Payment Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{formatCurrency(request.paymentDetails?.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium capitalize">
                        {request.paymentDetails?.method?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-mono text-xs">{request.paymentDetails?.reference}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Notes
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={3}
                    placeholder="Add any notes about the payment verification..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowVerifyModal(false)
                      setVerificationNotes('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyPayment}
                    disabled={loadingAction}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {loadingAction ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      'Verify & Activate Lease'
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