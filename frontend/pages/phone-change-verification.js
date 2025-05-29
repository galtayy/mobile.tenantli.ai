import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { apiService } from '../lib/api';

// SVG ikonlar
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" stroke="#2E3642" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function PhoneChangeVerification() {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [phone, setPhone] = useState('');
  const [userId, setUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(180); // 3 minutes countdown
  const [verificationType, setVerificationType] = useState('phone-change-step1');
  const router = useRouter();
  const { resendVerificationCode } = useAuth();
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  
  // Get phone and userId from query params
  useEffect(() => {
    if (router.isReady) {
      if (router.query.phone) {
        setPhone(router.query.phone);
      }
      
      if (router.query.userId) {
        setUserId(router.query.userId);
      }

      // Check verification type
      if (router.query.type === 'phone-change-step1') {
        setVerificationType('phone-change-step1');
      }
    }
  }, [router.isReady, router.query]);

  // Theme setting for light mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);
  
  // Debugging code state
  useEffect(() => {
    console.log('Code updated:', verificationCode.join(''));
  }, [verificationCode]);
  
  // Countdown timer for resend code
  useEffect(() => {
    const timer = seconds > 0 && setInterval(() => setSeconds(seconds - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  // Handle input change and auto-focus next input
  const handleInputChange = (index, value) => {
    setError(''); // Clear error when user types
    
    if (value.length > 1) {
      value = value.substring(0, 1);
    }
    
    // Only accept numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const newVerificationCode = [...verificationCode];
    newVerificationCode[index] = value;
    setVerificationCode(newVerificationCode);

    // Auto focus next input
    if (value !== '' && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle backspace key
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && verificationCode[index] === '' && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.split('').slice(0, 4);
    
    if (pasteArray.every(char => /^\d+$/.test(char))) {
      const newCode = [...verificationCode];
      pasteArray.forEach((char, index) => {
        if (index < 4) {
          newCode[index] = char;
        }
      });
      setVerificationCode(newCode);
      
      // Focus on the next empty input or the last input
      const nextIndex = Math.min(pasteArray.length, 3);
      inputRefs[nextIndex].current.focus();
    }
  };

  // Submit verification code
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const code = verificationCode.join('');
    if (code.length !== 4) {
      setError('Please enter a 4-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('Phone change verification with:', { userId, code, verificationType });
      
      if (verificationType === 'phone-change-step1') {
        // Step 1: Verify identity via email
        const response = await apiService.auth.verifyEmail({ userId, code });
        
        if (response.data && response.data.success) {
          console.log('Step 1 verification successful, redirecting to new phone page');
          router.push('/profile/new-phone-number');
        } else {
          setError('Invalid verification code. Please try again.');
        }
      }
    } catch (error) {
      console.error('Phone change verification failed:', error);
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Invalid verification code. Please try again.');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    // Don't allow resending if countdown is active
    if (seconds > 0) return;
    
    try {
      if (!userId) {
        console.error('User ID is missing. Please try again or go back to login.');
        return;
      }
      
      // Call the resendVerificationCode API
      const result = await resendVerificationCode(userId);
      
      if (result.success) {
        // Clear the code fields
        setVerificationCode(['', '', '', '']);
        
        // Reset the countdown timer to 3 minutes
        setSeconds(180);
        
        // Focus on first input after clearing
        setTimeout(() => {
          if (inputRefs[0].current) inputRefs[0].current.focus();
        }, 100);
      } else {
        console.error(result.message || 'Failed to resend verification code. Please try again.');
      }
    } catch (error) {
      console.error('Error resending code:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Verify Phone Change - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="description" content="Verify your identity to change phone number" />
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
        `}</style>
      </Head>
      
      <div 
        className="relative min-h-screen w-full font-['Nunito']" 
        style={{ backgroundColor: '#FBF5DA' }}
      >
        {/* Header - Fixed positioning */}
        <div className="fixed top-0 left-0 right-0 bg-[#FBF5DA] z-20">
          <div className="w-full max-w-[390px] mx-auto">
            <div className="flex flex-row items-center px-[20px] h-[65px] gap-[10px]" style={{ paddingTop: 'env(safe-area-inset-top, 20px)' }}>
              <Link href="/profile/change-phone-number" className="relative z-50 w-10 h-10 flex items-center justify-center -ml-2">
                <ArrowLeftIcon />
              </Link>
              <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
                Verify Your Email
              </h1>
            </div>
          </div>
        </div>
        
        {/* Content Frame - Start after header */}
        <div className="flex flex-col items-center p-6 gap-6 pt-[85px]">
          {/* Email envelope image */}
          <div className="relative h-[180px] w-[180px] flex items-center justify-center">
            <div className="absolute w-[180px] h-[180px] bg-white rounded-full shadow-sm overflow-hidden">
              <img 
                src="/images/confirmmail.svg" 
                alt="Email verification" 
                className="absolute w[200px] h[100px] left[15px] top-[0px] transform rotate-[0deg]"
              />            
            </div>
          </div>
          
          {/* Text Frame */}
          <div className="flex flex-col items-center gap-3 max-w-[320px]">
            <h2 className="font-bold text-[18px] text-center text-[#0B1420] whitespace-nowrap">
              Let's confirm it's you
            </h2>
            <div className="font-semibold text-[13px] text-center text-[#515964]">
              <p className="mb-1">Enter the 4-digit code we sent to your email:</p>
              <p className="font-semibold">We're verifying your identity to change your phone number</p>
            </div>
          </div>
          
          {/* Verification code inputs */}
          <form id="verifyForm" onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col items-center w-full mt-4">
              <div className="flex flex-col items-center w-full">
                <div className="flex justify-center gap-4 w-full">
                  {[0, 1, 2, 3].map((index) => (
                    <div 
                      key={index} 
                      className={`box-border w-[60px] h-[56px] bg-white border rounded-[16px] relative transition-colors duration-200 ${
                        error ? 'border-red-300' : 'border-[#D1E7D5]'
                      }`}
                    >
                      <input
                        ref={inputRefs[index]}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={verificationCode[index]}
                        onChange={(e) => handleInputChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className={`w-full h-full text-center text-[24px] font-bold bg-transparent outline-none text-[#0B1420]`}
                        style={{
                          backgroundColor: 'transparent',
                          borderRadius: '16px',
                        }}
                        autoFocus={index === 0 && !verificationCode[0]}
                      />
                    </div>
                  ))}
                </div>
                {error && (
                  <div className="mt-4 w-full max-w-[300px] bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                )}
              </div>
            </div>
          </form>
          
          {/* Resend code text */}
          <button 
            onClick={resendCode}
            disabled={seconds > 0}
            className="w-full py-2 font-normal text-[14px] text-center text-[#1C2C40] mt-2"
          >
            Didn't get the code? <span className={`font-semibold ${seconds > 0 ? 'text-[#8A9099]' : 'text-[#4D935A]'}`}>
              {seconds > 0 ? `Resend in ${seconds}s` : 'Resend it'}
            </span>
          </button>
        </div>
        
        {/* Bottom section with confirm button */}
        <div className="w-full flex justify-center fixed bottom-8">
          <button
            type="submit"
            form="verifyForm"
            disabled={isSubmitting || verificationCode.some(digit => digit === '')}
            className="w-full max-w-[350px] h-[56px] flex justify-center items-center py-4 bg-[#1C2C40] rounded-[16px] disabled:opacity-50 mx-4"
          >
            <span className="font-bold text-[16px] text-[#D1E7E2]">
              {isSubmitting ? "Processing..." : "Verify & Continue"}
            </span>
          </button>
        </div>
        
        {/* Bottom Spacing */}
        <div className="pb-[50px]"></div>
      </div>
    </>
  );
}