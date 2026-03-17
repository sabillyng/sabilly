
'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  type: ToastType
  message: string
  duration?: number
  onClose: () => void
}

const toastIcons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon
}

const toastColors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
}

export const Toast: React.FC<ToastProps> = ({ type, message, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const Icon = toastIcons[type]

  return (
    <div className={`fixed bottom-4 right-4 z-50 animate-slideUp`}>
      <div className={`flex items-center p-4 rounded-xl shadow-lg border ${toastColors[type]} min-w-[300px] max-w-md`}>
        <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
        <p className="text-sm flex-1">{message}</p>
        <button onClick={() => setIsVisible(false)} className="ml-3 p-1 hover:bg-black/5 rounded-lg">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}