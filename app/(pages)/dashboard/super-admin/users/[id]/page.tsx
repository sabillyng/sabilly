// app/(pages)/dashboard/admin/users/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useUser } from '../../../../../context/UserContext'
import { useAdminRentalRequest } from '../../../../../context/RentalRequestContext'
import { useProperty } from '../../../../../context/PropertyContext'
import DashboardLayout from '../../../DashboardLayout'
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  DocumentTextIcon,
  HomeModernIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  PencilIcon,
  LockClosedIcon,
  KeyIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  ChartBarIcon,
  CreditCardIcon,
  CheckBadgeIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import { User } from '../../../../../types/auth'
import { RentalRequest } from '../../../../../types/rentalRequest'

interface UserStats {
  totalRequests?: number
  activeLeases?: number
  pendingRequests?: number
  totalPayments?: number
}

interface UserDocument {
  type: string
  url: string
  uploadedAt?: Date | string
  verified?: boolean
}

interface TabProps {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const tabs: TabProps[] = [
  { id: 'overview', label: 'Overview', icon: UserIcon },
  { id: 'activity', label: 'Activity', icon: ClockIcon },
  { id: 'documents', label: 'Documents', icon: DocumentTextIcon },
  { id: 'security', label: 'Security', icon: ShieldCheckIcon },
  { id: 'admin-stats', label: 'Admin Stats', icon: ChartBarIcon } // New tab for admin stats
]

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser, fetchUserById, updateUserStatus, verifyUserKYC } = useUser()
  const { fetchApprovedRequests } = useAdminRentalRequest()
  const { fetchAdminProperties } = useProperty()
  
  const [user, setUser] = useState<User & { stats?: UserStats; documents?: UserDocument[] }>(null)
  const [rentalHistory, setRentalHistory] = useState<RentalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showKYCModal, setShowKYCModal] = useState(false)
  const [actionReason, setActionReason] = useState('')
  
  // Admin-specific stats
  const [adminStats, setAdminStats] = useState({
    totalPropertiesListed: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    pendingRequests: 0,
    paymentsVerified: 0,
    totalRentCollected: 0,
    activeLeasesManaged: 0,
    expiringLeases: 0,
    completedLeases: 0,
    averageResponseTime: '0h',
    tenantSatisfaction: 0
  })

  useEffect(() => {
    const loadUserData = async () => {
      if (!params.id) return
      setLoading(true)
      try {
        const userData = await fetchUserById(params.id as string)
        if (userData) {
          setUser(userData)
          
          // Fetch rental history
          const history = await fetchApprovedRequests()
          setRentalHistory(Array.isArray(history) ? history : [])
          
          // If user is admin or super admin, fetch their admin stats
          if (userData.role === 'admin' || userData.role === 'super_admin') {
            await loadAdminStats(userData._id)
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUserData()
  }, [params.id])

  const loadAdminStats = async (adminId: string) => {
    try {
      // Fetch properties listed by this admin
      const properties = await fetchAdminProperties() // You'll need to add a method to filter by admin ID
      const adminProperties = Array.isArray(properties) ? properties.filter((p: { listedBy?: string; admin?: string }) => p.listedBy === adminId || p.admin === adminId) : []
      
      // Fetch all rental requests
      const allRequests = await fetchApprovedRequests() // This should be modified to get all requests
      const adminRequests = Array.isArray(allRequests) ? allRequests.filter((r: { assignedAdmin?: string }) => r.assignedAdmin === adminId) : []
      
      // Calculate stats
      const approvedRequests = adminRequests.filter((r: RentalRequest) => r.status === 'approved').length
      const rejectedRequests = adminRequests.filter((r: RentalRequest) => r.status === 'rejected').length
      const pendingRequests = adminRequests.filter((r: RentalRequest) => r.status === 'pending').length
      const paymentsVerified = adminRequests.filter((r: RentalRequest) => r.paymentDetails?.verified).length
      
      // Calculate total rent collected from verified payments
      const totalRentCollected = adminRequests
        .filter((r: RentalRequest) => r.paymentDetails?.verified)
        .reduce((sum, r) => sum + (r.paymentDetails?.amount || 0), 0)
      
      // Active leases managed by this admin
      const activeLeasesManaged = adminRequests.filter((r: RentalRequest) => r.status === 'active_lease').length
      
      // Expiring leases (within 30 days)
      const expiringLeases = adminRequests.filter((r: RentalRequest) => {
        if (r.status !== 'active_lease' || !r.leaseInfo?.endDate) return false
        const daysUntilExpiry = Math.ceil(
          (new Date(r.leaseInfo.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0
      }).length
      
      // Completed leases
      const completedLeases = adminRequests.filter((r: RentalRequest) => r.status === 'completed').length
      
      // Calculate average response time (mock data for now)
      const averageResponseTime = '24h'
      
      // Tenant satisfaction (mock data)
      const tenantSatisfaction = 92

      setAdminStats({
        totalPropertiesListed: adminProperties.length,
        approvedRequests,
        rejectedRequests,
        pendingRequests,
        paymentsVerified,
        totalRentCollected,
        activeLeasesManaged,
        expiringLeases,
        completedLeases,
        averageResponseTime,
        tenantSatisfaction
      })
    } catch (error) {
      console.error('Error loading admin stats:', error)
    }
  }

  const handleStatusUpdate = async () => {
    if (!user) return
    const success = await updateUserStatus(user._id, !user.isActive, actionReason)
    if (success) {
      setUser({ ...user, isActive: !user.isActive })
      setShowStatusModal(false)
      setActionReason('')
    }
  }

  const handleKYCVerify = async (verified: boolean) => {
    if (!user) return
    const success = await verifyUserKYC(user._id, verified, actionReason)
    if (success) {
      setUser({ ...user, kycVerified: verified })
      setShowKYCModal(false)
      setActionReason('')
    }
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <DashboardLayout activeTab="users" onTabChange={() => {}}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout activeTab="users" onTabChange={() => {}}>
        <div className="text-center py-12">
          <ExclamationCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">The user you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  const isSuperAdmin = currentUser?.role === 'super_admin'
  const isAdminUser = user.role === 'admin' || user.role === 'super_admin'
  const canEdit = isSuperAdmin || (currentUser?.role === 'admin' && user.role === 'tenant')

  return (
    <DashboardLayout activeTab="users" onTabChange={() => {}}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            {canEdit && (
              <div className="flex gap-2">
                {user.role === 'tenant' && (
                  <>
                    {!user.kycVerified && (
                      <button
                        onClick={() => setShowKYCModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <ShieldCheckIcon className="w-5 h-5" />
                        Verify KYC
                      </button>
                    )}
                    <button
                      onClick={() => setShowStatusModal(true)}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        user.isActive
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <XCircleIcon className="w-5 h-5" />
                          Suspend User
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-5 h-5" />
                          Activate User
                        </>
                      )}
                    </button>
                  </>
                )}
                {isSuperAdmin && user.role === 'admin' && (
                  <Link
                    href={`/dashboard/super-admin/users/${user._id}/edit`}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                  >
                    <PencilIcon className="w-5 h-5" />
                    Edit Admin
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User Header Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.fullName}
                    width={96}
                    height={96}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span>{getInitials(user.fullName)}</span>
                )}
              </div>
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                user.isActive ? 'bg-green-500' : 'bg-red-500'
              } border-4 border-white`}>
                {user.isActive ? (
                  <CheckCircleSolidIcon className="w-4 h-4 text-white" />
                ) : (
                  <XCircleIcon className="w-4 h-4 text-white" />
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{user.fullName}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === 'super_admin' ? 'bg-purple-500' :
                  user.role === 'admin' ? 'bg-blue-500' :
                  'bg-emerald-500'
                }`}>
                  {user.role === 'super_admin' ? 'Super Admin' :
                   user.role === 'admin' ? 'Admin' : 'Tenant'}
                </span>
                {user.kycVerified && (
                  <span className="px-3 py-1 bg-green-500 rounded-full text-xs font-medium flex items-center">
                    <CheckCircleSolidIcon className="w-3 h-3 mr-1" />
                    KYC Verified
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center">
                  <EnvelopeIcon className="w-5 h-5 mr-2 text-white/70" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="w-5 h-5 mr-2 text-white/70" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-white/70" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Conditional based on user role */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {!isAdminUser ? (
            // Tenant Stats
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{user.stats?.totalRequests || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <DocumentTextIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Leases</p>
                    <p className="text-2xl font-bold text-green-600">{user.stats?.activeLeases || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <HomeModernIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Requests</p>
                    <p className="text-2xl font-bold text-yellow-600">{user.stats?.pendingRequests || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Payments</p>
                    <p className="text-2xl font-bold text-purple-600">{user.stats?.totalPayments || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Admin Stats
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Properties Listed</p>
                    <p className="text-2xl font-bold text-emerald-600">{adminStats.totalPropertiesListed}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <BuildingOfficeIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Approved Requests</p>
                    <p className="text-2xl font-bold text-green-600">{adminStats.approvedRequests}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckBadgeIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Payments Verified</p>
                    <p className="text-2xl font-bold text-blue-600">{adminStats.paymentsVerified}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <CreditCardIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Leases</p>
                    <p className="text-2xl font-bold text-purple-600">{adminStats.activeLeasesManaged}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <HomeModernIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Additional Stats Row for Admin */}
        {isAdminUser && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Reviews</p>
                  <p className="text-2xl font-bold text-yellow-600">{adminStats.pendingRequests}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Rejected Requests</p>
                  <p className="text-2xl font-bold text-red-600">{adminStats.rejectedRequests}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Rent Collected</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(adminStats.totalRentCollected)}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tenant Satisfaction</p>
                  <p className="text-2xl font-bold text-emerald-600">{adminStats.tenantSatisfaction}%</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs - Show Admin Stats tab only for admin users */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              // Hide admin-stats tab for non-admin users
              if (tab.id === 'admin-stats' && !isAdminUser) return null
              
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium text-gray-900">{user.fullName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Email Address</p>
                    <div className="flex items-center">
                      <EnvelopeIcon className="w-4 h-4 text-emerald-600 mr-2" />
                      <a href={`mailto:${user.email}`} className="text-emerald-700 hover:underline">
                        {user.email}
                      </a>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    <div className="flex items-center">
                      <PhoneIcon className="w-4 h-4 text-emerald-600 mr-2" />
                      <a href={`tel:${user.phone}`} className="text-emerald-700">
                        {user.phone || 'N/A'}
                      </a>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">User ID</p>
                    <p className="font-mono text-sm text-gray-900">{user._id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Account Created</p>
                    <p className="text-gray-900">{formatDateTime(user.createdAt)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                    <p className="text-gray-900">{formatDateTime(user.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  Verification Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg border ${
                    user.isEmailVerified
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Email Verification</span>
                      {user.isEmailVerified ? (
                        <CheckCircleSolidIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <ClockIcon className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {user.isEmailVerified
                        ? 'Email verified'
                        : 'Email verification pending'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    user.kycVerified
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">KYC Verification</span>
                      {user.kycVerified ? (
                        <CheckCircleSolidIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <ClockIcon className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {user.kycVerified
                        ? 'Identity verified'
                        : user.kycVerified === false
                        ? 'KYC submitted, pending review'
                        : 'KYC not submitted'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    user.isActive
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Account Status</span>
                      {user.isActive ? (
                        <CheckCircleSolidIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {user.isActive
                        ? 'Account active'
                        : 'Account suspended'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              
              {rentalHistory.length > 0 ? (
                <div className="space-y-4">
                  {rentalHistory.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            {item.property?.media?.images?.[0] ? (
                              <Image
                                src={item.property.media.images[0].url}
                                alt={item.property.title}
                                width={40}
                                height={40}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <BuildingOfficeIcon className="w-5 h-5 text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.property?.title || 'Property'}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Status: <span className="capitalize">{item.status}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDateTime(item.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/admin/rental-requests/${item._id}`}
                          className="text-emerald-600 hover:text-emerald-800"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No activity found</p>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
              
              {user.documents && user.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.documents.map((doc: UserDocument, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <DocumentTextIcon className="w-8 h-8 text-emerald-600 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {doc.type?.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Uploaded {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {doc.verified ? (
                            <span className="text-green-600 text-xs flex items-center">
                              <CheckCircleSolidIcon className="w-4 h-4 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="text-yellow-600 text-xs flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              Pending
                            </span>
                          )}
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-3 text-emerald-600 hover:text-emerald-800"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No documents uploaded</p>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <LockClosedIcon className="w-5 h-5 text-emerald-600 mr-2" />
                      <span className="font-medium text-gray-900">Password</span>
                    </div>
                    {canEdit && (
                      <Link
                        href={`/dashboard/admin/users/${user._id}/reset-password`}
                        className="text-sm text-emerald-600 hover:text-emerald-800"
                      >
                        Reset Password
                      </Link>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Last changed: {formatDate(user.updatedAt) || 'Never'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <ClockIcon className="w-5 h-5 text-emerald-600 mr-2" />
                      <span className="font-medium text-gray-900">Last Login</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <IdentificationIcon className="w-5 h-5 text-emerald-600 mr-2" />
                      <span className="font-medium text-gray-900">Login History</span>
                    </div>
                    <Link
                      href={`/dashboard/admin/users/${user._id}/login-history`}
                      className="text-sm text-emerald-600 hover:text-emerald-800"
                    >
                      View All
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Stats Tab */}
          {activeTab === 'admin-stats' && isAdminUser && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Performance Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Request Processing Stats */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                  <h4 className="font-semibold text-emerald-800 mb-4 flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    Request Processing
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approved Requests</span>
                      <span className="font-bold text-green-600">{adminStats.approvedRequests}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rejected Requests</span>
                      <span className="font-bold text-red-600">{adminStats.rejectedRequests}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending Reviews</span>
                      <span className="font-bold text-yellow-600">{adminStats.pendingRequests}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approval Rate</span>
                      <span className="font-bold text-emerald-600">
                        {adminStats.approvedRequests + adminStats.rejectedRequests > 0
                          ? Math.round((adminStats.approvedRequests / (adminStats.approvedRequests + adminStats.rejectedRequests)) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Stats */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                    <CreditCardIcon className="w-5 h-5 mr-2" />
                    Payment Management
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Payments Verified</span>
                      <span className="font-bold text-blue-600">{adminStats.paymentsVerified}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Rent Collected</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(adminStats.totalRentCollected)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Payment</span>
                      <span className="font-bold text-purple-600">
                        {adminStats.paymentsVerified > 0
                          ? formatCurrency(adminStats.totalRentCollected / adminStats.paymentsVerified)
                          : formatCurrency(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lease Management Stats */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-4 flex items-center">
                    <HomeModernIcon className="w-5 h-5 mr-2" />
                    Lease Management
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Leases</span>
                      <span className="font-bold text-purple-600">{adminStats.activeLeasesManaged}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Expiring Soon</span>
                      <span className="font-bold text-yellow-600">{adminStats.expiringLeases}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completed Leases</span>
                      <span className="font-bold text-green-600">{adminStats.completedLeases}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Occupancy Rate</span>
                      <span className="font-bold text-emerald-600">
                        {adminStats.totalPropertiesListed > 0
                          ? Math.round((adminStats.activeLeasesManaged / adminStats.totalPropertiesListed) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-4 flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    Performance Metrics
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Properties Listed</span>
                      <span className="font-bold text-amber-600">{adminStats.totalPropertiesListed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Response Time</span>
                      <span className="font-bold text-emerald-600">{adminStats.averageResponseTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tenant Satisfaction</span>
                      <span className="font-bold text-green-600">{adminStats.tenantSatisfaction}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Properties per Lease</span>
                      <span className="font-bold text-blue-600">
                        {adminStats.activeLeasesManaged > 0
                          ? (adminStats.totalPropertiesListed / adminStats.activeLeasesManaged).toFixed(1)
                          : adminStats.totalPropertiesListed}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Efficiency Score</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {adminStats.approvedRequests + adminStats.rejectedRequests > 0
                      ? Math.round((adminStats.approvedRequests / (adminStats.approvedRequests + adminStats.rejectedRequests)) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Approval rate</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Total Value Managed</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(adminStats.totalRentCollected)}</p>
                  <p className="text-xs text-gray-400 mt-1">Lifetime rent collected</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Portfolio Size</p>
                  <p className="text-2xl font-bold text-emerald-600">{adminStats.totalPropertiesListed}</p>
                  <p className="text-xs text-gray-400 mt-1">Properties managed</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Update Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fadeIn">
              <div className="p-6">
                <div className={`w-16 h-16 ${user.isActive ? 'bg-red-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {user.isActive ? (
                    <XCircleIcon className="w-8 h-8 text-red-600" />
                  ) : (
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  {user.isActive ? 'Suspend User Account?' : 'Activate User Account?'}
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  {user.isActive 
                    ? `This will suspend ${user.fullName}'s account. They will not be able to log in.`
                    : `This will activate ${user.fullName}'s account. They will be able to log in.`}
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
                      setActionReason('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                      user.isActive
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {user.isActive ? 'Suspend Account' : 'Activate Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KYC Verification Modal */}
        {showKYCModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fadeIn">
              <div className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Verify KYC for {user.fullName}
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  Confirm that you have verified the user&apos;s identity documents.
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