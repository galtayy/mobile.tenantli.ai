import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../lib/auth';
import { apiService } from '../../lib/api';
import { toast } from 'react-toastify';

// SVG icons
const PasswordChangeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 8.33333V6.66667C5 3.90833 5.83333 1.66667 10 1.66667C14.1667 1.66667 15 3.90833 15 6.66667V8.33333" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 15.4167C10.9205 15.4167 11.6667 14.6705 11.6667 13.75C11.6667 12.8295 10.9205 12.0833 10 12.0833C9.07953 12.0833 8.33333 12.8295 8.33333 13.75C8.33333 14.6705 9.07953 15.4167 10 15.4167Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.1667 18.3333H5.83333C2.5 18.3333 1.66667 17.5 1.66667 14.1667V12.5C1.66667 9.16667 2.5 8.33333 5.83333 8.33333H14.1667C17.5 8.33333 18.3333 9.16667 18.3333 12.5V14.1667C18.3333 17.5 17.5 18.3333 14.1667 18.3333Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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

export default function ChangePassword() {
  const { user, loading: authLoading } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
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

  // Password validation - match register page requirements
  const validatePassword = (password) => {
    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return {
      isValid: hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecial,
      hasLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear all errors
    setErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
    let hasError = false;
    const newErrors = { currentPassword: '', newPassword: '', confirmPassword: '' };
    
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      hasError = true;
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
      hasError = true;
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
      hasError = true;
    } else {
      const validation = validatePassword(newPassword);
      if (!validation.isValid) {
        newErrors.newPassword = 'Your password needs to be a bit stronger.';
        hasError = true;
      }
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Those passwords don’t match.';
      hasError = true;
    }
    
    if (hasError) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Sending password change request...');
      const response = await apiService.user.changePassword({
        currentPassword,
        newPassword
      });
      console.log('Password change response:', response.data);
      
      router.push('/'); // Redirect to dashboard immediately
    } catch (error) {
      console.error('Password change error:', error);
      
      if (error.response && error.response.data) {
        const message = error.response.data.message || '';
        
        // Check for same password error first
        if (message.toLowerCase().includes('cannot be the same as current password') ||
            message.toLowerCase().includes('same as current') ||
            message.toLowerCase().includes('cannot be the same')) {
          setErrors({ ...errors, newPassword: 'New password must be different from current password' });
          // No toast for this error - only show under input
        }
        // Check for current password error
        else if (message.toLowerCase().includes('current password') || 
                 message.toLowerCase().includes('incorrect')) {
          setErrors({ ...errors, currentPassword: 'Incorrect password' });
          // No toast for this error - only show under input
        } 
        // For any other API errors, show as toast
        else {
          toast.error(message || 'Failed to change password');
        }
      } else {
        // Network or other errors
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page if user is not logged in
    router.push('/login');
    return null;
  }

  const passwordValidation = validatePassword(newPassword);
  const allRequirementsMet = passwordValidation.isValid;
  const passwordsMatch = newPassword === confirmPassword && newPassword !== '';

  return (
    <>
      <Head>
        <title>Change Password - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="description" content="Change your tenantli account password" />
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
          .safe-area-top {
            padding-top: env(safe-area-inset-top, 20px);
          }
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom, 20px);
          }
        `}</style>
      </Head>
      
      <div 
        className="h-screen font-['Nunito'] relative w-full bg-[#FBF5DA] flex flex-col overflow-hidden" 
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
                  router.back();
                }}
                aria-label="Go back"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 19L8 12L15 5" stroke="#2E3642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
                Change Your Password
              </h1>
            </div>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="w-full flex-1 overflow-hidden mt-[85px]">
          <form id="changePasswordForm" className="px-5" onSubmit={handleSubmit}>
          
          {/* Current Password Input */}
          <div className={`flex flex-row items-center px-5 py-[18px] gap-2 bg-white border ${
            errors.currentPassword ? 'border-[#E95858]' : 'border-[#D1E7D5]'
          } rounded-2xl h-14 mt-6`}>
            <PasswordChangeIcon />
            <input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (errors.currentPassword) {
                  setErrors({ ...errors, currentPassword: '' });
                }
              }}
              placeholder="Current password"
              className="flex-1 outline-none bg-transparent text-[#515964] font-bold text-sm"
            />
            <button 
              type="button" 
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="text-gray-500"
            >
              {showCurrentPassword ? <EyeIcon /> : <EyeSlashIcon />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-[#E95858] text-sm mt-1 ml-2">{errors.currentPassword}</p>
          )}
          
          {/* New Password Input */}
          <div className={`flex flex-row items-center px-5 py-[18px] gap-2 bg-white border ${
            errors.newPassword 
              ? 'border-[#E95858]' 
              : !newPassword 
                ? 'border-[#D1E7D5]' 
                : !passwordValidation.isValid
                  ? 'border-[#E95858]' 
                  : 'border-[#55A363]'
          } rounded-2xl h-14 mt-4`}>
            <KeyIcon />
            <input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) {
                  setErrors({ ...errors, newPassword: '' });
                }
              }}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              placeholder="Create a new password"
              className={`flex-1 outline-none bg-transparent ${
                !newPassword 
                  ? 'text-[#515964]' 
                  : !passwordValidation.isValid
                    ? 'text-[#E95858]' 
                    : 'text-[#55A363]'
              } font-bold text-sm`}
              minLength={8}
            />
            <button 
              type="button" 
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="text-gray-500"
            >
              {showNewPassword ? <EyeIcon /> : <EyeSlashIcon />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-[#E95858] text-sm mt-1 ml-2">{errors.newPassword}</p>
          )}
          
          {/* Confirm Password Input */}
          <div className={`flex flex-row items-center px-5 py-[18px] gap-2 bg-white border ${
            errors.confirmPassword 
              ? 'border-[#E95858]' 
              : !confirmPassword 
                ? 'border-[#D1E7D5]' 
                : !passwordsMatch
                  ? 'border-[#E95858]' 
                  : 'border-[#55A363]'
          } rounded-2xl h-14 mt-4`}>
            <KeyIcon />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: '' });
                }
              }}
              placeholder="Confirm new password"
              className={`flex-1 outline-none bg-transparent ${
                !confirmPassword
                  ? 'text-[#515964]' 
                  : !passwordsMatch
                    ? 'text-[#E95858]' 
                    : 'text-[#55A363]'
              } font-bold text-sm`}
              minLength={8}
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-500"
            >
              {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[#E95858] text-sm mt-1 ml-2">{errors.confirmPassword}</p>
          )}
          
          {/* Password Requirements - match register page */}
          {focusedField === 'password' && (
            <div className="mt-2 flex flex-col p-[18px_20px] gap-[8px] w-full bg-white border border-[#D1E7D5] rounded-[16px]">
              <div className="flex flex-row items-start p-0 gap-[8px] flex-grow">
                <div className="font-['Nunito'] font-semibold text-[14px] leading-[160%] whitespace-pre-line">
                  <span className={newPassword.length >= 8 ? 'text-[#4D935A]' : 'text-gray-400'}>
                    8+ characters
                  </span>
                  <br />
                  <span className={/[A-Z]/.test(newPassword) ? 'text-[#4D935A]' : 'text-gray-400'}>
                    1 uppercase letter
                  </span>
                  <br />
                  <span className={/[a-z]/.test(newPassword) ? 'text-[#4D935A]' : 'text-gray-400'}>
                    1 lowercase letter
                  </span>
                  <br />
                  <span className={/[0-9]/.test(newPassword) ? 'text-[#4D935A]' : 'text-gray-400'}>
                    1 number
                  </span>
                  <br />
                  <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? 'text-[#4D935A]' : 'text-gray-400'}>
                    1 special character (like ! or @)
                  </span>
                </div>
              </div>
            </div>
          )}
          
          </form>
        </div>
        
        {/* Fixed Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#FBF5DA] w-full">
          <div className="px-5 pt-5 pb-5 safe-area-bottom">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !currentPassword || !allRequirementsMet || !passwordsMatch}
              className={`w-full h-14 flex justify-center items-center py-[18px] rounded-2xl ${
                currentPassword && allRequirementsMet && passwordsMatch
                  ? 'bg-[#1C2C40] cursor-pointer'
                  : 'bg-[#8A9099] cursor-not-allowed'
              }`}
            >
              <span className="font-bold text-[16px] text-[#D1E7E2]">
                {isSubmitting ? "Changing..." : "Change Password"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}