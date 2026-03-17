"use client";
import React, { useState } from 'react';
import { XMarkIcon, EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useUser } from '../../context/UserContext';

interface ForgotPasswordPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function ForgotPasswordPopup({ isOpen, onClose, onSwitchToLogin }: ForgotPasswordPopupProps) {
  const { forgotPassword } = useUser();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-transparent bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-8 text-white">
            <h2 className="text-2xl font-bold mb-1">Forgot Password?</h2>
            <p className="text-emerald-100 text-sm">
              Enter your email address and we&apos;ll send you a code to reset your password.
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {success ? (
              <div className="text-center py-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We&apos;ve sent a password reset code to <span className="font-semibold text-emerald-600">{email}</span>
                </p>
                <button
                  onClick={handleClose}
                  className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Code'
                  )}
                </button>

                {/* Back to Login */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchToLogin();
                      onClose();
                    }}
                    className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}