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

export default function EmailVerification() {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(180); // 3 minutes countdown
  const [verificationType, setVerificationType] = useState('registration'); // 'registration' or 'email-change'
  const [newEmail, setNewEmail] = useState(''); // For email change verification
  const router = useRouter();
  const { verifyEmail, resendVerificationCode } = useAuth();
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  
  // Get email and userId from query params
  useEffect(() => {
    if (router.isReady) {
      if (router.query.email) {
        setEmail(router.query.email);
      }
      
      if (router.query.userId) {
        setUserId(router.query.userId);
      }

      // Check if this is email change verification
      if (router.query.type === 'email-change') {
        setVerificationType('email-change');
        if (router.query.newEmail) {
          setNewEmail(router.query.newEmail);
          setEmail(router.query.newEmail); // Display the new email in UI
        }
      } else if (router.query.type === 'email-change-step1') {
        setVerificationType('email-change-step1');
        // For step 1, we're verifying current email
      }
    }
  }, [router.isReady, router.query]);

  // Theme setting for light mode
  useEffect(() => {
    // Ensure light mode is applied
    if (typeof window !== 'undefined') {
      // Reset dark mode if present
      document.documentElement.classList.remove('dark');
      // Store the light theme preference
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

  // Handle paste functionality
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    if (pastedData.length === 4 && /^\d{4}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setVerificationCode(digits);
      
      // Focus last input after paste
      inputRefs[3].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const code = verificationCode.join('');
    if (code.length !== 4) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('Submitting verification with:', { userId, code, verificationType });
      
      if (verificationType === 'email-change-step1') {
        // Step 1: Verify current email identity
        console.log('Verifying current email identity:', { userId, code });
        
        try {
          // Use direct API call for step 1 verification
          console.log('Calling direct API for step 1 verification:', { userId, code });
          
          const response = await apiService.auth.verifyEmail({ userId, code });
          console.log('Direct API result:', response);
          
          if (response.data && response.data.success) {
            console.log('Step 1 verification successful, redirecting to success page');
            // Step 1 successful, go to verification success page with email change flag
            router.push('/verification-success?type=email-change-step1');
          } else {
            console.log('Step 1 verification failed:', response.data);
            setError('Invalid verification code. Please try again.');
          }
        } catch (error) {
          console.error('Step 1 verification failed:', error);
          if (error.response && error.response.data) {
            console.log('Error response:', error.response.data);
            setError(error.response.data.message || 'Invalid verification code. Please try again.');
          } else {
            setError('Invalid verification code. Please try again.');
          }
        }
      } else if (verificationType === 'email-change') {
        // Step 2: Email change verification (final step)
        console.log('Sending email change verification:', { userId, code, newEmail });
        
        // Use apiService 
        const response = await apiService.auth.verifyEmailChange({
          userId,
          code,
          newEmail
        });
        
        const result = response.data;
        console.log('Email change verification response:', result);
        
        if (result.success) {
          localStorage.setItem('emailChangeSuccess', 'true');
          router.push('/verification-success?type=email-change');
        } else {
          console.error('Email change verification failed:', result);
          setError(result.message || 'Invalid verification code. Please try again.');
        }
      } else {
        // Regular registration verification
        const result = await verifyEmail(userId, code);
        
        console.log('Verification result:', result);
        
        if (result && result.success) {
          // Mark user as newly verified so they can be redirected to onboarding flow
          localStorage.setItem('newlyVerified', 'true');
          // If verification is successful, redirect to success page
          router.push('/verification-success');
        } else {
          // If verification fails, show error
          console.error('Verification failed:', result);
          setError('Invalid verification code. Please try again.');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Invalid verification code. Please try again.');
    } finally {
      // Stop loading state
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

  // Auto-submit disabled - user must click button
  // useEffect(() => {
  //   if (verificationCode.every(digit => digit !== '') && !isSubmitting) {
  //     handleSubmit();
  //   }
  // }, [verificationCode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Head>
        <title>Verify Your Email - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="description" content="Verify your email to access tenantli" />
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
              <Link href="/login" className="relative z-50 w-10 h-10 flex items-center justify-center -ml-2">
                <ArrowLeftIcon />
              </Link>
              <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
                Verify Email
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
              <p className="mb-1">Enter the 4-digit code we sent to:</p>
              <p className="font-semibold">{email}</p>
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
              {isSubmitting ? "Processing..." : "Confirm"}
            </span>
          </button>
        </div>
        
        {/* Bottom Spacing */}
        <div className="pb-[50px]"></div>
      </div>
    </>
  );
}
