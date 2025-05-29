import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion, AnimatePresence, animate } from 'framer-motion';
import clsx from 'clsx';


export default function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const [transitionBg, setTransitionBg] = useState(null);

  useEffect(() => {
    if (currentStep === 1) return; // Step 1'de geçiş yok

    const color = currentStep % 2 === 0 ? '#D1E7D5' : '#FBF5DA';
    const id = `bg-${currentStep}`;

    setTransitionBg({ id, color });

    if (currentStep !== 2) {

      const timer = setTimeout(() => {
        setTransitionBg(null); // Animasyon bitince kaldır
      }, 600);

      return () => clearTimeout(timer);
    }

  }, [currentStep]);


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
      setCurrentStep(currentStep + 1);
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
  const StepContent = ({ step }) => {
    const [play, setPlay] = useState(false)

    useEffect(() => {
      if (step === 2) {
        setPlay(false)                // önce kesinlikle kapat
        // bir sonraki repaint’te aç
        const id = window.requestAnimationFrame(() => {
          setPlay(true)
        })
        return () => window.cancelAnimationFrame(id)
      }
    }, [step])
    return (
      <section
        id="scene"
        className={clsx('relative w-screen h-[50vh] max-w-[430px] mx-auto overflow-hidden transition-colors duration-1000')}
      >
        {/* line */}
        <div className={clsx('absolute w-[93vw] h-[0.2vw] bg-gray-400 bottom-[13vw]')} />
        {/* paint 1 */}
        <div className={clsx('absolute w-[18vw] h-[18vw] bg-[url("/onboarding/small_painting.png")] bg-contain bg-no-repeat bg-center transition-transform duration-1000 ease-[cubic-bezier(0.35,0.84,0.33,1)] left-[6vw] top-[12vw] origin-[100%_0%]', play && 'rotate-[-20deg]')} />
        {/* paint 2 */}
        <div className={clsx('absolute w-[18vw] h-[18vw] bg-[url("/onboarding/small_painting.png")] bg-contain bg-no-repeat bg-center transition-transform duration-1000 ease-[cubic-bezier(0.35,0.84,0.33,1)] left-[6vw] top-[34vw] origin-[0%_50%]', play && 'rotate-[30deg]')} />
        {/* big painting */}
        <div className={clsx('absolute w-[32vw] h-[24vw] bg-[url("/onboarding/big_painting.png")] bg-contain bg-no-repeat bg-center left-[55vw] top-[10vw] origin-[100%_0%] transition-transform duration-1000 ease-[cubic-bezier(0.35,0.84,0.33,1)]', play && 'rotate-[-30deg]')} />
        {/* lamb */}
        <div className={clsx('absolute w-[32vw] h-[42vw] bg-[url("/onboarding/lamb.png")] bg-contain bg-no-repeat bg-center left-[23.4vw] top-[17.5vw] origin-[50%_57%] z-[1] transition-transform duration-1000 ease-[cubic-bezier(0.35,0.84,0.33,1)]', play && 'rotate-[45deg]')} />
        <div className="absolute w-[14vw] h-[64vw] bg-[url('/onboarding/lamb_stand.png')] bg-contain bg-no-repeat bg-center left-[32vw] bottom-[13vw]" />
        {/* seats */}
        <div className={clsx('absolute w-[55vw] h-[48vw] bg-[url("/onboarding/seat_left.png")] bg-contain bg-no-repeat bg-center right-[10vw] bottom-[26vw] z-[2] transition-transform duration-1000 ease-[cubic-bezier(0.35,0.84,0.33,1)]', play && 'rotate-[-8deg]')} />
        <div className="absolute w-[47vw] h-[62vw] bg-[url('/onboarding/seat_right.png')] bg-contain bg-no-repeat bg-center right-[6vw] bottom-[13vw] origin-[50%_90%] z-[2]" />
        <div className="absolute w-[35vw] h-[20vw] bg-[url('/onboarding/vase.png')] bg-contain bg-no-repeat bg-center left-[0vw] bottom-[13vw] z-[1]" />
        {/* leaves */}
        <div className={clsx('absolute w-[0.1vw] h-[12vw] bg-[#25414e] left-[14vw] bottom-[30vw] origin-bottom transition-transform duration-1000 ease-in-out', play && 'rotate-[-20deg]')} />
        <div className={clsx('absolute w-[0.1vw] h-[12vw] bg-[#25414e] left-[21vw] bottom-[26vw] origin-bottom transition-transform duration-1000 ease-in-out', play && 'rotate-[20deg]')} />
        <div className="absolute w-[0.1vw] h-[12vw] bg-[#25414e] left-[14vw] bottom-[21vw] origin-bottom transition-transform duration-1000 ease-in-out" />
        <div className={clsx('absolute w-[18vw] h-[18vw] bg-[url("/onboarding/leaf_2.png")] bg-contain bg-no-repeat bg-center left-[4vw] bottom-[32vw] rotate-[20deg] scale-[1.2] z-[2] transition-transform duration-1000 ease-in-out', play && 'translate-x-[5vw] translate-y-[19vw] rotate-[75deg]')} />
         { <div className={clsx('absolute w-[12vw] h-[12vw] bg-[url("/onboarding/leaf_1.png")] bg-contain bg-no-repeat bg-center left-[17vw] bottom-[30vw] rotate-[-30deg] scale-[1.2] z-[2] transition-transform duration-1000 ease-in-out', play && 'translate-x-[-10vw] translate-y-[17vw] rotate-[-85deg]')} /> }
       <div className={clsx('absolute w-[12vw] h-[12vw] bg-[url("/onboarding/leaf_1.png")] bg-contain bg-no-repeat bg-center left-[8vw] bottom-[25vw] rotate-[20deg] scale-[1.2] z-[2] transition-transform duration-1000 ease-in-out', play && 'translate-x-[12vw] translate-y-[12vw] rotate-[75deg]')} />
      </section>
    );
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

          @keyframes slideInFromRight {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(0%);
  }
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
          backgroundColor: currentStep === 1 ? '#FBF5DA' : undefined,
          transition: 'background-color 600ms ease-out',
        }}
      >
        {/* Animasyonlu geçiş arkaplanı */}
        {transitionBg && (
          <div
            key={transitionBg.id}
            className="absolute top-0 left-0 w-full h-full z-0"
            style={{
              backgroundColor: transitionBg.color,
              transform: 'translateX(100%)',
              animation: 'slideInFromRight 0.6s ease-out forwards',
            }}
          />
        )}

        {/* Content Container */}
        <div className="relative w-full h-screen overflow-hidden">
          {/* Step 1 Content */}
          {currentStep === 1 && (
            <div
              key="step1"
              className={
                `absolute inset-0 ${currentStep === 1 ? '' : 'hidden'}`
              }            >
              {/* Status Bar Space */}
              <div className="h-10 w-full"></div>

              {/* Main illustration */}
              <div
                className="absolute top-[105px] left-0 right-0 px-4"
              >

                <div className="relative">
                  <StepContent step={1} />
                </div>
              </div>

              {/* Text content */}
              <div
                className="absolute w-[300px] flex flex-col items-center gap-2 top-[503px] left-1/2 transform -translate-x-1/2"
              >
                <h2 className="font-bold text-[24px] leading-[120%] text-center text-[#0B1420] w-full">
                  Let's lock in your deposit
                </h2>
                <p className="font-normal text-[14px] leading-[140%] text-center text-[#515964] w-full">
                  Snap a few photos, tag any damage, and get a time-stamped report — all in 10 minutes
                </p>
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
                  onClick={handleNext}
                  className="w-full h-full flex justify-center items-center bg-[#1C2C40] rounded-[16px] shadow-md transition-transform duration-150 active:scale-95"
                >
                  <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
                    Let's Go
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2 Content */}
          {currentStep === 2 && (
            <div
              key="step2"
              className={
                `absolute inset-0 ${currentStep === 2 ? '' : 'hidden'}`
              }            >
              {/* Status Bar Space */}
              <div className="h-10 w-full"></div>

              {/* Main illustration */}
              <div
                className="absolute top-[105px] left-0 right-0 px-4"
              >
                <div className="relative">
                  <StepContent step={2} />
                </div>
              </div>

              {/* Text content */}
              <div
                className="absolute w-[300px] flex flex-col items-center gap-2 top-[503px] left-1/2 transform -translate-x-1/2"
              >
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
                  onClick={handleNext}
                  className="w-full h-full flex justify-center items-center bg-[#1C2C40] rounded-[16px] shadow-md transition-transform duration-150 active:scale-95"
                >
                  <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
                    Next
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3 Content */}
          {currentStep === 3 && (
            <div
              key="step3"
              className={
                `absolute inset-0 ${currentStep === 3 ? '' : 'hidden'}`
              }
            >
              {/* Status Bar Space */}
              <div className="h-10 w-full"></div>

              {/* Main illustration with custom SVG */}
              <div
                className="absolute top-[105px] left-0 right-0 flex justify-center items-center"
              >
                <div className="relative w-full max-w-[400px] h-[400px] mx-auto flex items-center justify-center">
                  <img
                    src="/images/onboarding3.png"
                    alt="Step 3 Illustration"
                    className="w-full h-full object-contain"
                  />
                  <motion.img
                    src="/onboarding/on2.svg"
                    alt="Animated Overlay"
                    className="absolute left-1/5 top-[-42px] transform -translate-x-1/3 -translate-y-1/3 z-10"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 0.2, opacity: 1 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                  />
                </div>
              </div>

              {/* Text content */}
              <div
                className="absolute w-[300px] flex flex-col items-center gap-2 top-[503px] left-1/2 transform -translate-x-1/2"
              >
                <h2 className="font-bold text-[24px] leading-[120%] text-center text-[#0B1420] w-full">
                  Document before you decorate.
                </h2>
                <p className="font-normal text-[14px] leading-[140%] text-center text-[#515964] w-full">
                  Do your walkthrough before the couch moves in. It's the easiest way to protect your deposit.
                </p>
              </div>

              {/* Page indicators */}
              <div className="absolute flex flex-row items-center gap-1.5 w-[60px] left-1/2 transform -translate-x-1/2 bottom-[120px]">
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
            </div>
          )}

          {/* Step 4 Content */}
          {currentStep === 4 && (
            <div
              key="step4"
              className={
                `absolute inset-0 ${currentStep === 4 ? '' : 'hidden'}`
              }
            >
              {/* Status Bar Space */}
              <div className="h-10 w-full"></div>

              {/* Main illustration with tags */}
              <div
                className="absolute top-[190px] left-0 right-0 px-4"
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
              </div>

              {/* Text content */}
              <div
                className="absolute w-[300px] flex flex-col items-center gap-2 top-[503px] left-1/2 transform -translate-x-1/2"
              >
                <h2 className="font-bold text-[24px] leading-[120%] text-center text-[#0B1420] w-full">
                  Tag what's already damaged
                </h2>
                <p className="font-normal text-[14px] leading-[140%] text-center text-[#515964] w-full">
                  In 10 minutes, you'll have time stamped proof of every scratch, scuff, and stain before it's pinned on you.
                </p>
              </div>

              {/* Page indicators */}
              <div className="absolute flex flex-row items-center gap-1.5 w-[60px] left-1/2 transform -translate-x-1/2 bottom-[120px]">
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
            </div>
          )}

          {/* Step 5 Content */}
          {currentStep === 5 && (
            <div
              key="step5"
              className={
                `absolute inset-0 ${currentStep === 5 ? '' : 'hidden'}`
              }            >
              {/* Status Bar Space */}
              <div className="h-10 w-full"></div>

              {/* Main illustration */}
              <div
                className="absolute top-[105px] left-10 right-0 px-4"
              >
                <div className="relative">
                  <img
                    src="/images/onboarding5.png"
                    alt="Report Illustration"
                    className="w-full object-contain"
                    style={{ maxHeight: '360px' }}
                  />
                </div>
              </div>

              {/* Text content */}
              <div
                className="absolute w-[300px] flex flex-col items-center gap-2 top-[503px] left-1/2 transform -translate-x-1/2"
              >
                <h2 className="font-bold text-[24px] leading-[120%] text-center text-[#0B1420] w-full">
                  We'll send your report to your landlord for you
                </h2>
                <p className="font-normal text-[14px] leading-[140%] text-center text-[#515964] w-full">
                  We'll create a clean, time-stamped summary and send it for you, so you don't have to.
                </p>
              </div>

              {/* Page indicators */}
              <div className="absolute flex flex-row items-center gap-1.5 w-[60px] left-1/2 transform -translate-x-1/2 bottom-[120px]">
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
            </div>
          )}
        </div >

      </div >


    </>
  );
}
