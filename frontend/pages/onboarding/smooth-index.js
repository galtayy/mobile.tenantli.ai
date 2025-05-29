import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

// SVG icons
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="20" rx="10" fill="#55A363"/>
    <path d="M14 7L8.5 12.5L6 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function SmoothOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Theme setting for light mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  // Set background color using useEffect
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const bgColor = currentStep === 1 ? '#FBF5DA' : '#D1E7D5';
      document.body.style.backgroundColor = bgColor;
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.backgroundColor = '';
      }
    };
  }, [currentStep]);

  const handleLetsGo = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(2);
      setIsAnimating(false);
    }, 300);
  };

  const handleNextStep = () => {
    // Continue to step3
    router.push('/onboarding/step3');
  };

  return (
    <>
      <Head>
        <style>{`
          body, html {
            background-color: ${currentStep === 1 ? '#FBF5DA' : '#D1E7D5'};
            min-height: 100vh;
            margin: 0;
            padding: 0;
            transition: background-color 600ms ease-out;
          }
        `}</style>
        <title>{currentStep === 1 ? "Already a renter?" : "The Law's On Your Side"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content={currentStep === 1 ? "#FBF5DA" : "#D1E7D5"} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="description" content="Get started with tenantli" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </Head>
      
      <div 
        className={`relative w-full min-h-screen font-['Nunito'] transition-colors duration-600`}
        style={{ 
          maxWidth: '390px', 
          margin: '0 auto',
          backgroundColor: currentStep === 1 ? '#FBF5DA' : '#D1E7D5'
        }}
      >
        {/* Content Container */}
        <div className="relative w-full h-screen overflow-hidden">
          {/* Step 1 Content */}
          <div 
            className={`absolute inset-0 transition-transform duration-600 ease-out ${
              currentStep === 1 ? 'translate-x-0' : '-translate-x-full'
            } ${isAnimating ? 'transitioning' : ''}`}
          >
            {/* Status Bar Space */}
            <div className="h-10 w-full"></div>
            
            {/* Header */}
            <div className="w-full flex items-center justify-center px-4 h-[65px]">
              <h1 className="font-semibold text-[18px] leading-[140%] text-center text-[#0B1420]">
                Getting Started
              </h1>
            </div>
            
            {/* Main illustration */}
            <div className="absolute top-[105px] left-0 right-0">
              <img 
                src="/images/onboarding1.png" 
                alt="Onboarding" 
                className="w-full object-contain"
                style={{ maxHeight: '360px' }}
              />
            </div>
            
            {/* Text content */}
            <div className="absolute w-[300px] flex flex-col items-center gap-2 top-[497px] left-1/2 transform -translate-x-1/2">
              <h2 className="font-bold text-[24px] leading-[120%] text-center text-[#0B1420] w-full">
                Already a renter?
              </h2>
              <p className="font-normal text-[14px] leading-[140%] text-center text-[#515964] w-full">
                Understand how to protect your deposit and make sure you don't lose unnecessary money.
              </p>
            </div>
            
            {/* tenantli logo */}
            <div className="absolute w-[156px] h-[24px] left-1/2 transform -translate-x-1/2 top-[625px]">
              <span className="font-bold text-[16px] leading-[24px] text-[#0B1420]">
                tenantli
              </span>
            </div>
            
            {/* Page indicators */}
            <div className="absolute flex flex-row items-center gap-1.5 w-[60px] left-1/2 transform -translate-x-1/2 bottom-[120px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1C2C40]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
            </div>
            
            {/* Let's Go button */}
            <div className="absolute w-[350px] h-[56px] left-1/2 transform -translate-x-1/2 bottom-[40px]">
              <button 
                onClick={handleLetsGo}
                className="w-full h-full flex justify-center items-center bg-[#1C2C40] rounded-[16px] shadow-md transition-all duration-300 hover:bg-[#0F1B2E] active:scale-95"
              >
                <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
                  Let's Go
                </span>
              </button>
            </div>
          </div>

          {/* Step 2 Content */}
          <div 
            className={`absolute inset-0 transition-transform duration-600 ease-out ${
              currentStep === 2 ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Status Bar Space */}
            <div className="h-10 w-full"></div>
            
            {/* Main illustration */}
            <div className="absolute top-[105px] left-0 right-0">
              <img 
                src="/images/onboarding2.png" 
                alt="Legal Protection" 
                className="w-full object-contain"
                style={{ maxHeight: '360px' }}
              />
            </div>
            
            {/* Text content */}
            <div className="absolute w-[300px] flex flex-col items-center gap-2 top-[503px] left-1/2 transform -translate-x-1/2">
              <h2 className="font-bold text-[24px] leading-[120%] text-center text-[#0B1420] w-full">
                The law's on your side
              </h2>
              <p className="font-normal text-[14px] leading-[140%] text-center text-[#515964] w-full">
                Landlords can't take money for cleaning or repainting. Only real damage.
              </p>
            </div>
            
            {/* Page indicators */}
            <div className="absolute flex flex-row items-center gap-1.5 w-[60px] left-1/2 transform -translate-x-1/2 bottom-[120px]">
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#1C2C40]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
            </div>
            
            {/* Next button */}
            <div className="absolute w-[350px] h-[56px] left-1/2 transform -translate-x-1/2 bottom-[40px]">
              <button 
                onClick={handleNextStep}
                className="w-full h-full flex justify-center items-center bg-[#1C2C40] rounded-[16px] shadow-md transition-all duration-300 hover:bg-[#0F1B2E] active:scale-95"
              >
                <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
                  Next
                </span>
              </button>
            </div>
          </div>
        </div>
        
      </div>
      
      <style jsx>{`
        .transitioning {
          will-change: transform;
        }
      `}</style>
    </>
  );
}