import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingFlow() {
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
      const bgColors = {
        1: '#FBF5DA',
        2: '#D1E7D5',
        3: '#FBF5DA',
        4: '#D1E7D5',
        5: '#FBF5DA'
      };
      document.body.style.backgroundColor = bgColors[currentStep];
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.backgroundColor = '';
      }
    };
  }, [currentStep]);

  // Clear the newlyVerified flag when reaching the last onboarding step
  useEffect(() => {
    if (currentStep === 5 && typeof window !== 'undefined') {
      localStorage.removeItem('newlyVerified');
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < 5) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 50);
    } else {
      // Navigate to home after last step
      router.push('/');
    }
  };

  const getBackgroundColor = () => {
    const bgColors = {
      1: '#FBF5DA',
      2: '#D1E7D5',
      3: '#FBF5DA',
      4: '#D1E7D5',
      5: '#FBF5DA'
    };
    return bgColors[currentStep];
  };

  const getTitles = () => {
    const titles = {
      1: "Let's lock in your deposit",
      2: "The law's on your side",
      3: "Document before you decorate",
      4: "Tag what's already damaged",
      5: "We'll send your report to your landlord for you"
    };
    return titles[currentStep];
  };

  return (
    <>
      <Head>
        <style>{`
          body, html {
            background-color: ${getBackgroundColor()};
            min-height: 100vh;
            margin: 0;
            padding: 0;
            transition: background-color 600ms ease-out;
          }
        `}</style>
        <title>{getTitles()}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content={getBackgroundColor()} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="description" content="Get started with tenantli" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </Head>
      
      <div 
        className={`relative w-full min-h-screen font-['Nunito']`}
        style={{ 
          maxWidth: '390px', 
          margin: '0 auto',
          backgroundColor: getBackgroundColor(),
          transition: 'background-color 600ms ease-out'
        }}
      >
        {/* Content Container */}
        <div className="relative w-full h-screen overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 1 Content */}
            {currentStep === 1 && (
              <motion.div 
                key="step1"
                className="absolute inset-0"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.95 }}
                transition={{ 
                  duration: 0.5, 
                  ease: "easeInOut",
                  opacity: { delay: 0.1 }
                }}
              >
            {/* Status Bar Space */}
            <div className="h-10 w-full"></div>
            
            {/* Main illustration */}
            <motion.div 
              className="absolute top-[105px] left-0 right-0"
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut",
                delay: 0.2
              }}
            >
              <img 
                src="/images/onboarding1.png" 
                alt="Welcome" 
                className="w-full object-contain"
                style={{ maxHeight: '360px' }}
              />
            </motion.div>
            
            {/* Text content */}
            <motion.div 
              className="absolute w-[300px] flex flex-col items-center gap-2 top-[503px] left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            >
              <h2 className="font-bold text-[24px] leading-[120%] text-center text-[#0B1420] w-full">
                Let's lock in your deposit
              </h2>
              <p className="font-normal text-[14px] leading-[140%] text-center text-[#515964] w-full">
                Snap a few photos, tag any damage, and get a time-stamped report — all in 10 minutes
              </p>
            </motion.div>
            
            {/* Page indicators */}
            <div className="absolute flex flex-row items-center gap-1.5 w-[60px] left-1/2 transform -translate-x-1/2 top-[680px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1C2C40]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
            </div>
            
            {/* Let's Go button */}
            <div className="absolute w-[350px] h-[56px] left-1/2 transform -translate-x-1/2 bottom-[40px]">
              <button 
                onClick={handleNext}
                className="w-full h-full flex justify-center items-center bg-[#1C2C40] rounded-[16px] shadow-md transition-transform duration-150 active:scale-95"
              >
                <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
                  Let's Go
                </span>
              </button>
            </div>
              </motion.div>
            )}

          {/* Step 2 Content */}
          {currentStep === 2 && (
            <motion.div 
              key="step2"
              className="absolute inset-0"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.5, 
                ease: "easeInOut",
                opacity: { delay: 0.1 }
              }}
            >
            {/* Status Bar Space */}
            <div className="h-10 w-full"></div>
            
            {/* Main illustration */}
            <motion.div 
              className="absolute top-[105px] left-0 right-0"
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut",
                delay: 0.2
              }}
            >
              <img 
                src="/images/onboarding2.png" 
                alt="Legal Protection" 
                className="w-full object-contain"
                style={{ maxHeight: '360px' }}
              />
            </motion.div>
            
            {/* Text content */}
            <motion.div 
              className="absolute w-[300px] flex flex-col items-center gap-2 top-[503px] left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            >
              <h2 className="font-bold text-[24px] leading-[120%] text-center text-[#0B1420] w-full">
                The law's on your side
              </h2>
              <p className="font-normal text-[14px] leading-[140%] text-center text-[#515964] w-full">
                Landlords can't take money for cleaning or repainting. Only real damage.
              </p>
            </motion.div>
            
            {/* Page indicators */}
            <div className="absolute flex flex-row items-center gap-1.5 w-[60px] left-1/2 transform -translate-x-1/2 top-[680px]">
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#1C2C40]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
            </div>
            
            {/* Next button */}
            <div className="absolute w-[350px] h-[56px] left-1/2 transform -translate-x-1/2 bottom-[40px]">
              <button 
                onClick={handleNext}
                className="w-full h-full flex justify-center items-center bg-[#1C2C40] rounded-[16px] shadow-md transition-transform duration-150 active:scale-95"
              >
                <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
                  Next
                </span>
              </button>
            </div>
            </motion.div>
          )}

          {/* Step 3 Content */}
          {currentStep === 3 && (
            <motion.div 
              key="step3"
              className="absolute inset-0"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.5, 
                ease: "easeInOut",
                opacity: { delay: 0.1 }
              }}
            >
            {/* Status Bar Space */}
            <div className="h-10 w-full"></div>
            
            {/* Main illustration with embedded image */}
            <motion.div 
              className="absolute top-[105px] left-0 right-0"
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut",
                delay: 0.2
              }}
            >
              <div className="relative">
                <img 
                  src="/images/onboarding3.png" 
                  alt="Document Before Decoration" 
                  className="w-full object-contain"
                  style={{ maxHeight: '360px' }}
                />
                {/* Embedded smaller image */}
                <div className="absolute" style={{ 
                  top: '85px', 
                  left: '155px', 
                  width: '75px', 
                  height: '75px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}>
                  <img 
                    src="/images/onboarding2.png"
                    alt="Embedded Image"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Text content */}
            <motion.div 
              className="absolute w-[300px] flex flex-col items-center gap-2 top-[503px] left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            >
              <h2 className="font-bold text-[24px] leading-[120%] text-center text-[#0B1420] w-full">
                Document before you decorate.
              </h2>
              <p className="font-normal text-[14px] leading-[140%] text-center text-[#515964] w-full">
                Do your walkthrough before the couch moves in. It's the easiest way to protect your deposit.
              </p>
            </motion.div>
            
            {/* Page indicators */}
            <div className="absolute flex flex-row items-center gap-1.5 w-[60px] left-1/2 transform -translate-x-1/2 top-[680px]">
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#1C2C40]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
            </div>
            
            {/* Next button */}
            <div className="absolute w-[350px] h-[56px] left-1/2 transform -translate-x-1/2 bottom-[40px]">
              <button 
                onClick={handleNext}
                className="w-full h-full flex justify-center items-center bg-[#1C2C40] rounded-[16px] shadow-md transition-transform duration-150 active:scale-95"
              >
                <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
                  Next
                </span>
              </button>
            </div>
            </motion.div>
          )}

          {/* Step 4 Content */}
          {currentStep === 4 && (
            <motion.div 
              key="step4"
              className="absolute inset-0"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.5, 
                ease: "easeInOut",
                opacity: { delay: 0.1 }
              }}
            >
            {/* Status Bar Space */}
            <div className="h-10 w-full"></div>
            
            {/* Main illustration with tags */}
            <motion.div 
              className="absolute top-[190px] left-0 right-0 px-4"
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut",
                delay: 0.2
              }}
            >
              <div className="relative flex justify-end">
                {/* Main illustration - shifted to the right */}
                <div className="relative" style={{ maxWidth: '300px', transform: 'translateX(21px)' }}>
                  <img 
                    src="/images/onboarding4.png" 
                    alt="Tag Damaged Items" 
                    className="w-full object-contain"
                    style={{ maxHeight: '300px' }}
                  />
                  {/* "Damaged" tag */}
                  <div 
                    className="absolute top-[150px] left-[95px] flex justify-center items-center bg-[#2D4666] rounded-[24px] px-3 py-1"
                    style={{ width: '60px', height: '18px' }}
                  >
                    <span className="text-[11px] font-normal text-center text-[#FBF5DA]">Damaged</span>
                  </div>
                  
                  {/* "Broken" tag */}
                  <div 
                    className="absolute top-[40px] left-[0px] flex justify-center items-center bg-[#2D4666] rounded-[24px] px-3 py-1"
                    style={{ width: '50px', height: '18px' }}
                  >
                    <span className="text-[11px] font-normal text-center text-[#FBF5DA]">Broken</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Text content */}
            <motion.div 
              className="absolute w-[300px] flex flex-col items-center gap-2 top-[503px] left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            >
              <h2 className="font-bold text-[24px] leading-[120%] text-center text-[#0B1420] w-full">
                Tag what's already damaged
              </h2>
              <p className="font-normal text-[14px] leading-[140%] text-center text-[#515964] w-full">
                In 10 minutes, you'll have time stamped proof of every scratch, scuff, and stain before it's pinned on you.
              </p>
            </motion.div>
            
            {/* Page indicators */}
            <div className="absolute flex flex-row items-center gap-1.5 w-[60px] left-1/2 transform -translate-x-1/2 top-[680px]">
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#1C2C40]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
            </div>
            
            {/* Next button */}
            <div className="absolute w-[350px] h-[56px] left-1/2 transform -translate-x-1/2 bottom-[40px]">
              <button 
                onClick={handleNext}
                className="w-full h-full flex justify-center items-center bg-[#1C2C40] rounded-[16px] shadow-md transition-transform duration-150 active:scale-95"
              >
                <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
                  Next
                </span>
              </button>
            </div>
            </motion.div>
          )}

          {/* Step 5 Content */}
          {currentStep === 5 && (
            <motion.div 
              key="step5"
              className="absolute inset-0"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.5, 
                ease: "easeInOut",
                opacity: { delay: 0.1 }
              }}
            >
            {/* Status Bar Space */}
            <div className="h-10 w-full"></div>
            
            {/* Main illustration */}
            <motion.div 
              className="absolute top-[105px] left-0 right-0 px-4"
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut",
                delay: 0.2
              }}
            >
              <div className="relative">
                <img 
                  src="/images/onboarding5.png" 
                  alt="Report Illustration" 
                  className="w-full object-contain"
                  style={{ maxHeight: '360px' }}
                />
              </div>
            </motion.div>
            
            {/* Text content */}
            <motion.div 
              className="absolute w-[300px] flex flex-col items-center gap-2 top-[503px] left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            >
              <h2 className="font-bold text-[24px] leading-[120%] text-center text-[#0B1420] w-full">
                We'll send your report to your landlord for you
              </h2>
              <p className="font-normal text-[14px] leading-[140%] text-center text-[#515964] w-full">
                We'll create a clean, time-stamped summary and send it for you, so you don't have to.
              </p>
            </motion.div>
            
            {/* Page indicators */}
            <div className="absolute flex flex-row items-center gap-1.5 w-[60px] left-1/2 transform -translate-x-1/2 top-[680px]">
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#1C2C40]"></div>
            </div>
            
            {/* Start button */}
            <div className="absolute w-[350px] h-[56px] left-1/2 transform -translate-x-1/2 bottom-[40px]">
              <button 
                onClick={handleNext}
                className="w-full h-full flex justify-center items-center bg-[#1C2C40] rounded-[16px] shadow-md transition-transform duration-150 active:scale-95"
              >
                <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
                  Start
                </span>
              </button>
            </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
        
      </div>
      
      <style jsx>{`
        .duration-600 {
          transition-duration: 600ms;
        }
      `}</style>
    </>
  );
}