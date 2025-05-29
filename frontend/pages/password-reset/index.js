import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { apiService } from '../../lib/api';
import { IS_DEVELOPMENT, ENABLE_DEMO_MODE, isDemoAccount, debugLog } from '../../lib/env-config';

// SVG icons
const SmsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.1667 17.0833H5.83333C3.33333 17.0833 1.66667 15.8333 1.66667 12.9167V7.08333C1.66667 4.16667 3.33333 2.91667 5.83333 2.91667H14.1667C16.6667 2.91667 18.3333 4.16667 18.3333 7.08333V12.9167C18.3333 15.8333 16.6667 17.0833 14.1667 17.0833Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M14.1667 7.5L10.5833 10.5C9.79167 11.1 8.20833 11.1 7.41667 10.5L3.83333 7.5" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
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
    <div className="absolute left-4 top-full mt-1 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 font-medium z-50">
      <div className="absolute -top-2 left-4 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-red-50"></div>
      <div className="absolute -top-[9px] left-4 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-red-200"></div>
      {message}
    </div>
  );
};

export default function PasswordReset() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({ email: '', general: '' });
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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear all errors before starting
    setErrors({ email: '', general: '' });
    setIsSubmitting(true);

    // Validation
    if (!email) {
      setErrors({ email: 'Email is required', general: '' });
      setIsSubmitting(false);
      return;
    } else if (!validateEmail(email)) {
      setErrors({ email: 'Invalid email format', general: '' });
      setIsSubmitting(false);
      return;
    }

    // Check if this is a demo account
    if (ENABLE_DEMO_MODE && isDemoAccount(email)) {
      debugLog('Using demo mode for email:', email);
      router.push({
        pathname: '/password-reset/verify',
        query: { email }
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Skip email check for security - directly request password reset
      debugLog('Requesting password reset for:', email);
      
      const response = await apiService.auth.requestPasswordReset({ email });
      
      debugLog('Password reset request response:', response.data);
      
      // Check if user exists based on response
      if (response.data.success !== false || response.data.userExists !== false) {
        // User exists - no need to show security message, just redirect
        router.push({
          pathname: '/password-reset/verify',
          query: { email }
        });
      } else {
        // User doesn't exist - show security message but don't redirect
        setErrors({ email: '', general: 'If this email is registered, you will receive a verification code' });
        setTimeout(() => {
          setIsSubmitting(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      
      if (ENABLE_DEMO_MODE && IS_DEVELOPMENT) {
        debugLog('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        // In development mode, continue despite errors
        router.push({
          pathname: '/password-reset/verify',
          query: { email }
        });
      } else {
        setErrors({ email: '', general: 'Connection error. Please try again later.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear errors when user types
  useEffect(() => {
    if (errors.email && email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  }, [email]);

  return (
    <>
      <Head>
        <title>Reset Password - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="description" content="Reset your tenantli account password" />
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
        className="relative w-full min-h-screen mobile-full-height font-['Nunito'] overflow-hidden"
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
                  router.push('/login');
                }}
                aria-label="Go back"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 19L8 12L15 5" stroke="#2E3642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
                Password Reset
              </h1>
            </div>
          </div>
        </div>
        
        {/* Content Container */}
        <div className="w-full flex flex-col items-center px-[5%] pt-[85px]">
          {/* Title + Subtext */}
          <div className="w-full max-w-[350px] sm:max-w-[400px] lg:max-w-[420px] mb-8">
            <p className="font-bold text-[15px] leading-[22px] text-[#0B1420]">
              Enter the email linked to your account — we'll send you a reset link right away.
            </p>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="w-full max-w-[350px] sm:max-w-[400px] lg:max-w-[420px] bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 mb-4">
              {errors.general}
            </div>
          )}

          <form id="resetPasswordForm" onSubmit={handleSubmit} className="w-full max-w-[350px] sm:max-w-[400px] lg:max-w-[420px]">
            {/* Email Input */}
            <div className="mb-24">
              <div className={`relative w-full h-[56px] flex flex-row items-center px-[20px] py-[18px] gap-[8px] ${focusedField === 'email' ? 'bg-[#E8F5EB] border-[#55A363]' : errors.email ? 'bg-red-50 border-red-300' : 'bg-white border-[#D1E7D5]'} border rounded-[16px] transition-all duration-200`}>
                <SmsIcon />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Email"
                  className="flex-1 outline-none bg-transparent text-[#515964] font-bold text-[14px] leading-[19px]"
                />
                <InputError message={errors.email} />
              </div>
            </div>
          </form>
          
          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full max-w-[350px] sm:max-w-[400px] lg:max-w-[420px] h-14 flex justify-center items-center py-[18px] bg-[#1C2C40] hover:bg-[#2A3A4E] rounded-2xl absolute bottom-[40px] transition-colors duration-200"
          >
            <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
              {isSubmitting ? "Processing..." : "Send Code"}
            </span>
          </button>
        </div>
        
        {/* Home Indicator */}
        <div className="pb-[50px]"></div>
      </div>
    </>
  );
}