
'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useUser } from '../../../../context/UserContext'
import DashboardLayout from '../../DashboardLayout'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CameraIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'

interface SettingsTab {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const tabs: SettingsTab[] = [
  { id: 'profile', label: 'Profile Information', icon: UserIcon },
  { id: 'security', label: 'Security', icon: LockClosedIcon },
]

export default function TenantSettingsPage() {
  const { user, loading } = useUser()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    profileImage: null as File | null,
    profileImagePreview: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        profileImage: null,
        profileImagePreview: user.avatar || '',
      })
    }
  }, [user])

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, profileImage: 'Please upload an image file' })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors({ ...errors, profileImage: 'File size must be less than 2MB' })
      return
    }

    setProfileData(prev => ({
      ...prev,
      profileImage: file,
      profileImagePreview: URL.createObjectURL(file),
    }))
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')

    // Validate
    if (!profileData.fullName.trim()) {
      setErrors({ ...errors, fullName: 'Full name is required' })
      return
    }

    try {
      // Call update profile API
      // await updateProfile(profileData)
      setSuccessMessage('Profile updated successfully!')
    } catch (error) {
      setErrors({ form: 'Failed to update profile' })
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')

    // Validate
    if (!passwordData.currentPassword) {
      setErrors({ ...errors, currentPassword: 'Current password is required' })
      return
    }
    if (!passwordData.newPassword) {
      setErrors({ ...errors, newPassword: 'New password is required' })
      return
    }
    if (passwordData.newPassword.length < 8) {
      setErrors({ ...errors, newPassword: 'Password must be at least 8 characters' })
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ ...errors, confirmPassword: 'Passwords do not match' })
      return
    }

    try {
      // Call update password API
      // await updatePassword(passwordData)
      setSuccessMessage('Password updated successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      setErrors({ form: 'Failed to update password' })
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <DashboardLayout activeTab="settings" onTabChange={() => {}}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-emerald-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200 flex items-center">
            <CheckCircleSolidIcon className="w-5 h-5 text-green-600 mr-3" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errors.form && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 flex items-center">
            <ExclamationCircleIcon className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800">{errors.form}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-24">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>

              {/* Account Status */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2">Account Status</p>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">Active</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Profile Image */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-emerald-100 border-4 border-white shadow-lg">
                        {profileData.profileImagePreview ? (
                          <Image
                            src={profileData.profileImagePreview}
                            alt="Profile"
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-green-400">
                            <UserIcon className="w-12 h-12 text-white" />
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor="profile-image"
                        className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors shadow-md"
                      >
                        <CameraIcon className="w-4 h-4 text-white" />
                        <input
                          type="file"
                          id="profile-image"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Profile Photo</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        JPG, PNG or GIF. Max 2MB.
                      </p>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.fullName
                            ? 'border-red-500 focus:ring-red-200'
                            : 'border-gray-300 focus:ring-emerald-200'
                        }`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        value={profileData.email}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+234 123 456 7890"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>

                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword.current ? 'text' : 'password'}
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.currentPassword
                            ? 'border-red-500 focus:ring-red-200'
                            : 'border-gray-300 focus:ring-emerald-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.current ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword.new ? 'text' : 'password'}
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.newPassword
                            ? 'border-red-500 focus:ring-red-200'
                            : 'border-gray-300 focus:ring-emerald-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.new ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 8 characters
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword.confirm ? 'text' : 'password'}
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.confirmPassword
                            ? 'border-red-500 focus:ring-red-200'
                            : 'border-gray-300 focus:ring-emerald-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.confirm ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}