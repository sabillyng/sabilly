
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAdminRentalRequest } from '../../../../context/RentalRequestContext'
import { useUser } from '../../../../context/UserContext'
import DashboardLayout from '../../DashboardLayout'
import { RentalRequest, RentalRequestStatus } from '../../../../types/rentalRequest'
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserIcon,
  HomeModernIcon,
  CalendarIcon,
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  DocumentCheckIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'

// Status configuration with proper typing
const statusConfig: Record<RentalRequestStatus, {
  color: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  bg: string
  border: string
  text: string
}> = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: ClockIcon,
    label: 'Pending',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700'
  },
  approved: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircleSolidIcon,
    label: 'Approved',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700'
  },
  rejected: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircleIcon,
    label: 'Rejected',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700'
  },
  cancelled: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: NoSymbolIcon,
    label: 'Cancelled',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700'
  },
  active_lease: {
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: HomeModernIcon,
    label: 'Active Lease',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700'
  },
  expired_lease: {
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: ExclamationCircleIcon,
    label: 'Expired',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700'
  },
  completed: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: DocumentCheckIcon,
    label: 'Completed',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700'
  },
  renewal_pending: {
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: ClockIcon,
    label: 'Renewal Pending',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700'
  }
}

interface ProcessModalState {
  isOpen: boolean
  request: RentalRequest | null
  status: 'approved' | 'rejected'
}

interface VerifyModalState {
  isOpen: boolean
  request: RentalRequest | null
}

export default function AdminRentalRequestsPage() {
  const router = useRouter()
  const { user } = useUser()
  const {
    allRequests,
    fetchAllRequests,
    processRequest,
    verifyPaymentAndActivateLease,
    stats,
    fetchRequestStats,
    loadingAllRequests,
    loadingAction
  } = useAdminRentalRequest()

  const [activeTab, setActiveTab] = useState<RentalRequestStatus | 'all' | 'active'>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [processModal, setProcessModal] = useState<ProcessModalState>({
    isOpen: false,
    request: null,
    status: 'approved'
  })
  const [verifyModal, setVerifyModal] = useState<VerifyModalState>({
    isOpen: false,
    request: null
  })
  const [adminResponse, setAdminResponse] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [verificationNotes, setVerificationNotes] = useState('')

  // Fetch requests and stats on mount
  useEffect(() => {
    if (user) {
      fetchAllRequests()
      fetchRequestStats()
    }
  }, [user])

  // Filter requests based on tab and search
  const filteredRequests = React.useMemo(() => {
    if (!allRequests) return []

    let filtered = [...allRequests]

    // Filter by status tab
    if (activeTab === 'pending') {
      filtered = filtered.filter(r => r.status === 'pending')
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(r => r.status === 'approved')
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(r => r.status === 'rejected')
    } else if (activeTab === 'active') {
      filtered = filtered.filter(r => r.status === 'active_lease')
    } else if (activeTab === 'all') {
      // No filter
    } else {
      filtered = filtered.filter(r => r.status === activeTab)
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(r => 
        r.property?.title?.toLowerCase().includes(term) ||
        r.property?.address?.toLowerCase().includes(term) ||
        r.tenant?.fullName?.toLowerCase().includes(term) ||
        r.tenant?.email?.toLowerCase().includes(term) ||
        r._id?.toLowerCase().includes(term)
      )
    }

    return filtered
  }, [allRequests, activeTab, searchTerm])

  // Handle process request (approve/reject)
  const handleProcessRequest = async () => {
    if (!processModal.request) return

    const result = await processRequest(processModal.request._id, {
      status: processModal.status,
      adminResponse,
      adminNotes
    })

    if (result.success) {
      setProcessModal({ isOpen: false, request: null, status: 'approved' })
      setAdminResponse('')
      setAdminNotes('')
      fetchAllRequests()
      fetchRequestStats()
    }
  }

  // Handle verify payment and activate lease
  const handleVerifyPayment = async () => {
    if (!verifyModal.request) return

    const result = await verifyPaymentAndActivateLease(verifyModal.request._id, {
      verificationNotes
    })

    if (result.success) {
      setVerifyModal({ isOpen: false, request: null })
      setVerificationNotes('')
      fetchAllRequests()
      fetchRequestStats()
    }
  }

  // Format date
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3.5 h-3.5 mr-1" />
        {config.label}
      </span>
    )
  }

  // Get count for tab
  const getTabCount = (tab: string) => {
    if (!stats) return 0
    switch (tab) {
      case 'pending': return stats.pending
      case 'approved': return stats.approved
      case 'rejected': return stats.rejected
      case 'active': return stats.activeLeases
      default: return allRequests?.length || 0
    }
  }

  const tabs = [
    { id: 'pending', label: 'Pending', icon: ClockIcon, color: 'yellow' },
    { id: 'approved', label: 'Approved', icon: CheckCircleIcon, color: 'green' },
    { id: 'rejected', label: 'Rejected', icon: XCircleIcon, color: 'red' },
    { id: 'active', label: 'Active Leases', icon: HomeModernIcon, color: 'emerald' },
    { id: 'all', label: 'All Requests', icon: DocumentTextIcon, color: 'blue' }
  ] as const

  return (
    <DashboardLayout activeTab="rental-requests" onTabChange={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Rental Requests</h1>
              <p className="text-emerald-600 mt-2">
                Manage and process all tenant rental requests
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchAllRequests()
                  fetchRequestStats()
                }}
                className="px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2"
              >
                <ArrowPathIcon className={`w-5 h-5 ${loadingAllRequests ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const count = getTabCount(tab.id)
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`bg-white rounded-xl shadow-sm p-5 border-2 transition-all ${
                  isActive 
                    ? `border-${tab.color}-600 shadow-md scale-[1.02]` 
                    : 'border-transparent hover:border-emerald-200 hover:shadow'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{tab.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${tab.color}-100 rounded-full flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${tab.color}-600`} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by property, tenant name, email or request ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as typeof activeTab)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
              >
                {tabs.map(tab => (
                  <option key={tab.id} value={tab.id}>{tab.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        {loadingAllRequests ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-emerald-700">Loading rental requests...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {filteredRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="text-left p-4 font-medium text-gray-600">Property</th>
                      <th className="text-left p-4 font-medium text-gray-600">Tenant</th>
                      <th className="text-left p-4 font-medium text-gray-600">Request Details</th>
                      <th className="text-left p-4 font-medium text-gray-600">Status</th>
                      <th className="text-left p-4 font-medium text-gray-600">Payment</th>
                      <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRequests.map((request) => {
                      const property = request.property
                      const tenant = request.tenant
                      
                      return (
                        <tr key={request._id} className="hover:bg-emerald-50/30 transition-colors">
                          {/* Property */}
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {property?.media?.images?.[0] ? (
                                  <Image
                                    src={property.media.images[0].url}
                                    alt={property.title}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-emerald-100">
                                    <HomeModernIcon className="w-6 h-6 text-emerald-600" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate max-w-[200px]">
                                  {property?.title || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {property?.address || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Tenant */}
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <UserIcon className="w-4 h-4 text-gray-400 mr-1.5" />
                                <span className="text-sm font-medium text-gray-900">
                                  {tenant?.fullName || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                                <a href={`mailto:${tenant?.email}`} className="text-xs text-emerald-600 hover:underline">
                                  {tenant?.email || 'N/A'}
                                </a>
                              </div>
                              <div className="flex items-center">
                                <PhoneIcon className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                                <a href={`tel:${tenant?.phone}`} className="text-xs text-gray-600 hover:text-emerald-600">
                                  {tenant?.phone || 'N/A'}
                                </a>
                              </div>
                            </div>
                          </td>

                          {/* Request Details */}
                          <td className="p-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center text-sm">
                                <CalendarIcon className="w-4 h-4 text-gray-400 mr-1.5" />
                                <span className="text-gray-600">Move-in:</span>
                                <span className="ml-1 font-medium text-gray-900">
                                  {formatDate(request.requestedMoveInDate)}
                                </span>
                              </div>
                              <div className="flex items-center text-sm">
                                <ClockIcon className="w-4 h-4 text-gray-400 mr-1.5" />
                                <span className="text-gray-600">Duration:</span>
                                <span className="ml-1 font-medium text-gray-900">
                                  {request.duration} months
                                </span>
                              </div>
                              <div className="flex items-center text-sm">
                                <DocumentTextIcon className="w-4 h-4 text-gray-400 mr-1.5" />
                                <span className="text-gray-600">Requested:</span>
                                <span className="ml-1 text-gray-900">
                                  {formatDate(request.createdAt)}
                                </span>
                              </div>
                              <div className="mt-1 p-2 bg-gray-50 rounded text-xs text-gray-600 line-clamp-2 max-w-[250px]">
                                <span className="font-medium">Message:</span> {request.message}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <div className="space-y-2">
                              {getStatusBadge(request.status)}
                              
                              {request.paymentDetails && (
                                <div className="flex items-center text-xs">
                                  {request.paymentDetails.verified ? (
                                    <span className="flex items-center text-green-600">
                                      <CheckCircleIcon className="w-3.5 h-3.5 mr-1" />
                                      Payment Verified
                                    </span>
                                  ) : (
                                    <span className="flex items-center text-yellow-600">
                                      <ClockIcon className="w-3.5 h-3.5 mr-1" />
                                      Payment Pending
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Payment */}
                          <td className="p-4">
                            {request.paymentDetails ? (
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {formatCurrency(request.paymentDetails.amount)}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {request.paymentDetails.method?.replace('_', ' ')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Ref: {request.paymentDetails.reference?.slice(-8) || 'N/A'}
                                </p>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">No payment</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-4">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => router.push(`/dashboard/super-admin/requests/${request._id}`)}
                                className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
                              >
                                <EyeIcon className="w-3.5 h-3.5 mr-1" />
                                View Details
                              </button>

                              {request.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => {
                                      setProcessModal({
                                        isOpen: true,
                                        request,
                                        status: 'approved'
                                      })
                                      setAdminResponse('')
                                      setAdminNotes('')
                                    }}
                                    className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                  >
                                    <CheckCircleIcon className="w-3.5 h-3.5 mr-1" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setProcessModal({
                                        isOpen: true,
                                        request,
                                        status: 'rejected'
                                      })
                                      setAdminResponse('')
                                      setAdminNotes('')
                                    }}
                                    className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                                  >
                                    <XCircleIcon className="w-3.5 h-3.5 mr-1" />
                                    Reject
                                  </button>
                                </>
                              )}

                              {request.status === 'approved' && request.paymentDetails && !request.paymentDetails.verified && (
                                <button
                                  onClick={() => {
                                    setVerifyModal({
                                      isOpen: true,
                                      request
                                    })
                                    setVerificationNotes('')
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
                                >
                                  <ShieldCheckIcon className="w-3.5 h-3.5 mr-1" />
                                  Verify Payment
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'pending' && <ClockIcon className="w-10 h-10 text-gray-400" />}
                  {activeTab === 'approved' && <CheckCircleIcon className="w-10 h-10 text-gray-400" />}
                  {activeTab === 'rejected' && <XCircleIcon className="w-10 h-10 text-gray-400" />}
                  {activeTab === 'active' && <HomeModernIcon className="w-10 h-10 text-gray-400" />}
                  {activeTab === 'all' && <DocumentTextIcon className="w-10 h-10 text-gray-400" />}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} requests found</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search criteria' 
                    : `There are currently no ${activeTab} rental requests`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Process Request Modal (Approve/Reject) */}
        {processModal.isOpen && processModal.request && (
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
                    ? 'This will approve the tenant\'s request and mark the property as rented.'
                    : 'This will reject the tenant\'s request and the property will remain available.'}
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

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Property:</span>
                      <span className="font-medium">{processModal.request.property?.title}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-600">Tenant:</span>
                      <span className="font-medium">{processModal.request.tenant?.fullName}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-600">Move-in Date:</span>
                      <span className="font-medium">{formatDate(processModal.request.requestedMoveInDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setProcessModal({ isOpen: false, request: null, status: 'approved' })
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
        {verifyModal.isOpen && verifyModal.request && (
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
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">
                        {formatCurrency(verifyModal.request.paymentDetails?.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium capitalize">
                        {verifyModal.request.paymentDetails?.method?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-mono text-xs">
                        {verifyModal.request.paymentDetails?.reference}
                      </span>
                    </div>
                    {verifyModal.request.paymentDetails?.receiptImage && (
                      <div className="mt-3">
                        <a
                          href={verifyModal.request.paymentDetails.receiptImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-800 text-sm flex items-center"
                        >
                          <DocumentTextIcon className="w-4 h-4 mr-1" />
                          View Receipt
                        </a>
                      </div>
                    )}
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
                      setVerifyModal({ isOpen: false, request: null })
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