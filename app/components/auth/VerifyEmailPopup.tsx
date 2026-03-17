"use client";
import { useState, useEffect } from 'react';
import { XMarkIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useUser } from '../../context/UserContext';

interface VerifyEmailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function VerifyEmailPopup({ isOpen, onClose, email }: VerifyEmailPopupProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const { verifyEmail, resendOtp } = useUser();

  useEffect(() => {
    if (isOpen) {
      setTimer(60);
      setCanResend(false);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
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

  const handleOtpChange = (index: number, value: string) => {
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
      
      // Focus next empty or last field
      const nextEmptyIndex = newOtp.findIndex((v, i) => !v && i < 6);
      if (nextEmptyIndex !== -1) {
        document.getElementById(`otp-${nextEmptyIndex}`)?.focus();
      }
    } else if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await verifyEmail(email, otpString);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      await resendOtp(email);
      setTimer(60);
      setCanResend(false);
      setError('');
      
      // Reset OTP fields
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
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

          {/* Content */}
          <div className="px-6 py-8">
            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
              <EnvelopeIcon className="h-8 w-8 text-emerald-600" />
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">Verify Your Email</h2>
            <p className="text-center text-gray-600 mb-2">
              We&apos;ve sent a verification code to
            </p>
            <p className="text-center font-medium text-emerald-600 mb-6">{email}</p>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* OTP Input */}
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Verify button */}
            <button
              onClick={handleVerify}
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>

            {/* Resend option */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn&apos;t receive the code?{' '}
                {canResend ? (
                  <button
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Resend
                  </button>
                ) : (
                  <span className="text-gray-400">Resend in {timer}s</span>
                )}
              </p>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-500 text-center mt-6">
              Please check your spam folder if you don&apos;t see the email in your inbox.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}