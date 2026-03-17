'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '../../../../context/UserContext'
import DashboardLayout from '../../DashboardLayout'
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

export default function CreateAdminPage() {
  const router = useRouter()
  const { createAdmin } = useUser()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const result = await createAdmin({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard/super-admin/users')
        }, 2000)
      } else {
        setErrors({ form: result.message || 'Failed to create admin' })
      }
    } catch (error) {
      setErrors({ form: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout activeTab="users" onTabChange={() => {}}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Admin</h1>
          <p className="text-gray-600 mt-1">Add a new administrator to the platform</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200 flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
            <p className="text-green-800">Admin created successfully! Redirecting...</p>
          </div>
        )}

        {/* Error Message */}
        {errors.form && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 flex items-center">
            <ExclamationCircleIcon className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800">{errors.form}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
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
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-emerald-200'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
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
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+234 123 456 7890"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-emerald-200'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword.password ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-emerald-200'
                }`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('password')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword.password ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 8 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword.confirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-emerald-200'
                }`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword.confirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Password Strength Indicator (Optional) */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4].map((level) => {
                  const hasLowercase = /[a-z]/.test(formData.password)
                  const hasUppercase = /[A-Z]/.test(formData.password)
                  const hasNumber = /\d/.test(formData.password)
                  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                  const isLongEnough = formData.password.length >= 8
                  
                  let strength = 0
                  if (isLongEnough) strength++
                  if (hasLowercase && hasUppercase) strength++
                  if (hasNumber) strength++
                  if (hasSpecial) strength++
                  
                  const isActive = level <= strength
                  
                  return (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        isActive
                          ? strength <= 2
                            ? 'bg-red-500'
                            : strength === 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password strength: {
                  (() => {
                    const hasLowercase = /[a-z]/.test(formData.password)
                    const hasUppercase = /[A-Z]/.test(formData.password)
                    const hasNumber = /\d/.test(formData.password)
                    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                    const isLongEnough = formData.password.length >= 8
                    
                    let strength = 0
                    if (isLongEnough) strength++
                    if (hasLowercase && hasUppercase) strength++
                    if (hasNumber) strength++
                    if (hasSpecial) strength++
                    
                    if (strength <= 2) return 'Weak'
                    if (strength === 3) return 'Medium'
                    return 'Strong'
                  })()
                }
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Admin...
              </>
            ) : (
              'Create Admin'
            )}
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}