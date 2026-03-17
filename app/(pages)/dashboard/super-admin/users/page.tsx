
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useUser } from '../../../../context/UserContext'
import DashboardLayout from '../../DashboardLayout'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  HomeModernIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import { User } from '../../../../types/auth'

export default function AdminUsersPage() {
  const { user, allUsers, userStats, fetchAllUsers, loadingUsers, updateUserStatus, verifyUserKYC } = useUser()

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'tenant' | 'admin'>('tenant')
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'suspended'>('all')
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showKYCModal, setShowKYCModal] = useState(false)
  const [actionReason, setActionReason] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      fetchAllUsers({
        role: roleFilter,
        status: statusFilter,
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage
      })
    }
  }, [user, roleFilter, statusFilter, searchTerm, currentPage])

  useEffect(() => {
    if (allUsers) {
      setFilteredUsers(allUsers)
    }
  }, [allUsers])

  const handleStatusUpdate = async () => {
    if (!selectedUser) return
    const success = await updateUserStatus(
      selectedUser._id,
      !selectedUser.isActive,
      actionReason
    )
    if (success) {
      setShowStatusModal(false)
      setSelectedUser(null)
      setActionReason('')
      fetchAllUsers({ role: roleFilter, status: statusFilter, search: searchTerm })
    }
  }

  const handleKYCVerify = async (verified: boolean) => {
    if (!selectedUser) return
    const success = await verifyUserKYC(selectedUser._id, verified, actionReason)
    if (success) {
      setShowKYCModal(false)
      setSelectedUser(null)
      setActionReason('')
      fetchAllUsers({ role: roleFilter, status: statusFilter, search: searchTerm })
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

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return { label: 'Suspended', color: 'bg-red-100 text-red-800', icon: XCircleIcon }
    }
    if (user.isEmailVerified && user.kycVerified) {
      return { label: 'Verified', color: 'bg-green-100 text-green-800', icon: CheckCircleSolidIcon }
    }
    return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon }
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  return (
    <DashboardLayout activeTab="users" onTabChange={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {user?.role === 'super_admin' ? 'User Management' : 'Tenant Management'}
              </h1>
              <p className="text-emerald-600 mt-2">
                {user?.role === 'super_admin' 
                  ? 'Manage all users, admins, and tenants'
                  : 'View and manage all tenant accounts'}
              </p>
            </div>
            <button
              onClick={() => fetchAllUsers({ role: roleFilter, status: statusFilter, search: searchTerm })}
              className="px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loadingUsers ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total {user?.role === 'super_admin' ? 'Users' : 'Tenants'}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{userStats?.totalUsers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {user?.role === 'super_admin' && (
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Admins</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{userStats?.totalAdmins || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Verified Users</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{userStats?.verifiedUsers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Verification</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{userStats?.pendingVerification || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Leases</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{userStats?.activeLeases || 0}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <HomeModernIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {user?.role === 'super_admin' && (
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as 'all' | 'tenant' | 'admin')}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                >
                  <option value="all">All Roles</option>
                  <option value="tenant">Tenants Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>
            )}

            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'verified' | 'pending' | 'suspended')}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending Verification</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearchTerm('')
                setRoleFilter('all')
                setStatusFilter('all')
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Users Table */}
        {loadingUsers ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {currentUsers.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200">
                        <th className="text-left p-4 font-medium text-gray-600">User</th>
                        <th className="text-left p-4 font-medium text-gray-600">Contact</th>
                        <th className="text-left p-4 font-medium text-gray-600">Role</th>
                        <th className="text-left p-4 font-medium text-gray-600">Status</th>
                        <th className="text-left p-4 font-medium text-gray-600">Stats</th>
                        <th className="text-left p-4 font-medium text-gray-600">Joined</th>
                        <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentUsers.map((user) => {
                        const status = getStatusBadge(user)
                        const StatusIcon = status.icon

                        return (
                          <tr key={user._id} className="hover:bg-emerald-50/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center overflow-hidden">
                                  {user.avatar ? (
                                    <Image
                                      src={user.avatar}
                                      alt={user.fullName}
                                      width={40}
                                      height={40}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <UserIcon className="w-6 h-6 text-emerald-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{user.fullName}</p>
                                  <p className="text-xs text-gray-500">ID: {user._id.slice(-8)}</p>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="text-gray-600">{user.email}</span>
                                </div>
                                {user.phone && (
                                  <div className="flex items-center text-sm">
                                    <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">{user.phone}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                                user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role === 'super_admin' ? 'Super Admin' :
                                 user.role === 'admin' ? 'Admin' : 'Tenant'}
                              </span>
                            </td>

                            <td className="p-4">
                              <div className="space-y-1">
                                <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${status.color}`}>
                                  <StatusIcon className="w-3.5 h-3.5 mr-1" />
                                  {status.label}
                                </span>
                                {user.isEmailVerified && user.kycVerified && (
                                  <div className="flex items-center text-xs text-green-600">
                                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                                    KYC Verified
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="text-sm">
                                <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="flex flex-col gap-2">
                                <Link
                                  href={`/dashboard/super-admin/users/${user._id}`}
                                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
                                >
                                  <EyeIcon className="w-3.5 h-3.5 mr-1" />
                                  View Details
                                </Link>

                                {user.role === 'tenant' && (
                                  <>
                                    {!user.kycVerified && (
                                      <button
                                        onClick={() => {
                                          setSelectedUser(user)
                                          setShowKYCModal(true)
                                        }}
                                        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                      >
                                        <ShieldCheckIcon className="w-3.5 h-3.5 mr-1" />
                                        Verify KYC
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setSelectedUser(user)
                                        setShowStatusModal(true)
                                      }}
                                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-center ${
                                        user.isActive
                                          ? 'bg-red-600 text-white hover:bg-red-700'
                                          : 'bg-green-600 text-white hover:bg-green-700'
                                      }`}
                                    >
                                      {user.isActive ? (
                                        <>
                                          <XCircleIcon className="w-3.5 h-3.5 mr-1" />
                                          Suspend
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircleIcon className="w-3.5 h-3.5 mr-1" />
                                          Activate
                                        </>
                                      )}
                                    </button>
                                  </>
                                )}
                              </div>
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
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
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
              </>
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-600">
                  {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No users have registered yet'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fadeIn">
              <div className="p-6">
                <div className={`w-16 h-16 ${selectedUser.isActive ? 'bg-red-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {selectedUser.isActive ? (
                    <XCircleIcon className="w-8 h-8 text-red-600" />
                  ) : (
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  {selectedUser.isActive ? 'Suspend User Account?' : 'Activate User Account?'}
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  {selectedUser.isActive 
                    ? `This will suspend ${selectedUser.fullName}'s account. They will not be able to log in.`
                    : `This will activate ${selectedUser.fullName}'s account. They will be able to log in.`}
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    rows={3}
                    placeholder="Enter reason for this action..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowStatusModal(false)
                      setSelectedUser(null)
                      setActionReason('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                      selectedUser.isActive
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {selectedUser.isActive ? 'Suspend Account' : 'Activate Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KYC Verification Modal */}
        {showKYCModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fadeIn">
              <div className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Verify KYC for {selectedUser.fullName}
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  Confirm that you have verified the users identity documents.
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Notes
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    rows={3}
                    placeholder="Add any notes about the verification..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowKYCModal(false)
                      setSelectedUser(null)
                      setActionReason('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleKYCVerify(false)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleKYCVerify(true)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Verify
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