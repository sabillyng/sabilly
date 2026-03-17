"use client";
import React from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface RegistrationSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'customer' | 'artisan' | 'business_owner';
  email: string;
}

export function RegistrationSuccessPopup({ isOpen, onClose, userType, email }: RegistrationSuccessPopupProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToDashboard = () => {
    onClose();
    if (userType === 'artisan') {
      router.push('/dashboard/artisan');
    } else if (userType === 'business_owner') {
      router.push('/dashboard/business');
    } else {
      router.push('/dashboard/customer');
    }
  };

  const handleBrowseServices = () => {
    onClose();
    router.push('/services');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-transparent bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Content */}
          <div className="px-6 py-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 mb-6">
              <CheckCircleIcon className="h-10 w-10 text-emerald-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Account Created Successfully!
            </h3>
            
            <p className="text-gray-600 mb-2">
              Welcome to Sabilly! Your account has been created.
            </p>
            
            <p className="text-sm text-emerald-600 mb-6">
              Verification code sent to <span className="font-semibold">{email}</span>
            </p>

            {/* Next Steps */}
            <div className="bg-emerald-50 p-4 rounded-lg mb-6 text-left">
              <h4 className="text-sm font-medium text-emerald-800 mb-3">What&apos;s next?</h4>
              <ul className="space-y-2 text-sm text-emerald-700">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Check your email for the 6-digit verification code
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Complete your profile to get more visibility
                </li>
                {(userType === 'artisan' || userType === 'business_owner') && (
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    List your services to start getting clients
                  </li>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoToDashboard}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Go to Dashboard
              </button>

              <button
                onClick={handleBrowseServices}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Browse Services
              </button>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}