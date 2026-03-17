
'use client'

import React, { useCallback, useContext, useEffect, useState } from 'react'
import { 
  ExclamationCircleIcon, 
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'

export type MessageType = 'success' | 'error' | 'warning' | 'info' | 'notification'

export interface MessagePopupProps {
  type: MessageType
  title?: string
  message: string
  duration?: number
  onClose?: () => void
  show?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  actions?: {
    label: string
    onClick: () => void
    primary?: boolean
  }[]
  showIcon?: boolean
  dismissible?: boolean
  progress?: boolean
}

const icons = {
  success: CheckCircleSolidIcon,
  error: XCircleIcon,
  warning: ExclamationCircleIcon,
  info: InformationCircleIcon,
  notification: BellAlertIcon
}

const colors = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: 'text-green-600',
    progress: 'bg-green-600'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-600',
    progress: 'bg-red-600'
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-600',
    progress: 'bg-yellow-600'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-600',
    progress: 'bg-blue-600'
  },
  notification: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    icon: 'text-purple-600',
    progress: 'bg-purple-600'
  }
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
}

export const MessagePopup: React.FC<MessagePopupProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  show = true,
  position = 'top-right',
  actions = [],
  showIcon = true,
  dismissible = true,
  progress = true
}) => {
  const [isVisible, setIsVisible] = useState(show)
  const [progressWidth, setProgressWidth] = useState(100)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    setIsVisible(show)
  }, [show])

  useEffect(() => {
    if (!isVisible || !duration || isPaused) return

    const startTime = Date.now()
    const endTime = startTime + duration

    const updateProgress = () => {
      const now = Date.now()
      const remaining = endTime - now
      const newWidth = Math.max(0, (remaining / duration) * 100)
      setProgressWidth(newWidth)

      if (remaining <= 0) {
        handleClose()
      }
    }

    const interval = setInterval(updateProgress, 10)
    return () => clearInterval(interval)
  }, [isVisible, duration, isPaused])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible) return null

  const Icon = icons[type]
  const color = colors[type]

  return (
    <div
      className={`fixed z-50 w-96 max-w-[calc(100vw-2rem)] animate-slideIn ${positionClasses[position]}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`relative rounded-xl shadow-lg border ${color.bg} ${color.border} overflow-hidden`}>
        {/* Progress Bar */}
        {progress && duration > 0 && (
          <div
            className={`absolute top-0 left-0 h-1 ${color.progress} transition-all duration-100 ease-linear`}
            style={{ width: `${progressWidth}%` }}
          />
        )}

        <div className="p-4">
          <div className="flex items-start">
            {/* Icon */}
            {showIcon && (
              <div className="flex-shrink-0 mr-3">
                <Icon className={`w-6 h-6 ${color.icon}`} />
              </div>
            )}

            {/* Content */}
            <div className="flex-1">
              {title && (
                <h3 className={`font-semibold ${color.text} mb-1`}>{title}</h3>
              )}
              <p className={`text-sm ${color.text} opacity-90`}>{message}</p>

              {/* Actions */}
              {actions.length > 0 && (
                <div className="mt-3 flex space-x-2">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        action.primary
                          ? `bg-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-600 text-white hover:opacity-90`
                          : `border border-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-300 text-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-700 hover:bg-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-50`
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            {dismissible && (
              <button
                onClick={handleClose}
                className={`flex-shrink-0 ml-3 p-1 rounded-lg hover:bg-black/5 transition-colors ${color.text}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Context for managing messages
interface MessageContextType {
  showMessage: (props: Omit<MessagePopupProps, 'show' | 'onClose'>) => string
  showSuccess: (message: string, options?: Partial<Omit<MessagePopupProps, 'type' | 'message'>>) => string
  showError: (message: string, options?: Partial<Omit<MessagePopupProps, 'type' | 'message'>>) => string
  showWarning: (message: string, options?: Partial<Omit<MessagePopupProps, 'type' | 'message'>>) => string
  showInfo: (message: string, options?: Partial<Omit<MessagePopupProps, 'type' | 'message'>>) => string
  showNotification: (message: string, options?: Partial<Omit<MessagePopupProps, 'type' | 'message'>>) => string
  hideMessage: (id: string) => void
  hideAll: () => void
}

const MessageContext = React.createContext<MessageContextType | undefined>(undefined)

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<(MessagePopupProps & { id: string })[]>([])

  const showMessage = useCallback((props: Omit<MessagePopupProps, 'show' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setMessages(prev => [...prev, { ...props, id, show: true }])
    return id
  }, [])

  const hideMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }, [])

  const hideAll = useCallback(() => {
    setMessages([])
  }, [])

  const showSuccess = useCallback((
    message: string,
    options?: Partial<Omit<MessagePopupProps, 'type' | 'message'>>
  ) => {
    return showMessage({ type: 'success', message, ...options })
  }, [showMessage])

  const showError = useCallback((
    message: string,
    options?: Partial<Omit<MessagePopupProps, 'type' | 'message'>>
  ) => {
    return showMessage({ type: 'error', message, ...options })
  }, [showMessage])

  const showWarning = useCallback((
    message: string,
    options?: Partial<Omit<MessagePopupProps, 'type' | 'message'>>
  ) => {
    return showMessage({ type: 'warning', message, ...options })
  }, [showMessage])

  const showInfo = useCallback((
    message: string,
    options?: Partial<Omit<MessagePopupProps, 'type' | 'message'>>
  ) => {
    return showMessage({ type: 'info', message, ...options })
  }, [showMessage])

  const showNotification = useCallback((
    message: string,
    options?: Partial<Omit<MessagePopupProps, 'type' | 'message'>>
  ) => {
    return showMessage({ type: 'notification', message, ...options })
  }, [showMessage])

  return (
    <MessageContext.Provider value={{
      showMessage,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showNotification,
      hideMessage,
      hideAll
    }}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-50">
        {messages.map(msg => (
          <MessagePopup
            key={msg.id}
            {...msg}
            onClose={() => hideMessage(msg.id)}
          />
        ))}
      </div>
    </MessageContext.Provider>
  )
}

export const useMessage = () => {
  const context = useContext(MessageContext)
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider')
  }
  return context
}