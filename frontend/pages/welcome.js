import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import splashAnimation from '../public/animations/splash.json';

export default function Welcome() {
  const [showSplash, setShowSplash] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    // Animasyon bitişini bekle (1.2 saniye - daha hızlı)
    const timer = setTimeout(() => {
      console.log('Splash animation completed...');
      setAnimationComplete(true);
      // Hemen sonra splash'i kapat
      setTimeout(() => {
        setShowSplash(false);
      }, 200);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Theme setting for light mode and background color
  useEffect(() => {
    // Ensure light mode is applied
    if (typeof window !== 'undefined') {
      // Reset dark mode if present
      document.documentElement.classList.remove('dark');
      // Store the light theme preference
      localStorage.setItem('theme', 'light');
      // Set body background to match design
      document.body.style.backgroundColor = '#F8F4D6';
    }
    
    // Cleanup - reset body background on unmount
    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.backgroundColor = '';
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>Welcome to tenantli</title>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            className="fixed inset-0 bg-[#FBF5DA] z-50 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
          >
            {/* Lottie Splash Animation */}
            <div className="w-full h-full max-w-[390px] max-h-[844px] mx-auto">
              <Lottie
                animationData={splashAnimation}
                loop={false}
                autoplay={true}
                style={{ 
                  width: '100%', 
                  height: '100%',
                  backgroundColor: '#FBF5DA'
                }}
                onComplete={() => {
                  console.log('Lottie animation completed');
                  setAnimationComplete(true);
                }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            className="flex flex-col min-h-screen font-['Nunito']"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
        {/* Sarı arka plan */}
        <div className="flex-1 bg-[#F8F4D6] relative overflow-hidden">
          {/* Yeşil alt zemin */}
          <div className="absolute bottom-0 left-0 right-0 h-[153px] bg-[#D1E7D5]"></div>
          
          {/* Görsel */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center" 
            style={{ width: '110%', left: '-5%' }}
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1], delay: 0.2 }}
          >
            <img
              src="/images/welcome-illustration.svg"
              alt="Person relaxing on a green sofa"
              className="w-full h-auto max-h-[90vh] object-contain -translate-y-[-15%]"
            />
          </motion.div>
        </div>
        
        {/* Beyaz alan */}
        <motion.div 
          className="bg-white p-6 pt-8 pb-10 -mt-4 shadow-lg z-10 relative rounded-t-[24px]"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1], delay: 0.4 }}
        >
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Protect your deposit <br /> from day one
            </h1>
            <p className="text-gray-600 mt-2">
              Renters deserve peace of mind <br /> and it starts here.
            </p>
            
            <div className="mt-6 space-y-3">
              <Link 
                href="/login"
                className="block text-base text-gray-800 font-medium"
              >
                Sign in
              </Link>
              <Link 
                href="/register"
                className="block w-full bg-[#1C2C40] text-[#D1E7E2] py-3 rounded-xl font-bold text-base"
              >
                Sign up
              </Link>
            </div>
          </div>
        </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}