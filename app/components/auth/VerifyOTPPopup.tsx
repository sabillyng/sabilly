"use client";
import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useUser } from '../../context/UserContext';

interface VerifyOTPPopupProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerificationSuccess?: () => void;
}

export function VerifyOTPPopup({ isOpen, onClose, email, onVerificationSuccess }: VerifyOTPPopupProps) {
  const { verifyEmail, resendOtp } = useUser();
  
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCountdown(60);
      setCanResend(false);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (i < 6 && /^\d*$/.test(char)) {
          newOtp[i] = char;
        }
      });
      setOtp(newOtp);
      setError('');
      setSuccessMessage('');
      
      // Focus last filled or next empty
      const lastFilledIndex = [...newOtp].reverse().findIndex(d => d !== '');
      const actualLastFilledIndex = lastFilledIndex === -1 ? -1 : 5 - lastFilledIndex;
      
      if (actualLastFilledIndex < 5 && actualLastFilledIndex >= 0) {
        inputRefs.current[actualLastFilledIndex + 1]?.focus();
      } else if (actualLastFilledIndex === -1) {
        inputRefs.current[0]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    } else if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');
      setSuccessMessage('');
      
      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.some(digit => !digit)) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const otpCode = otp.join('');
      await verifyEmail(email, otpCode);
      
      setSuccessMessage('Email verified successfully!');
      
      // Close popup after success
      setTimeout(() => {
        onClose();
        if (onVerificationSuccess) {
          onVerificationSuccess();
        }
      }, 1500);
      
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('invalid')) {
          setError('Invalid verification code. Please try again.');
        } else if (errorMessage.includes('expired')) {
          setError('This verification code has expired. Please request a new one.');
        } else if (errorMessage.includes('already verified')) {
          setSuccessMessage('Email already verified!');
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setError(error.message);
        }
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await resendOtp(email);
      setSuccessMessage('A new verification code has been sent to your email.');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop - Fixed: changed from bg-transparent to bg-black */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
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

          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <EnvelopeIcon className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-1">Verify Your Email</h2>
            <p className="text-emerald-100 text-center text-sm">
              Enter the 6-digit code sent to
            </p>
            <p className="text-emerald-100 text-center font-medium">{email}</p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600 text-center">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* OTP Input Fields */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Verification Code
                </label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { inputRefs.current[index] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={isLoading || !!successMessage}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:opacity-50"
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading || otp.some(d => !d) || !!successMessage}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium mb-4"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn&apos;t receive the code?{' '}
                <button
                  onClick={handleResendOTP}
                  disabled={!canResend || isLoading}
                  className={`font-medium ${
                    canResend && !isLoading
                      ? 'text-emerald-600 hover:text-emerald-700'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canResend ? 'Resend code' : `Resend in ${countdown}s`}
                </button>
              </p>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">
                The code is valid for 10 minutes. Check your spam folder if you don&apos;t see the email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}