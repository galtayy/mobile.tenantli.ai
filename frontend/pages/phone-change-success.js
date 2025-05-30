import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function PhoneChangeSuccess() {
  const router = useRouter();
  

  // Theme setting for light mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);


  const handleGoToProfile = () => {
    router.push('/profile');
  };

  return (
    <>
      <Head>
        <title>Phone Number Updated Successfully</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <style>{`
          body, html {
            background-color: #FBF5DA;
            min-height: 100vh;
            margin: 0;
            padding: 0;
          }
          /* Hide toast notifications on this page */
          .Toastify__toast-container {
            display: none !important;
          }
        `}</style>
      </Head>
      
      
      <div 
        className="flex flex-col items-center w-full min-h-screen font-['Nunito'] bg-[#FBF5DA]"
      >
        {/* Status Bar Space */}
        <div className="h-10 w-full"></div>
        
        {/* Header */}
        <div className="w-full h-[65px] flex justify-center items-center">
          <h1 className="font-semibold text-[18px] leading-[140%] text-center text-[#0B1420]">
           
          </h1>
        </div>
        
        {/* Content Container */}
        <div className="flex flex-col items-center justify-between flex-grow max-w-[390px] w-full px-5">
          {/* Success image */}
          <div className="w-[180px] h-[180px] mt-10 relative">
            <div className="absolute inset-0 bg-white rounded-full shadow-sm"></div>
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative" style={{ transform: 'scale(1) translateX(6px)' }}>
                  <img 
                    src="/images/done.svg" 
                    alt="Success" 
                    className="w-[190px] h-[190px]"
                    style={{ 
                      objectFit: 'contain',
                      objectPosition: '40% center',
                    }}
                    onError={(e) => {
                      // Fallback if image doesn't load
                      e.target.style.display = 'none';
                      document.getElementById('success-fallback').style.display = 'flex';
                    }}
                  />
                </div>
              </div>
              <div id="success-fallback" className="absolute inset-0 flex items-center justify-center bg-[#F1F8F2]" style={{display: 'none'}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color: '#55A363'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Text content */}
          <div className="flex flex-col items-center gap-2 mt-10 max-w-[296px]">
            <h2 className="font-bold text-[18px] leading-[25px] text-center text-[#0B1420]">
              Phone Number Updated!
            </h2>
            <p className="font-semibold text-[14px] leading-[19px] text-center text-[#515964]">
              We have changed your phone number successfully.
            </p>
          </div>
          
          {/* Spacer */}
          <div className="flex-grow"></div>
          
          {/* Spacer for button positioning */}
          <div className="h-20"></div>
        </div>
        
        {/* Continue button - positioned near bottom */}
        <div className="w-full flex justify-center px-5 fixed bottom-8 z-10 pb-safe">
          <button 
            onClick={handleGoToProfile}
            className="w-full max-w-[350px] h-[56px] flex justify-center items-center bg-[#1C2C40] rounded-[16px] shadow-md"
          >
            <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
              Done
            </span>
          </button>
        </div>
        
        {/* Extra bottom spacing to compensate for fixed button */}
        <div className="h-32"></div>
        
      </div>
    </>
  );
}