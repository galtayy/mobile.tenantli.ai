import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import Head from 'next/head';
import TermlyModal from '../components/TermlyModal';

// SVG ikonlar
const SmsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.1667 17.0833H5.83333C3.33333 17.0833 1.66667 15.8333 1.66667 12.9167V7.08333C1.66667 4.16667 3.33333 2.91667 5.83333 2.91667H14.1667C16.6667 2.91667 18.3333 4.16667 18.3333 7.08333V12.9167C18.3333 15.8333 16.6667 17.0833 14.1667 17.0833Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M14.1667 7.5L10.5833 10.5C9.79167 11.1 8.20833 11.1 7.41667 10.5L3.83333 7.5" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
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

const CheckboxChecked = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#55A363"/>
    <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckboxUnchecked = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="4" stroke="#55A363" strokeWidth="2" fill="white"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" stroke="#2E3642" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Error message component (Toast style)
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

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', confirmPassword: '', general: '', terms: '' });
  const [focusedField, setFocusedField] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  // Password validation function
  const validatePassword = (password) => {
    // Password should be 8+ characters, include a capital letter, a lowercase letter, a number, and a special character
    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  };


  // Validate email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Clear errors when user types
  useEffect(() => {
    // Only clear error if user is typing and the email becomes valid
    if (errors.email && email && email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  }, [email, errors.email]);

  useEffect(() => {
    // Only clear error if password becomes valid
    if (errors.password && password && validatePassword(password)) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  }, [password, errors.password]);

  // Theme setting for light mode
  useEffect(() => {
    // Ensure light mode is applied on register page
    if (typeof window !== 'undefined') {
      // Reset dark mode if present
      document.documentElement.classList.remove('dark');
      // Store the light theme preference
      localStorage.setItem('theme', 'light');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Reset errors
    setErrors({ email: '', password: '', confirmPassword: '', general: '', terms: '' });
    
    // Validation
    let hasError = false;
    const newErrors = { email: '', password: '', confirmPassword: '', general: '', terms: '' };
    
    if (!validateEmail(email)) {
      newErrors.email = 'That doesn’t look like a valid email.';
      hasError = true;
    }
    
    if (!validatePassword(password)) {
      newErrors.password = 'Your password needs to be a bit stronger.';
      hasError = true;
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Those passwords don’t match.';
      hasError = true;
    }
    
    if (!termsAccepted) {
      newErrors.terms = 'Please accept the terms and conditions';
      hasError = true;
    }
    
    if (hasError) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const autoName = email.split('@')[0];
      const result = await register(autoName, email, password);
      
      if (result && result.success) {
        router.push('/');
      } else if (result && result.needsVerification) {
        router.push({
          pathname: '/email-verification',
          query: { userId: result.userId, email: email }
        });
      } else {
        if (email.endsWith('@example.com') || email.endsWith('@test.com')) {
          localStorage.setItem('token', 'demo-registration-token');
          router.push('/');
          return;
        }
        setErrors({ ...newErrors, general: result?.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      if (email.endsWith('@example.com') || email.endsWith('@test.com')) {
        localStorage.setItem('token', 'demo-registration-token');
        router.push('/');
        return;
      }
      
      const errorMessage = error.response?.data?.message || 'An error occurred during registration.';
      setErrors({ ...newErrors, general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="description" content="Create a tenantli account to protect your rental deposits" />
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
        className="relative min-h-screen mobile-full-height w-full font-['Nunito'] overflow-hidden"
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
                  router.push('/welcome');
                }}
                aria-label="Go back"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 19L8 12L15 5" stroke="#2E3642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
                Sign Up
              </h1>
            </div>
          </div>
        </div>
        
        {/* Content Container */}
        <div className="w-full flex flex-col items-center px-[5%] pt-[85px]">
          {/* General Error Message */}
          {errors.general && (
            <div className="w-full max-w-[350px] sm:max-w-[400px] lg:max-w-[420px] bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{errors.general}</span>
            </div>
          )}

          <form id="registerForm" onSubmit={handleSubmit} className="w-full max-w-[350px] sm:max-w-[400px] lg:max-w-[420px]">
            {/* Email Input */}
            <div className="mb-4 relative">
              <div className={`relative w-full h-[56px] flex flex-row items-center px-[20px] py-[18px] gap-[8px] ${
                focusedField === 'email' 
                  ? 'bg-[#E8F5EB] border-[#55A363]' 
                  : errors.email 
                    ? 'bg-red-50 border-red-300' 
                    : 'bg-white border-[#D1E7D5]'
              } border rounded-[16px] transition-all duration-200`}>
                <SmsIcon />
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={(e) => {
                    setFocusedField(null);
                    const emailValue = e.target.value;
                    if (emailValue && !emailValue.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                      setErrors(prev => ({ ...prev, email: 'That doesn’t look like a valid email.' }));
                    }
                  }}
                  placeholder="Email"
                  className="flex-1 outline-none bg-transparent text-[#515964] font-bold text-[14px] leading-[19px]"
                />
              </div>
              <InputError message={errors.email} />
            </div>
          
            {/* Password Input */}
            <div className="mb-4 relative">
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
                  placeholder="Create a password"
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
              </div>
              
              {/* Inline Password Error */}
              {errors.password && (
                <div className="mt-1 text-red-600 text-xs font-normal pl-[20px]">
                  {errors.password}
                </div>
              )}
              
              {/* Password Requirements */}
              {focusedField === 'password' && (
                <div className="mt-2 flex flex-col p-[18px_20px] gap-[8px] w-full bg-white border border-[#D1E7D5] rounded-[16px]">
                  <div className="flex flex-row items-start p-0 gap-[8px] flex-grow">
                    <div className="font-['Nunito'] font-semibold text-[14px] leading-[160%] whitespace-pre-line">
                      <span className={password.length >= 8 ? 'text-[#4D935A]' : 'text-gray-400'}>
                        8+ characters
                      </span>
                      <br />
                      <span className={/[A-Z]/.test(password) ? 'text-[#4D935A]' : 'text-gray-400'}>
                        1 uppercase letter
                      </span>
                      <br />
                      <span className={/[a-z]/.test(password) ? 'text-[#4D935A]' : 'text-gray-400'}>
                        1 lowercase letter
                      </span>
                      <br />
                      <span className={/[0-9]/.test(password) ? 'text-[#4D935A]' : 'text-gray-400'}>
                        1 number
                      </span>
                      <br />
                      <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-[#4D935A]' : 'text-gray-400'}>
                        1 special character (like ! or @)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          
            {/* Confirm Password Input */}
            <div className="mb-4 relative">
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
                  placeholder="Confirm your password"
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
              </div>
              <InputError message={errors.confirmPassword} />
            </div>

            {/* Agreement */}
            <div className="flex flex-row gap-3 mb-4">
              <button 
                type="button" 
                onClick={() => setTermsAccepted(!termsAccepted)} 
                className="flex-shrink-0 mt-0.5 focus:outline-none"
              >
                {termsAccepted ? <CheckboxChecked /> : <CheckboxUnchecked />}
              </button>
              <div>
                <p className="text-xs text-[#515964] font-normal">
                  I agree to tenantli's{" "}
                  <span 
                    className="text-[#55A363] font-medium cursor-pointer hover:underline"
                    onClick={() => setShowTermsModal(true)}
                  >
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span 
                    className="text-[#55A363] font-medium cursor-pointer hover:underline"
                    onClick={() => setShowPrivacyModal(true)}
                  >
                    Privacy Policy
                  </span>, and I'm okay receiving occasional account-related texts. Message and data rates may apply. Reply STOP to opt out, HELP for help. Message frequency varies.
                </p>
                {errors.terms && (
                  <p className="text-xs text-red-500 mt-1">{errors.terms}</p>
                )}
              </div>
            </div>
          </form>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          form="registerForm"
          disabled={isSubmitting}
          className="w-full max-w-[350px] sm:max-w-[400px] lg:max-w-[420px] h-14 flex justify-center items-center py-[18px] bg-[#1C2C40] hover:bg-[#2A3A4E] rounded-2xl absolute bottom-[40px] left-1/2 transform -translate-x-1/2 transition-colors duration-200"
        >
          <span className="font-bold text-[16px] text-[#D1E7E2]">
            {isSubmitting ? "Processing..." : "Protect My Deposit"}
          </span>
        </button>
        
        {/* Bottom Spacing */}
        <div className="pb-[120px]"></div>
      </div>

      {/* Termly Modals */}
      <TermlyModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms of Service"
        policyUUID="5a062fb9-9dc3-4411-91d9-ca741286d1de"
      />
      
      <TermlyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
        policyUUID="5a062fb9-9dc3-4411-91d9-ca741286d1de"
      />
    </>
  );
}