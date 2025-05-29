import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { apiService } from '../../lib/api';
import { ENABLE_DEMO_MODE, isDemoAccount, debugLog } from '../../lib/env-config';

// SVG icons
const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.4916 12.4416C14.7749 14.1499 12.3166 14.6749 10.1583 14.0083L6.2333 17.9166C5.9499 18.2083 5.3916 18.3833 4.9916 18.3249L3.1749 18.0749C2.5749 17.9916 2.0166 17.4249 1.9249 16.8249L1.6749 15.0083C1.6166 14.6083 1.8083 14.0499 2.0833 13.7666L6.0083 9.8499C5.3333 7.6833 5.8499 5.2249 7.5666 3.5166C10.0249 1.0583 14.0166 1.0583 16.4833 3.5166C18.9499 5.9749 18.9499 9.9833 16.4916 12.4416Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M5.74167 14.575L7.65833 16.4917" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.083 9.16675C12.7734 9.16675 13.333 8.60722 13.333 7.91675C13.333 7.22627 12.7734 6.66675 12.083 6.66675C11.3925 6.66675 10.833 7.22627 10.833 7.91675C10.833 8.60722 11.3925 9.16675 12.083 9.16675Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeSlashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.1083 7.8917L7.8917 12.1083C7.35003 11.5667 7.01669 10.825 7.01669 10C7.01669 8.35 8.35003 7.01667 10 7.01667C10.825 7.01667 11.5667 7.35 12.1083 7.8917Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.85 4.80834C13.3917 3.70834 11.725 3.10834 10 3.10834C7.05833 3.10834 4.31667 4.84167 2.40833 7.84167C1.65833 9.01667 1.65833 10.9917 2.40833 12.1667C3.06667 13.2 3.83333 14.0917 4.66667 14.8083" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.01669 16.275C7.96669 16.675 8.97503 16.8917 10 16.8917C12.9417 16.8917 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00833 17.5917 7.83333C17.3167 7.33333 17.0167 6.85833 16.7083 6.425" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.925 10.5833C12.7083 11.7583 11.75 12.7167 10.575 12.9333" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.89166 12.1083L1.66666 18.3333" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.3333 1.66667L12.1083 7.89167" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.9833 10.0001C12.9833 11.6501 11.65 12.9834 10 12.9834C8.35 12.9834 7.01666 11.6501 7.01666 10.0001C7.01666 8.35008 8.35 7.01675 10 7.01675C11.65 7.01675 12.9833 8.35008 12.9833 10.0001Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 16.8917C12.9417 16.8917 15.6833 15.1584 17.5917 12.1584C18.3417 10.9834 18.3417 9.00838 17.5917 7.83338C15.6833 4.83338 12.9417 3.10005 10 3.10005C7.05833 3.10005 4.31667 4.83338 2.40833 7.83338C1.65833 9.00838 1.65833 10.9834 2.40833 12.1584C4.31667 15.1584 7.05833 16.8917 10 16.8917Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" stroke="#2E3642" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Error message component
const InputError = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="absolute left-4 top-full mt-1 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 font-medium z-[100] shadow-sm">
      <div className="absolute -top-2 left-4 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-red-50"></div>
      <div className="absolute -top-[9px] left-4 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-red-200"></div>
      {message}
    </div>
  );
};

export default function NewPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({ password: '', confirmPassword: '', general: '' });
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const router = useRouter();

  // Theme and background setting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Reset dark mode if present
      document.documentElement.classList.remove('dark');
      // Store the light theme preference
      localStorage.setItem('theme', 'light');
      
      // Apply background color to both html and body elements
      document.documentElement.style.backgroundColor = '#FBF5DA';
      document.documentElement.style.minHeight = '100%';
      document.body.style.backgroundColor = '#FBF5DA';
      document.body.style.minHeight = '100vh';
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        document.documentElement.style.backgroundColor = '';
        document.body.style.backgroundColor = '';
      }
    };
  }, []);

  // Get token and email from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = sessionStorage.getItem('resetToken');
      const storedEmail = sessionStorage.getItem('resetEmail');
      
      if (storedToken && storedEmail) {
        setToken(storedToken);
        setEmail(storedEmail);
      } else {
        // Redirect to first step if email or token is missing
        router.push('/password-reset');
      }
    }
  }, [router]);

  // Password validation
  const validatePassword = (password) => {
    const minLength = 8;
    const maxLength = 16;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return {
      isValid: password.length >= minLength && password.length <= maxLength && hasUppercase && hasLowercase && hasNumber,
      minLength: password.length >= minLength,
      maxLength: password.length <= maxLength,
      lengthValid: password.length >= minLength && password.length <= maxLength,
      hasUppercase,
      hasLowercase,
      hasNumber
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({ password: '', confirmPassword: '', general: '' });
    
    // Validation
    let hasError = false;
    const newErrors = { password: '', confirmPassword: '', general: '' };
    
    const validation = validatePassword(password);
    if (!validation.isValid) {
      newErrors.password = 'Password must meet all requirements';
      hasError = true;
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Those passwords don’t match.';
      hasError = true;
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      hasError = true;
    }
    
    if (hasError) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Şifre sıfırlama isteği gönder
      const response = await apiService.auth.resetPassword({ 
        email, 
        token,
        newPassword: password 
      });
      
      if (response.data.success) {
        // Clear sessionStorage when done
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('resetToken');
          sessionStorage.removeItem('resetEmail');
        }
        
        router.push('/login');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Special handling for demo accounts
      if (ENABLE_DEMO_MODE && isDemoAccount(email)) {
        debugLog('Handling demo account password reset:', email);
        
        // Clear sessionStorage when done
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('resetToken');
          sessionStorage.removeItem('resetEmail');
        }
        
        router.push('/login');
        return;
      }
      
      // Extract error message
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'Session expired. Please try again.';
        setTimeout(() => {
          router.push('/password-reset');
        }, 2000);
      } else if (!error.response) {
        errorMessage = 'Connection error. Please try again later.';
      }
      
      setErrors({ ...newErrors, general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear errors when user types
  useEffect(() => {
    if (errors.password && password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  }, [password]);

  useEffect(() => {
    if (errors.confirmPassword && confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  }, [confirmPassword]);

  const passwordValidation = validatePassword(password);
  const allRequirementsMet = passwordValidation.isValid;
  const passwordsMatch = password === confirmPassword && password !== '';

  return (
    <>
      <Head>
        <title>New Password - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="description" content="Set a new password for your tenantli account" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="stylesheet" href="/styles/modern/theme.css" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          body, html {
            background-color: #FBF5DA;
            min-height: 100vh;
            margin: 0;
            padding: 0;
          }
          @media (max-width: 640px) {
            .mobile-full-height {
              min-height: calc(100vh - env(safe-area-inset-bottom));
            }
          }
        `}</style>
      </Head>
      
      <div className="fixed inset-0 bg-[#FBF5DA]"></div>
      <div 
        className="min-h-screen mobile-full-height font-['Nunito'] relative w-full overflow-hidden" 
        style={{ maxWidth: '100%', margin: '0 auto' }}
      >
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 bg-[#FBF5DA] z-20">
          <div className="w-full max-w-[390px] mx-auto">
            <div className="flex flex-row items-center px-[20px] h-[65px] gap-[10px]" style={{ paddingTop: 'env(safe-area-inset-top, 20px)' }}>
              <button 
                className="relative z-50 w-10 h-10 flex items-center justify-center -ml-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // When navigating back, keep the email but remove the token
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('resetToken');
                  }
                  router.push('/password-reset/verify?email=' + encodeURIComponent(email));
                }}
                aria-label="Go back"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 19L8 12L15 5" stroke="#2E3642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
                Reset Your Password
              </h1>
            </div>
          </div>
        </div>
        
        {/* Content Container */}
        <div className="w-full flex flex-col items-center px-[5%]" style={{ paddingTop: '85px' }}>
          {/* General Error Message */}
          {errors.general && (
            <div className="w-full max-w-[350px] sm:max-w-[400px] lg:max-w-[420px] bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{errors.general}</span>
            </div>
          )}

          <form id="newPasswordForm" onSubmit={handleSubmit} className="w-full max-w-[350px] sm:max-w-[400px] lg:max-w-[420px]">
            {/* Password Input */}
            <div className="mb-4">
              <div className={`relative w-full h-[56px] flex flex-row items-center px-[20px] py-[18px] gap-[8px] ${
                focusedField === 'password' 
                  ? 'bg-[#E8F5EB] border-[#55A363]' 
                  : errors.password 
                    ? 'bg-red-50 border-red-300' 
                    : 'bg-white border-[#D1E7D5]'
              } border rounded-[16px] transition-all duration-200`}>
                <KeyIcon />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Create a new password"
                  className="flex-1 outline-none bg-transparent text-[#515964] font-bold text-[14px] leading-[19px]"
                  minLength={8}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500"
                >
                  {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                </button>
                <InputError message={errors.password} />
              </div>
              
              {/* Password Requirements */}
              {focusedField === 'password' && password && (
                <div className="mt-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-600 mb-1">Password requirements:</p>
                  <ul className="text-xs space-y-1">
                    <li className={`flex items-center ${passwordValidation.lengthValid ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className={`w-3 h-3 mr-2 rounded-full ${passwordValidation.lengthValid ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      8-16 characters
                    </li>
                    <li className={`flex items-center ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className={`w-3 h-3 mr-2 rounded-full ${passwordValidation.hasUppercase ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      At least one uppercase letter
                    </li>
                    <li className={`flex items-center ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className={`w-3 h-3 mr-2 rounded-full ${passwordValidation.hasLowercase ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      At least one lowercase letter
                    </li>
                    <li className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className={`w-3 h-3 mr-2 rounded-full ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      At least one number
                    </li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* Confirm Password Input */}
            <div className="mb-6">
              <div className={`relative w-full h-[56px] flex flex-row items-center px-[20px] py-[18px] gap-[8px] ${
                focusedField === 'confirmPassword' 
                  ? 'bg-[#E8F5EB] border-[#55A363]' 
                  : errors.confirmPassword 
                    ? 'bg-red-50 border-red-300' 
                    : 'bg-white border-[#D1E7D5]'
              } border rounded-[16px] transition-all duration-200`}>
                <KeyIcon />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Confirm new password"
                  className="flex-1 outline-none bg-transparent text-[#515964] font-bold text-[14px] leading-[19px]"
                  minLength={8}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-500"
                >
                  {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
                </button>
                <InputError message={errors.confirmPassword} />
              </div>
            </div>
          </form>
          
        </div>
        
        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !allRequirementsMet || !passwordsMatch}
          className={`w-full max-w-[350px] sm:max-w-[400px] lg:max-w-[420px] h-14 flex justify-center items-center py-[18px] rounded-2xl absolute bottom-[40px] left-1/2 transform -translate-x-1/2 transition-colors duration-200 ${
            allRequirementsMet && passwordsMatch
              ? 'bg-[#1C2C40] hover:bg-[#2A3A4E] cursor-pointer'
              : 'bg-[#8A9099] cursor-not-allowed'
          }`}
        >
          <span className="font-bold text-[16px] text-[#D1E7E2]">
            {isSubmitting ? "Processing..." : "Save"}
          </span>
        </button>
        
        {/* Bottom Spacing */}
        <div className="pb-[120px]"></div>
      </div>
    </>
  );
}