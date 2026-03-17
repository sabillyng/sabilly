
'use client'

import React from 'react'
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export type DialogType = 'warning' | 'danger' | 'info' | 'success'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  type?: DialogType
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}

const dialogConfig = {
  warning: {
    icon: ExclamationTriangleIcon,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
    title: 'Warning'
  },
  danger: {
    icon: ExclamationTriangleIcon,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    confirmBg: 'bg-red-600 hover:bg-red-700',
    title: 'Confirm Action'
  },
  info: {
    icon: InformationCircleIcon,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    confirmBg: 'bg-blue-600 hover:bg-blue-700',
    title: 'Information'
  },
  success: {
    icon: QuestionMarkCircleIcon,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    confirmBg: 'bg-green-600 hover:bg-green-700',
    title: 'Confirmation'
  }
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false
}) => {
  if (!isOpen) return null

  const config = dialogConfig[type]
  const Icon = config.icon

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="p-6">
            {/* Icon */}
            <div className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Icon className={`w-8 h-8 ${config.iconColor}`} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {title || config.title}
            </h3>

            {/* Message */}
            <p className="text-gray-600 text-center mb-6">
              {message}
            </p>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors disabled:opacity-50 ${config.confirmBg}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}