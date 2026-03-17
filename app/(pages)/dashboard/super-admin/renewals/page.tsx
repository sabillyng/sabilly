// app/(pages)/dashboard/admin/renewals/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAdminRentalRequest } from '../../../../context/RentalRequestContext'
import { useUser } from '../../../../context/UserContext'
import DashboardLayout from '../../DashboardLayout'
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserIcon,
  HomeModernIcon,
  CalendarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { RentalRequest } from '../../../../types/rentalRequest'

export default function AdminRenewalsPage() {
  const router = useRouter()
  const { user } = useUser()
  const { renewLease, fetchRenewalRequests, processRenewal, loadingRenewals, loadingAction } = useAdminRentalRequest()

  const [searchTerm, setSearchTerm] = useState('')
  const [filteredRenewals, setFilteredRenewals] = useState<RentalRequest[]>([])
  const [selectedRenewal, setSelectedRenewal] = useState<RentalRequest | null>(null)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')
  const [newMonthlyRent, setNewMonthlyRent] = useState('')
  const [newDuration, setNewDuration] = useState('12')
  const [adminNotes, setAdminNotes] = useState('')
  const [renewals, setRenewals] = useState<RentalRequest[]>([])

  useEffect(() => {
    if (user) {
      const loadRenewals = async () => {
        await fetchRenewalRequests()
      }
      loadRenewals()
    }
  }, [user, fetchRenewalRequests])

  useEffect(() => {
    if (!renewals || renewals.length === 0) {
      setFilteredRenewals([])
      return
    }

    let filtered = [...renewals]

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(r => 
        r.property?.title?.toLowerCase().includes(term) ||
        r.tenant?.fullName?.toLowerCase().includes(term) ||
        r.tenant?.email?.toLowerCase().includes(term)
      )
    }

    setFilteredRenewals(filtered)
  }, [renewals, searchTerm])

  const handleProcessRenewal = async () => {
    if (!selectedRenewal) return

    const result = await processRenewal(selectedRenewal._id, {
      action: actionType,
      newMonthlyRent: actionType === 'approve' ? parseFloat(newMonthlyRent) || undefined : undefined,
      newDuration: actionType === 'approve' ? parseInt(newDuration) : undefined,
      adminNotes
    })

    if (result.success) {
      setShowProcessModal(false)
      setSelectedRenewal(null)
      setNewMonthlyRent('')
      setNewDuration('12')
      setAdminNotes('')
      fetchRenewalRequests()
    }
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '₦0'
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <DashboardLayout activeTab="renewals" onTabChange={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Lease Renewal Requests</h1>
              <p className="text-emerald-600 mt-2">Review and process tenant lease renewal requests</p>
            </div>
            <button
              onClick={() => fetchRenewalRequests()}
              className="px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 flex items-center gap-2"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loadingRenewals ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by property, tenant name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Renewals Table */}
        {loadingRenewals ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {filteredRenewals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="text-left p-4 font-medium text-gray-600">Property</th>
                      <th className="text-left p-4 font-medium text-gray-600">Tenant</th>
                      <th className="text-left p-4 font-medium text-gray-600">Current Lease</th>
                      <th className="text-left p-4 font-medium text-gray-600">Request Details</th>
                      <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRenewals.map((renewal) => (
                      <tr key={renewal._id} className="hover:bg-emerald-50/30">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                              {renewal.property?.media?.images?.[0] ? (
                                <Image
                                  src={renewal.property.media.images[0].url}
                                  alt={renewal.property.title}
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
                            <div>
                              <p className="font-medium text-gray-900">{renewal.property?.title}</p>
                              <p className="text-sm text-gray-500">{renewal.property?.address}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900">{renewal.tenant?.fullName}</p>
                            <p className="text-sm text-gray-500">{renewal.tenant?.email}</p>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="text-gray-500">Ends:</span>{' '}
                              <span className="font-medium">{formatDate(renewal.leaseInfo?.endDate)}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-500">Rent:</span>{' '}
                              <span className="font-medium text-emerald-700">
                                {formatCurrency(renewal.leaseInfo?.monthlyRent)}/mo
                              </span>
                            </p>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="text-gray-500">Preferred:</span>{' '}
                              <span className="font-medium">{renewal.leaseInfo?.renewalOffered || 12} months</span>
                            </p>
                            {renewal.leaseInfo?.terms && (
                              <p className="text-xs text-gray-600 line-clamp-2 max-w-[200px]">
                                {renewal.leaseInfo.terms}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              Requested: {formatDate(renewal.leaseInfo?.renewalDeadline)}
                            </p>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => {
                                setSelectedRenewal(renewal)
                                setActionType('approve')
                                setNewMonthlyRent(renewal.leaseInfo?.monthlyRent?.toString() || '')
                                setShowProcessModal(true)
                              }}
                              className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 flex items-center justify-center"
                            >
                              <CheckCircleIcon className="w-3.5 h-3.5 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRenewal(renewal)
                                setActionType('reject')
                                setShowProcessModal(true)
                              }}
                              className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 flex items-center justify-center"
                            >
                              <XCircleIcon className="w-3.5 h-3.5 mr-1" />
                              Reject
                            </button>
                            <button
                              onClick={() => router.push(`/dashboard/admin/leases/${renewal._id}`)}
                              className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 flex items-center justify-center"
                            >
                              <EyeIcon className="w-3.5 h-3.5 mr-1" />
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Renewal Requests</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'No requests match your search' : 'No pending renewal requests at this time'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Process Renewal Modal */}
        {showProcessModal && selectedRenewal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-fadeIn">
              <div className="p-6">
                <div className={`w-16 h-16 ${actionType === 'approve' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {actionType === 'approve' ? (
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-8 h-8 text-red-600" />
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  {actionType === 'approve' ? 'Approve Renewal Request' : 'Reject Renewal Request'}
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  {actionType === 'approve'
                    ? 'This will extend the lease for the tenant.'
                    : 'This will reject the renewal request.'}
                </p>

                <div className="space-y-4 mb-6">
                  {actionType === 'approve' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Monthly Rent (₦)
                        </label>
                        <input
                          type="number"
                          value={newMonthlyRent}
                          onChange={(e) => setNewMonthlyRent(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter new monthly rent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Renewal Duration
                        </label>
                        <select
                          value={newDuration}
                          onChange={(e) => setNewDuration(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="6">6 months</option>
                          <option value="12">12 months</option>
                          <option value="18">18 months</option>
                          <option value="24">24 months</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {actionType === 'approve' ? 'Notes (Optional)' : 'Reason for Rejection'}
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      placeholder={actionType === 'approve' ? 'Add any notes about this renewal...' : 'Explain why the request is being rejected...'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Request Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Tenant:</span> {selectedRenewal.tenant?.fullName}</p>
                      <p><span className="text-gray-500">Property:</span> {selectedRenewal.property?.title}</p>
                      <p><span className="text-gray-500">Current End Date:</span> {formatDate(selectedRenewal.leaseInfo?.endDate)}</p>
                      <p><span className="text-gray-500">Preferred Duration:</span> {selectedRenewal.leaseInfo?.renewalOffered || 12} months</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowProcessModal(false)
                      setSelectedRenewal(null)
                      setNewMonthlyRent('')
                      setNewDuration('12')
                      setAdminNotes('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessRenewal}
                    disabled={loadingAction}
                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                      actionType === 'approve'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    } disabled:opacity-50`}
                  >
                    {loadingAction ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
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