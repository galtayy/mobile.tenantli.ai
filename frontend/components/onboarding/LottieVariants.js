import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import splashAnimation from '../../public/animations/splash.json';

// Different Lottie configurations for each step
export const LottieStep1 = () => {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ scale: 1.5, opacity: 0, y: 100 }}
      animate={{ scale: 1, opacity: 0.3, y: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <div className="relative">
        {/* Main Lottie animation */}
        <div className="w-[280px] h-[280px]">
          <Lottie 
            animationData={splashAnimation}
            loop={true}
            autoplay={true}
            speed={0.8}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        
        {/* Floating particles around */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#55A363] rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export const LottieStep2 = () => {
  return (
    <>
      {/* Multiple small Lottie instances */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: `${20 + i * 30}%`,
            left: i % 2 === 0 ? '5%' : 'auto',
            right: i % 2 === 1 ? '5%' : 'auto'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1, 0.8], 
            opacity: [0, 0.3, 0.2],
            rotate: i % 2 === 0 ? [0, 360] : [360, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "linear"
          }}
        >
          <div className="w-[80px] h-[80px]">
            <Lottie 
              animationData={splashAnimation}
              loop={true}
              autoplay={true}
              speed={0.5 + i * 0.2}
              style={{ width: '100%', height: '100%' }}
              initialSegment={[i * 20, (i + 1) * 40]}
            />
          </div>
        </motion.div>
      ))}
    </>
  );
};

export const LottieStep3 = () => {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Central pulsing Lottie */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-[220px] h-[220px]">
          <Lottie 
            animationData={splashAnimation}
            loop={true}
            autoplay={true}
            speed={1.2}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </motion.div>
      
      {/* Rotating outer ring */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-[320px] h-[320px] opacity-10">
          <Lottie 
            animationData={splashAnimation}
            loop={true}
            autoplay={true}
            speed={0.3}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};