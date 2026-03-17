"use client";
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useUser } from '../../context/UserContext';
import { useMessage } from '../../components/ui/MessagePopup';
import { EmailNotVerifiedError } from '../../api/auth';
import { ForgotPasswordPopup } from './ForgotPasswordPopup';
import { VerifyOTPPopup } from './VerifyOTPPopup';
import { ResetPasswordPopup } from './ResetPasswordPopup';
import { RegistrationSuccessPopup } from './RegistrationSuccessPopup';

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthPopup({ isOpen, onClose, initialMode = 'login' }: AuthPopupProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [userType, setUserType] = useState<'customer' | 'artisan' | 'business_owner'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Popup states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerifyOTP, setShowVerifyOTP] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Registration form state
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    skills: [] as string[],
    bio: '',
    acceptTerms: false
  });

  const [skillInput, setSkillInput] = useState('');
  
  const { login, registerArtisan, registerCustomer } = useUser();
  const { showSuccess } = useMessage();

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMessage('');
      setLoginData({ email: '', password: '', rememberMe: false });
      setRegisterData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        skills: [],
        bio: '',
        acceptTerms: false
      });
    }
  }, [isOpen, mode]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(loginData.email, loginData.password, loginData.rememberMe);
      showSuccess('Login successful! Welcome back.');
      onClose();
    } catch (err) {
      if (err instanceof EmailNotVerifiedError) {
        setPendingEmail(loginData.email);
        setError('Please verify your email first');
        // Open verification popup
        setTimeout(() => {
          setShowVerifyOTP(true);
        }, 500);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!registerData.fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!registerData.email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!registerData.phone.trim()) {
      setError('Phone number is required');
      return;
    }

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(registerData.phone.replace(/[\s\-\(\)]/g, ''))) {
      setError('Please enter a valid phone number');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!registerData.acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    if (userType === 'artisan' && registerData.skills.length === 0) {
      setError('Please add at least one skill');
      return;
    }

    setIsLoading(true);

    try {
      if (userType === 'customer') {
        await registerCustomer({
          fullName: registerData.fullName,
          email: registerData.email,
          password: registerData.password,
          phone: registerData.phone
        });
      } else {
        await registerArtisan({
          fullName: registerData.fullName,
          email: registerData.email,
          password: registerData.password,
          phone: registerData.phone,
          skills: registerData.skills,
          bio: registerData.bio,
          role: userType
        });
      }

      setPendingEmail(registerData.email);
      setShowRegistrationSuccess(true);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !registerData.skills.includes(skillInput.trim())) {
      setRegisterData({
        ...registerData,
        skills: [...registerData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setRegisterData({
      ...registerData,
      skills: registerData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  if (!isOpen) return null;

  return (
    <>
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

            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-8 text-white">
              <h2 className="text-2xl font-bold mb-1">
                {mode === 'login' ? 'Welcome Back!' : 'Join Sabilly Today'}
              </h2>
              <p className="text-emerald-100 text-sm">
                {mode === 'login' 
                  ? 'Sign in to connect with trusted professionals' 
                  : 'Create an account to start your journey'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  mode === 'login'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  mode === 'register'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">{successMessage}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {mode === 'login' ? (
                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="you@example.com"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={loginData.rememberMe}
                        onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (loginData.email) {
                          setPendingEmail(loginData.email);
                        }
                        setShowForgotPassword(true);
                      }}
                      className="text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* User Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      I want to join as
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setUserType('customer')}
                        className={`p-2 text-xs font-medium rounded-lg border transition-colors ${
                          userType === 'customer'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Customer
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType('artisan')}
                        className={`p-2 text-xs font-medium rounded-lg border transition-colors ${
                          userType === 'artisan'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Artisan
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType('business_owner')}
                        className={`p-2 text-xs font-medium rounded-lg border transition-colors ${
                          userType === 'business_owner'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Business
                      </button>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="John Doe"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="you@example.com"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="+234 801 234 5678"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Skills (for artisans and businesses) */}
                  {(userType === 'artisan' || userType === 'business_owner') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Skills / Services
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="e.g., Plumbing"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={addSkill}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                          >
                            Add
                          </button>
                        </div>
                        
                        {/* Skills list */}
                        {registerData.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {registerData.skills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkill(skill)}
                                  className="ml-1 text-emerald-700 hover:text-emerald-900"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio / Description <span className="text-gray-400">(optional)</span>
                        </label>
                        <textarea
                          value={registerData.bio}
                          onChange={(e) => setRegisterData({ ...registerData, bio: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Tell potential customers about yourself..."
                          disabled={isLoading}
                        />
                      </div>
                    </>
                  )}

                  {/* Terms and Conditions */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={registerData.acceptTerms}
                      onChange={(e) => setRegisterData({ ...registerData, acceptTerms: e.target.checked })}
                      className="h-4 w-4 mt-1 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      required
                    />
                    <label className="ml-2 text-sm text-gray-600">
                      I agree to the{' '}
                      <button type="button" className="text-emerald-600 hover:text-emerald-700">
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button type="button" className="text-emerald-600 hover:text-emerald-700">
                        Privacy Policy
                      </button>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              )}

              {/* Social Login */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <svg className="h-5 w-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Popup */}
      <ForgotPasswordPopup
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSwitchToLogin={() => {
          setMode('login');
          setShowForgotPassword(false);
        }}
      />

      {/* Verify OTP Popup */}
      <VerifyOTPPopup
        isOpen={showVerifyOTP}
        onClose={() => setShowVerifyOTP(false)}
        email={pendingEmail}
        onVerificationSuccess={() => {
          setShowVerifyOTP(false);
          showSuccess('Email verified successfully! You can now login.');
          setMode('login');
        }}
      />

      {/* Reset Password Popup */}
      <ResetPasswordPopup
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
        email={pendingEmail}
        onSwitchToLogin={() => {
          setMode('login');
          setShowResetPassword(false);
        }}
      />

      {/* Registration Success Popup */}
      <RegistrationSuccessPopup
        isOpen={showRegistrationSuccess}
        onClose={() => {
          setShowRegistrationSuccess(false);
          setShowVerifyOTP(true);
        }}
        userType={userType}
        email={pendingEmail}
      />
    </>
  );
}