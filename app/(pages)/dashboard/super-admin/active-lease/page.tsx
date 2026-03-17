
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAdminRentalRequest } from '../../../../context/RentalRequestContext'
import { useUser } from '../../../../context/UserContext'
import DashboardLayout from '../../DashboardLayout'
import {
  HomeModernIcon,
  ClockIcon,
  EyeIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'
import { RentalRequest } from '../../../../types/rentalRequest'

export default function AdminActiveLeasesPage() {
  const router = useRouter()
  const { user } = useUser()
  const { activeLeases, fetchActiveLeases, loadingLeases } = useAdminRentalRequest()

  const [searchTerm, setSearchTerm] = useState('')
  const [filteredLeases, setFilteredLeases] = useState<RentalRequest[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    if (user) {
      fetchActiveLeases()
    }
  }, [user])

  useEffect(() => {
    if (!activeLeases) {
      setFilteredLeases([])
      return
    }

    let filtered = [...activeLeases]

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(lease => 
        lease.property?.title?.toLowerCase().includes(term) ||
        lease.tenant?.fullName?.toLowerCase().includes(term) ||
        lease.tenant?.email?.toLowerCase().includes(term) ||
        lease.property?.address?.toLowerCase().includes(term)
      )
    }

    setFilteredLeases(filtered)
    setCurrentPage(1)
  }, [activeLeases, searchTerm])

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

  const getDaysRemaining = (endDate: Date | string | undefined) => {
    if (!endDate) return 0
    const end = new Date(endDate)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getStatusBadge = (daysRemaining: number) => {
    if (daysRemaining < 0) {
      return { label: 'Expired', color: 'bg-red-100 text-red-800', icon: ExclamationCircleIcon }
    } else if (daysRemaining <= 30) {
      return { label: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon }
    } else {
      return { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon }
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentLeases = filteredLeases.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredLeases.length / itemsPerPage)

  if (loadingLeases) {
    return (
      <DashboardLayout activeTab="leases" onTabChange={() => {}}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab="leases" onTabChange={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Active Leases</h1>
              <p className="text-emerald-600 mt-2">
                Manage and monitor all active tenant leases
              </p>
            </div>
            <button
              onClick={() => fetchActiveLeases()}
              className="px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Active Leases</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{filteredLeases.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <HomeModernIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {filteredLeases.filter(l => {
                    const days = getDaysRemaining(l.leaseInfo?.endDate)
                    return days > 0 && days <= 30
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Auto-Renew Enabled</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {filteredLeases.filter(l => l.leaseInfo?.autoRenew).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DocumentDuplicateIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Monthly Revenue</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {formatCurrency(filteredLeases.reduce((sum, l) => sum + (l.leaseInfo?.monthlyRent || 0), 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-green-600">₦</span>
              </div>
            </div>
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

        {/* Leases Table */}
        {currentLeases.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="text-left p-4 font-medium text-gray-600">Property</th>
                    <th className="text-left p-4 font-medium text-gray-600">Tenant</th>
                    <th className="text-left p-4 font-medium text-gray-600">Lease Period</th>
                    <th className="text-left p-4 font-medium text-gray-600">Monthly Rent</th>
                    <th className="text-left p-4 font-medium text-gray-600">Status</th>
                    <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentLeases.map((lease) => {
                    const daysRemaining = getDaysRemaining(lease.leaseInfo?.endDate)
                    const status = getStatusBadge(daysRemaining)
                    const StatusIcon = status.icon

                    return (
                      <tr key={lease._id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {lease.property?.media?.images?.[0] ? (
                                <Image
                                  src={lease.property.media.images[0].url}
                                  alt={lease.property.title}
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
                              <p className="font-medium text-gray-900">{lease.property?.title}</p>
                              <p className="text-sm text-gray-500">{lease.property?.address}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900">{lease.tenant?.fullName}</p>
                            <p className="text-sm text-gray-500">{lease.tenant?.email}</p>
                            <p className="text-sm text-gray-500">{lease.tenant?.phone}</p>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="text-gray-500">Start:</span>{' '}
                              <span className="font-medium">{formatDate(lease.leaseInfo?.startDate)}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-500">End:</span>{' '}
                              <span className="font-medium">{formatDate(lease.leaseInfo?.endDate)}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
                            </p>
                          </div>
                        </td>

                        <td className="p-4">
                          <div>
                            <p className="font-bold text-emerald-700">
                              {formatCurrency(lease.leaseInfo?.monthlyRent)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {lease.leaseInfo?.autoRenew ? (
                                <span className="text-blue-600">Auto-renew enabled</span>
                              ) : (
                                <span className="text-gray-400">Manual renewal</span>
                              )}
                            </p>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="w-3.5 h-3.5 mr-1" />
                            {status.label}
                          </span>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => router.push(`/dashboard/super-admin/leases/${lease._id}`)}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
                          >
                            <EyeIcon className="w-3.5 h-3.5 mr-1" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLeases.length)} of{' '}
                    {filteredLeases.length} leases
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HomeModernIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Leases Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria' : 'There are no active leases at the moment'}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}